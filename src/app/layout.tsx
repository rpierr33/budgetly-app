import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Budgetly — Simple budgeting for everyone",
  description: "Track spending, set budgets, reach savings goals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 24px 96px' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
