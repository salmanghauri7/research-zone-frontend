import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./providers";
import NextProgress from "@/components/NextProgress";
import CreateWorkspaceModal from "@/components/CreateWorkspaceModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Research Zone",
  description: "A collaboration platform for researchers",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <NextProgress />
        <Provider>
          {children}
          <CreateWorkspaceModal />
        </Provider>
      </body>
    </html>
  );
}
