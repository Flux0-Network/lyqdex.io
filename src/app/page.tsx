import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Security } from "@/components/landing/security";
import { Waitlist } from "@/components/landing/waitlist";
import { Footer } from "@/components/landing/footer";
import { PageBg } from "@/components/landing/page-bg";

export default function Home() {
  return (
    <>
      <PageBg />
      <Navbar />
      <Hero />
      <Features />
      <Security />
      <Waitlist />
      <Footer />
    </>
  );
}
