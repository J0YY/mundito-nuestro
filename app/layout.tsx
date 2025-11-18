import './globals.css';
import 'leaflet/dist/leaflet.css';
import React from 'react';

export const metadata = {
  title: "mundito nuestro",
  description: "A map of how Joy & Socrates loved across the world."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen antialiased selection:bg-core/20 selection:text-core">
        {children}
      </body>
    </html>
  );
}

