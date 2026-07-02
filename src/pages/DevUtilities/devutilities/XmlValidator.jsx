import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const VALID_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102" available="true"/>
</catalog>`;

const INVALID_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide
    <genre>Computer</genre>
    <price>44.95</price>
  </book>
</catalog>`;

// Tokens we care about while pretty-printing / minifying.
const PI_RE = /^<\?[\s\S]*\?>$/;
const COMMENT_RE = /^<!--[\s\S]*-->$/;
const CDATA_RE = /^<!\[CDATA\[[\s\S]*\]\]>$/;
const CLOSING_RE = /^<\/[^>]+>$/;
const SELF_CLOSING_RE = /^<[^>]+\/>$/;
const TOKEN_RE =
  /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]+>|[^<]+/g;

// Extracts the browser's native parsererror message into a friendlier,
// structured shape: { description, line, column }.
const parseErrorDetails = (rawMessage) => {
  const lineMatch = rawMessage.match(/line\s*(?:number)?\s*[: ]?\s*(\d+)/i);
  const columnMatch = rawMessage.match(/column\s*[: ]?\s*(\d+)/i);
  const descMatch =
    rawMessage.match(/error on line \d+ at column \d+:\s*(.+)/i) ||
    rawMessage.match(/error:\s*(.+)/i);

  const firstLine = rawMessage
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return {
    line: lineMatch ? lineMatch[1] : null,
    column: columnMatch ? columnMatch[1] : null,
    description: descMatch ? descMatch[1].split("\n")[0].trim() : firstLine,
  };
};

// Parses the given string with the browser's native DOMParser and reports
// whether it is well-formed XML.
const validateXml = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const errorNode = xmlDoc.getElementsByTagName("parsererror")[0];

  if (errorNode) {
    return { valid: false, details: parseErrorDetails(errorNode.textContent), doc: null };
  }

  return { valid: true, details: null, doc: xmlDoc };
};

// Beautifies an XML string using a lightweight, dependency-free tokenizer.
const beautifyXml = (xmlString, indentUnit) => {
  const normalized = xmlString.trim().replace(/>\s+</g, "><");
  const tokens = normalized.match(TOKEN_RE) || [];

  let depth = 0;
  const lines = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    if (!token) continue;

    if (CLOSING_RE.test(token)) {
      depth = Math.max(depth - 1, 0);
      lines.push(indentUnit.repeat(depth) + token);
    } else if (
      PI_RE.test(token) ||
      COMMENT_RE.test(token) ||
      CDATA_RE.test(token) ||
      SELF_CLOSING_RE.test(token)
    ) {
      lines.push(indentUnit.repeat(depth) + token);
    } else if (token.startsWith("<")) {
      const next = tokens[i + 1] ? tokens[i + 1].trim() : "";
      const afterNext = tokens[i + 2] ? tokens[i + 2].trim() : "";

      // Collapse "<tag>text</tag>" onto a single line instead of three.
      if (next && !next.startsWith("<") && CLOSING_RE.test(afterNext)) {
        lines.push(indentUnit.repeat(depth) + token + next + afterNext);
        i += 2;
      } else {
        lines.push(indentUnit.repeat(depth) + token);
        depth++;
      }
    } else {
      lines.push(indentUnit.repeat(depth) + token);
    }
  }

  return lines.join("\n");
};

// Strips comments and inter-tag whitespace to minify the document.
const minifyXml = (xmlString) =>
  xmlString
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .trim();

const getRootTagName = (xmlString) => {
  const match = xmlString.match(/<([a-zA-Z_][\w.-]*)/);
  return match ? match[1] : "document";
};

