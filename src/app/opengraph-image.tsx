import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Pulls the display face so the card matches the site.
 * Falls back to the bundled sans if the network is unavailable
 * at build time — the layout is designed to hold up either way.
 */
async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Instrument+Serif&text=" +
        encodeURIComponent(site.name),
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());

    const url = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const display = await loadDisplayFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#04050a",
          padding: 72,
          position: "relative",
        }}
      >
        {/* Aurora wash */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 520px at 22% 8%, rgba(108,92,255,0.42), transparent 62%), radial-gradient(760px 460px at 88% 30%, rgba(47,212,221,0.28), transparent 60%), radial-gradient(620px 420px at 60% 108%, rgba(243,193,121,0.22), transparent 62%)",
            display: "flex",
          }}
        />
        {/* Halo */}
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 620,
            borderRadius: 620,
            border: "1px solid rgba(238,240,247,0.13)",
            right: -140,
            top: -90,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#8a90a6",
          }}
        >
          {site.role}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: -4,
              color: "#eef0f7",
              fontFamily: display ? "Display" : undefined,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 28,
              lineHeight: 1.4,
              color: "#a2a8bd",
              maxWidth: 760,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            letterSpacing: 4,
            color: "#6f758c",
            borderTop: "1px solid rgba(238,240,247,0.1)",
            paddingTop: 26,
          }}
        >
          <span>{site.domain}</span>
          <span>{site.location}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: display
        ? [{ name: "Display", data: display, style: "normal", weight: 400 }]
        : [],
    },
  );
}
