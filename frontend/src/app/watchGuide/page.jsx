"use client";

import React, { useEffect } from "react";
import "../index.css";
import { toast } from "react-toastify";
import Header from "../../components/common/Header";
import WorkInProgress from "../../components/common/comingSoon";

export default function WatchGuide() {
  useEffect(() => {
    toast.info("👷 Work in Progress: We're building something awesome for you here at NexGen-Quillix. Check back soon!");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="items-center justify-center mt-10">
        <WorkInProgress />
      </main>
    </div>
  );
}
