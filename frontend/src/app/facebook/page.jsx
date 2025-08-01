"use client";

import React from "react";
import "../index.css";
import Header from "../../components/common/Header";
import FacebookPost from "../../components/facebook/facebookPost";

export default function PageWrapper() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex flex-1 items-center justify-center mt-18">
        <FacebookPost />
      </main>
    </div>
  );
}
