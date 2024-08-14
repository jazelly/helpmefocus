"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/input";
import { CubeSpinner } from "@/components/loader";
import ExpandableMessageList from "@/components/expandable-list";
import { schedule } from "./service";

const CountdownTimer = () => {
  const [time, setTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [inputMinutes, setInputMinutes] = useState("30");
  const [intervalMinutes, setIntervalMinutes] = useState("10");
  const [intervalId, setIntervalId] = useState(-1);
  const [scheduling, setScheduling] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [remindList, setRemindList] = useState<string[]>([]);
  const [remindListIndex, setRemindListIndex] = useState(0);

  useEffect(() => {
    if (time <= 0 && isActive) {
      setIsActive(false);
      speak("Focus finished");
      if (intervalId >= 0) clearInterval(intervalId);
      handleReset();
    }
  }, [isActive, time]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const intervalMinutesNumber = parseInt(intervalMinutes);
  const inputMinutesNumber = parseInt(inputMinutes);
  const handleStart = async () => {
    setScheduling(true);
    try {
      if (inputMinutesNumber <= 0 || intervalMinutesNumber <= 0) throw Error('Need valid number');

      const payload = {
        intervalMinutes: intervalMinutesNumber,
        totalMinutes: inputMinutesNumber,
        prompt: prompt,
        toneLevel: 1,
      };
      console.log('payload', payload);
      const response = await schedule(payload);

      console.log("Response data:", response);

      const remindMessages = response.remindMessages;
      if (Array.isArray(remindMessages))
        setRemindList(remindMessages as string[]);

      const totalTime = inputMinutesNumber * 60;
      setTime(inputMinutesNumber * 60);
      setIsActive(true);
      speak(`Countdown started for ${inputMinutesNumber} minutes`);

      const intervalInSec = intervalMinutesNumber * 60;
      const interval = setInterval(() => {
        if (totalTime % intervalInSec === 0) {
          speak(`${totalTime / 60} minutes remaining`);
          if (remindListIndex < remindList.length) {
            speak(remindList[remindListIndex]);
            setRemindListIndex((remindListIndex) => {
              return remindListIndex + 1;
            });
          } else {
            speak(remindList[remindListIndex - 1]);
            setRemindListIndex((remindListIndex) => {
              return remindListIndex - 1;
            });
          }
        }

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
    setRemindList([]);
    setRemindListIndex(0);
    setInputMinutes("0");
    setIntervalMinutes("10");
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
    <div className="flex flex-col items-center space-y-4 p-4 text-brown-1">
      <h1 className="text-3xl font-bold">Help me Focus</h1>
      {scheduling ? (
        <div className="flex flex-col items-center ">
          <CubeSpinner color="black" size={30} />
          <span>Generating reminders</span>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 p-4">
          <div className="text-4xl font-mono">{formatTime(time)}</div>
          <div className="flex flex-col justify-center items-stretch">
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

            <div className="flex-col space-x-2 w-full items-center mt-4">
              <textarea
                value={prompt}
                draggable="false"
                onChange={(e) => {
                  setPrompt(e.target.value);
                }}
                placeholder="In a few words, describe what you want to achieve"
                className="w-full border border-gray-300 rounded-lg p-2 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-around">
              <button
                className="px-6 py-1 bg-[#afd4e0] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                onClick={handleStart}
                disabled={isActive}
              >
                Start
              </button>
              <button
                className="px-6 py-1 bg-[#afd4e0] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {isActive && (
        <ExpandableMessageList
          label="Preview reminders"
          messages={remindList}
        />
      )}
    </div>
  );
};

export default CountdownTimer;
