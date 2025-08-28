"use client";

import React, { useEffect } from "react";
import "../index.css";
import { toast } from "react-toastify";
import Header from "../../components/common/Header";
import HelpCenter from "../../components/help/helpcenter";

export default function HelpCenterPage() {
  useEffect(() => {
    toast.info("Welcome to NexGen-Quillix's Help Center page! 🤝");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="items-center justify-center mt-18">
        <HelpCenter />
      </main>
    </div>
  );
}
