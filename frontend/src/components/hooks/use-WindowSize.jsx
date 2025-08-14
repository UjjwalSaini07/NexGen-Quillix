"use client";

import { useState, useEffect } from "react";

const getScreenCategory = (width) => {
  if (width < 576) return "mobile";
  if (width < 768) return "small";
  if (width < 992) return "medium";
  return "large";
};

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
    screenCategory: "large",
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        screenCategory: getScreenCategory(window.innerWidth),
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;
