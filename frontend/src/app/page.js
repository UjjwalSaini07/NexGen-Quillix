"use client";

import React, { useEffect } from "react";
import Header from "../components/common/Header";
import "./index.css";
import FooterPage from "@/components/home/footer";
import Hero from "@/components/home/Hero";
import Home2 from "@/components/home/Home2";
import Home3 from "@/components/home/Home3";
import Home4 from "@/components/home/Home4";
import Home5 from "@/components/home/Home5";
import Testimonials from "@/components/home/testimonials";

export default function HomePage() {
  useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="flex flex-col items-center justify-center mt-6">
        <Hero />
        <Home2 />
        <Home3 />
        <Home4 />
        <Home5 />
        <Testimonials />
      </main>
      <footer>
        <FooterPage />
      </footer>
    </div>
  );
}
