"use client";

import { useEffect } from "react";
import { Socket } from "socket.io-client";
import {
  RadarCategoryDonePayload,
  RadarErrorPayload,
  RadarFinding,
} from "../types";

interface UseRadarSocketProps {
  socket: Socket | null;
  workspaceId: string | null;
  onFinding?: (finding: RadarFinding) => void;
  onCategoryDone?: (payload: RadarCategoryDonePayload) => void;
  onComplete?: (workspaceId: string) => void;
  onError?: (payload: RadarErrorPayload) => void;
}

export default function useRadarSocket({
  socket,
  workspaceId,
  onFinding,
  onCategoryDone,
  onComplete,
  onError,
}: UseRadarSocketProps) {
  useEffect(() => {
    if (!socket) return;

    const handleFinding = (payload: { finding: RadarFinding }) => {
      // debugger;
      if (!payload?.finding) return;
      if (workspaceId && payload.finding.workspaceId !== workspaceId) return;
      onFinding?.(payload.finding);
    };

    socket.on("radar:finding", handleFinding);

    return () => {
      socket.off("radar:finding", handleFinding);
    };
  }, [socket, workspaceId, onFinding]);

  useEffect(() => {
    if (!socket) return;

    const handleCategoryDone = (payload: RadarCategoryDonePayload) => {
      // debugger;
      if (!payload?.category) return;
      onCategoryDone?.(payload);
    };

    socket.on("radar:category:done", handleCategoryDone);

    return () => {
      socket.off("radar:category:done", handleCategoryDone);
    };
  }, [socket, onCategoryDone]);

  useEffect(() => {
    if (!socket) return;

    const handleComplete = (payload: { workspaceId: string }) => {
      // debugger;
      if (workspaceId && payload?.workspaceId !== workspaceId) return;
      if (payload?.workspaceId) {
        onComplete?.(payload.workspaceId);
      }
    };

    socket.on("radar:complete", handleComplete);

    return () => {
      socket.off("radar:complete", handleComplete);
    };
  }, [socket, workspaceId, onComplete]);

  useEffect(() => {
    if (!socket) return;

    const handleError = (payload: RadarErrorPayload) => {
      if (!payload?.message) return;
      if (workspaceId && payload?.workspaceId !== workspaceId) return;
      onError?.(payload);
    };

    socket.on("radar:error", handleError);

    return () => {
      socket.off("radar:error", handleError);
    };
  }, [socket, workspaceId, onError]);
}
