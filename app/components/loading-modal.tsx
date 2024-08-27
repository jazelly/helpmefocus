"use client";

import { CircleNotch } from "@phosphor-icons/react";

export const CircleLoadingModal = () => {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
      }}
      className="fixed bg-black opacity-50 w-full h-full flex flex-col items-center justify-center z-50"
    >
      <CircleNotch color="white" size={56} className="z-100 absolute">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          dur="2s"
          from="0 0 0"
          to="360 0 0"
          repeatCount="indefinite"
        ></animateTransform>
      </CircleNotch>
    </div>
  );
};
