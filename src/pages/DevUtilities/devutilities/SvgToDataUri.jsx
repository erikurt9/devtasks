import { useMemo, useState } from "react";
import { FaCopy, FaEye, FaFileCode, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import { createSvgOutputs } from "./svgDataUri";

const SAMPLE_SVG = `<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="160" rx="32" fill="#18181b"/>
  <path d="M48 82l20 20 44-48" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function validateSvg(svg) {
  if (!svg.trim()) {
    return { valid: false, message: "Paste SVG markup to generate a preview." };
  }

  try {
    const document = new DOMParser().parseFromString(svg, "image/svg+xml");
    const parserError = document.querySelector("parsererror");

    if (parserError || document.documentElement.localName !== "svg") {
      return { valid: false, message: "The SVG markup could not be parsed." };
    }

    return { valid: true, message: "SVG parsed successfully." };
  } catch {
    return { valid: false, message: "The SVG markup could not be parsed." };
  }
}

function SvgToDataUri() {
  const { dark } = useTheme();
  const [svg, setSvg] = useState("");
  const [quoteStyle, setQuoteStyle] = useState("double");

  const outputs = useMemo(
    () => createSvgOutputs(svg, quoteStyle),
    [svg, quoteStyle],
  );
  const validation = useMemo(() => validateSvg(svg), [svg]);

  const theme = {
    wrapper: dark
      ? "bg-[#090A0F] text-zinc-100"
      : "bg-[#F8F9FA] text-zinc-900",
    card: dark
      ? "bg-zinc-900/50 border-zinc-800/85 shadow-lg"
      : "bg-white border-zinc-200/85 shadow-sm",
    input: dark
      ? "bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600"
      : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400",
    secondary: dark
      ? "bg-zinc-950/50 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white"
      : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950",
    active: dark
      ? "bg-white text-zinc-950 border-white"
      : "bg-zinc-900 text-white border-zinc-900",
    inactive: dark
      ? "bg-zinc-950/50 text-zinc-400 border-zinc-800 hover:text-white"
      : "bg-white text-zinc-600 border-zinc-200 hover:text-zinc-950",
    subtext: dark ? "text-zinc-400" : "text-zinc-500",
    preview: dark
      ? "bg-zinc-950/70 border-zinc-800"
      : "bg-zinc-50 border-zinc-200",
  };

  const copy = async (value, label) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const outputFields = [
    ["CSS Background Image", outputs.css],
    ["HTML Image Tag", outputs.html],
    ["Base64 Data URI", outputs.base64],
    ["Raw URL-encoded Data URI", outputs.raw],
  ];

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-colors duration-300 sm:px-6 ${theme.wrapper}`}
    >
      <title>SVG to Data URI Converter — DevTasks</title>
      <meta
        name="description"
        content="Convert raw SVG markup into optimized CSS background-image statements and data URIs offline."
      />

      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center gap-4">
          <Link
            to="/devutilities"
            className={`flex shrink-0 items-center justify-center rounded-xl border p-2.5 transition-all active:scale-95 ${theme.secondary}`}
            title="Back to Dev Utilities"
            aria-label="Back to Dev Utilities"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              SVG to Data URI Converter
            </h1>
            <p className={`mt-1 text-sm ${theme.subtext}`}>
              Create compact CSS, HTML, and Base64 SVG snippets entirely in
              your browser.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <section className={`rounded-3xl border p-6 sm:p-8 ${theme.card}`}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FaFileCode className="text-zinc-500" />
                <h2 className="text-lg font-bold">SVG Input</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSvg(SAMPLE_SVG);
                    toast.success("Sample SVG loaded");
                  }}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${theme.secondary}`}
                >
                  Load sample
                </button>
                <button
                  type="button"
                  onClick={() => setSvg("")}
                  disabled={!svg}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${theme.secondary}`}
                >
                  <FaTrash className="mr-1 inline" /> Clear
                </button>
              </div>
            </div>

            <label
              htmlFor="svg-input"
              className={`mb-2 block text-xs font-bold uppercase tracking-wider ${theme.subtext}`}
            >
              Raw SVG markup
            </label>
            <textarea
              id="svg-input"
              rows={16}
              value={svg}
              onChange={(event) => setSvg(event.target.value)}
              placeholder={'<svg viewBox="0 0 24 24">...</svg>'}
              spellCheck={false}
              className={`w-full resize-y rounded-2xl border p-4 font-mono text-xs leading-relaxed outline-none transition-colors ${theme.input}`}
            />

            <fieldset className="mt-6">
              <legend
                className={`mb-3 text-xs font-bold uppercase tracking-wider ${theme.subtext}`}
              >
                CSS outer quote style
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["double", 'Double quotes (\"…\")'],
                  ["single", "Single quotes ('…')"],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setQuoteStyle(value)}
                    aria-pressed={quoteStyle === value}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-xs font-bold transition-colors ${
                      quoteStyle === value ? theme.active : theme.inactive
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className={`mt-3 text-xs leading-relaxed ${theme.subtext}`}>
                Conflicting SVG quotes are encoded to preserve the selected
                CSS wrapper.
              </p>
            </fieldset>
          </section>

          <section className="space-y-6">
            <div className={`rounded-3xl border p-6 sm:p-8 ${theme.card}`}>
              <div className="mb-4 flex items-center gap-2.5">
                <FaEye className="text-zinc-500" />
                <h2 className="text-lg font-bold">Live Preview</h2>
              </div>
              <div
                className={`flex min-h-48 items-center justify-center rounded-2xl border bg-[linear-gradient(45deg,rgba(127,127,127,.08)_25%,transparent_25%),linear-gradient(-45deg,rgba(127,127,127,.08)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(127,127,127,.08)_75%),linear-gradient(-45deg,transparent_75%,rgba(127,127,127,.08)_75%)] bg-[length:20px_20px] ${theme.preview}`}
              >
                {validation.valid ? (
                  <div
                    role="img"
                    aria-label="Converted SVG preview"
                    className="h-32 w-32 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${outputs.preview}")` }}
                  />
                ) : (
                  <p className={`px-6 text-center text-sm ${theme.subtext}`}>
                    {validation.message}
                  </p>
                )}
              </div>
              {svg && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-3 text-xs ${
                    validation.valid ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {validation.message}
                </p>
              )}
            </div>

            <div className={`rounded-3xl border p-6 sm:p-8 ${theme.card}`}>
              <h2 className="mb-5 text-lg font-bold">Generated Outputs</h2>
              <div className="space-y-5">
                {outputFields.map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        className={`text-xs font-bold uppercase tracking-wider ${theme.subtext}`}
                      >
                        {label}
                      </label>
                      <button
                        type="button"
                        onClick={() => copy(value, label)}
                        disabled={!value}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${theme.secondary}`}
                        aria-label={`Copy ${label}`}
                      >
                        <FaCopy /> Copy
                      </button>
                    </div>
                    <textarea
                      value={value}
                      readOnly
                      rows={label === "CSS Background Image" ? 3 : 2}
                      placeholder="Output appears as you type..."
                      spellCheck={false}
                      aria-label={label}
                      className={`w-full resize-y rounded-xl border p-3 font-mono text-xs leading-relaxed outline-none ${theme.input}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SvgToDataUri;
