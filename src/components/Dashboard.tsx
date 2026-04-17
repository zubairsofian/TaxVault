import React, { useState } from 'react';
import { Receipt } from '../types';
import { motion } from 'motion/react';

export default function Dashboard({ receipts }: { receipts: Receipt[] }) {
  const [flippedCat, setFlippedCat] = useState<string | null>(null);

  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);

  const categoryTotals = receipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);

  const formattedTotal = new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalAmount);

  interface FlipCardProps {
      cat: string;
      amount: number;
      percentage: number;
      isFlipped: boolean;
      onToggle: () => void;
  }

  const FlipCard: React.FC<FlipCardProps> = ({ cat, amount, percentage, isFlipped, onToggle }) => {
      return (
        <div className="relative h-[160px] cursor-pointer" style={{ perspective: 1000 }} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            <motion.div 
                className="w-full h-full absolute"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Side */}
                <div className="absolute inset-0 border border-[#222] p-6 rounded-[4px] bg-[#050505] shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col justify-center" style={{ backfaceVisibility: 'hidden' }}>
                    <div className="text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888]">{cat}</div>
                    <div className="text-[32px] font-bold mt-2 font-mono tracking-tighter">RM {new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)}</div>
                    <div className="h-[4px] bg-[#222] mt-4 relative">
                        <div className="h-full bg-[#00FF5F] absolute left-0 top-0 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 border border-[#00FF5F] p-6 rounded-[4px] bg-[#00FF5F] text-black shadow-[0_0_20px_rgba(0,255,95,0.2)] flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <div className="text-[0.75rem] font-extrabold uppercase tracking-[2px] opacity-80">{cat}</div>
                    <div className="text-[28px] font-black tracking-[-1px] mt-1">{percentage.toFixed(1)}%</div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-[1px] mt-2 opacity-80">Dari keseluruhan belanja</div>
                </div>
            </motion.div>
        </div>
      );
  };

  return (
    <div className="p-6 md:p-10 flex flex-col flex-1" onClick={() => setFlippedCat(null)}>
      <div className="mt-5">
        <div className="text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Jumlah Perbelanjaan Cukai</div>
        <div className="text-[clamp(50px,10vw,112px)] font-black leading-[0.9] tracking-[-6px] -ml-1">
          <span className="text-[clamp(24px,4vw,40px)] tracking-normal mr-2 align-baseline text-white">RM</span>
          {formattedTotal}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 pb-10">
        {categories.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-[#888] text-[0.8rem] font-bold uppercase border border-[#222] p-8 text-center rounded-[4px]">
            Tiada data untuk dipaparkan. Sila tambah resit.
          </div>
        ) : null}
        
        {categories.map(cat => {
            const percentage = totalAmount > 0 ? (categoryTotals[cat] / totalAmount) * 100 : 0;
            return <FlipCard key={cat} cat={cat} amount={categoryTotals[cat]} percentage={percentage} isFlipped={flippedCat === cat} onToggle={() => setFlippedCat(flippedCat === cat ? null : cat)} />
        })}
      </div>
    </div>
  );
}
