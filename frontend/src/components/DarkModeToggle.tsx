"use client";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  return (
    <button
      className="fixed top-5 right-5 z-50 bg-white/80 dark:bg-darkglass rounded-full shadow-glass p-2 transition-all border border-gray-200 dark:border-gray-700 hover:scale-110 animate-pop"
      aria-label="切换深色模式"
      onClick={() => setIsDark(v => !v)}
    >
      {isDark ? (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
      ) : (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
      )}
    </button>
  );
} 