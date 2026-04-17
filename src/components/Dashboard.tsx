import React from 'react';
import { Receipt } from '../types';

export default function Dashboard({ receipts }: { receipts: Receipt[] }) {
  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);

  const categoryTotals = receipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);

  const formattedTotal = new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalAmount);

  return (
    <div className="p-6 md:p-10 flex flex-col flex-1">
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
            return (
                <div key={cat} className="border border-[#222] p-6 rounded-[4px] bg-[#050505]">
                  <div className="text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888]">{cat}</div>
                  <div className="text-[32px] font-bold mt-2 font-mono tracking-tighter">RM {new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(categoryTotals[cat])}</div>
                  <div className="h-[4px] bg-[#222] mt-4 relative">
                      <div className="h-full bg-[#00FF5F] absolute left-0 top-0 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}
