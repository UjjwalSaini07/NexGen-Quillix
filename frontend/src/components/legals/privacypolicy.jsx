"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const dataArray = [
  {
    title: "1. Introduction",
    para: `Welcome to NexGen-Quillix's Privacy Policy. Your privacy matters to us. This document outlines how we collect, use, and safeguard your personal information. By using our platform, you consent to the practices described below.`,
  },
  {
    title: "2. Information We Collect",
    para: `We collect details you provide while signing up, generating content, or using NexGen-Quillix features such as AI-powered creation, personalization, and analytics. This may include your name, email, and content preferences.`,
  },
  {
    title: "3. How We Use Your Information",
    para: `Your information allows us to deliver tailored AI-driven content, personalize your experience, and optimize posts for platforms like LinkedIn, Instagram, and X. We do not sell your data. It is only used to enhance and improve your experience.`,
  },
  {
    title: "4. Security of Your Information",
    para: `We employ strong security measures, including encryption and secure protocols, to protect your data against unauthorized access, alteration, or misuse. Our systems are regularly updated to maintain industry-standard safeguards.`,
  },
  {
    title: "5. Cookies & Tracking",
    para: `Cookies help us remember your preferences and improve user experience. They may also be used to understand engagement and optimize performance. You can manage or disable cookies in your browser settings.`,
  },
  {
    title: "6. Policy Updates",
    para: `We may update this Privacy Policy from time to time to reflect platform changes or new data practices. Updates will always be posted on this page, and we encourage you to review it periodically.`,
  },
  {
    title: "7. Contact Us",
    para: `If you have any questions or concerns about this Privacy Policy, feel free to reach us at ujjwalsaini0007+quillixsupport@gmail.com.`,
  },
];

const PrivacyPolicy = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleBtn = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2 }}
      className="min-h-screen bg-black"
    >
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1
            style={{ fontFamily: "Orbitron, sans-serif" }}
            className="text-3xl md:text-4xl lg:text-5xl text-center font-bold text-cyan-500 mb-4"
            >
            Privacy Policy
        </h1>

        <p
            style={{ fontFamily: "Ancizar Serif, sans-serif" }}
            className="text-center text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-8"
            >
            This Privacy Policy explains how NexGen-Quillix collects, uses, and protects
            your information. We are committed to safeguarding your data and ensuring
            transparency in how it is handled.
        </p>

        <div>
          {dataArray.map((data, index) => (
            <motion.div
              key={index}
              className="shadow-lg cursor-pointer py-3 px-5 bg-white mt-6 rounded-lg"
              whileHover={{ scale: 1.01 }}
              onClick={() => toggleBtn(index)}
            >
              <div className="flex justify-between items-center">
                <p
                  style={{ fontFamily: 'Times New Roman, sans-serif' }}
                  className="text-lg md:text-xl font-semibold text-gray-800"
                >
                  {data.title}
                </p>
                <div>
                  <span className="text-xl md:text-2xl text-gray-600">
                    {activeIndex === index ? "-" : "+"}
                  </span>
                </div>
              </div>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden"
                >
                  <div className="py-4">
                    <p
                      style={{ fontFamily: "Ancizar Serif, sans-serif" }}
                      className="text-gray-700 text-sm md:text-base leading-6"
                    >
                      {data.para}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="text-center text-sm text-neutral-500 -mt-4 mb-10">
          <p className="inline-flex items-center gap-1 transition-colors duration-300">
            <span className="text-neutral-500">Developed with {" "}</span>
            <span className="animate-pulse text-red-700">❤️</span>
            <span className="text-neutral-500">by</span>
            <a
              href="https://ujjwalsaini.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-cyan-500 hover:text-cyan-400 hover:underline underline-offset-4 transition-all duration-300"
            >
              UjjwalS
            </a>
            <span className="animate-pulse text-cyan-400">✦</span>
          </p>
        </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
