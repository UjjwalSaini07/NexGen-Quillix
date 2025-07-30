"use client";

import React from "react";
import Header from "../components/common/Header";
import LinkedinPost from "../components/linkedin/linkedinPost";

export default function PageWrapper() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex flex-1 mt-10 items-center justify-center">
        <LinkedinPost />
      </main>
    </div>
  );
}
