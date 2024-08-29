import React, { useState, useEffect } from "react";

export const CountdownAnimatedTimer = ({
  initialTime,
}: {
  initialTime: number;
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      clearInterval(timer!);
      // Trigger any completion actions here
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);
  const resetTimer = () => setTimeLeft(initialTime);

  const getFormattedTime = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getCircleProgress = () => {
    return (timeLeft / initialTime) * 283; // 283 is the circumference of the circle
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className="w-40 h-40">
          <circle
            cx="50%"
            cy="50%"
            r="45"
            stroke="lightgray"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45"
            stroke="blue"
            strokeWidth="10"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset={getCircleProgress()}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold">{getFormattedTime()}</div>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={startTimer}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Start
        </button>
        {isRunning ? (
          <button
            onClick={stopTimer}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={resetTimer}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default CountdownAnimatedTimer;
