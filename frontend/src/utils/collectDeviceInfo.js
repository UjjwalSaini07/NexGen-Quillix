"use client";

function getLongTimezoneName() {
  try {
    const parts = Intl.DateTimeFormat("en-US", { timeZoneName: "long" })
      .formatToParts(new Date());
    return parts.find(p => p.type === "timeZoneName")?.value
      || Intl.DateTimeFormat().resolvedOptions().timeZone
      || "Unknown";
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  }
}
// Author - UjjwalS - @Override is prohibited in this API due to incorrect sequencing, ONLY for Educational Purpose
export async function collectDeviceInfo() {
  let ipData = {};
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) ipData = await res.json();
  } catch {/* ignore */}

  // Client-side device bits
  const ua = typeof navigator !== "undefined" ? (navigator.userAgent || "Unknown") : "Unknown";
  const lang = (typeof navigator !== "undefined" && Array.isArray(navigator.languages) && navigator.languages.length)
    ? navigator.languages.join(",")
    : (typeof navigator !== "undefined" ? (navigator.language || "*") : "*");

  const screenResolution =
    typeof window !== "undefined" && window.screen
      ? `${window.screen.width}x${window.screen.height}`
      : "Unknown";

  const clientDevice = {
    userAgent: ua,
    language: lang,
    screenResolution,
    timezone: getLongTimezoneName(),
    connection:
      (typeof navigator !== "undefined" && navigator.connection?.effectiveType)
        ? navigator.connection.effectiveType
        : "Unknown",
  };

  const locationInfo = {
    ip: ipData.ip ?? "Unknown",
    network: ipData.network ?? "Unknown",
    version: ipData.version ?? "Unknown",
    city: ipData.city ?? "Unknown",
    region: ipData.region ?? "Unknown",
    region_code: ipData.region_code ?? "Unknown",
    country: ipData.country ?? "Unknown",
    country_name: ipData.country_name ?? "Unknown",
    country_capital: ipData.country_capital ?? "Unknown",
    postal: ipData.postal ?? "Unknown",
    latitude: typeof ipData.latitude === "number" ? ipData.latitude : 0.0,
    longitude: typeof ipData.longitude === "number" ? ipData.longitude : 0.0,
    timezone: ipData.timezone ?? "Unknown",
    isp: ipData.org ?? "Unknown ISP",
  };

  return { clientDevice, locationInfo };
}
// Author - UjjwalS - @Override is prohibited in this API due to incorrect sequencing, ONLY for Educational Purpose

// Todo: Direct API Load Processing...
// "use client";

// // Utility: Collect device + browser info
// export async function collectDeviceInfo() {
//   const ipResponse = await fetch("https://ipapi.co/json/");
//   const ipData = await ipResponse.json();

//   const deviceInfo = {
//     userAgent: navigator.userAgent || "Unknown",
//     platform: navigator.platform || "Unknown",
//     language: navigator.language || "Unknown",
//     screenResolution: `${window.screen.width}x${window.screen.height}`,
//     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     connection: navigator.connection?.effectiveType || "Unknown",
//     memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Unknown",
//     cpuCores: navigator.hardwareConcurrency
//       ? `${navigator.hardwareConcurrency} Cores`
//       : "Unknown",
//     os: navigator.userAgentData?.platform || navigator.platform || "Unknown",
//   };

//   const locationInfo = {
//     ip: ipData.ip || "Unknown",
//     network: ipData.network || "Unknown",
//     version: ipData.version || "Unknown",
//     city: ipData.city || "Unknown",
//     region: ipData.region || "Unknown",
//     region_code: ipData.region_code || "Unknown",
//     country: ipData.country || "Unknown",
//     country_name: ipData.country_name || "Unknown",
//     country_capital: ipData.country_capital || "Unknown",
//     postal: ipData.postal || "Unknown",
//     latitude: ipData.latitude || 0.0,
//     longitude: ipData.longitude || 0.0,
//     timezone: ipData.timezone || "Unknown",
//     isp: ipData.org || "Unknown ISP",
//   };

//   return { device: deviceInfo, location: locationInfo };
// }
