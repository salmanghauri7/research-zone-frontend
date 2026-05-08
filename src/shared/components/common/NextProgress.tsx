"use client";

import NextTopLoader from "nextjs-toploader";

export default function NextProgress() {
  return (
    <NextTopLoader
      color="#003eff"
      height={3}
      crawlSpeed={130}
      showSpinner={false}
      easing="ease"
      speed={400}
      shadow="none"
      zIndex={9999}
    />
  );
}
