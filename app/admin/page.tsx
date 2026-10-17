/**
 * Admin Dashboard - Main management interface
 * Three tabs: Login History, Sunshine (Photos/Videos), Music
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoginHistory from '@/components/admin/LoginHistory';
import SunshineManager from '@/components/admin/SunshineManager';
import MusicManager from '@/components/admin/MusicManager';

type Tab = 'history' | 'sunshine' | 'music';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'history', label: 'Login History', icon: '📊' },
    { id: 'sunshine', label: 'Sunshine Gallery', icon: '☀️' },
    { id: 'music', label: 'Music Library', icon: '🎵' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Manage Simi's World content and monitor activity
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-3 font-medium text-sm whitespace-nowrap transition-all
                ${
                  activeTab === tab.id
                    ? 'text-yellow-400'
                    : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-pink-400"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'history' && <LoginHistory />}
            {activeTab === 'sunshine' && <SunshineManager />}
            {activeTab === 'music' && <MusicManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
