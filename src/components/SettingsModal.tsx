import React from 'react';
import { Receipt } from '../types';
import { X, Download, Share2 } from 'lucide-react';

export default function SettingsModal({ onClose, receipts }: { onClose: () => void, receipts: Receipt[] }) {
    const handleExport = () => {
        if (receipts.length === 0) {
            alert("Tiada resit untuk dieksport.");
            return;
        }
        const headers = ['ID', 'Tajuk', 'Jumlah(RM)', 'Tarikh', 'Kategori', 'Status'];
        const rows = receipts.map(r => [
            r.id,
            `"${r.title.replace(/"/g, '""')}"`,
            r.amount,
            r.date,
            r.category,
            r.syncStatus || 'completed'
        ]);

        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'taxvault_eksport.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-[4px] w-full max-w-sm p-8 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-[1.2rem] font-extrabold tracking-[-1px]">TETAPAN</h2>
                    <button onClick={onClose} className="text-[#888888] hover:text-[#00FF5F] transition"><X size={24}/></button>
                </div>

                <div className="space-y-4">
                    <div className="border border-[#222] bg-[#141414] rounded-[4px] p-5">
                        <h3 className="text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888]">Storan Peranti</h3>
                        <p className="text-[0.8rem] text-[#ccc] mt-2 leading-relaxed">
                            Rekod disimpan dengan selamat dalam Local Storage. Senarai: <span className="text-[#00FF5F] font-bold">{receipts.length} rekod</span>.
                        </p>
                    </div>

                    <button onClick={handleExport} className="w-full bg-[#141414] border border-[#222] hover:border-[#00FF5F] hover:text-[#00FF5F] text-white font-extrabold uppercase tracking-[1px] text-[0.8rem] py-4 px-4 rounded-[4px] flex items-center justify-center gap-3 transition">
                        <Download size={18} /> Eksport CSV
                    </button>
                    
                    <button onClick={() => alert("Fungsi perkongsian bakal datang!")} className="w-full bg-[#141414] border border-[#222] hover:border-[#00FF5F] hover:text-[#00FF5F] text-white font-extrabold uppercase tracking-[1px] text-[0.8rem] py-4 px-4 rounded-[4px] flex items-center justify-center gap-3 transition">
                        <Share2 size={18} /> Kongsi Laporan
                    </button>
                </div>
            </div>
        </div>
    )
}
