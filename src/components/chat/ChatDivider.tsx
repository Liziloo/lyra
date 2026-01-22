import React from "react";

export const ChatDivider: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <div className="relative py-6 flex items-center">
      <div className="flex-grow border-t-2 border-saffron"></div>
      {label && (
        <span className="flex-shrink mx-4 text-xs font-bold text-saffron uppercase tracking-widest bg-white px-2">
          {label}
        </span>
      )}
      {!label && <div className="flex-grow border-t-2 border-saffron"></div>}
    </div>
  );
};
