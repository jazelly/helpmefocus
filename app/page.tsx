"use client";

import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Main } from "./components/main";

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
      <Toaster />
      <main className="flex flex-col min-h-screen items-center p-3">
        <Main />
      </main>
    </div>
  );
}
