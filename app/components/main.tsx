"use client";

import { useEffect, useState } from "react";
import CountdownTimer from "./CountdownTimer";
import { CircleLoadingModal } from "./loading-modal";

export const Main = () => {
  const [loading, setLoading] = useState(false);

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
    <>
      {loading && <CircleLoadingModal />}
      <CountdownTimer setLoading={setLoading} />
    </>
  );
};
