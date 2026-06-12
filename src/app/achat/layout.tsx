'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarNav from '../references/sidebar-nav';
import TopBar from '../components/top-bar';

export default function AchatLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authUser = localStorage.getItem('authUser');
    if (!authUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(authUser));
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-indigo-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <SidebarNav isOpen={isSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <TopBar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
