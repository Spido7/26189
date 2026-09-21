"use client";

import React, { useState } from "react";
import { TopCommandBar } from "@/components/TopCommandBar";
import { SidebarNav } from "@/components/SidebarNav";
import { BottomStatusBar } from "@/components/BottomStatusBar";

interface WorkstationShellProps {
  children: React.ReactNode;
  activeCaseId?: string;
  onCaseChange?: (caseId: string) => void;
  className?: string;
}

export const WorkstationShell: React.FC<WorkstationShellProps> = ({
  children,
  activeCaseId = "FIR-2024-8842",
  onCaseChange,
  className = "",
}) => {
  const [currentCase, setCurrentCase] = useState(activeCaseId);

  const handleCaseSelect = (caseId: string) => {
    setCurrentCase(caseId);
    onCaseChange?.(caseId);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-bg-base text-text-primary overflow-hidden font-sans antialiased">
      {/* 1. Top Command Bar */}
      <TopCommandBar
        activeCaseId={currentCase}
        onCaseChange={handleCaseSelect}
      />

      {/* 2. Main Workstation Area: Sidebar + Workspace Center */}
      <div className="flex-1 flex overflow-hidden relative w-full h-full">
        <SidebarNav
          selectedCaseId={currentCase}
          onCaseSelect={handleCaseSelect}
        />

        <main className={`flex-1 relative w-full h-full overflow-hidden flex flex-col ${className}`}>
          {children}
        </main>
      </div>

      {/* 3. Bottom Status Bar */}
      <BottomStatusBar activeCaseId={currentCase} isLive={false} />
    </div>
  );
};
