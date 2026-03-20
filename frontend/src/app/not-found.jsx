"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [glitchActive, setGlitchActive] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  const [systemStatus, setSystemStatus] = useState([]);
  const [particles, setParticles] = useState([]);

  const terminalLines = [
    "Initializing neural interface...",
    "Scanning quantum database...",
    "Searching for lost data...",
    "Error: Signal corrupted",
    "Attempting reconnection...",
    "System compromised.",
  ];

  const systemChecks = [
    { name: "Neural Network", status: "OFFLINE", color: "#ef4444" },
    { name: "Quantum Core", status: "DEGRADED", color: "#f59e0b" },
    { name: "Data Streams", status: "INTERCEPTED", color: "#ef4444" },
    { name: "Security Protocol", status: "COMPROMISED", color: "#ef4444" },
    { name: "Backup Systems", status: "ACTIVE", color: "#22c55e" },
  ];

  // Typing effect for terminal
  useEffect(() => {
    if (currentLine < terminalLines.length) {
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + "\n" + terminalLines[currentLine]);
        setCurrentLine((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [currentLine]);

  // System status cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus((prev) => {
        const newStatus = [...prev];
        if (newStatus.length < systemChecks.length) {
          return [...newStatus, systemChecks[newStatus.length]];
        }
        return newStatus;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate particles
  useEffect(() => {
    const newParticles = [...Array(30)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(newParticles);
  }, []);

  // Calculate time on this page
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      {/* Animated Grid Background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(147, 51, 234, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(147, 51, 234, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          animation: "gridMove 15s linear infinite",
        }}
      />

      {/* Gradient Orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-25 blur-[100px] animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(147, 51, 234, 1) 0%, transparent 70%)",
          top: "5%",
          left: "5%",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[80px] animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 1) 0%, transparent 70%)",
          bottom: "10%",
          right: "10%",
          animationDelay: "1.5s",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-15 blur-[60px] animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 1) 0%, transparent 70%)",
          top: "60%",
          left: "60%",
          animationDelay: "2s",
        }}
      />

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-8">
        <div
          className="absolute w-full h-[3px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          style={{
            animation: "scan 3s linear infinite",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        
        {/* Header Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-black/80 border-b border-purple-500/30 flex items-center justify-between px-4 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: "#9333ea" }}>
              ◈ SYSTEM STATUS: CRITICAL
            </span>
            <span className="text-xs" style={{ color: "#ef4444" }}>
              ▮ ERROR 404
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs" style={{ color: "#a78bfa" }}>
              UPTIME: {formatUptime(uptime)}
            </span>
            <span className="text-xs" style={{ color: "#22c55e" }}>
              ● CONNECTED
            </span>
          </div>
        </div>

        {/* Glitch 404 Text */}
        <div className="relative mb-6 mt-8">
          <h1
            className={`text-[120px] md:text-[180px] lg:text-[250px] font-bold tracking-tighter select-none
              ${glitchActive ? "animate-glitch" : ""}`}
            style={{
              textShadow: `
                0 0 10px rgba(147, 51, 234, 1),
                0 0 30px rgba(147, 51, 234, 0.8),
                0 0 60px rgba(147, 51, 234, 0.6),
                0 0 100px rgba(147, 51, 234, 0.4),
                0 0 150px rgba(147, 51, 234, 0.2)
              `,
              color: "#fff",
            }}
          >
            404
            {/* Glitch Layers */}
            <span
              className="absolute top-0 left-0 -z-10 opacity-80"
              style={{
                color: "#9333ea",
                clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
                transform: `translate(${glitchActive ? "6px" : "-6px"}, 0)`,
                textShadow: "6px 0 #3b82f6",
                animation: glitchActive ? "glitchSkew 0.3s infinite" : "none",
              }}
            >
              404
            </span>
            <span
              className="absolute top-0 left-0 -z-10 opacity-80"
              style={{
                color: "#9333ea",
                clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
                transform: `translate(${glitchActive ? "-6px" : "6px"}, 0)`,
                textShadow: "-6px 0 #ef4444",
                animation: glitchActive ? "glitchSkew 0.3s infinite" : "none",
              }}
            >
              404
            </span>
          </h1>
        </div>

        {/* Cyberpunk Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-purple-500" />
          <div className="w-3 h-3 rotate-45 bg-purple-500 animate-pulse shadow-[0_0_10px_#9333ea]" />
          <div className="w-3 h-3 rotate-45 bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" style={{ animationDelay: "0.3s" }} />
          <div className="w-3 h-3 rotate-45 bg-pink-500 animate-pulse shadow-[0_0_10px_#ec4899]" style={{ animationDelay: "0.6s" }} />
          <div className="w-3 h-3 rotate-45 bg-purple-500 animate-pulse shadow-[0_0_10px_#9333ea]" style={{ animationDelay: "0.9s" }} />
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-purple-500" />
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h2
            className="text-xl md:text-3xl font-bold mb-3 tracking-[0.3em]"
            style={{
              color: "#e9d5ff",
              textShadow: "0 0 15px rgba(147, 51, 234, 0.8)",
            }}
          >
            <span className="inline-block animate-pulse mr-2">▸</span>
            NEURAL PATHWAY SEVERED
            <span className="inline-block animate-pulse ml-2">◂</span>
          </h2>
          <p
            className="text-sm md:text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: "#a78bfa" }}
          >
            The data node you're seeking has been{' '}
            <span className="text-purple-400 font-bold">disconnected</span> from our quantum network.
            <br />
            <span className="text-blue-400">Initiating recovery sequence...</span>
          </p>
        </div>

        {/* Terminal & System Status Container */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-4xl">
          {/* Terminal */}
          <div
            className="flex-1 p-5 rounded-lg border border-purple-500/40 bg-black/70 backdrop-blur-sm"
            style={{
              boxShadow: "0 0 40px rgba(147, 51, 234, 0.25), inset 0 0 20px rgba(147, 51, 234, 0.05)",
            }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-500/20">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70 shadow-[0_0_8px_#ef4444]" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70 shadow-[0_0_8px_#f59e0b]" />
                <div className="w-3 h-3 rounded-full bg-green-500/70 shadow-[0_0_8px_#22c55e]" />
              </div>
              <span className="text-xs ml-2" style={{ color: "#6b7280" }}>
                system_terminal_v2.0.44
              </span>
            </div>
            <pre
              className="text-xs md:text-sm font-mono h-32 overflow-hidden"
              style={{ color: "#22c55e" }}
            >
              <span style={{ color: "#9333ea" }}>nexgen@quillix:~$</span> {typedText}
              <span className="animate-blink">_</span>
            </pre>
          </div>

          {/* System Status */}
          <div
            className="w-full md:w-72 p-5 rounded-lg border border-blue-500/40 bg-black/70 backdrop-blur-sm"
            style={{
              boxShadow: "0 0 40px rgba(59, 130, 246, 0.25), inset 0 0 20px rgba(59, 130, 246, 0.05)",
            }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-500/20">
              <svg className="w-4 h-4" style={{ color: "#3b82f6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span className="text-xs font-bold tracking-wider" style={{ color: "#3b82f6" }}>
                SYSTEM DIAGNOSTICS
              </span>
            </div>
            <div className="space-y-2">
              {systemChecks.map((check, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span style={{ color: "#9ca3af" }}>{check.name}</span>
                  <span
                    className="font-bold"
                    style={{
                      color: check.color,
                      textShadow: `0 0 10px ${check.color}`,
                    }}
                  >
                    {index < systemStatus.length ? systemStatus[index].status : "..."}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress Bar */}
            <div className="mt-4 pt-3 border-t border-blue-500/20">
              <div className="flex justify-between text-xs mb-1" style={{ color: "#6b7280" }}>
                <span>Data Recovery</span>
                <span style={{ color: "#f59e0b" }}>23%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full animate-pulse"
                  style={{
                    width: "23%",
                    background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                    boxShadow: "0 0 10px #f59e0b",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href="/"
          className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-none mb-8"
          style={{
            border: "2px solid #9333ea",
            boxShadow: "0 0 30px rgba(147, 51, 234, 0.4)",
          }}
        >
          {/* Button Background Animation */}
          <div
            className="absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"
            style={{
              background: "linear-gradient(90deg, #9333ea, #7c3aed, #9333ea, #7c3aed)",
              backgroundSize: "300% 100%",
              animation: "shimmer 2.5s linear infinite",
            }}
          />

          {/* Button Content */}
          <span className="relative z-10 flex items-center gap-4 text-white font-bold tracking-[0.2em] group-hover:text-black transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="group-hover:tracking-[0.3em] transition-all">RETURN TO BASE</span>
          </span>

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500 group-hover:border-black transition-colors" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500 group-hover:border-black transition-colors" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500 group-hover:border-black transition-colors" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500 group-hover:border-black transition-colors" />
        </Link>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Help Center", href: "/helpcenter" },
          ].map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-xs px-4 py-2 border border-purple-500/30 rounded hover:bg-purple-500/20 hover:border-purple-500 transition-all duration-300"
              style={{ color: "#a78bfa" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                background: particle.id % 3 === 0 
                  ? "#9333ea" 
                  : particle.id % 3 === 1 
                    ? "#3b82f6" 
                    : "#ec4899",
                opacity: particle.opacity,
                animation: `particleFloat ${particle.speed * 5}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
                boxShadow: `0 0 ${particle.size * 3}px ${
                  particle.id % 3 === 0 
                    ? "#9333ea" 
                    : particle.id % 3 === 1 
                      ? "#3b82f6" 
                      : "#ec4899"
                }`,
              }}
            />
          ))}
        </div>

        {/* Mouse Follower Glow */}
        <div
          className="absolute w-40 h-40 rounded-full pointer-events-none opacity-40 blur-[60px] transition-all duration-75"
          style={{
            background: "radial-gradient(circle, rgba(147, 51, 234, 0.9) 0%, transparent 70%)",
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Corner Decorations */}
        <div className="absolute top-14 left-4 w-20 h-20 opacity-50">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0 30 L0 0 L30 0" fill="none" stroke="#9333ea" strokeWidth="3" />
            <circle cx="8" cy="8" r="4" fill="#9333ea">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        <div className="absolute top-14 right-4 w-20 h-20 opacity-50">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M100 30 L100 0 L70 0" fill="none" stroke="#3b82f6" strokeWidth="3" />
            <circle cx="92" cy="8" r="4" fill="#3b82f6">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        <div className="absolute bottom-4 left-4 w-20 h-20 opacity-50">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0 70 L0 100 L30 100" fill="none" stroke="#3b82f6" strokeWidth="3" />
            <circle cx="8" cy="92" r="4" fill="#3b82f6">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        <div className="absolute bottom-4 right-4 w-20 h-20 opacity-50">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M100 70 L100 100 L70 100" fill="none" stroke="#9333ea" strokeWidth="3" />
            <circle cx="92" cy="92" r="4" fill="#9333ea">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Side Info Bars */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-2 h-2 rotate-45 border border-purple-500/50" style={{ opacity: i * 0.2 }} />
          ))}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {[5, 4, 3, 2, 1].map((i) => (
            <div key={i} className="w-2 h-2 rotate-45 border border-blue-500/50" style={{ opacity: i * 0.2 }} />
          ))}
        </div>
      </div>

      {/* Footer with Developer Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-purple-500/30 py-3 px-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "#6b7280" }}>
              ◈ NEXGEN-QUILLIX v2.0
            </span>
            <span className="text-xs" style={{ color: "#4b5563" }}>|</span>
            <span className="text-xs" style={{ color: "#6b7280" }}>
              ERROR CODE: 404-NODE-LOST
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: "#6b7280" }}>
              Designed & Developed by{" "}
              <a
                href="https://www.ujjwalsaini.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold transition-all hover:scale-105 inline-flex items-center gap-1"
                style={{
                  color: "#9333ea",
                  textShadow: "0 0 10px rgba(147, 51, 234, 0.5)",
                }}
              >
                <span className="hover:underline">UjjwalS</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </span>
            <span className="text-xs hidden sm:inline" style={{ color: "#4b5563" }}>
              © 2025 All Rights Reserved
            </span>
          </div>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style jsx global>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }

        @keyframes scan {
          0% { top: -5%; }
          100% { top: 105%; }
        }

        @keyframes shimmer {
          0% { background-position: -300% 0; }
          100% { background-position: 300% 0; }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.1;
          }
          25% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-50px) translateX(-10px);
            opacity: 0.2;
          }
          75% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.5;
          }
        }

        @keyframes glitch {
          0% {
            clip-path: none;
            transform: translate(0);
          }
          20% {
            clip-path: polygon(0 15%, 100% 15%, 100% 30%, 0 30%);
            transform: translate(-5px, 3px);
          }
          40% {
            clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%);
            transform: translate(5px, -3px);
          }
          60% {
            clip-path: polygon(0 70%, 100% 70%, 100% 85%, 0 85%);
            transform: translate(-3px, 2px);
          }
          80% {
            clip-path: polygon(0 85%, 100% 85%, 100% 100%, 0 100%);
            transform: translate(3px, -2px);
          }
          100% {
            clip-path: none;
            transform: translate(0);
          }
        }

        @keyframes glitchSkew {
          0% { transform: translate(0) skew(0deg); }
          20% { transform: translate(-5px, 3px) skew(-2deg); }
          40% { transform: translate(5px, -3px) skew(2deg); }
          60% { transform: translate(-3px, 2px) skew(-1deg); }
          80% { transform: translate(3px, -2px) skew(1deg); }
          100% { transform: translate(0) skew(0deg); }
        }

        .animate-glitch {
          animation: glitch 0.4s ease-in-out infinite;
        }

        .animate-blink {
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
