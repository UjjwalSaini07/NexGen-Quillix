"use client";

import React from "react";
import { motion } from "framer-motion";

const License = () => {
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
          License
        </h1>

        <p
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
          className="text-center text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-8"
        >
          NexGen-Quillix is released under the MIT License. This license
          allows free use, modification, and distribution of the software
          while limiting liability of the author.
        </p>

        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <pre
            style={{ fontFamily: "Courier New, monospace" }}
            className="whitespace-pre-wrap text-gray-800 text-sm md:text-base leading-6"
          >
{`MIT License

Copyright (c) 2025 Ujjwal Saini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </pre>
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

export default License;
