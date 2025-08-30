"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const dataArray = [
  {
    title: "1. Introduction",
    para: `Welcome to NexGen-Quillix! By accessing or using our platform, you agree to comply with and be bound by these Terms and Conditions. These terms establish a legal agreement between you and NexGen-Quillix regarding the use of our AI-powered services. Please read them carefully. If you do not agree with any part of these terms, we kindly ask that you discontinue use of NexGen-Quillix immediately.`,
  },
  {
    title: "2. Use of Services",
    para: `You agree to use NexGen-Quillix solely for lawful, ethical, and intended purposes, and always in accordance with these Terms and Conditions. Misuse of the platform—including but not limited to attempts to hack, reverse engineer, gain unauthorized access, or distribute harmful or malicious content—is strictly prohibited. Any violation of these rules may result in suspension, termination, or legal action depending on the severity of the breach.`,
  },
  {
    title: "3. User Responsibilities",
    para: `You are solely responsible for maintaining the confidentiality of your account credentials and for all activities carried out under your account. It is your responsibility to ensure that your login details remain secure. NexGen-Quillix will not be held liable for any loss, damage, or misuse resulting from unauthorized use of your account, whether caused by negligence or third-party access.`,
  },
  {
    title: "4. Intellectual Property",
    para: `All intellectual property rights related to NexGen-Quillix—including but not limited to software code, algorithms, branding, logos, designs, and AI-generated content—remain the exclusive property of NexGen-Quillix. You are granted a limited, non-transferable license to use the platform strictly in accordance with these Terms. You may not copy, alter, reproduce, distribute, sell, or create derivative works from our content or technology without explicit written consent.`,
  },
  {
    title: "5. Limitation of Liability",
    para: `NexGen-Quillix is provided "as is" and "as available," without warranties of any kind, whether express or implied. While we strive to provide uninterrupted and accurate services, we cannot guarantee that the platform will always be error-free, secure, or available at all times. NexGen-Quillix shall not be held liable for indirect, incidental, consequential, or special damages arising from the use—or inability to use—our services.`,
  },
  {
    title: "6. Termination of Access",
    para: `We reserve the right to suspend, restrict, or terminate your access to NexGen-Quillix at our sole discretion if we believe you have violated these Terms and Conditions, engaged in fraudulent or harmful behavior, or acted in a way that negatively impacts other users or the integrity of the platform. In certain cases, we may also pursue legal remedies.`,
  },
  {
    title: "7. Updates to Terms",
    para: `These Terms and Conditions may be updated or modified from time to time to reflect platform enhancements, security improvements, or changes in legal and regulatory requirements. Whenever updates are made, they will be published on this page. Continued use of NexGen-Quillix after any update will signify your acceptance of the revised terms.`,
  },
  {
    title: "8. Governing Law",
    para: `These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which NexGen-Quillix operates. Any disputes or claims arising from the use of the platform will fall under the exclusive jurisdiction of the relevant courts in that region.`,
  },
  {
    title: "9. Contact Us",
    para: `If you have any questions, concerns, or feedback regarding these Terms and Conditions, you may contact our support team at ujjwalsaini0007+quillixsupport@gmail.com. We are committed to addressing user queries promptly and maintaining transparency in all communications.`,
  },
];

const TermsAndConditions = () => {
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
          Terms & Conditions
        </h1>

        <p
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
          className="text-center text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-8"
        >
          These Terms and Conditions govern the use of NexGen-Quillix. Please
          review them carefully, as by using our platform you agree to these
          rules and obligations.
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
                  style={{ fontFamily: "Times New Roman, sans-serif" }}
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

export default TermsAndConditions;
