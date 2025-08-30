"use client";

import React, { useEffect } from "react";
import "../index.css";
import { toast } from "react-toastify";
import Header from "../../components/common/Header";
import License from "../../components/legals/License";

export default function LicensePage() {
  useEffect(() => {
    toast.info("Welcome to NexGen-Quillix's License Page! 📝", {
      toastId: "license-welcome-toast",
    });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="items-center justify-center mt-18">
        <License />
      </main>
    </div>
  );
}
