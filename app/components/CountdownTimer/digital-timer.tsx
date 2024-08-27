"use client";

import { hmsToSeconds } from "@/utils/time";
import React, { useEffect, useRef, useState } from "react";

export const DigitalTimer = ({
  initialHours,
  initialMinutes,
  initialSeconds,
  editable,
  onChange,
}: {
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  editable?: boolean; // if not editable, timer is in display mode
  onChange: (seconds: number) => void; 
}) => {
  let displayedHours = initialHours?.toString() || "00";
  let displayedMinutes = initialMinutes?.toString() || "00";
  let displayedSeconds = initialSeconds?.toString() || "00";
  const [error, setError] = useState("");
  const [hours, setHours] = useState(displayedHours);
  const [minutes, setMinutes] = useState(displayedMinutes);
  const [seconds, setSeconds] = useState(displayedSeconds);
  const [focused, setFocused] = useState<
    "hours" | "minutes" | "seconds" | null
  >(null);

  const [inputBuffer, setInputBuffer] = useState("");
  const lastInputTime = useRef<number | null>(null);

  const handleFocus = (unit: "hours" | "minutes" | "seconds" | null, e) => {
    console.log("focus", unit);
    if (inputBuffer) setInputBuffer("");
    if (error) setError("");
    setFocused(unit);
    e.target.setSelectionRange(0, 0);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Backspace') {
      switch (focused) {
        case "hours":
          setHours("00");
          break;
        case "minutes":
          setMinutes("00");
          break;
        case "seconds":
          setSeconds("00");
          break;
        default:
          break;
      }
    }
  };

  const handleInput = (e) => {
    if (error) setError("");
    const { value } = e.target; // value.length always 3 if input, always 1 if decreasing
    let changeResult = "00";
    console.log('value', value);
    if (value.length === 3) {
      // find input diff - could occur at any index
      let currentPaddedValue = hours.padStart(2, "0");
      if (focused === "minutes") currentPaddedValue = minutes.padStart(2, "0");
      if (focused === "seconds") currentPaddedValue = seconds.padStart(2, "0");
      console.log('currentPaddedValue', currentPaddedValue);

      changeResult = currentPaddedValue;

      let pExist = 0;
      let pValue = 0;
      while (pValue < 3 && value[pValue] === currentPaddedValue[pExist]) {
        if (pExist < 2) pExist += 1;
        pValue += 1;
      }
      let inputChar = value[pValue];
      inputChar = inputChar.replace(/[^0-9]/g, ""); // Allow only numbers
      console.log('diff', inputChar);
      console.log('inputBuffer', inputBuffer);
      // handle throttle-like input
      const now = Date.now();
      if (inputBuffer.length === 0) {
        if (lastInputTime.current && now - lastInputTime.current < 500) {
            
        }
        lastInputTime.current = Date.now();
        changeResult = inputChar;
        setInputBuffer(changeResult);
      } else if (inputBuffer.length === 1) {
        if (lastInputTime.current && now - lastInputTime.current < 500) {
          if (focused !== "hours" && parseInt(inputBuffer + inputChar) >= 60) {
            // minutes and seconds cannot be >= 60
            setError(`must be less than 60 ${focused}`);
          } else if (
            focused === "hours" &&
            parseInt(inputBuffer + inputChar) >= 24
          ) {
            // hours cannot be >= 24
            setError("must be less than 24 hours");
          } else {
            changeResult = inputBuffer + inputChar;
          }
        } else {
          changeResult = inputChar;
        }
        setInputBuffer(changeResult);
        lastInputTime.current = Date.now();
      } else {
        if (lastInputTime.current && now - lastInputTime.current < 500) {
          setError(`must be less than 2 digits`);
        } else {
          changeResult = inputChar;
          setInputBuffer(changeResult)
          lastInputTime.current = Date.now();
        }
      }
    }

    switch (focused) {
      case "hours":
        setHours(changeResult);
        break;
      case "minutes":
        setMinutes(changeResult);
        break;
      case "seconds":
        setSeconds(changeResult);
        break;
      default:
        break;
    }

    const timeJson =   {
      hours,
      minutes,
      seconds,
      ...(focused && {[focused]: changeResult}),
    };
    const totalSeconds = hmsToSeconds(timeJson);
    onChange(totalSeconds);

  };

  const inputRefs = {
    hr: useRef<HTMLInputElement>(null),
    min: useRef<HTMLInputElement>(null),
    sec: useRef<HTMLInputElement>(null),
  };

  // Handle clicks outside the inputs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRefs.hr.current &&
        inputRefs.min.current &&
        inputRefs.sec.current &&
        !inputRefs.hr.current.contains(event.target) &&
        !inputRefs.min.current.contains(event.target) &&
        !inputRefs.sec.current.contains(event.target)
      ) {
        setFocused(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log('hms', hours, minutes, seconds);

  if (editable) {
    displayedHours = hours;
    displayedMinutes = minutes;
    displayedSeconds = seconds;
  }

  return (
    <div className="relative flex bg-[#C15C5C] px-2 py-1 text-9xl rounded text-white items-center">
      <input
        ref={inputRefs.hr}
        type='tel'
        disabled={!editable}
        onKeyDown={handleKeyDown} 
        onFocus={(e) => {
          handleFocus("hours", e);
        }}
        onInput={handleInput}
        className={`timer-input py-0 rounded w-20 text-center 
            ${focused === "hours" ? "bg-[#e25418]" : "bg-[#C15C5C]"} 
            ${focused === "hours" && error !== "" ? "shake" : ""}  
            cursor-default text-white`}
        style={{ caretColor: "transparent" }}
        value={displayedHours.padStart(2, "0")}
      />

      <div className="colon flex flex-col space-y-3 ml-[1px] mr-[1px] items-center">
        <div className="dot bg-white w-2 h-2 rounded-full"></div>
        <div className="dot bg-white w-2 h-2 rounded-full"></div>
      </div>

      <input
        ref={inputRefs.min}
        type='tel'
        onKeyDown={handleKeyDown}
        disabled={!editable}
        onFocus={(e) => {
          handleFocus("minutes", e);
        }}
        onInput={handleInput}
        className={`timer-input rounded w-20 text-center 
            ${focused === "minutes" ? "bg-[#e25418]" : "bg-[#C15C5C]"} 
            ${focused === "minutes" && error !== "" ? "shake" : ""}  
            cursor-default text-white`}
        style={{ caretColor: "transparent" }}
        value={displayedMinutes.padStart(2, "0")}
      />

      <div className="colon flex flex-col space-y-3 ml-[1px] mr-[1px] items-center">
        <div className="dot bg-white w-2 h-2 rounded-full"></div>
        <div className="dot bg-white w-2 h-2 rounded-full"></div>
      </div>

      <input
        ref={inputRefs.sec}
        type='tel'
        onKeyDown={handleKeyDown} 
        disabled={!editable}
        onFocus={(e) => {
          handleFocus("seconds", e);
        }}
        onInput={handleInput}
        className={`timer-input rounded w-20 text-center 
          ${focused === "seconds" ? "bg-[#e25418]" : "bg-[#C15C5C]"} 
          ${focused === "seconds" && error !== "" ? "shake" : ""}  
          cursor-default text-white`}
        style={{ caretColor: "transparent" }}
        value={displayedSeconds.padStart(2, "0")}
      />
    </div>
  );
};
