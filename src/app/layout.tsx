import './globals.css';
import type { ReactNode } from 'react';
import QueryProvider from '../components/QueryProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
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
        </QueryProvider>
      </body>
    </html>
  );
}
