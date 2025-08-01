"use client";

import React from "react";
import Header from "../components/common/Header";
import "./index.css";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex flex-1 items-center justify-center mt-18">
        <h1 className="text-4xl">Welcome to the Homepage</h1>
      </main>
    </div>
  );
}
