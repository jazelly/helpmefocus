import { CaretCircleDown, CaretCircleLeft } from '@phosphor-icons/react';
import React, { useState } from 'react';

const ExpandableMessageList = ({ label = 'Messages', messages }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 w-80">
      <div onClick={toggleExpand} className="flex w-full cursor-pointer">
        <span>{label}</span>
        <div className="w-full h-2 border border-gray-300"></div>
        {isExpanded ? (
          <CaretCircleDown size={36} />
        ) : (
          <CaretCircleLeft size={36} />
        )}
      </div>
      {isExpanded && (
        <ul className="mt-4 space-y-2">
          {messages.map((message: string, index: number) => (
            <li key={index} className="border-b border-gray-200 pb-2">
              {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpandableMessageList;
