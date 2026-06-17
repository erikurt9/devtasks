import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import useSidebar from "../hooks/useSidebar";
import { useEffect } from "react";

const SIDEBAR_SECTIONS = [
  {
    title: "Overview",
    description: "Jump back to the main workspace",
    match: (pathname) => pathname === "/" || pathname === "/dashboard",
    items: [
      { label: "Home", description: "Landing page", path: "/", exact: true },
      { label: "Dashboard", description: "App overview", path: "/dashboard", exact: true },
    ],
  },
  {
    title: "Task Management",
    description: "Roadmaps, logs, and backups",
    match: (pathname) => pathname.startsWith("/taskmanage"),
    items: [
      { label: "Task Workspace", description: "Task section hub", path: "/taskmanage", exact: true },
      { label: "Add Tasks", description: "Create new roadmap items", path: "/taskmanage/add-tasks" },
      { label: "Task List", description: "Review active and completed tasks", path: "/taskmanage/list-tasks" },
      { label: "Delete History", description: "Restore removed items", path: "/taskmanage/delete-history" },
      { label: "Data Center", description: "Import and export backups", path: "/taskmanage/data-center" },
    ],
  },
  {
    title: "Snippet Vault",
    description: "Save, review, and restore snippets",
    match: (pathname) => pathname.startsWith("/snippetvault"),
    items: [
      { label: "Vault Home", description: "Snippet overview", path: "/snippetvault", exact: true },
      { label: "Add Snippet", description: "Create a new snippet", path: "/snippetvault/add" },
      { label: "Snippet List", description: "Browse saved snippets", path: "/snippetvault/list" },
      { label: "Delete History", description: "Restore removed snippets", path: "/snippetvault/delete-history" },
      { label: "Data Center", description: "Import and export backups", path: "/snippetvault/data-center" },
    ],
  },
  {
    title: "Resource Hub",
    description: "Links, references, and backups",
    match: (pathname) => pathname.startsWith("/resourcehub"),
    items: [
      { label: "Hub Home", description: "Resource overview", path: "/resourcehub", exact: true },
      { label: "Add Resource", description: "Save a new link", path: "/resourcehub/add" },
      { label: "Resource List", description: "Browse saved resources", path: "/resourcehub/list" },
      { label: "Delete History", description: "Restore removed resources", path: "/resourcehub/delete-history" },
      { label: "Data Center", description: "Import and export backups", path: "/resourcehub/data-center" },
    ],
  },
  {
    title: "Dev Utilities",
    description: "Quick tools and converters",
    match: (pathname) => pathname.startsWith("/devutilities"),
    items: [
      { label: "Utilities Home", description: "Tool overview", path: "/devutilities", exact: true },
      { label: "Regex Tester", description: "Test expressions", path: "/devutilities/regex" },
      { label: "JSON Formatter", description: "Format and validate JSON", path: "/devutilities/json" },
      { label: "Base64", description: "Encode and decode", path: "/devutilities/base64" },
      { label: "Timestamp", description: "Convert timestamps", path: "/devutilities/timestamp" },
      { label: "UUID", description: "Generate UUIDs", path: "/devutilities/uuid" },
      { label: "JWT Decoder", description: "Inspect tokens", path: "/devutilities/jwt" },
      { label: "Diff Checker", description: "Compare text differences", path: "/devutilities/diff" },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { dark } = useTheme();
  const {
    isSidebarOpen,
    isMobileMode,
    setIsSidebarOpen,
  } = useSidebar();

  const activeSection =
    SIDEBAR_SECTIONS.find((section) => section.match(location.pathname)) ||
    SIDEBAR_SECTIONS[0];

  const isItemActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  };

  const basePanel = dark
    ? "border-zinc-800 bg-zinc-950/80 text-zinc-100"
    : "border-zinc-200 bg-white text-zinc-900";

  useEffect(() => {
    if (isMobileMode) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobileMode, setIsSidebarOpen]);

  return (
    <>
      {/* Mobile backdrop fades in and out with the drawer. */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sidebar-motion-mobile lg:hidden ${
          isSidebarOpen && isMobileMode
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer slides, scales, and fades on open and close. */}
      <aside
        className={`fixed left-0 right-0 top-18.5 z-50 max-h-[calc(100vh-74px)] w-full rounded-none border-x-0 border-b-0 shadow-2xl sidebar-motion-mobile lg:hidden ${basePanel} ${
          isSidebarOpen && isMobileMode
            ? "translate-y-0 scale-100 opacity-100 pointer-events-auto blur-0"
            : "-translate-y-6 scale-[0.98] opacity-0 pointer-events-none blur-sm"
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col gap-4 max-h-[calc(100vh-74px)] overflow-y-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                App Sidebar
              </div>
              <h2 className="mt-1 text-xl font-black uppercase tracking-tighter">
                {activeSection.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                dark
                  ? "border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
                  : "border-zinc-200 text-zinc-500 hover:border-black hover:text-black"
              }`}
              aria-label="Close sidebar menu"
            >
              <span className="text-lg font-black leading-none">×</span>
            </button>
          </div>

          <nav className="space-y-2">
            {activeSection.items.map((item) => {
              const isActive = isItemActive(item);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`group flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? dark
                        ? "border-white bg-white text-black"
                        : "border-black bg-black text-white"
                      : dark
                        ? "border-zinc-800 bg-zinc-900/40 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/50"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black uppercase tracking-tight">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        {isActive ? "Active" : "Open"}
                      </span>
                    </div>

                    <p
                      className={`mt-1 text-xs leading-relaxed ${
                        isActive
                          ? dark
                            ? "text-black/70"
                            : "text-white/70"
                          : "text-neutral-400"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Desktop wrapper animates width so the content can reclaim space. */}
      <div
        className={`hidden lg:block relative flex-none sidebar-motion-width overflow-visible ${
          isSidebarOpen ? "lg:w-80 xl:w-96" : "lg:w-0"
        }`}
      >
        {/* Desktop panel slides and fades during collapse/expand. */}
        <aside
          className={`w-full max-w-full lg:w-80 xl:w-96 shrink-0 rounded-[28px] border shadow-2xl overflow-hidden sidebar-motion-panel lg:h-full lg:min-h-0 lg:self-stretch ${basePanel} ${
            isSidebarOpen
              ? "translate-x-0 scale-100 opacity-100 pointer-events-auto blur-0"
              : "-translate-x-5 scale-[0.96] opacity-0 pointer-events-none blur-sm"
          }`}
        >
          <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

          <div className="p-5 sm:p-6 flex flex-col gap-6 h-full min-h-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                  App Sidebar
                </div>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-tighter">
                  {activeSection.title}
                </h2>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  {activeSection.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  dark
                    ? "border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
                    : "border-zinc-200 text-zinc-500 hover:border-black hover:text-black"
                }`}
                aria-pressed={false}
              >
                Collapse
              </button>
            </div>

            <nav className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {activeSection.items.map((item, index) => {
                const isActive = isItemActive(item);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                      isActive
                        ? dark
                          ? "border-white bg-white text-black"
                          : "border-black bg-black text-white"
                        : dark
                          ? "border-zinc-800 bg-zinc-900/40 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/50"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100"
                    } ${
                      isSidebarOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0"
                    }`}
                    style={{ transitionDelay: isSidebarOpen ? `${index * 35}ms` : "0ms" }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black uppercase tracking-tight">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          {isActive ? "Active" : "Open"}
                        </span>
                      </div>

                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          isActive
                            ? dark
                              ? "text-black/70"
                              : "text-white/70"
                            : "text-neutral-400"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Collapsed bubble scales in/out as the desktop trigger. */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className={`absolute left-2 top-2 z-30 h-12 w-12 items-center justify-center rounded-full border shadow-xl sidebar-motion-panel ${
            isSidebarOpen
              ? "pointer-events-none scale-75 opacity-0 blur-sm"
              : "pointer-events-auto scale-100 opacity-100 hover:scale-105"
          } ${
            dark
              ? "border-zinc-700 bg-zinc-950 text-white hover:border-white"
              : "border-zinc-200 bg-white text-black hover:border-black"
          }`}
          aria-label="Expand sidebar"
        >
          <span className="text-base font-black leading-none">›</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;