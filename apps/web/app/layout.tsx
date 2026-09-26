import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Provider } from "@/components/provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "InternshipOS",
  description: "Know which internships to pursue next, then prepare each application yourself.",
};

const themeBoot = `try{var t=localStorage.getItem("ios-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;else if(window.matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.dataset.theme="dark";}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
