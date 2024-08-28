"use client";

import React, { useEffect } from "react";
import CountdownTimer from "@/components/CountdownTimer";

export default function page() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
  
    setVh();
    window.addEventListener('resize', setVh);
  
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <div className="w-full h-full">
      <main className="flex flex-col items-center p-3">
        <CountdownTimer />
      </main>
    </div>
  );
}
