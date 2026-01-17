"use client"; // 👈 สำคัญมาก! ต้องมีบรรทัดนี้

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}