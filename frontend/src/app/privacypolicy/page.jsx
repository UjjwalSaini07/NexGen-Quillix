"use client";

import React, { useEffect } from "react";
import "../index.css";
import { toast } from "react-toastify";
import Header from "../../components/common/Header";
import PrivacyPolicy from "../../components/legals/privacypolicy";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    toast.info("Welcome to NexGen-Quillix's Privacy Policy page! 📝", {
      toastId: "privacy-policy-welcome-toast",
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
        <PrivacyPolicy />
      </main>
    </div>
  );
}
