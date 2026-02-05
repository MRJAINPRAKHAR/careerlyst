import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) {
        setProgress(0);
        return;
      }

      const percent = (scrollTop / docHeight) * 100;
      setProgress(percent);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-[9999] h-[2px] w-full bg-transparent">
      <div
        className="h-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.55)] transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
