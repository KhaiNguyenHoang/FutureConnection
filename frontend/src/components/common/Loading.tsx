"use client";

import { useEffect, useState } from "react";

interface LoadingProps {
  onFinished?: () => void;
}

export default function Loading({ onFinished }: LoadingProps) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showConnected, setShowConnected] = useState(false);

  useEffect(() => {
    let value = 0;
    const interval = setInterval(() => {
      value += 1;
      if (value >= 100) {
        value = 100;
        clearInterval(interval);
        setTimeout(() => setIsFinished(true), 200);
      }
      setProgress(value);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isFinished) {
      const connectedTimeout = setTimeout(() => {
        setShowConnected(true);
        const finalTimeout = setTimeout(() => {
          onFinished?.();
        }, 1500);
        return () => clearTimeout(finalTimeout);
      }, 800);
      return () => clearTimeout(connectedTimeout);
    }
  }, [isFinished, onFinished]);

  return (
    <div className="relative h-screen w-full bg-white text-black overflow-hidden flex">
      {/* Expanding Yellow Background (The Transition) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-1000 ease-in-out ${
          isFinished ? "w-full bg-amber-400" : "w-2 bg-neutral-100"
        }`}
      >
        {/* Progress Fill inside the transitioning bar */}
        {!isFinished && (
          <div
            className="absolute left-0 w-full bg-gradient-to-b from-amber-300 to-amber-500 rounded-full shadow-md transition-all duration-75"
            style={{
              height: `${progress}%`,
              top: "0",
            }}
          />
        )}

        {/* Indicator + Percentage */}
        {!isFinished && (
          <div
            className="absolute left-6 flex items-center gap-3"
            style={{
              top: `${progress}%`,
              transform: "translateY(-50%)",
            }}
          >
            <div className="w-[2px] h-6 bg-amber-500 animate-pulse shadow-sm" />
            <span className="text-amber-600 text-2xl font-semibold tracking-wider drop-shadow-sm">
              {progress.toString().padStart(3, "0")}%
            </span>
          </div>
        )}

        {/* Connected Text (Full screen state) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
            showConnected
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          }`}
        >
          <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-black uppercase">
            Connected
          </h2>
        </div>
      </div>

      {/* Background Track (Visible behind the expanding bar) */}
      {!isFinished && (
        <div className="w-2 bg-neutral-100" />
      )}

      {/* Center content */}
      <div className={`flex-1 flex flex-col items-center justify-center h-full transition-opacity duration-500 ${isFinished ? 'opacity-0' : 'opacity-100'}`}>
        <div className="relative inline-block">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2">
            <div className="h-6 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-40 rounded-full blur-md" />
          </div>

          <h1 className="relative text-4xl font-black tracking-wide text-black uppercase italic">
            FutureConnection
          </h1>
        </div>

        <p className="mt-4 text-sm text-neutral-500 tracking-wide animate-pulse font-medium">
          Build connections. Share knowledge. Work without limits.
        </p>
      </div>
    </div>
  );
}
