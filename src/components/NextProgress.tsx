"use client";

import NextTopLoader from "nextjs-toploader";

export default function NextProgress() {
    return (
        <NextTopLoader
            color="#003eff"        // your theme color
            height={3}             // line height
            crawlSpeed={130}       // how fast the line moves
            showSpinner={false}    // hide spinner
            easing="ease"
            speed={400}
            shadow="none"
            zIndex={9999}          // ensure it's above all other elements
        />
    );
}
