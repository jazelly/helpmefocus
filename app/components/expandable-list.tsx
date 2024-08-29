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
  const [hover, setHover] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleHover = () => {
    setHover(true);
  };

  return (
    <div
      className={`flex flex-col border border-[#df3434] rounded pt-3 ${isExpanded ? 'pb-3' : 'pb-0'} px-1 w-full`}
      onMouseOver={handleHover}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <div
        onClick={toggleExpand}
        className={`flex w-full cursor-pointer justify-between items-center px-2 py-2 rounded-lg ${hover && 'bg-white'}`}
      >
        <span>{label}</span>
        <CaretCircleDown
          size={26}
          className={`transition-transform duration-300`}
          style={{ transform: isExpanded ? "rotate(180deg)" : "" }}
        />
      </div>
      {isExpanded && <div className="w-full h-[1px] bg-gray-300 mt-2 px-3"></div>}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 16 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
        className="px-2"
      >
        <ul className="mt-4 space-y-2">
          {messages.map((message: string, index: number) => (
            <li key={index} className={`${index < messages.length - 1 && 'border-b'} border-gray-200 pb-2`}>
              <span className={`${index < cursor && "line-through"}`}>
                {message}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default ExpandableMessageList;
