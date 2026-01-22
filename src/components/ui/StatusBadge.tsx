import React from "react";

interface StatusBadgeProps {
  isOnline: boolean;
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  isOnline,
  label,
}) => {
  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 w-fit">
      <div className="relative flex h-3 w-3">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        ></span>
      </div>
      <span className="text-xs font-medium text-graphite uppercase tracking-wider">
        {label}: {isOnline ? "Active" : "Offline"}
      </span>
    </div>
  );
};
