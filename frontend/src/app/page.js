"use client";

import React from "react";
import Header from "../components/common/Header";
import "./index.css";
import FooterPage from "@/components/home/footer";
import Testimonials from "@/components/home/testimonials";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="flex flex-1 items-center justify-center mt-18">
        <Testimonials />
      </main>
      <footer>
        <FooterPage />
      </footer>
    </div>
  );
}
