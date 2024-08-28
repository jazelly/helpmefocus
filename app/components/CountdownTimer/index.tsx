"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/input";
import { CubeSpinner } from "@/components/loader";
import ExpandableMessageList from "@/components/expandable-list";
import { schedule } from "./service";
import { speak } from "./tts";
import { toneOptions } from "@/utils/tone";
import Select from "react-select";

const CountdownTimer = () => {
  const [time, setTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [inputMinutes, setInputMinutes] = useState("25");
  const [intervalMinutes, setIntervalMinutes] = useState("5");
  const [intervalId, setIntervalId] = useState(-1);
  const [scheduling, setScheduling] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [remindMessages, setRemindMessages] = useState<string[]>([]);
  const [remindListIndex, setRemindListIndex] = useState(0);
  const [promptError, setPromptError] = useState("");
  const [toneLevel, setToneLevel] = useState<number>(3);

  useEffect(() => {
    if (time <= 0 && isActive) {
      setIsActive(false);
      speak("Focus finished");
      if (intervalId >= 0) clearInterval(intervalId);
      handleReset();
      return;
    }

    console.log("time", time);
    const intervalInSec = intervalMinutesNumber * 60;
    console.log("remindMessages", remindMessages[remindListIndex]);
    if ((time - 1) % intervalInSec === 0) {
      speak(`${Math.floor(time / 60)} minutes remain`);
      if (remindListIndex < remindMessages.length) {
        speak(remindMessages[remindListIndex]);
        setRemindListIndex((remindListIndex) => {
          return remindListIndex + 1;
        });
      } else {
        speak(remindMessages[remindListIndex - 1]);
        setRemindListIndex((remindListIndex) => {
          return remindListIndex - 1;
        });
      }
    }
  }, [isActive, time]);

  const intervalMinutesNumber = parseInt(intervalMinutes);
  const inputMinutesNumber = parseInt(inputMinutes);
  const handleStart = async () => {
    if (promptError) return;

    if (isActive) clearInterval(intervalId);

    setScheduling(true);
    try {
      if (inputMinutesNumber <= 0 || intervalMinutesNumber <= 0)
        throw Error("Need valid number");

      const payload = {
        intervalMinutes: intervalMinutesNumber,
        totalMinutes: inputMinutesNumber,
        prompt: prompt,
        toneLevel,
      };
      console.log("payload", payload);
      const response = await schedule(payload);

      console.log("Response data:", response);

      const remindMessages = response.data.remindMessages;
      if (Array.isArray(remindMessages))
        setRemindMessages(remindMessages as string[]);

      setTime(inputMinutesNumber * 60);
      setIsActive(true);
      speak(`Countdown started for ${inputMinutesNumber} minutes`);

      const interval = setInterval(() => {
        setTime((prevTime) => {
          return prevTime - 1;
        });
      }, 1000);

      setIntervalId(interval as any as number);
    } catch (err: any) {
      speak(err.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleReset = () => {
    setTime(0);
    setIsActive(false);
    setRemindMessages([]);
    setRemindListIndex(0);
    setInputMinutes("25");
    setIntervalMinutes("5");
    clearInterval(intervalId);
    speak("Countdown reset");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 text-brown-1 w-full h-full">
      <h1 className="text-3xl font-bold">Help me Focus</h1>
      {// scheduling && 
      (
        <div className="absolute flex flex-col items-center justify-center w-full h-full z-20">
          <CubeSpinner color="black" size={30} />
          <span>Generating reminders</span>
        </div>
      )}
      <div className="flex flex-col items-center space-y-4 p-4">
        <div className="text-4xl font-mono">{formatTime(time)}</div>
        <div className="flex flex-col items-stretch">
          <div className="flex space-x-2 w-full items-center">
            <label className="min-w-32">Focus time:</label>
            <Input
              value={inputMinutes}
              onChange={(e) => {
                setInputMinutes(e.target.value);
              }}
              placeholder="Enter minutes"
              className="w-16"
            />
            <span>mins</span>
          </div>

          <div className="flex space-x-2 w-full items-center mt-3">
            <label className="min-w-32">Remind interval:</label>
            <Input
              value={intervalMinutes}
              onChange={(e) => {
                setIntervalMinutes(e.target.value);
              }}
              placeholder="Enter interval"
              className="w-16"
            />
            <span>mins</span>
          </div>

          <div className="mt-2">
            <Select
              instanceId={"provide-this-to-surpass-warning"}
              options={toneOptions}
              placeholder="Tone level - Default 3: neutral"
              onChange={(option) => setToneLevel(option?.value ?? 3)}
              isClearable={true}
            />
          </div>

          <div className="flex-col space-x-2 w-full items-center mt-4">
            <textarea
              value={prompt}
              draggable="false"
              onChange={(e) => {
                if (e.target.value.length > 200)
                  setPromptError("Must be less than 200 characters");
                else if (promptError) setPromptError("");

                setPrompt(e.target.value);
              }}
              placeholder="In a few words, describe what you want to achieve"
              className={`w-full border ${promptError ? "border-red-500" : "border-gray-300"} rounded-lg p-2 h-[300px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {promptError && (
              <div className="text-sm text-red-500">{promptError}</div>
            )}
          </div>

          <div className="flex justify-around">
            <button
              className={`
                ${isActive ? 'bg-[#6F777B]' : 'bg-[#3D82AE] transition ease-in-out duration-150 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700 focus:outline-none focus:ring-2'}
                px-12 py-1 bg-[#3D82AE] text-white font-semibold rounded-lg shadow-md 
              `}
              onClick={handleStart}
              disabled={isActive}
            >
              Start
            </button>
            <button
              className="px-12 py-1 bg-[#afd4e0] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
          {
            isActive && remindMessages.length > 0 &&
            <div className="mt-3">
              <ExpandableMessageList
                cursor={remindListIndex}
                label="Preview reminders"
                messages={remindMessages}
              />
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
