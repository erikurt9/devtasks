import { useState } from "react";
import { Link } from "react-router-dom";
import { dump, load } from "js-yaml";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";


const FORMATS = ["json", "yaml", "csv"];

const DELIMITER_OPTIONS = [
  { label: "Comma (,)", value: "," },
  { label: "Semicolon (;)", value: ";" },
  { label: "Tab (\\t)", value: "\t" },
];

const YAML_OPTIONS = { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false };

const SAMPLE_OBJECT = {
  app: { name: "DevTasks", environment: "development", version: "1.0.0", debug: true },
  server: {
    host: "localhost",
    port: 5173,
    cors: { enabled: true, origins: ["http://localhost:5173", "https://dev-tasks-beta.vercel.app"] },
  },
  features: [
    { key: "taskManagement", enabled: true },
    { key: "snippetVault", enabled: true },
    { key: "resourceHub", enabled: false },
  ],
  limits: { maxUploadMb: 10, retryAttempts: 3 },
};

const SAMPLE_CSV_ROWS = [
  { key: "taskManagement", enabled: "true", priority: "high" },
  { key: "snippetVault", enabled: "true", priority: "medium" },
  { key: "resourceHub", enabled: "false", priority: "low" },
];


const formatJsonParseError = (error, source) => {
  const message = error instanceof Error ? error.message : "Invalid JSON syntax.";
  if (/line\s+\d+\s+column\s+\d+/i.test(message)) return message;
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) return message;
  const position = Number(positionMatch[1]);
  if (Number.isNaN(position)) return message;
  const beforeError = source.slice(0, position);
  const line = beforeError.split("\n").length;
  const column = beforeError.length - beforeError.lastIndexOf("\n");
  return `${message} (line ${line}, column ${column})`;
};

const formatYamlParseError = (error) => {
  const message = error instanceof Error ? error.message : "Invalid YAML syntax.";
  if (error?.mark) {
    return `${error.reason || message} (line ${error.mark.line + 1}, column ${error.mark.column + 1})`;
  }
  return message;
};

const formatErrorFor = (format, error, source) => {
  if (format === "json") return { title: "Invalid JSON", message: formatJsonParseError(error, source) };
  if (format === "yaml") return { title: "Invalid YAML", message: formatYamlParseError(error) };
  return { title: "Invalid CSV", message: error instanceof Error ? error.message : "Invalid CSV input." };
};


const parseCsvLine = (line, delimiter) => {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (line.startsWith(delimiter, i)) { fields.push(current.trim()); current = ""; i += delimiter.length - 1; }
      else { current += ch; }
    }
  }
  fields.push(current.trim());
  return fields;
};

const escapeCsvField = (value, delimiter) => {
  const str = value === null || value === undefined ? "" : String(value);
  if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const parseCsv = (csv, delimiter = ",", hasHeader = true) => {
  const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];
  const firstRow = parseCsvLine(lines[0], delimiter);
  const headers = hasHeader ? firstRow : firstRow.map((_, i) => `field${i + 1}`);
  const dataLines = hasHeader ? lines.slice(1) : lines;
  return dataLines.map((line) => {
    const values = parseCsvLine(line, delimiter);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] !== undefined ? values[i] : ""; });
    return obj;
  });
};

const serializeCsv = (data, delimiter = ",", includeHeader = true) => {
  if (!Array.isArray(data) || data.length === 0)
    throw new Error("CSV export requires a non-empty array of objects.");
  const keys = data.reduce((acc, row) => {
    if (row && typeof row === "object") Object.keys(row).forEach((k) => { if (!acc.includes(k)) acc.push(k); });
    return acc;
  }, []);
  const rows = data.map((row) => keys.map((k) => escapeCsvField(row[k], delimiter)).join(delimiter));
  return includeHeader ? [keys.map((k) => escapeCsvField(k, delimiter)).join(delimiter), ...rows].join("\n") : rows.join("\n");
};

const parseSource = (text, format, delimiter, hasHeader) => {
  if (format === "json") return JSON.parse(text);
  if (format === "yaml") return load(text);
  if (format === "csv") return parseCsv(text, delimiter, hasHeader);
  throw new Error(`Unknown format: ${format}`);
};


