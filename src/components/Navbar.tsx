import React from 'react';
import { Plus } from 'lucide-react';
import { TabType } from '../App';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <>
      <button 
        onClick={() => setActiveTab('add')} 
        className="absolute right-6 md:right-10 bottom-[120px] w-16 h-16 bg-[#00FF5F] rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,255,95,0.3)] hover:scale-105 transition z-50 focus:outline-none"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      <nav className="absolute bottom-[30px] left-0 w-full bg-[#050505]/95 backdrop-blur-md grid grid-cols-3 border-t border-[#222] z-40">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`py-6 text-center text-[0.7rem] font-extrabold uppercase tracking-[2px] transition ${
            activeTab === 'dashboard' ? 'text-[#00FF5F] border-t-2 border-[#00FF5F]' : 'text-[#888888] border-t-2 border-transparent hover:text-white'
          }`}
        >
          Utama
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`py-6 text-center text-[0.7rem] font-extrabold uppercase tracking-[2px] transition ${
            activeTab === 'history' ? 'text-[#00FF5F] border-t-2 border-[#00FF5F]' : 'text-[#888888] border-t-2 border-transparent hover:text-white'
          }`}
        >
          Sejarah
        </button>
        <button 
          onClick={() => setActiveTab('chart')} 
          className={`py-6 text-center text-[0.7rem] font-extrabold uppercase tracking-[2px] transition ${
            activeTab === 'chart' ? 'text-[#00FF5F] border-t-2 border-[#00FF5F]' : 'text-[#888888] border-t-2 border-transparent hover:text-white'
          }`}
        >
          Analisis
        </button>
      </nav>
    </>
  );
}
