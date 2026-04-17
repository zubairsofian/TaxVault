import React, { useState, useEffect } from 'react';
import { Receipt } from './types';
import { loadReceipts, saveReceipts } from './utils/storage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AddReceipt from './components/AddReceipt';
import History from './components/History';
import Charts from './components/Charts';
import SettingsModal from './components/SettingsModal';
import { AnimatePresence, motion } from 'motion/react';

export type TabType = 'dashboard' | 'add' | 'history' | 'chart';

export default function App() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const data = loadReceipts();
    setReceipts(data);
    setIsReady(true);
  }, []);

  const handleAdd = (receipt: Receipt) => {
    const newData = [receipt, ...receipts];
    setReceipts(newData);
    saveReceipts(newData);
    setActiveTab('history');
  };

  const handleUpdate = (updated: Receipt) => {
    const newData = receipts.map(r => r.id === updated.id ? updated : r);
    setReceipts(newData);
    saveReceipts(newData);
  };

  const handleDelete = (id: string) => {
    const newData = receipts.filter(r => r.id !== id);
    setReceipts(newData);
    saveReceipts(newData);
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex justify-center text-white font-sans selection:bg-[#00FF5F] selection:text-black">
      <div className="w-full max-w-4xl bg-[#050505] min-h-screen relative pb-[120px] flex flex-col overflow-x-hidden border-x border-[#222]">
        
        <header className="px-5 md:px-10 py-6 flex justify-between items-center z-10 sticky top-0 border-b border-[#222] bg-[#050505]">
          <div className="text-[1.2rem] font-black tracking-[-1px] uppercase">
            TAX<span className="text-[#00FF5F]">VAULT</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="flex items-center gap-2 md:gap-3 text-[0.7rem] md:text-[0.8rem] font-bold uppercase tracking-[1px] text-white hover:text-[#00FF5F] transition"
          >
            Tetapan <span className="text-[#00FF5F]">•</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col" style={{ perspective: '1200px' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
              className="flex-1 flex flex-col"
            >
              {activeTab === 'dashboard' && <Dashboard receipts={receipts} />}
              {activeTab === 'chart' && <Charts receipts={receipts} />}
              {activeTab === 'add' && <AddReceipt onAdd={handleAdd} />}
              {activeTab === 'history' && <History receipts={receipts} onUpdate={handleUpdate} onDelete={handleDelete} />}
            </motion.div>
          </AnimatePresence>
        </main>

        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} receipts={receipts} />}
        
        <footer className="absolute bottom-0 w-full text-center py-2 text-[#444] text-[0.6rem] font-bold uppercase tracking-[2px] bg-[#050505] border-t border-[#222] z-50">
          Copyright Zubair Sofian
        </footer>
      </div>
    </div>
  );
}
