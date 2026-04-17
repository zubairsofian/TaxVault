import React, { useState } from 'react';
import { Receipt } from '../types';
import { formatRM, formatDate } from '../utils/format';
import EditModal from './EditModal';
import { X } from 'lucide-react';

export default function History({ receipts, onUpdate, onDelete }: { receipts: Receipt[], onUpdate: (r: Receipt) => void, onDelete: (id: string) => void }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewImage, setViewImage] = useState<string | null>(null);

    const editingReceipt = receipts.find(r => r.id === editingId);

    if (receipts.length === 0) {
        return (
            <div className="p-10 bg-[#0a0a0a] min-h-full flex flex-col items-center justify-center text-[#888888] pt-20">
                <p className="text-[0.8rem] font-bold uppercase tracking-[2px]">Tiada resit dipaparkan.</p>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-10 bg-[#0a0a0a] min-h-full">
            <h2 className="text-[1.5rem] font-extrabold mb-8 tracking-[-1px] mt-4">Resit Terkini</h2>
            
            <div className="flex flex-col gap-4 max-w-3xl">
                {receipts.map(receipt => (
                    <div key={receipt.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-4 pb-4 border-b border-[#222]">
                        <div className="w-12 h-12 bg-[#141414] rounded-[4px] flex items-center justify-center font-bold text-[#00FF5F] text-xl">
                            {receipt.category.charAt(0)}
                        </div>
                        
                        <div className="min-w-0 pr-2">
                            <div className="font-bold text-[0.9rem] truncate">{receipt.title}</div>
                            <div className="text-[0.75rem] text-[#888888] mt-1 truncate">
                                {formatDate(receipt.date)} <span className="text-[#00FF5F] font-bold mx-1">•</span> {receipt.category}
                            </div>
                        </div>
                        
                        <div className="text-right flex flex-col items-end">
                            <div className="font-bold font-mono text-[1.1rem] tracking-tight">{formatRM(receipt.amount)}</div>
                            <div className="flex gap-3 mt-2 text-[0.65rem] font-bold uppercase tracking-[1px]">
                                {receipt.image && (
                                    <button onClick={() => setViewImage(receipt.image)} className="text-[#888] hover:text-[#00FF5F] transition">Img</button>
                                )}
                                <button onClick={() => setEditingId(receipt.id)} className="text-[#888] hover:text-white transition">Edit</button>
                                <button onClick={() => window.confirm('Padam resit ini secara kekal?') && onDelete(receipt.id)} className="text-[#888] hover:text-red-500 transition">Del</button>
                            </div>
                            {receipt.syncStatus === 'synced' && <span className="text-[0.6rem] text-[#00FF5F] uppercase tracking-[1px] mt-2 font-bold">Disegerak</span>}
                        </div>
                    </div>
                ))}
            </div>

            {editingReceipt && (
                <EditModal
                    receipt={editingReceipt}
                    onClose={() => setEditingId(null)}
                    onUpdate={(r) => { onUpdate(r); setEditingId(null); }}
                />
            )}

            {viewImage && (
                <div className="fixed inset-0 z-50 bg-[#050505]/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <button onClick={() => setViewImage(null)} className="absolute top-10 right-10 text-white hover:text-[#00FF5F] transition">
                        <X size={32} />
                    </button>
                    <img src={viewImage} className="max-w-full max-h-[85vh] rounded-[4px] object-contain border border-[#222] shadow-2xl" alt="Papar Resit" />
                </div>
            )}
        </div>
    );
}