const serializeTarget = (value, format, delimiter, hasHeader) => {
  if (format === "json") return JSON.stringify(value ?? null, null, 2);
  if (format === "yaml") return dump(value ?? null, YAML_OPTIONS);
  if (format === "csv") {
    const arr = Array.isArray(value) ? value : [value];
    return serializeCsv(arr, delimiter, hasHeader);
  }
  throw new Error(`Unknown format: ${format}`);
};


const runConvert = (sourceText, srcFmt, tgtFmt, delimiter, hasHeader) => {
  if (!sourceText.trim()) return { result: "", error: null };
  try {
    const parsed = parseSource(sourceText, srcFmt, delimiter, hasHeader);
    const result = serializeTarget(parsed, tgtFmt, delimiter, hasHeader);
    return { result, error: null };
  } catch (err) {
    
    const isSerializeError = err.message?.includes("CSV export requires");
    if (isSerializeError) {
      return {
        result: "",
        error: {
          title: "Cannot convert to CSV",
          message: "CSV output requires an array of objects. Make sure your source data is an array (JSON array or YAML list).",
        },
      };
    }
    return { result: "", error: formatErrorFor(srcFmt, err, sourceText) };
  }
};


const getSample = (format, delimiter) => {
  if (format === "json") return JSON.stringify(SAMPLE_OBJECT, null, 2);
  if (format === "yaml") return dump(SAMPLE_OBJECT, YAML_OPTIONS);
  if (format === "csv") return serializeCsv(SAMPLE_CSV_ROWS, delimiter, true);
  return "";
};


const buildTheme = (dark) => ({
  page: dark ? "bg-zinc-950" : "bg-[#F7F7F7]",
  panel: dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200",
  textarea: dark
    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black",
  textareaError: dark
    ? "bg-zinc-950 border-red-500/70 text-white focus:border-red-400 focus:ring-1 focus:ring-red-400"
    : "bg-neutral-50 border-red-400 text-black focus:border-red-500 focus:ring-1 focus:ring-red-500",
  textareaReadonly: dark
    ? "bg-zinc-900 border-zinc-800 text-zinc-300 cursor-default"
    : "bg-white border-neutral-200 text-zinc-700 cursor-default",
  softBtn: dark
    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
    : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400",
  primaryBtn: dark
    ? "bg-white text-black border-white hover:bg-zinc-200"
    : "bg-black text-white border-black hover:bg-zinc-800",
  fmtActive: dark
    ? "bg-white text-black"
    : "bg-black text-white",
  fmtInactive: dark
    ? "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
    : "bg-neutral-100 text-zinc-500 hover:text-black hover:bg-neutral-200",
  fmtWrap: dark ? "bg-zinc-800 border-zinc-700" : "bg-neutral-100 border-neutral-200",
  label: dark ? "text-zinc-500" : "text-neutral-400",
  heading: dark ? "text-white" : "text-black",
  subtext: dark ? "text-zinc-500" : "text-neutral-500",
  errorBox: dark ? "bg-red-950/30 border-red-900/70 text-red-200" : "bg-red-50 border-red-200 text-red-700",
  errorLabel: dark ? "text-red-100" : "text-red-800",
  optionsBar: dark ? "bg-zinc-800/60 border-zinc-700" : "bg-neutral-50 border-neutral-200",
  select: dark
    ? "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-white"
    : "bg-white border-neutral-300 text-black focus:border-black",
  checkLabel: dark ? "text-zinc-300" : "text-zinc-600",
  divider: dark ? "border-zinc-800" : "border-neutral-100",
  swapBtn: dark
    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-700"
    : "bg-white border-neutral-200 text-zinc-500 hover:text-black hover:border-neutral-400",
});


const FormatPills = ({ value, onChange, t }) => (
  <div className={`flex rounded-lg border overflow-hidden text-[11px] ${t.fmtWrap}`}>
    {FORMATS.map((fmt) => (
      <button
        key={fmt}
        type="button"
        onClick={() => onChange(fmt)}
        className={`px-3 py-1.5 font-black uppercase tracking-widest transition-all duration-150 ${
          value === fmt ? t.fmtActive : t.fmtInactive
        }`}
      >
        {fmt}
      </button>
    ))}
  </div>
);