const XmlValidator = () => {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [status, setStatus] = useState(null); // { valid, description, line, column }

  const runValidation = (xmlString) => {
    if (!xmlString.trim()) {
      setStatus(null);
      return null;
    }
    const result = validateXml(xmlString);
    if (result.valid) {
      setStatus({ valid: true });
    } else {
      setStatus({ valid: false, ...result.details });
    }
    return result;
  };

  const getIndentUnit = () => (indent === "tab" ? "\t" : " ".repeat(Number(indent)));

  const handleBeautify = () => {
    if (!input.trim()) return;
    const result = runValidation(input);
    if (!result || !result.valid) {
      toast.error("Fix the XML errors before formatting");
      return;
    }
    setOutput(beautifyXml(input, getIndentUnit()));
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    const result = runValidation(input);
    if (!result || !result.valid) {
      toast.error("Fix the XML errors before minifying");
      return;
    }
    setOutput(minifyXml(input));
  };

  const handleValidate = () => {
    if (!input.trim()) {
      toast.error("Paste some XML first");
      return;
    }
    const result = runValidation(input);
    if (result?.valid) {
      toast.success("XML is valid");
    } else {
      toast.error("XML is invalid");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setStatus(null);
  };

  const handleLoadValidSample = () => {
    setInput(VALID_SAMPLE);
    setOutput("");
    setStatus(null);
  };

  const handleLoadInvalidSample = () => {
    setInput(INVALID_SAMPLE);
    setOutput("");
    setStatus(null);
  };

  const handleCopy = async () => {
    try {
      if (!output) return;
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const rootName = getRootTagName(output);
    const blob = new Blob([output], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rootName || "document"}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buttons = [
    { label: "Validate", onClick: handleValidate },
    { label: "Beautify", onClick: handleBeautify },
    { label: "Minify", onClick: handleMinify },
    { label: "Clear", onClick: handleClear },
  ];

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>XML Validator & Formatter — DevTasks</title>
      <meta
        name="description"
        content="Validate XML syntax offline, see exact error locations, and beautify or minify XML data."
      />

      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3 w-full min-w-0">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
            }`}
            title="Back to Workspace"
          >
            <svg
              className="w-4 h-4"
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
          <h1
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            XML Validator & Formatter
          </h1>

          <select
            value={indent}
            onChange={(e) => setIndent(e.target.value)}
            title="Indentation"
            className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none transition-all duration-300 shrink-0 ${
              dark
                ? "bg-zinc-800 border-zinc-700 text-white"
                : "bg-white border-neutral-300 text-black"
            }`}
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </div>

        <div className="w-full md:h-[520px] p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-4">
            {/* Input panel */}
            <div className="group w-full flex flex-col space-y-2">
              <div className="flex items-center justify-between h-8 gap-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Input
                </label>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleLoadValidSample}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-300 ${
                      dark
                        ? "bg-white text-black border-white hover:bg-zinc-200"
                        : "bg-black text-white border-black hover:bg-zinc-800"
                    }`}
                  >
                    Valid Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadInvalidSample}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-300 ${
                      dark
                        ? "border-zinc-700 text-white hover:bg-zinc-800"
                        : "border-neutral-300 text-black hover:bg-neutral-100"
                    }`}
                  >
                    Invalid Sample
                  </button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (!e.target.value.trim()) setStatus(null);
                }}
                placeholder="<root><item>value</item></root>"
                spellCheck={false}
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {buttons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    type="button"
                    className={`w-full px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                      dark
                        ? "border-white text-white hover:bg-white hover:text-black"
                        : "border-black text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output panel */}
            <div className="group w-full flex flex-col space-y-2">
              <div className="flex items-center h-8">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Output
                </label>
              </div>

              {status && (
                <div
                  className={`px-4 py-3 rounded-2xl border text-sm font-medium transition-colors duration-300 ${
                    status.valid
                      ? dark
                        ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                        : "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : dark
                      ? "bg-red-950/40 border-red-800 text-red-300"
                      : "bg-red-50 border-red-300 text-red-700"
                  }`}
                >
                  {status.valid ? (
                    "✅ XML is valid"
                  ) : (
                    <div className="space-y-1">
                      <div>❌ XML is invalid</div>
                      {status.description && (
                        <div className="text-xs opacity-90 break-words">
                          {status.description}
                        </div>
                      )}
                      {(status.line || status.column) && (
                        <div className="text-xs opacity-75">
                          {status.line && `Line ${status.line}`}
                          {status.line && status.column && ", "}
                          {status.column && `Column ${status.column}`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <textarea
                value={output}
                readOnly
                spellCheck={false}
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCopy}
                  type="button"
                  className={`w-32 px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                    dark
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                  }`}
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  type="button"
                  className={`w-32 px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                    dark
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                  }`}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XmlValidator;
