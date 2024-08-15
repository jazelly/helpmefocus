import {
  CaretCircleDown,
  CaretCircleLeft,
  CaretCircleUp,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import React, { useState } from "react";

const ExpandableMessageList = ({
  label = "Messages",
  messages,
  cursor,
}: {
  label: string;
  messages: string[];
  cursor: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col border border-gray-300 rounded-lg p-3 w-full">
      <div
        onClick={toggleExpand}
        className="flex w-full cursor-pointer justify-between items-center"
      >
        <span>{label}</span>
        <CaretCircleDown
          size={26}
          className={`transition-transform duration-300`}
          style={{ transform: isExpanded ? "rotate(180deg)" : "" }}
        />
      </div>
      <div className="w-full h-[1px] bg-gray-300"></div>
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 16 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <ul className="mt-4 space-y-2">
          {messages.map((message: string, index: number) => (
            <li key={index} className={`border-b border-gray-200 pb-2`}>
              <span className={`${index < cursor && 'line-through'}`}>{message}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default ExpandableMessageList;
