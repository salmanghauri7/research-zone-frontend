"use client";

import React, { useEffect, useState } from "react";

interface ResendTimerProps {
  seconds: number;
  onFinish: () => void;
}

const ResendTimer: React.FC<ResendTimerProps> = ({ seconds, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish();
      return;
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish]);

  if (timeLeft <= 0) return null;

  return <span className="ml-1 text-gray-500">in {timeLeft}s</span>;
};

export default ResendTimer;