const JsonYamlCsvConverter = () => {
  const { dark } = useTheme();
  const t = buildTheme(dark);

  const [srcFmt, setSrcFmt] = useState("json");
  const [tgtFmt, setTgtFmt] = useState("yaml");

  const [srcText, setSrcText] = useState("");
  const [tgtText, setTgtText] = useState("");

  const [delimiter, setDelimiter] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);

  const [error, setError] = useState(null); 


  const applyConversion = (text, sf, tf, delim, hdr) => {
    if (!text.trim()) {
      setTgtText("");
      setError(null);
      return;
    }
    const { result, error: err } = runConvert(text, sf, tf, delim, hdr);
    setTgtText(result);
    setError(err);
  };

  
  const handleSrcChange = (value) => {
    setSrcText(value);
    applyConversion(value, srcFmt, tgtFmt, delimiter, hasHeader);
  };

  
  const handleSrcFmtChange = (fmt) => {
    if (fmt === srcFmt) return;
    setSrcFmt(fmt);

    setSrcText("");
    setTgtText("");
    setError(null);
  };

  const handleTgtFmtChange = (fmt) => {
    if (fmt === tgtFmt) return;
    setTgtFmt(fmt);
    applyConversion(srcText, srcFmt, fmt, delimiter, hasHeader);
  };

  const handleSwap = () => {
    const prevSrcFmt = srcFmt;
    const prevTgtFmt = tgtFmt;
    const prevSrcText = srcText;
    const prevTgtText = tgtText;

    setSrcFmt(prevTgtFmt);
    setTgtFmt(prevSrcFmt);
    setSrcText(prevTgtText);
    applyConversion(prevTgtText, prevTgtFmt, prevSrcFmt, delimiter, hasHeader);
    if (!prevTgtText.trim()) setError(null);
  };

  const handleDelimiterChange = (delim) => {
    setDelimiter(delim);
    applyConversion(srcText, srcFmt, tgtFmt, delim, hasHeader);
  };

  const handleHeaderChange = (val) => {
    setHasHeader(val);
    applyConversion(srcText, srcFmt, tgtFmt, delimiter, val);
  };

  const handleSample = () => {
    const sample = getSample(srcFmt, delimiter);
    setSrcText(sample);
    applyConversion(sample, srcFmt, tgtFmt, delimiter, hasHeader);
    toast.success("Sample data loaded");
  };

  const handleFormat = () => {
    if (!srcText.trim()) return;
    try {
      const parsed = parseSource(srcText, srcFmt, delimiter, hasHeader);
      const beautified = serializeTarget(parsed, srcFmt, delimiter, hasHeader);
      setSrcText(beautified);
      applyConversion(beautified, srcFmt, tgtFmt, delimiter, hasHeader);
      toast.success("Formatted successfully");
    } catch (err) {
      const { title, message } = formatErrorFor(srcFmt, err, srcText);
      setError({ title, message });
      toast.error("Fix syntax errors before formatting");
    }
  };

  
  const handleClear = () => {
    setSrcText("");
    setTgtText("");
    setError(null);
  };

  const handleCopy = async (value, label) => {
    if (!value.trim()) { toast.error(`No ${label} to copy`); return; }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const showCsvOptions = srcFmt === "csv" || tgtFmt === "csv";


  return (
    <div className={`min-h-[calc(100vh-76px)] px-4 py-6 transition-colors duration-300 sm:px-6 ${t.page}`}>
      <title>JSON YAML CSV Converter — DevTasks</title>
      <meta name="description" content="Convert between JSON, YAML, and CSV formats offline with live validation." />

      <div className={`mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-3xl border shadow-xl transition-colors duration-300 ${t.panel}`}>

        {/* Accent bar */}
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        {/* ── Header ── */}
        <header className="flex flex-col gap-4 px-5 pt-6 sm:px-8 sm:pt-8">

          {/* Title + actions row */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/devutilities"
                className={`flex shrink-0 items-center justify-center rounded-xl border p-2.5 transition-all duration-200 active:scale-95 ${t.softBtn}`}
                title="Back to Workspace"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className={`text-xl font-black uppercase tracking-tight sm:text-2xl ${t.heading}`}>
                  JSON · YAML · CSV Converter
                </h1>
                <p className={`mt-0.5 text-sm font-medium ${t.subtext}`}>
                  Live conversion · works offline · no data leaves your browser
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleSample}
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.primaryBtn}`}>
                Sample Data
              </button>
              <button type="button" onClick={handleFormat}
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}>
                Format / Beautify
              </button>
              <button type="button" onClick={handleClear}
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}>
                Clear
              </button>
            </div>
          </div>

          {/* CSV options row */}
          {showCsvOptions && (
            <div className={`flex flex-wrap items-center gap-5 rounded-2xl border px-4 py-3 ${t.optionsBar}`}>
              <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>
                CSV Options
              </span>
              <label className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${t.checkLabel}`}>Delimiter</span>
                <select
                  value={delimiter}
                  onChange={(e) => handleDelimiterChange(e.target.value)}
                  className={`rounded-lg border px-2 py-1 text-xs font-mono outline-none ${t.select}`}
                >
                  {DELIMITER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => handleHeaderChange(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-current rounded"
                />
                <span className={`text-xs font-semibold ${t.checkLabel}`}>First row is header</span>
              </label>
              <span className={`ml-auto text-[11px] font-mono font-bold rounded-lg px-2 py-1 border ${t.optionsBar}`}>
                {srcFmt.toUpperCase()} → {tgtFmt.toUpperCase()}
              </span>
            </div>
          )}
        </header>

        {/* ── Editor panels ── */}
        <main className="flex flex-col gap-5 p-5 sm:p-8">
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_44px_1fr]">

            {/* Source panel */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>Source</span>
                  <FormatPills value={srcFmt} onChange={handleSrcFmtChange} t={t} />
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(srcText, `${srcFmt.toUpperCase()} source`)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}
                >
                  Copy
                </button>
              </div>
              <textarea
                value={srcText}
                onChange={(e) => handleSrcChange(e.target.value)}
                spellCheck={false}
                placeholder={
                  srcFmt === "json" ? '{\n  "key": "value"\n}'
                  : srcFmt === "yaml" ? "key: value"
                  : "column1,column2\nvalue1,value2"
                }
                className={`min-h-[340px] lg:min-h-[460px] w-full resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all duration-200 ${
                  error ? t.textareaError : t.textarea
                }`}
              />
            </section>

            {/* Swap button (centred, offset to align with textareas) */}
            <div className="flex items-center justify-center pt-0 lg:pt-10">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap panels"
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${t.swapBtn}`}
              >
                {/* Vertical arrows for large screens */}
                <svg className="hidden h-4 w-4 lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                {/* Horizontal arrows for small screens */}
                <svg className="h-4 w-4 lg:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7H4m0 0l4-4M4 7l4 4M8 17h12m0 0l-4-4m4 4l-4 4" />
                </svg>
              </button>
            </div>

            {/* Target panel (read-only output) */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>Output</span>
                  <FormatPills value={tgtFmt} onChange={handleTgtFmtChange} t={t} />
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(tgtText, `${tgtFmt.toUpperCase()} output`)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}
                >
                  Copy
                </button>
              </div>
              <textarea
                value={tgtText}
                readOnly
                spellCheck={false}
                placeholder={
                  tgtFmt === "json" ? "Converted JSON appears here…"
                  : tgtFmt === "yaml" ? "Converted YAML appears here…"
                  : "Converted CSV appears here…"
                }
                className={`min-h-[340px] lg:min-h-[460px] w-full resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all duration-200 select-all ${t.textareaReadonly}`}
              />
            </section>
          </div>

          {/* Error box */}
          {error && (
            <div
              className={`rounded-2xl border px-4 py-3 font-mono text-sm ${t.errorBox}`}
              role="alert"
              aria-live="polite"
            >
              <span className={`mr-2 font-black uppercase tracking-widest ${t.errorLabel}`}>
                {error.title}:
              </span>
              {error.message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JsonYamlCsvConverter;