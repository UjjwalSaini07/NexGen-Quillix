"use client";

import { Geist, Geist_Mono, Ancizar_Serif, Orbitron, Playfair_Display_SC } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

import { useEffect, useRef } from "react";
import { db } from "@/components/firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { collectDeviceInfo } from "../utils/DeviceInfo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ancizar = Ancizar_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const playfairSC = Playfair_Display_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const metadata = {
  title: "NexGen-Quillix: AI-Powered Content Creation",
  description:
    "NexGen-Quillix is an AI-powered content creation platform that crafts tailored, high-impact posts for LinkedIn, Instagram, X (Twitter), and more in seconds. Leveraging real-time trend analysis and customizable tone adaptation, it empowers marketers, entrepreneurs, and creators to boost engagement and streamline content workflows.",
  applicationName: "NexGen-Quillix",
  authors: [{ name: "UjjwalS" }],
  authorUrl: "https://www.ujjwalsaini.dev/",
  keywords: [
    "NexGen-Quillix", "AI content creation", "social media posts", "LinkedIn", "Instagram", "X", "Twitter", "trend analysis", "content automation", "Next.js", "React.js", "TypeScript", "Python", "TailwindCSS", "Redis", "Docker", "GitHub Actions",
  ],
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow",
  themeColor: "#000000",
  referrer: "origin-when-cross-origin",
  category: "technology",
  metadataBase: new URL("https://nexgenquillix.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NexGen-Quillix: AI-Powered Content Creation",
    description:
      "Create platform-ready social media content instantly with NexGen-Quillix, an AI-driven tool tailored for marketers and creators, enhancing digital presence through smart automation and creative flexibility.",
    url: "https://nexgenquillix.vercel.app/",
    authors: [{ name: "UjjwalS" }],
    authorUrl: "https://www.ujjwalsaini.dev/",
    siteName: "NexGen-Quillix",
    images: [
      {
        url: "/NexGenQuillixLogo.png",
        width: 800,
        height: 600,
        alt: "NexGen-Quillix Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexGen-Quillix: AI-Powered Content Creation",
    description:
      "Generate high-impact, trend-aware social media posts in seconds with NexGen-Quillix, combining intelligent AI automation with creative control for marketers and creators.",
    creator: "@UjjwalSaini0007",
    site: "@NexGenQuillix",
    images: ["/NexGenQuillixLogo.png"],
  },
  other: {
    "rating": "General",
    "distribution": "Global",
    "copyright": "NexGen-Quillix ©2025",
    "apple-mobile-web-app-title": "NexGen-Quillix",
    "apple-mobile-web-app-capable": "yes",
    "http-equiv": "IE=edge",
  },
};

export default function RootLayout({ children }) {
  const savedRef = useRef(false);

  useEffect(() => {
    const sessionKey = "deviceInfoSaved";

    if (!savedRef.current && !sessionStorage.getItem(sessionKey)) {
      savedRef.current = true;

      collectDeviceInfo().then(async (info) => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const hour = new Date().getHours();
          const segment = hour < 12 ? "segment1" : "segment2"; 

          // Path: QuillixUser/{today}/{segment}/{docId}
          const dateDocRef = doc(db, "QuillixUser", today);
          const segmentColRef = collection(dateDocRef, segment);

          await addDoc(segmentColRef, {
            ...info,
            createdAt: serverTimestamp(),
          });

          sessionStorage.setItem(sessionKey, "true");
          console.log("Device info saved under QuillixUser ✅");
        } catch (err) {
          console.error("Failed to save device info:", err);
        }
      });
    }
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ToastContainer position="bottom-right" autoClose={5000} />
      </body>
    </html>
  );
}
