"use client";

import React, { useState } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import { Toaster } from "react-hot-toast";
import { CircleLoadingModal } from "./components/loading-modal";

export default function page() {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <Toaster />
      {loading && <CircleLoadingModal />}
      <main className="flex flex-col min-h-screen items-center p-3">
        <CountdownTimer setLoading={setLoading}/>
      </main>
    </div>
  );
}
