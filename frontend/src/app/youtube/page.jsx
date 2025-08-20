"use client";

import React, { useEffect } from "react";
import "../index.css";
import { toast } from "react-toastify";
import Header from "../../components/common/Header";
import YoutubePost from "../../components/youtube/youtubePost";

export default function YoutubePageWrapper() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const alreadyShown = sessionStorage.getItem("FirstYoutubeRequest");

      if (!alreadyShown) {
        toast.info(
          "On the 1st request, it might take up to 1 minute. Please be patient. After that, requests work in seconds 🚀"
        );
        sessionStorage.setItem("FirstYoutubeRequest", "true");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="flex flex-1 items-center justify-center mt-18">
        <YoutubePost />
      </main>
    </div>
  );
}