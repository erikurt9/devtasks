import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 1023px)";

const useMobileMode = () => {
  // Shared viewport truth point for mobile-specific UI changes.
  const [isMobileMode, setIsMobileMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const updateMobileMode = () => {
      setIsMobileMode(mediaQuery.matches);
    };

    updateMobileMode();
    mediaQuery.addEventListener("change", updateMobileMode);

    return () => {
      mediaQuery.removeEventListener("change", updateMobileMode);
    };
  }, []);

  return isMobileMode;
};

export default useMobileMode;