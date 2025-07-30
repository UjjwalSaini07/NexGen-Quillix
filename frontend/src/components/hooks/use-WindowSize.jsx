import { useState, useEffect } from "react";

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    screenCategory: getScreenCategory(window.innerWidth),
  });

  function getScreenCategory(width) {
    if (width < 576) return "mobile";
    if (width < 768) return "small";
    if (width < 992) return "medium";
    return "large";
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        screenCategory: getScreenCategory(window.innerWidth),
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;
