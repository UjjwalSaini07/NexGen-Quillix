import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NexGen-Quillix: AI-Powered Content Creation",
  description:
    "NexGen-Quillix is an AI-powered content creation platform that crafts tailored, high-impact posts for LinkedIn, Instagram, X (Twitter), and more in seconds. Leveraging real-time trend analysis and customizable tone adaptation, it empowers marketers, entrepreneurs, and creators to boost engagement and streamline content workflows.",
  applicationName: "NexGen-Quillix",
  authors: [{ name: "UjjwalS" }],
  keywords: [
    "NexGen-Quillix", "AI content creation", "social media posts", "LinkedIn", "Instagram", "X", "Twitter", "trend analysis", "content automation", "Next.js", "React.js", "TypeScript", "Python", "TailwindCSS", "Redis", "Docker", "GitHub Actions",
  ],
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow",
  themeColor: "#000000",
  referrer: "origin-when-cross-origin",
  category: "technology",
  metadataBase: new URL("http://localhost:3000/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NexGen-Quillix: AI-Powered Content Creation",
    description:
      "Create platform-ready social media content instantly with NexGen-Quillix, an AI-driven tool tailored for marketers and creators, enhancing digital presence through smart automation and creative flexibility.",
    url: "http://localhost:3000/",
    authors: [{ name: "UjjwalS" }],
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ToastContainer position="bottom-right" autoClose={5000} />
      </body>
    </html>
  );
}
