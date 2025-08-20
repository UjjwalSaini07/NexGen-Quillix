"use server";

import { v4 as uuidv4 } from "uuid";
import { collectDeviceInfo } from "./collectDeviceInfo";

export async function generatePost(data) {
  try {
    const cacheKey = uuidv4();

    // 1) Client bits
    const { clientDevice, locationInfo } = await collectDeviceInfo();

    // 2) Server augmentation (headers + server RAM/CPU/OS) - From App api Route
    const augRes = await fetch("/api/augment-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientDevice }),
    });
    if (!augRes.ok) throw new Error("Failed to augment device info");
    const { device } = await augRes.json();

    // 3) Cache JSON payload
    const cacheData = {
      device,
      location: locationInfo,
      timestamp: new Date().toISOString(),
      linked_post: cacheKey,
    };

    // 4) Data Storing in Redis Cache
    await fetch("/api/store-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cacheKey, cacheData }),
    });

    // 5) Backend Calling FASTAPI
    // const response = await fetch("http://localhost:8000/generate/linkedin", {
    const response = await fetch("https://nexgen-quillix.onrender.com/generate/linkedin", { //127.0.0.1.8000
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, cacheKey }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail || "Failed to generate post");
    }

    return await response.json();
  } catch (error) {
    throw new Error(`API Error: ${error.message}`);
  }
}

// "use server";

// export async function generatePost(data) {
//   try {
//     const response = await fetch("https://nexgen-quillix.onrender.com/generate/linkedin", { //127.0.0.1.8000
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       const err = await response.json();
//       throw new Error(err?.detail || "Failed to generate post");
//     }

//     const result = await response.json();
//     return result;

//   } catch (error) {
//     throw new Error(`API Error: ${error.message}`);
//   }
// }
