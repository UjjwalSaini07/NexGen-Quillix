"use client";

import { useEffect, useState } from "react";

function getLongTimezoneName() {
  try {
    const parts = Intl.DateTimeFormat("en-US", {
      timeZoneName: "long",
    }).formatToParts(new Date());
    return (
      parts.find((p) => p.type === "timeZoneName")?.value ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "Unknown"
    );
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  }
}

export async function collectDeviceInfo() {
  let ipData = {};
  try {
    const res = await fetch("https://ipapi.co/json/");
    console.log("IP API response status:", res.status);
    if (res.ok) ipData = await res.json();
  } catch (err) {
    console.error("Failed to fetch IP info:", err);
  }

  const ua = navigator?.userAgent || "Unknown";
  const lang =
    Array.isArray(navigator?.languages) && navigator.languages.length
      ? navigator.languages.join(",")
      : navigator?.language || "*";
  const screenResolution = window?.screen
    ? `${window.screen.width}x${window.screen.height}`
    : "Unknown";

  const clientDevice = {
    userAgent: ua,
    language: lang,
    screenResolution,
    timezone: getLongTimezoneName(),
    connection: navigator?.connection?.effectiveType || "Unknown",
  };

  const locationInfo = {
    ip: ipData.ip ?? "Unknown",
    network: ipData.network ?? "Unknown",
    version: ipData.version ?? "Unknown",
    city: ipData.city ?? "Unknown",
    region: ipData.region ?? "Unknown",
    region_code: ipData.region_code ?? "Unknown",
    country: ipData.country_name ?? "Unknown",
    country_code: ipData.country_code ?? "Unknown",
    postal: ipData.postal ?? "Unknown",
    latitude: typeof ipData.latitude === "number" ? ipData.latitude : 0.0,
    longitude: typeof ipData.longitude === "number" ? ipData.longitude : 0.0,
    timezone: ipData.timezone ?? "Unknown",
    isp: ipData.org ?? "Unknown",
  };

  return { clientDevice, locationInfo };
}

export default function DeviceInfoPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const data = await collectDeviceInfo();
      setInfo(data);
    })();
  }, []);
}
