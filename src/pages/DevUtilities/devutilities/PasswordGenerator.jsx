import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import {
  FaKey,
  FaLock,
  FaCopy,
  FaRedo,
  FaShieldAlt,
  FaChevronLeft,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SPECIAL = "!@#$%^&*()_+~|}{[]:;?><,./-=";
const SIMILAR = "il1Lo0O";

export default function PasswordGenerator() {
  const { dark } = useTheme();

  // Generator states
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [special, setSpecial] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showGenerated, setShowGenerated] = useState(true);

  // Analyzer states
  const [testPassword, setTestPassword] = useState("");
  const [showTest, setShowTest] = useState(false);

  const generatePassword = () => {
    const getCleanedSet = (set) => {
      return excludeSimilar
        ? [...set].filter((char) => !SIMILAR.includes(char)).join("")
        : set;
    };

    let pool = "";
    let mandatory = [];

    if (uppercase) {
      const set = getCleanedSet(UPPER);
      pool += set;
      if (set.length) mandatory.push(set[Math.floor(Math.random() * set.length)]);
    }
    if (lowercase) {
      const set = getCleanedSet(LOWER);
      pool += set;
      if (set.length) mandatory.push(set[Math.floor(Math.random() * set.length)]);
    }
    if (numbers) {
      const set = getCleanedSet(NUMBERS);
      pool += set;
      if (set.length) mandatory.push(set[Math.floor(Math.random() * set.length)]);
    }
    if (special) {
      const set = getCleanedSet(SPECIAL);
      pool += set;
      if (set.length) mandatory.push(set[Math.floor(Math.random() * set.length)]);
    }

    if (!pool.length) {
      setGeneratedPassword("");
      return;
    }

    // Fill the rest with random characters from the pool
    let result = [...mandatory];
    for (let i = result.length; i < length; i++) {
      result.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    // Shuffle the result
    result = result.sort(() => Math.random() - 0.5).join("");
    setGeneratedPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, uppercase, lowercase, numbers, special, excludeSimilar]);

  const getPoolSize = (password) => {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/[0-9]/.test(password)) size += 10;
    if (/[^a-zA-Z0-9]/.test(password)) size += 33;
    return size;
  };

  const calculateEntropy = (password) => {
    const poolSize = getPoolSize(password);
    if (!password || !poolSize) return 0;
    return password.length * Math.log2(poolSize);
  };

  const getStrengthMetrics = (pwd) => {
    const ent = calculateEntropy(pwd);
    if (!pwd) {
      return {
        label: "Empty",
        color: dark
          ? "text-zinc-400 bg-zinc-400/10 border-zinc-400/20"
          : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
        barColor: "bg-zinc-400",
        percent: 0,
      };
    }
    if (ent < 36) {
      return {
        label: "Weak",
        color: dark
          ? "text-rose-400 bg-[#f43f5e]/15 border-[#f43f5e]/30"
          : "text-rose-600 bg-rose-50 border-rose-200",
        barColor: "bg-rose-500",
        percent: 25,
      };
    }
    if (ent < 60) {
      return {
        label: "Medium",
        color: dark
          ? "text-amber-400 bg-[#f59e0b]/15 border-[#f59e0b]/30"
          : "text-amber-700 bg-amber-50 border-amber-200",
        barColor: "bg-amber-500",
        percent: 50,
      };
    }
    if (ent < 80) {
      return {
        label: "Strong",
        color: dark
          ? "text-emerald-450 bg-[#10b981]/15 border-[#10b981]/30"
          : "text-emerald-700 bg-emerald-50 border-emerald-200",
        barColor: "bg-emerald-500",
        percent: 75,
      };
    }
    return {
      label: "Secure",
      color: dark
        ? "text-blue-400 bg-[#3b82f6]/15 border-[#3b82f6]/30"
        : "text-blue-700 bg-blue-50 border-blue-200",
      barColor: dark ? "bg-blue-500" : "bg-blue-600",
      percent: 100,
    };
  };

  const getCrackTime = (pwd) => {
    const ent = calculateEntropy(pwd);
    if (!pwd) return "N/A";
    if (ent < 30) return "Instantly";
    if (ent < 45) return "Seconds to Minutes";
    if (ent < 60) return "Hours to Days";
    if (ent < 75) return "Weeks to Months";
    if (ent < 90) return "Years to Centuries";
    return "Effectively Uncrackable";
  };

  const handleCopy = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast.success("Generated password copied to clipboard!");
    } catch {
      toast.error("Failed to copy password");
    }
  };

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-black font-extrabold",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-250 text-black placeholder-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 focus:outline-none",
      select:
        "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
      buttonPrimary: "bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm",
      buttonSecondary: "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors",
      label: "text-zinc-500 font-semibold tracking-wider text-xs uppercase",
      result: "bg-zinc-50 border-zinc-200 text-black",
      infoCard: "bg-zinc-50/55 border-zinc-150/85 text-zinc-600",
      badge: "bg-zinc-100 text-zinc-700",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-white font-extrabold",
      subtext: "text-zinc-400",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-lg",
      input:
        "bg-zinc-950/70 border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:ring-2 focus:ring-white/5 focus:outline-none",
      select:
        "bg-zinc-950/70 border-zinc-800 text-white focus:border-zinc-750 focus:outline-none",
      buttonPrimary: "bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm",
      buttonSecondary: "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors",
      label: "text-zinc-400 font-semibold tracking-wider text-xs uppercase",
      result: "bg-zinc-950/80 border-zinc-800 text-white",
      infoCard: "bg-zinc-900/40 border-zinc-800/60 text-zinc-400",
      badge: "bg-zinc-800/50 text-zinc-300",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const generatedMetrics = getStrengthMetrics(generatedPassword);
  const testMetrics = getStrengthMetrics(testPassword);

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-10 transition-colors duration-300 relative overflow-x-hidden`}>
      <title>Secure Password Generator & Strength Analyzer — DevTasks</title>
      <meta
        name="description"
        content="Generate strong random passwords and analyze strength, entropy, and crack time offline."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-350"
            }`}
            title="Back to Workspace"
          >
            <FaChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${dark ? "text-white" : "text-black"}`}>
              Password Generator & Analyzer
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Generate strong random passwords with custom parameters and analyze their strength, entropy, and crack times offline.
            </p>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Generator (7/12) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Output Display Card */}
            <div className={`rounded-2xl border p-6 ${t.card} flex flex-col gap-4 relative overflow-hidden`}>
              <div className="flex justify-between items-center">
                <span className={t.label}>Generated Password</span>
                {generatedPassword && (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${generatedMetrics.color}`}>
                    {generatedMetrics.label}
                  </span>
                )}
              </div>

              {/* Password Result Box */}
              <div className="flex gap-2">
                <div
                  className={`flex-1 p-4 rounded-xl border font-mono text-lg break-all select-all flex items-center justify-between tracking-wide ${
                    dark ? "bg-zinc-950/70 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <span className={showGenerated ? (dark ? "text-white" : "text-black") : (dark ? "text-zinc-500" : "text-zinc-400") + " tracking-widest font-sans"}>
                    {showGenerated ? generatedPassword : "•".repeat(Math.min(length, 24))}
                  </span>
                  
                  {/* Eye hide/show */}
                  <button
                    onClick={() => setShowGenerated(!showGenerated)}
                    className={`ml-3 cursor-pointer ${dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-800"}`}
                    title={showGenerated ? "Hide Password" : "Show Password"}
                  >
                    {showGenerated ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Regenerate Action */}
                <button
                  onClick={generatePassword}
                  className={`p-4 rounded-xl border cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0 ${
                    dark
                      ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white"
                      : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                  }`}
                  title="Regenerate Password"
                >
                  <FaRedo className="w-4 h-4" />
                </button>
              </div>

              {/* Strength Indicators */}
              {generatedPassword && (
                <div className="flex flex-col gap-2">
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${dark ? "bg-zinc-800" : "bg-zinc-200"}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${generatedMetrics.barColor}`}
                      style={{ width: `${generatedMetrics.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <span>Entropy: {calculateEntropy(generatedPassword).toFixed(1)} bits</span>
                    <span>Est. Crack: {getCrackTime(generatedPassword)}</span>
                  </div>
                </div>
              )}

              {/* Copy Action */}
              <button
                onClick={handleCopy}
                disabled={!generatedPassword}
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] ${t.buttonPrimary}`}
              >
                <FaCopy className="w-4 h-4" /> Copy Generated Password
              </button>
            </div>

            {/* Config Options Card */}
            <div className={`rounded-2xl border p-6 ${t.card} flex flex-col gap-6`}>
              <h2 className={`text-sm font-bold tracking-wide uppercase ${dark ? "text-white" : "text-black"}`}>
                Generator Configurations
              </h2>

              {/* Length Selection */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className={t.label}>Password Length</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${dark ? "bg-blue-400/10 text-blue-400" : "bg-blue-600/10 text-blue-600"}`}>
                    {length} Characters
                  </span>
                </div>
                
                <input
                  type="range"
                  min="6"
                  max="128"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 ${dark ? "bg-zinc-800" : "bg-zinc-200"}`}
                />

                {/* Popular lengths quick selectors */}
                <div className="flex gap-2">
                  {[12, 16, 24, 32, 64].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        length === l
                          ? (dark ? "bg-white border-white text-zinc-950" : "bg-zinc-900 border-zinc-900 text-white")
                          : (dark ? "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200" : "border-zinc-200 text-zinc-650 hover:border-zinc-350 hover:text-zinc-900")
                      }`}
                    >
                      {l} Chars
                    </button>
                  ))}
                </div>
              </div>

              {/* Character set checkboxes */}
              <div className="flex flex-col gap-4">
                <span className={t.label}>Character Rules</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Uppercase toggle */}
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      uppercase
                        ? (dark ? "border-blue-400/30 bg-blue-400/5 text-white" : "border-blue-600/30 bg-blue-600/5 text-black")
                        : (dark ? "border-zinc-800 text-zinc-400 hover:border-zinc-700" : "border-zinc-200 text-zinc-700 hover:border-zinc-300")
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={uppercase}
                      onChange={(e) => setUppercase(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer animate-none"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Uppercase Characters</span>
                      <span className="text-[10px] text-zinc-500">e.g. A, B, C, D...</span>
                    </div>
                  </label>

                  {/* Lowercase toggle */}
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      lowercase
                        ? (dark ? "border-blue-400/30 bg-blue-400/5 text-white" : "border-blue-600/30 bg-blue-600/5 text-black")
                        : (dark ? "border-zinc-800 text-zinc-400 hover:border-zinc-700" : "border-zinc-200 text-zinc-700 hover:border-zinc-300")
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={lowercase}
                      onChange={(e) => setLowercase(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer animate-none"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Lowercase Characters</span>
                      <span className="text-[10px] text-zinc-500">e.g. a, b, c, d...</span>
                    </div>
                  </label>

                  {/* Numbers toggle */}
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      numbers
                        ? (dark ? "border-blue-400/30 bg-blue-400/5 text-white" : "border-blue-600/30 bg-blue-600/5 text-black")
                        : (dark ? "border-zinc-800 text-zinc-400 hover:border-zinc-700" : "border-zinc-200 text-zinc-700 hover:border-zinc-300")
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={numbers}
                      onChange={(e) => setNumbers(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer animate-none"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Include Numbers</span>
                      <span className="text-[10px] text-zinc-500">e.g. 0, 1, 2, 3...</span>
                    </div>
                  </label>

                  {/* Special toggle */}
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      special
                        ? (dark ? "border-blue-400/30 bg-blue-400/5 text-white" : "border-blue-600/30 bg-blue-600/5 text-black")
                        : (dark ? "border-zinc-800 text-zinc-400 hover:border-zinc-700" : "border-zinc-200 text-zinc-700 hover:border-zinc-300")
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={special}
                      onChange={(e) => setSpecial(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer animate-none"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Include Special Symbols</span>
                      <span className="text-[10px] text-zinc-500">e.g. !, @, #, $...</span>
                    </div>
                  </label>
                </div>

                {/* Exclude Similar characters toggle */}
                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none mt-2 ${
                    excludeSimilar
                      ? (dark ? "border-blue-400/30 bg-blue-400/5 text-white" : "border-blue-600/30 bg-blue-600/5 text-black")
                      : (dark ? "border-zinc-800 text-zinc-400 hover:border-zinc-700" : "border-zinc-200 text-zinc-700 hover:border-zinc-300")
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={excludeSimilar}
                    onChange={(e) => setExcludeSimilar(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer animate-none"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Exclude Similar Characters</span>
                    <span className="text-[10px] text-zinc-500">Avoid confusing characters (e.g. i, l, 1, L, o, 0, O)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Analyzer (5/12) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Analyzer Card */}
            <div className={`rounded-2xl border p-6 ${t.card} flex flex-col gap-5`}>
              <h2 className={`text-sm font-bold tracking-wide uppercase ${dark ? "text-white" : "text-black"}`}>
                Password Strength Analyzer
              </h2>

              <div className="flex flex-col gap-2">
                <span className={t.label}>Test Password</span>
                
                <div className="relative">
                  <input
                    type={showTest ? "text" : "password"}
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="Enter any password to test..."
                    className={`w-full p-4 pr-12 rounded-xl border font-mono text-sm outline-none transition-all duration-200 focus:ring-2 ${
                      dark
                        ? "bg-zinc-950/70 border-zinc-800 text-white focus:ring-blue-450/10 focus:border-blue-500"
                        : "bg-zinc-50 border-zinc-250 text-black focus:ring-blue-600/10 focus:border-blue-600"
                    }`}
                  />
                  
                  {/* Eye hide/show */}
                  {testPassword && (
                    <button
                      onClick={() => setShowTest(!showTest)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${dark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-800"}`}
                      title={showTest ? "Hide Input" : "Show Input"}
                    >
                      {showTest ? <FaEyeSlash className="w-4.5 h-4.5" /> : <FaEye className="w-4.5 h-4.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Strength analysis outcomes */}
              {testPassword && (
                <div className="flex flex-col gap-5 pt-2">
                  
                  {/* Strength Bar */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400">Strength Rating</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${testMetrics.color}`}>
                        {testMetrics.label}
                      </span>
                    </div>
                    
                    <div className={`h-2 w-full rounded-full overflow-hidden ${dark ? "bg-zinc-800" : "bg-zinc-200"}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${testMetrics.barColor}`}
                        style={{ width: `${testMetrics.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Quantitative Details */}
                  <div className={`flex flex-col gap-3.5 border-t pt-4 ${dark ? "border-zinc-800/80" : "border-zinc-200/50"}`}>
                    
                    {/* Entropy Score */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-500">Entropy Score</span>
                      <span className={`font-bold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                        {calculateEntropy(testPassword).toFixed(1)} bits
                      </span>
                    </div>

                    {/* Crack Time */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-500">Estimated Crack Time</span>
                      <span className={`font-bold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                        {getCrackTime(testPassword)}
                      </span>
                    </div>
                  </div>

                  {/* Criteria Checklist */}
                  <div className={`flex flex-col gap-2.5 border-t pt-4 ${dark ? "border-zinc-800/80" : "border-zinc-200/50"}`}>
                    <span className={t.label}>Composition Breakdown</span>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-zinc-500">
                      <div className="flex items-center gap-2">
                        {/[A-Z]/.test(testPassword) ? (
                          <FaCheckCircle className="text-emerald-500 w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <FaTimesCircle className="text-rose-500/40 w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>Uppercase (A-Z)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/[a-z]/.test(testPassword) ? (
                          <FaCheckCircle className="text-emerald-500 w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <FaTimesCircle className="text-rose-500/40 w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>Lowercase (a-z)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/[0-9]/.test(testPassword) ? (
                          <FaCheckCircle className="text-emerald-500 w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <FaTimesCircle className="text-rose-500/40 w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>Numbers (0-9)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/[^a-zA-Z0-9]/.test(testPassword) ? (
                          <FaCheckCircle className="text-emerald-500 w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <FaTimesCircle className="text-rose-500/40 w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>Symbols (!@#...)</span>
                      </div>
                    </div>

                    <div className={`flex justify-between items-center text-[11px] font-semibold text-zinc-500 mt-1 border-t border-dashed pt-2 ${
                      dark ? "border-zinc-800/40" : "border-zinc-200/50"
                    }`}>
                      <span>Characters Count</span>
                      <span className={`font-bold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                        {testPassword.length} Chars
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyzer Guide when empty */}
              {!testPassword && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                    dark
                      ? "bg-zinc-950/40 border-zinc-800 text-zinc-400"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <FaInfoCircle className={`w-5 h-5 shrink-0 mt-0.5 ${dark ? "text-blue-400" : "text-blue-600"}`} />
                  <div>
                    Type or paste a password above to evaluate its security strength against standard dictionary crack tests, composition checks, and mathematical entropy calculations.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
