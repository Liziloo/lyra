import React from "react";

interface ControlCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  active?: boolean;
}

export const ControlCard: React.FC<ControlCardProps> = ({
  title,
  description,
  children,
  active,
}) => {
  return (
    <div
      className={`bg-white border-2 rounded-2xl p-4 transition-all duration-300 ${active ? "border-brilliant-rose shadow-md" : "border-saffron/20 shadow-sm"}`}
    >
      <div className="mb-3">
        <h3
          className={`text-[10px] font-black uppercase tracking-[0.2em] ${active ? "text-brilliant-rose" : "text-graphite"}`}
        >
          {title}
        </h3>
        {description && (
          <p className="text-[9px] opacity-40 italic mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};
