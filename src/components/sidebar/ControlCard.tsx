import React from "react";

interface ControlCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const ControlCard: React.FC<ControlCardProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm hover:border-brilliant-rose transition-colors duration-200 group">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-graphite uppercase tracking-tight group-hover:text-brilliant-rose transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="control-content">{children}</div>
    </div>
  );
};
