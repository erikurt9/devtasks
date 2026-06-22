import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const UserAgentParser = () => {
  const { dark } = useTheme();

  const [userAgent, setUserAgent] = useState(navigator.userAgent);

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

const [browser, setBrowser] = useState("Unknown");
const [os, setOs] = useState("Unknown");

const [deviceType, setDeviceType] = useState("Desktop");
const [engine, setEngine] = useState("Unknown");

const sampleUAs = {
  Googlebot:
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",

  "Safari iPhone":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",

  "Chrome Android":
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",

  "Firefox Linux":
    "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0",
};

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
  if (userAgent.includes("Chrome")) {
    setBrowser("Chrome");
  } else if (userAgent.includes("Firefox")) {
    setBrowser("Firefox");
  } else if (userAgent.includes("Safari")) {
    setBrowser("Safari");
  }

  if (userAgent.includes("Windows")) {
    setOs("Windows");
  } else if (userAgent.includes("Android")) {
    setOs("Android");
  } else if (userAgent.includes("Linux")) {
    setOs("Linux");
  } else if (userAgent.includes("Mac")) {
    setOs("macOS");
  }

if (/Mobile|Android|iPhone/i.test(userAgent)) {
  setDeviceType("Mobile");
} else if (/iPad|Tablet/i.test(userAgent)) {
  setDeviceType("Tablet");
} else {
  setDeviceType("Desktop");
}

if (userAgent.includes("Chrome")) {
  setEngine("Blink");
} else if (userAgent.includes("AppleWebKit")) {
  setEngine("WebKit");
} else if (userAgent.includes("Gecko")) {
  setEngine("Gecko");
}
}, [userAgent]);

const loadSampleUA = (ua) => {
  setUserAgent(ua);
};

  return (
    <div
      className={
        dark
          ? "bg-zinc-950 min-h-screen text-white"
          : "bg-white min-h-screen text-black"
      }
    >
      <div className="max-w-6xl mx-auto p-6">
        <Link
          to="/devutilities"
          className="inline-block mb-4 text-sm hover:underline"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">
          User Agent Parser & Client Info Inspector
        </h1>

        <p className="mb-6 text-sm opacity-70">
          Analyze user agent strings and inspect browser information.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            className={`p-5 rounded-xl border ${
              dark ? "border-zinc-800" : "border-zinc-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">
              Client Information
            </h2>

            <p>
              <strong>Viewport Width:</strong> {viewport.width}px
            </p>

            <p>
              <strong>Viewport Height:</strong> {viewport.height}px
            </p>
            <p>
  <strong>Device Pixel Ratio:</strong> {window.devicePixelRatio}
</p>
<p>
  <strong>Screen Resolution:</strong>{" "}
  {window.screen.width} × {window.screen.height}
</p>

            <p>
              <strong>Language:</strong> {navigator.language}
            </p>

            <p>
  <strong>Timezone:</strong>{" "}
  {Intl.DateTimeFormat().resolvedOptions().timeZone}
</p>
<p>
  <strong>Online Status:</strong>{" "}
  {navigator.onLine ? "Online" : "Offline"}
</p>
<p>
  <strong>Hardware Concurrency:</strong>{" "}
  {navigator.hardwareConcurrency}
</p>
            <p>
              <strong>Platform:</strong> {navigator.platform}
            </p>

            <p>
              <strong>Cookies Enabled:</strong>{" "}
              {navigator.cookieEnabled ? "Yes" : "No"}
            </p>
            <p>
            <strong>Browser:</strong> {browser}
            </p>
            <p>
            <strong>OS:</strong> {os}
            </p>
            <p><strong>Device Type:</strong> {deviceType}
            </p>

        <p>
            <strong>Rendering Engine:</strong> {engine}
        </p>
          </div>

          <div
            className={`p-5 rounded-xl border ${
              dark ? "border-zinc-800" : "border-zinc-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">
              User Agent String
            </h2>

            <textarea
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              className={`w-full h-48 p-3 rounded-lg border ${
                dark
                  ? "bg-zinc-900 border-zinc-700"
                  : "bg-gray-50 border-gray-300"
              }`}
            />

            <textarea
  value={userAgent}
  onChange={(e) => setUserAgent(e.target.value)}
  className={`w-full h-48 p-3 rounded-lg border ${
    dark
      ? "bg-zinc-900 border-zinc-700"
      : "bg-gray-50 border-gray-300"
  }`}
/>

<p className="mt-3 text-sm">
  <strong>Characters:</strong> {userAgent.length}
</p>
<button
  onClick={() => {
    navigator.clipboard.writeText(userAgent);
    alert("Copied!");
  }}
  className="mt-3 px-4 py-2 rounded-lg border"
>
  Copy User Agent
</button>

<button
  onClick={() => setUserAgent("")}
  className="mt-3 ml-3 px-4 py-2 rounded-lg border"
>
    
  Clear
</button>

<button
  onClick={() => setUserAgent(navigator.userAgent)}
  className="mt-3 ml-3 px-4 py-2 rounded-lg border"
>
  Detect My UA
</button>

<div className="mt-3 flex flex-wrap gap-2">
  <button
    onClick={() => loadSampleUA(sampleUAs.Googlebot)}
    className="px-3 py-2 rounded-lg border"
  >
    Googlebot
  </button>

  <button
    onClick={() => loadSampleUA(sampleUAs["Safari iPhone"])}
    className="px-3 py-2 rounded-lg border"
  >
    Safari iPhone
  </button>

  <button
    onClick={() => loadSampleUA(sampleUAs["Chrome Android"])}
    className="px-3 py-2 rounded-lg border"
  >
    Chrome Android
  </button>

  <button
    onClick={() => loadSampleUA(sampleUAs["Firefox Linux"])}
    className="px-3 py-2 rounded-lg border"
  >
    Firefox Linux
  </button>
</div>

<button
  onClick={() =>
    navigator.clipboard.writeText(
      JSON.stringify(
        {
          browser,
          os,
          deviceType,
          engine,
          language: navigator.language,
        },
        null,
        2
      )
    )
  }
  className="mt-3 ml-3 px-4 py-2 rounded-lg border"
>
  Copy Details
</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAgentParser;