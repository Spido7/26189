"use client";

import React, { useState } from "react";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import ThreatRadar from "@/components/ThreatRadar";

export default function ThreatRadarPage() {
  const [activeCaseId, setActiveCaseId] = useState<string>("FIR-2024-8842");

  return (
    <WorkstationShell activeCaseId={activeCaseId} onCaseChange={setActiveCaseId}>
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#0c0e12]">
        <ThreatRadar />
      </div>
    </WorkstationShell>
  );
}
