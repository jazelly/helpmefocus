import React from "react";
import CountdownTimer from "@/components/CountdownTimer";

export default function page() {
  return (
    <div>
      <main className="flex flex-col min-h-screen items-center p-3">
        <CountdownTimer />
      </main>
    </div>
  );
}
