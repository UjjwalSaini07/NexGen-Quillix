"use client";

import { useEffect, useRef } from "react";
import { db } from "@/components/firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { collectDeviceInfo } from "../utils/DeviceInfo";

export default function DeviceInfoCollector() {
  const savedRef = useRef(false);

  useEffect(() => {
    const sessionKey = "deviceInfoSaved";

    if (!savedRef.current && !sessionStorage.getItem(sessionKey)) {
      savedRef.current = true;

      collectDeviceInfo().then(async (info) => {
        try {
          // Save to NexGenQuillix collection - organized by date for analytics
          const today = new Date().toISOString().split("T")[0];
          
          // Main analytics collection: NexGenQuillix/analytics/{date}
          const analyticsRef = collection(db, "NexGenQuillix", "analytics", today);
          
          await addDoc(analyticsRef, {
            ...info,
            type: "device_info",
            savedAt: serverTimestamp(),
          });

          // Also save user session info in users subcollection
          // Only save if we have a valid user ID (not anonymous/undefined)
          if (info.deviceId && info.deviceId !== 'anonymous') {
            const userRef = doc(db, "NexGenQuillix", "users", info.deviceId);
            await setDoc(userRef, {
              lastVisit: serverTimestamp(),
              deviceInfo: info,
              firstVisit: info.firstVisit || serverTimestamp(),
            }, { merge: true });
          }

          sessionStorage.setItem(sessionKey, "true");
          console.log("Analytics data saved to NexGenQuillix database ✅");
        } catch (err) {
          console.error("Failed to save analytics:", err);
        }
      });
    }
  }, []);

  return null;
}
