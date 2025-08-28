"use client";

import React, { useEffect } from "react";
import "../index.css";
import { toast } from "react-toastify";
import Header from "../../components/common/Header";
import AboutPage from "../../components/help/about";

export default function AboutPageWrapper() {
  useEffect(() => {
    toast.info("Welcome to NexGen-Quillix’s Inspiring About Page! ❤️");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="items-center justify-center mt-18">
        <AboutPage />
      </main>
    </div>
  );
}
