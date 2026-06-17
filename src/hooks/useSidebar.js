import { useContext } from "react";
import SidebarContext from "../context/SidebarContext";

/**
 * Reads the shared sidebar state from SidebarProvider.
 *
 * Returns:
 * - isSidebarOpen: whether the sidebar is currently open
 * - setIsSidebarOpen: setter for opening and closing the sidebar
 * - isMobileMode: viewport flag used to switch mobile vs desktop behavior
 */
const useSidebar = () => useContext(SidebarContext);

export default useSidebar;