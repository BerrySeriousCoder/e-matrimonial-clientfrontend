import './globals.css';
import type { ReactNode } from 'react';
import QueryProvider from '../components/QueryProvider';
import { ToastProvider } from '../components/ToastContext';
import LoadingScreenWrapper from '../components/LoadingScreenWrapper';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/clean-gray-paper.png" />
        <link rel="preload" as="image" href="/emtriloading.png" />
      </head>
      <body>
        <QueryProvider>
          <ToastProvider>
            <LoadingScreenWrapper>
              <div className="min-h-screen flex">
                {/* Vertical Sidebar Banner */}
                <aside className="newspaper-sidebar">
                  <div className="newspaper-sidebar-content">
                    <div className="newspaper-sidebar-text-vertical">
                      <h1 className="newspaper-sidebar-title">E-MATRIMONIAL</h1>
                      <p className="newspaper-sidebar-subtitle">FINDING YOUR PERFECT MATCH SINCE 2025</p>
                    </div>
                  </div>
                </aside>
                
                {/* Main Content Area */}
                <main className="newspaper-main-content">
                  {children}
                </main>
              </div>
            </LoadingScreenWrapper>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
