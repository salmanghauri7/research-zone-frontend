import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Provider from "./providers";
import NextProgress from "@/components/NextProgress";
import CreateWorkspaceModal from "@/components/CreateWorkspaceModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
  preload: true,
});

export const metadata: Metadata = {
  title: "Research Zone",
  description: "A collaboration platform for researchers",
  openGraph: {
    title: "Research Zone",
    description: "A collaboration platform for researchers",
    url: "https://research-zone-frontend.vercel.app",
    siteName: "ResearchZone",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <NextProgress />
        <Analytics />
        <Provider>
          {children}
          <CreateWorkspaceModal />
        </Provider>
      </body>
    </html>
  );
}
