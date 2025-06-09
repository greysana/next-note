"use client";
import { AppProvider } from "@/hooks/AppContext";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <div className="flex h-screen">
            {/* <div className="w-64 bg-gray-100 p-4">
              <h2 className="text-xl font-bold mb-4">Notes</h2> */}
              {/* Sidebar content */}
            {/* </div> */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
