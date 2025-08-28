import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { AnimatedUniqueness } from "../ui/animatedUniqueness";

const data = [
  {
    name: "AI-Powered Trend Prediction",
    type: "Stay Ahead of the Curve",
    quote:
      "Our AI analyzes billions of data points to predict upcoming content trends before they peak. This ensures your brand always rides the wave at the perfect time, not after it has passed.",
    src: "https://static.inlinx.com/1f3a33cd19/e69b0/linxapp/blog/5_what_is_the_chatroom_feature_cover.png",
  },
  {
    name: "Seamless Multi-Platform Publishing",
    type: "One Click, Everywhere",
    quote:
      "Publish once, and NexGen-Quillix distributes optimized versions of your content across all major platforms—Facebook, LinkedIn, Instagram, and beyond—without the hassle of manual tweaking.",
    src: "https://www.sorryonmute.com/wp-content/uploads/2022/08/Feature-Image-2.png",
  },
  {
    name: "Adaptive Brand Voice",
    type: "Your Identity, Perfected",
    quote:
      "Our engine learns your unique tone and style, ensuring every post, caption, or article reflects your brand’s voice—consistent, authentic, and tailored for your audience.",
    src: "https://thumbs.dreamstime.com/b/conference-video-call-people-talking-to-each-other-monitor-screen-working-home-remote-project-management-conference-video-186775025.jpg",
  },
  {
    name: "Real-Time Analytics & Optimization",
    type: "Smarter Decisions Instantly",
    quote:
      "No more guessing. Quillix provides live feedback on performance and auto-adjusts campaigns to maximize reach and conversions—empowering you to focus on creativity, not spreadsheets.",
    src: "https://mumbaimirror.indiatimes.com/photo/76099716.cms",
  },
];

export default function Home3() {
  useEffect(() => {
    AOS.init({
      offset: 100,
      delay: 10,
      duration: 2000,
      easing: "ease",
      once: false,
    });
  }, []);

  return (
    <div className="flex justify-center items-center overflow-hidden py-20 px-6 -mb-25">
      <div className="w-full max-w-6xl text-center">
        <h1
          data-aos="zoom-in-down"
          style={{ fontFamily: "Times New Roman, serif" }}
          className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg"
        >
          Discover the{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Uniqueness of NexGen-Quillix
          </span>
        </h1>

        <p
          data-aos="fade-up"
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
          className="text-neutral-400 max-w-3xl mx-auto text-lg leading-relaxed"
        >
          Our MVP isn’t just another tool—it’s a complete reimagining of how
          creators, marketers, and businesses engage with their audiences.
          From predictive insights to adaptive brand voice, NexGen-Quillix is
          built to give you an unmatched competitive edge.
        </p>

        <div
          data-aos="flip-left"
          data-aos-easing="ease-out-cubic"
          data-aos-duration="3000"
        >
          <AnimatedUniqueness testimonials={data} autoplay={true} />
        </div>
      </div>
    </div>
  );
}
