"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
   A single full-screen fragment shader: domain-warped aurora
   curtains, drifting starfield, a slow halo, and a pointer
   light. One draw call, no dependencies, ~5KB of GLSL.
   ──────────────────────────────────────────────────────────── */

const VERT = `#version 300 es
void main() {
  // Full-screen triangle from gl_VertexID — no buffers needed.
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;   // smoothed, 0..1
uniform float uScroll;    // page progress, 0..1
uniform float uReveal;    // 0 = dark, 1 = fully lit
uniform float uOctaves;   // quality dial

const vec3 VIOLET = vec3(0.42, 0.34, 1.00);
const vec3 CYAN   = vec3(0.15, 0.83, 0.87);
const vec3 GOLD   = vec3(0.98, 0.76, 0.44);
const vec3 ROSE   = vec3(1.00, 0.45, 0.62);

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 6; i++) {
    if (float(i) >= uOctaves) break;
    v += a * vnoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

/* Ribbons of light: a soft horizontal band per curtain, cut by
   vertical striations, drifting through its own noise field. */
vec3 curtains(vec2 uv, float t, float aspect) {
  vec3 col = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);

    // Normalised across the viewport width, so a phone sees the same
    // ribbon structure as a desktop instead of a horizontally stretched one.
    float nx = uv.x / max(aspect, 0.001);

    vec2 q = vec2(nx * 1.05, uv.y * 0.5)
           + vec2(t * (0.018 + fi * 0.011), t * 0.007);

    float w  = fbm(q * 1.3 + fi * 11.7);
    float w2 = fbm(q * 2.6 + w * 1.1 + fi * 5.1);

    // Where the ribbon hangs across the frame. The middle band sits
    // behind the content, so it is kept faint; the outer two frame it.
    float cx = nx - 0.5;
    float curve = 0.14 + fi * 0.31
                + cx * (fi - 1.0) * 0.13
                + sin(nx * 2.1 + t * 0.12 + fi * 2.3) * 0.09
                + (w2 - 0.5) * 0.18;

    float band = exp(-abs(uv.y - curve) * (17.0 + fi * 5.0));

    // Vertical rays — the structure that reads as "aurora" and not "fog".
    band *= 0.42 + 0.58 * fbm(vec2(nx * 19.0 + fi * 3.7, t * 0.3 + fi * 2.0));

    // The ribbon thins out and reappears along its length.
    band *= smoothstep(0.20, 0.58, w);

    vec3 c = mix(CYAN, VIOLET, clamp(fi * 0.42 + w * 0.75, 0.0, 1.0));
    c = mix(c, GOLD, pow(max(w2 - 0.62, 0.0) * 2.6, 2.0));
    c = mix(c, ROSE, pow(max(w - 0.70, 0.0) * 2.4, 2.0) * 0.7);

    float weight = mix(1.0, 0.34, exp(-pow((fi - 1.0) * 1.6, 2.0)));
    col += c * band * weight;
  }
  return col;
}

/* Sparse, slowly breathing stars — denser toward the top. */
float starfield(vec2 uv, float t) {
  vec2 g = uv * vec2(uRes.x / max(uRes.y, 1.0), 1.0) * 110.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;

  float h = hash21(id);
  float present = step(0.972, h);
  vec2 off = (vec2(hash21(id + 1.3), hash21(id + 7.9)) - 0.5) * 0.7;
  float d = length(f - off);
  float tw = 0.55 + 0.45 * sin(t * (0.6 + h * 2.4) + h * 62.0);

  float core = 1.0 - smoothstep(0.0, 0.06, d);
  return present * core * tw * smoothstep(-0.2, 0.7, uv.y);
}

/* Filmic-ish tone curve. Keeps highlights from clipping to flat white. */
vec3 tonemap(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 res = uRes;
  vec2 uv = frag / res;

  // Aspect-corrected, origin-centred space for radial work.
  float aspect = res.x / max(res.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float t = uTime;

  // Descending through the field as the page scrolls.
  vec2 fieldUv = vec2(uv.x * aspect, uv.y + uScroll * 0.45);

  // Pointer parallax — the field leans very slightly toward the cursor.
  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);
  fieldUv += pointer * 0.06;

  vec3 col = curtains(fieldUv, t, aspect);

  // Deep base wash so the void is never truly flat.
  float wash = fbm(fieldUv * 0.7 + t * 0.01);
  col += mix(vec3(0.008, 0.011, 0.030), vec3(0.022, 0.016, 0.052), wash);

  // A breath of upper atmosphere — the glow above the ribbons.
  float sky = pow(smoothstep(0.30, 1.0, uv.y), 2.2);
  sky *= 0.55 + 0.45 * fbm(vec2(uv.x * 2.2 + t * 0.03, t * 0.05));
  col += mix(VIOLET, CYAN, 0.35 + 0.25 * sin(t * 0.17)) * sky * 0.075;

  // The faintest bloom behind the content, so the centre is never dead.
  float r = length(p - vec2(0.0, 0.06 - uScroll * 0.5));
  col += mix(VIOLET, ROSE, 0.25) * exp(-r * 2.6) * 0.045;

  // Stars, dimmed wherever aurora already lives.
  float s = starfield(vec2(uv.x, uv.y + uScroll * 0.22), t);
  col += vec3(0.85, 0.90, 1.0) * s * 0.70 * (1.0 - clamp(length(col) * 1.6, 0.0, 1.0));

  // Cursor light.
  float pd = length(p - pointer);
  col += mix(CYAN, GOLD, 0.5) * exp(-pd * 5.0) * 0.085;

  // Vignette — pulls the eye to the centre without a visible edge.
  float vig = 1.0 - smoothstep(0.30, 1.20, length(p * vec2(0.85, 1.0)));
  col *= 0.34 + 0.66 * vig;

  col = tonemap(col);

  // Subtle chromatic lift in the highlights: cool shadows, warm lights.
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, col * vec3(1.03, 0.99, 1.06), 1.0 - lum);

  // Film grain, animated. Breaks up banding on wide gradients.
  float grain = hash21(frag + fract(t) * 137.0) - 0.5;
  col += grain * 0.022;

  col *= uReveal;

  fragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[aurora] shader:", gl.getShaderInfoLog(sh));
    }
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function AuroraCanvas({
  revealed,
  reducedMotion,
}: {
  revealed: boolean;
  reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealedRef = useRef(revealed);
  const reducedRef = useRef(reducedMotion);

  // Mirrored into refs so the render loop below can read the latest values
  // without ever being torn down and rebuilt.
  useEffect(() => {
    revealedRef.current = revealed;
  }, [revealed]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });

    // No WebGL2 → the CSS gradient underneath is the design.
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const u = {
      res: gl.getUniformLocation(program, "uRes"),
      time: gl.getUniformLocation(program, "uTime"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      scroll: gl.getUniformLocation(program, "uScroll"),
      reveal: gl.getUniformLocation(program, "uReveal"),
      octaves: gl.getUniformLocation(program, "uOctaves"),
    };

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const state = {
      scale: coarse ? 0.62 : 0.82,
      octaves: coarse ? 4 : 5,
      pointer: { x: 0.5, y: 0.55 },
      target: { x: 0.5, y: 0.55 },
      scroll: 0,
      scrollTarget: 0,
      reveal: 0,
      time: reducedMotion ? 24 : 0,
      last: performance.now(),
      // Adaptive quality: sample the first ~90 frames, then commit.
      frames: 0,
      accum: 0,
      settled: false,
    };

    let raf = 0;
    let disposed = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(window.innerWidth * dpr * state.scale));
      const h = Math.max(1, Math.round(window.innerHeight * dpr * state.scale));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const onPointer = (e: PointerEvent) => {
      state.target.x = e.clientX / window.innerWidth;
      state.target.y = 1 - e.clientY / window.innerHeight;
    };

    const onScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      state.scrollTarget = Math.min(1, window.scrollY / max);
    };

    const render = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(render);

      const dt = Math.min(0.05, (now - state.last) / 1000);
      state.last = now;

      // Adaptive quality — drop resolution once if we're clearly struggling.
      if (!state.settled) {
        state.frames++;
        state.accum += dt;
        if (state.frames === 90) {
          const avg = state.accum / state.frames;
          if (avg > 0.024) {
            state.scale = Math.max(0.45, state.scale - 0.22);
            state.octaves = Math.max(3, state.octaves - 1);
            resize();
          }
          state.settled = true;
        }
      }

      const still = reducedRef.current;
      if (!still) state.time += dt;

      state.reveal = damp(state.reveal, revealedRef.current ? 1 : 0, 2.6, dt);
      state.scroll = damp(state.scroll, state.scrollTarget, 6, dt);

      if (still) {
        state.pointer.x = 0.5;
        state.pointer.y = 0.55;
      } else {
        state.pointer.x = damp(state.pointer.x, state.target.x, 3.2, dt);
        state.pointer.y = damp(state.pointer.y, state.target.y, 3.2, dt);
      }

      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, state.time);
      gl.uniform2f(u.pointer, state.pointer.x, state.pointer.y);
      gl.uniform1f(u.scroll, state.scroll);
      gl.uniform1f(u.reveal, state.reveal);
      gl.uniform1f(u.octaves, state.octaves);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && !disposed) {
        state.last = performance.now();
        raf = requestAnimationFrame(render);
      }
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // Deliberately not calling WEBGL_lose_context: the context belongs to
      // the canvas, not to this effect, and a Strict Mode remount would then
      // re-attach to a dead one.
    };
    // Effect owns the render loop for the lifetime of the component; live
    // values are read through refs so it never needs to tear down.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void"
    >
      {/* Fallback ground: visible before first paint and without WebGL2. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 8%, #14103a 0%, #0a0a1c 42%, #04050a 78%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Reading scrim — guarantees text contrast over any shader frame. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(4,5,10,0.42) 0%, rgba(4,5,10,0.06) 34%, rgba(4,5,10,0.28) 72%, rgba(4,5,10,0.72) 100%)",
        }}
      />
    </div>
  );
}
