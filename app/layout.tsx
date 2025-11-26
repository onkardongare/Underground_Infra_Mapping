"use client";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/store/Provider';
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ReactNode, useEffect } from "react";
import {
  fetchCurrentUser,
  markAuthInitialized,
  selectAuthInitialized,
} from "@slices/authSlice";
import { getAuthToken } from "@/lib/api";

// --- CRITICAL: This import makes the map visible ---
import 'maplibre-gl/dist/maplibre-gl.css'; 

const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'InfraMap India',
//   description: 'Unified Underground Infrastructure Platform',
// };

// --- Small component that runs inside Redux Provider ---
function AuthBootstrapWrapper({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector(selectAuthInitialized);

  useEffect(() => {
    // If we've already initialized, don't repeat
    if (initialized) return;

    const token = getAuthToken();

    if (token) {
      // If we have a token locally, try to restore user from backend
      dispatch(fetchCurrentUser());
    } else {
      // No token -> we know user is logged out
      dispatch(markAuthInitialized());
    }
  }, [initialized, dispatch]);

  // Optional: show a small loading screen while checking auth
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Preparing your session...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <AuthBootstrapWrapper>{children}</AuthBootstrapWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}