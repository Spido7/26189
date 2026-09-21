"use client";

import React from "react";
import { EntityType } from "@/types/forensics";
import { ENTITY_CONFIG } from "@/lib/tokens";

interface EntityStatusBadgeProps {
  type: EntityType;
  count: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export const EntityStatusBadge: React.FC<EntityStatusBadgeProps> = ({
  type,
  count,
  isSelected = false,
  onClick,
}) => {
  const config = ENTITY_CONFIG[type] || {
    label: type,
    dotColor: "bg-zinc-400",
    textColor: "text-zinc-300",
    bgColor: "bg-zinc-900",
    borderColor: "border-zinc-700",
    dimBgColor: "bg-zinc-800",
    tagColor: "bg-zinc-800 text-zinc-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-0.5 border text-[11px] font-mono transition-all select-none cursor-pointer ${
        config.bgColor
      } ${config.borderColor} ${
        isSelected ? "ring-1 ring-offset-0 ring-white/50 brightness-125" : "opacity-90 hover:opacity-100"
      }`}
      title={`Filter ${config.label} entities (Count: ${count})`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0`} />
      <span className={`${config.textColor} font-medium tracking-tight whitespace-nowrap`}>
        {config.label}
      </span>
      <span className={`${config.dimBgColor} ${config.textColor} px-1 text-[10px] font-bold`}>
        {count}
      </span>
    </button>
  );
};
