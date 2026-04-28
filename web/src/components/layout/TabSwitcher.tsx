'use client';

import { usePdfStore } from '@/store/usePdfStore';
import { Scissors, Combine } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TabSwitcher() {
  const { activeTab, setActiveTab } = usePdfStore();

  const tabs = [
    { id: 'extract', label: 'Extract Pages', icon: Scissors },
    { id: 'merge', label: 'Merge PDF', icon: Combine },
  ] as const;

  return (
    <div className="flex p-1.5 glass rounded-2xl mb-8 relative">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 z-10
              ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className={`w-4 h-4 z-10 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span className="z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
