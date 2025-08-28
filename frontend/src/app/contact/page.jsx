"use client";

import React, { useEffect } from "react";
import "../index.css";
import { toast } from "react-toastify";
import Header from "../../components/common/Header";
import Contact from "../../components/help/contact";

export default function ContactPage() {
  useEffect(() => {
    toast.info("Welcome to NexGen-Quillix's Contact page! 📞, Please wait, contact form loading...");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header />
      <main className="items-center justify-center mt-18">
        <Contact />
      </main>
    </div>
  );
}
