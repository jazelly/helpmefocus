"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/input";
import ExpandableMessageList from "@/components/expandable-list";
import { schedule } from "./service";
import { speak } from "./tts";
import { toneOptions } from "@/utils/tone";
import Select from "react-select";
import { DigitalTimer } from "./digital-timer";
import { formatTime } from "@/utils/time";
import toast from 'react-hot-toast';

const CountdownTimer = ({ setLoading }) => {
  const [time, setTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [inputSeconds, setInputSeconds] = useState<number>(0);
  const [intervalMinutes, setIntervalMinutes] = useState("5");
  const [intervalId, setIntervalId] = useState(-1);
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

  console.log(inputSeconds);
  const intervalMinutesNumber = parseInt(intervalMinutes);
  const handleStart = async () => {
    if (promptError) return;

    if (isActive) clearInterval(intervalId);

    setLoading(true);
    try {
      if (inputSeconds <= 0)
        throw Error("Invalid focus time");
      if (intervalMinutesNumber <= 0)
        throw Error("Invalid reminder interval");

      const payload = {
        intervalMinutes: intervalMinutesNumber,
        totalMinutes: Math.ceil(inputSeconds / 60),
        prompt: prompt,
        toneLevel,
      };
      console.log("payload", payload);
      const response = await schedule(payload);

      console.log("Response data:", response);

      const remindMessages = response.data.remindMessages;
      if (Array.isArray(remindMessages))
        setRemindMessages(remindMessages as string[]);

      setTime(inputSeconds);
      setIsActive(true);
      speak(`Let's go`);

      const interval = setInterval(() => {
        setTime((prevTime) => {
          return prevTime - 1;
        });
      }, 1000);

      setIntervalId(interval as any as number);
    } catch (err: any) {
      toast.error(err.message);

    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTime(0);
    setIsActive(false);
    setRemindMessages([]);
    setRemindListIndex(0);
    setIntervalMinutes("5");
    clearInterval(intervalId);
  };

  const hms = formatTime(time);

  return (
    <>
      <div className={`flex flex-col items-center space-y-4 p-4 text-brown-1`}>
        <div className="flex flex-col items-center space-y-4 p-4">
          <div id="clock-area" className="flex flex-col justify-center items-center">
            <DigitalTimer
              initialHours={hms.hours}
              initialMinutes={hms.minutes}
              initialSeconds={hms.seconds}
              editable={!isActive}
              onChange={setInputSeconds}
            />
          </div>
          <div className="flex flex-col items-stretch">
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
                ${isActive ? "bg-[#6F777B]" : "bg-[#3D82AE] transition ease-in-out duration-150 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700 focus:outline-none focus:ring-2"}
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
            {isActive && remindMessages.length > 0 && (
              <div className="mt-3 w-full">
                <ExpandableMessageList
                  cursor={remindListIndex}
                  label="Preview reminders"
                  messages={remindMessages}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CountdownTimer;
