import Hero from "@/components/sections/Hero";
import Ethos from "@/components/sections/Ethos";
import Work from "@/components/sections/Work";
import Craft from "@/components/sections/Craft";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Ethos />
      <Work />
      <Craft />
      <Contact />
      <Footer />
    </main>
  );
}
