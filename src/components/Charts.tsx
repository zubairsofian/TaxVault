import React from 'react';
import { Receipt } from '../types';
import { TAX_CATEGORIES, CATEGORIES } from '../utils/taxRelief';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Charts({ receipts }: { receipts: Receipt[] }) {
    if (receipts.length === 0) {
        return (
            <div className="p-10 bg-[#0a0a0a] min-h-full flex flex-col items-center justify-center text-[#888888] pt-20">
                <p className="text-[0.8rem] font-bold uppercase tracking-[2px]">Tiada data untuk dianalisis.</p>
            </div>
        );
    }

    const categoryTotals = receipts.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + r.amount;
        return acc;
    }, {} as Record<string, number>);

    // Total claims logic limits
    let overallEligible = 0;
    
    const enrichedData = TAX_CATEGORIES.map(taxCat => {
        const spent = categoryTotals[taxCat.name] || 0;
        const eligible = taxCat.limit > 0 ? Math.min(spent, taxCat.limit) : spent;
        overallEligible += eligible;
        
        return {
            ...taxCat,
            spent,
            eligible,
            percentage: taxCat.limit > 0 ? Math.min((spent / taxCat.limit) * 100, 100) : (spent > 0 ? 100 : 0) // if no limit but has spent, 100% visible
        }
    }).filter(cat => cat.spent > 0);

    const data = Object.keys(categoryTotals).map(cat => ({
        name: cat,
        value: categoryTotals[cat]
    })).sort((a, b) => b.value - a.value);

    const COLORS = ['#00FF5F', '#00DF53', '#00BF47', '#009F3A', '#007F2E', '#005F22', '#003F16', '#001F0A'];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#141414] border border-[#00FF5F] text-[#00FF5F] p-3 rounded-[4px] shadow-[0_0_15px_rgba(0,255,95,0.2)] font-mono text-sm font-bold tracking-tight">
                    <p className="mb-1 font-sans text-[0.65rem] uppercase tracking-[1px] text-white opacity-80">{payload[0].name}</p>
                    {`RM ${payload[0].value.toFixed(2)}`}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 md:p-10 bg-[#0a0a0a] min-h-full flex flex-col pt-10">
            <h2 className="text-[1.5rem] font-extrabold mb-8 tracking-[-1px] uppercase">Analisis Pelepasan Cukai (LHDN 2025)</h2>
            
            <div className="flex flex-col gap-8">
                
                {/* Total Eligible Section */}
                <div className="bg-[#00FF5F] text-black p-6 rounded-[4px] shadow-[0_0_20px_rgba(0,255,95,0.2)]">
                    <div className="text-[0.7rem] font-extrabold uppercase tracking-[2px] opacity-80 mb-2">Jumlah Pelepasan Yang Layak</div>
                    <div className="text-[clamp(32px,6vw,48px)] font-black tracking-[-2px] leading-none mb-1">
                        RM {new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 2 }).format(overallEligible)}
                    </div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-[1px] opacity-70 mt-3">*Berdasarkan had LHDN Tahun Taksiran 2025</div>
                </div>

                {/* Progress Breakdown */}
                <div className="w-full bg-[#141414] border border-[#222] p-6 rounded-[4px]">
                    <h3 className="text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-6">Status Penggunaan Had Pelepasan</h3>
                    <div className="space-y-6">
                        {enrichedData.map(item => (
                            <div key={item.name}>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex-1">
                                        <div className="text-[0.75rem] font-bold text-white">{item.name}</div>
                                        <div className="text-[0.6rem] text-[#666] tracking-[0.5px] uppercase mt-1">{item.description}</div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="text-[1rem] font-mono font-bold text-[#00FF5F]">RM {item.spent.toLocaleString('ms-MY')}</div>
                                        <div className="text-[0.6rem] text-[#888] uppercase tracking-[1px]">
                                            {item.limit > 0 ? `Had: RM ${item.limit.toLocaleString('ms-MY')}` : 'Tiada Had'}
                                        </div>
                                    </div>
                                </div>
                                {item.limit > 0 && (
                                    <div className="h-[6px] bg-[#222] rounded-full overflow-hidden relative">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-[#00FF5F] transition-all duration-1000 ease-out" 
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pie Chart Section */}
                <div className="w-full bg-[#141414] border border-[#222] p-6 rounded-[4px] mb-8">
                    <h3 className="text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-6">Pecahan Kategori Berseluruh</h3>
                    <div className="h-[250px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 border-t border-[#222] pt-6">
                        {data.map((entry, index) => (
                            <div key={entry.name} className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <div className="text-[0.7rem] font-bold uppercase tracking-[1px] text-[#888] leading-snug">{entry.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
