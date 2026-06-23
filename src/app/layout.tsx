import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atlas Match — JD & CV Matching Tool",
  description:
    "Evidence-first candidate screening. Compare job descriptions against candidate CVs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
