import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import ThemeToggle from "../../../components/ThemeToggle";

const Base64Url = () => {
  const { dark } = useTheme();

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      {/* Page Metadata */}
      <title>Base64 & URL Converter | DevTasks</title>
      <meta name="description" content="Offline Base64 and URL encoding/decoding utility tool." />

      <div
        className={`w-[85%] max-w-none mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1
            className={`text-2xl sm:text-3xl font-black uppercase ${
              dark ? "text-white" : "text-black"
            }`}
          >
            Base64 / URL Converter
          </h1>
          
          
          <ThemeToggle />
        </div>

        {/* Content Area */}
        <div className="mb-8">
          <p
            className={`leading-relaxed mb-8 ${
              dark ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            This is a placeholder page for Base64 string encoding/decoding and URL query escaping.
          </p>

          {/* Visual Placeholder */}
          <div
            className={`border-2 border-dashed rounded-2xl h-48 flex items-center justify-center transition-colors duration-300 ${
              dark
                ? "border-zinc-700 bg-zinc-800/40"
                : "border-neutral-300 bg-neutral-50"
            }`}
          >
            <span
              className={`text-sm font-black uppercase tracking-widest ${
                dark ? "text-zinc-500" : "text-neutral-400"
              }`}
            >
              Tool interface will be built here
            </span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div
          className={`mt-12 border-t pt-6 ${
            dark ? "border-zinc-800" : "border-neutral-100"
          }`}
        >
          <Link
            to="/devutilities"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>←</span>
            <span>Back to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Base64Url;