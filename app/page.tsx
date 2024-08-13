import React from "react";
import CountdownTimer from "@/components/CountdownTimer";

export default function page() {
  return (
    <div>
      <main className="flex min-h-screen flex-col justify-center items-center p-3">
        <CountdownTimer />
      </main>
    </div>
  );
}
