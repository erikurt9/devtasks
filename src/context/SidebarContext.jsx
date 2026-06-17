import { createContext, useState } from "react";
import useMobileMode from "../hooks/useMobileMode";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobileMode = useMobileMode();

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isMobileMode,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;