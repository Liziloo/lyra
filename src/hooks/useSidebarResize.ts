import { useState, useEffect, useRef } from "react";

export const useSidebarResize = (initialWidth: number) => {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      setWidth(Math.max(260, Math.min(600, e.clientX)));
    };
    const handleMouseUp = () => (isResizing.current = false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return { width, startResizing: () => (isResizing.current = true) };
};
