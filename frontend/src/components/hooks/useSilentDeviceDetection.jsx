"use client";

import { useState } from "react";

export const useSilentDeviceDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [data, setData] = useState(null);

  const getDeviceInfo = () => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const platform = navigator.platform || "Unknown";
    const os = navigator.userAgent.includes("Win")
      ? "Windows"
      : navigator.userAgent.includes("Mac")
      ? "macOS"
      : navigator.userAgent.includes("Linux")
      ? "Linux"
      : "Unknown";

    return {
      userAgent: navigator.userAgent,
      platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      connection: connection?.effectiveType || "Unknown",
      memory: `${navigator.deviceMemory || 4} GB`,
      cpuCores: `${navigator.hardwareConcurrency || 4} Cores`,
      os,
    };
  };

  const fetchLocationInfo = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      return {
        ip: data.ip,
        city: data.city,
        country: data.country_name,
        isp: data.org || "Unknown ISP",
      };
    } catch {
      return null;
    }
  };

  const runDetection = async () => {
    if (isDetecting) return;
    setIsDetecting(true);

    const device = getDeviceInfo();
    const location = await fetchLocationInfo();

    const combined = {
      device,
      location,
      timestamp: new Date().toISOString(),
    };

    setData(combined);
    setIsDetecting(false);

    return combined;
  };

  return {
    isDetecting,
    runDetection,
    data,
  };
};
