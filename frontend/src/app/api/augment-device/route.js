import { NextResponse } from "next/server";
import os from "os";

function platformSystem() {
  const p = os.platform(); // 'win32' | 'darwin' | 'linux' | ...
  if (p === "win32") return "Windows";
  if (p === "darwin") return "Darwin";
  if (p === "linux") return "Linux";
  return p || "Unknown";
}

function windowsLabelFromRelease(release) {
  // Windows reports "10.0.x". Build >= 22000 -> Windows 11
  const build = Number(String(release).split(".")[2] || 0);
  const gen = build >= 22000 ? "11" : "10";
  return `Windows-${gen}-${release}`;
}

function platformPlatform() {
  const p = os.platform();
  const release = os.release(); // e.g., "10.0.26100"
  if (p === "win32") return windowsLabelFromRelease(release);
  if (p === "darwin") return `Darwin-${release}`;
  if (p === "linux") return `Linux-${release}`;
  return `${p || "Unknown"}-${release || ""}`.replace(/-$/, "");
}

// datetime.now().astimezone().tzname()
function serverTzLongName() {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZoneName: "long" })
      .formatToParts(new Date());
    return parts.find(p => p.type === "timeZoneName")?.value || "Unknown";
  } catch {
    return "Unknown";
  }
}

export async function POST(req) {
  try {
    const { clientDevice } = await req.json();

    const ua = req.headers.get("user-agent") || "Unknown";
    const acceptLanguage = req.headers.get("accept-language") || "*";
    const connection = req.headers.get("connection") || "Unknown";

    // Python: round(psutil.virtual_memory().total / GB)
    const totalGB = Math.round(os.totalmem() / (1024 ** 3));
    // Python: psutil.cpu_count(logical=True)
    const cpuCores = os.cpus()?.length ? `${os.cpus().length} Cores` : "Unknown";

    const device = {
      userAgent: ua,
      platform: platformSystem(),
      language: acceptLanguage,
      screenResolution: clientDevice?.screenResolution || "Unknown",
      timezone: serverTzLongName(),
      connection,
      memory: `${totalGB} GB`,
      cpuCores,
      os: platformPlatform(),
    };

    return NextResponse.json({ device });
  } catch (e) {
    console.error("[augment-device] error:", e);
    return NextResponse.json({ error: "Failed to augment device info" }, { status: 500 });
  }
}
