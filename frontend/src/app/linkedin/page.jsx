"use client";

import React, { useEffect } from "react";
import "../index.css";
import { toast } from "react-toastify";
import Header from "../../components/common/Header";
import LinkedinPost from "../../components/linkedin/linkedinPost";

export default function LinkedinPageWrapper() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const alreadyShown = sessionStorage.getItem("FirstLinkedinRequest");

      if (!alreadyShown) {
        toast.info(
          "On the 1st request, it might take up to 1 minute. Please be patient. After that, requests work in seconds 🚀"
          // "We analyze your inputs to provide more accurate predictions. On the 1st request, it might take up to 1 minute. Please be patient. After that, requests work in seconds 🚀"
        );
        sessionStorage.setItem("FirstLinkedinRequest", "true");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="flex flex-1 items-center justify-center mt-18">
        <LinkedinPost />
      </main>
    </div>
  );
}