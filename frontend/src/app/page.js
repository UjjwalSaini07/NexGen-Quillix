"use client";

import React from "react";
import Header from "../components/common/Header";
import "./index.css";
import FooterPage from "@/components/home/footer";
import Home2_1 from "@/components/home/Home2_Sec1";
import Home2 from "@/components/home/Home2";
import Home3 from "@/components/home/Home3";
import Testimonials from "@/components/home/testimonials";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="flex flex-col items-center justify-center mt-18">
        <Home2_1 />
        <Home2 />
        <Home3 />
        <Testimonials />
      </main>
      <footer>
        <FooterPage />
      </footer>
    </div>
  );
}
