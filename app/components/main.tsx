"use client";

import { useState } from "react";
import CountdownTimer from "./CountdownTimer";
import { CircleLoadingModal } from "./loading-modal";

export const Main = () => {
  const [loading, setLoading] = useState(false);
  return (
    <>
      {loading && <CircleLoadingModal />}
      <CountdownTimer setLoading={setLoading} />
    </>
  );
};
