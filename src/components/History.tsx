import React, { useState } from 'react';
import { Receipt } from '../types';
import { formatRM, formatDate } from '../utils/format';
import EditModal from './EditModal';
import { X, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryRowProps {
    receipt: Receipt;
    isFlipped: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onViewImage: () => void;
}

const HistoryRow: React.FC<HistoryRowProps> = ({ receipt, isFlipped, onToggle, onEdit, onDelete, onViewImage }) => {
    return (
        <div className="relative h-[80px] mb-4 cursor-pointer group" style={{ perspective: 1000 }} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            <motion.div
                className="w-full h-full relative"
                initial={false}
                animate={{ rotateX: isFlipped ? -180 : 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Side */}
                <div className="absolute inset-0 grid grid-cols-[48px_1fr_auto] items-center gap-4 bg-[#0a0a0a] border-b border-[#222] group-hover:bg-[#0a0a0a]" style={{ backfaceVisibility: 'hidden' }}>
                    <div className="w-12 h-12 bg-[#141414] rounded-[4px] flex items-center justify-center font-bold text-[#00FF5F] text-xl border border-[#222]">
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
                        <div className="text-[0.6rem] text-[#888] uppercase tracking-[1px] mt-2 underline decoration-dashed underline-offset-4 opacity-50 group-hover:opacity-100 transition">Lihat Pilihan</div>
                    </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 flex items-center justify-center gap-8 bg-[#141414] border border-[#00FF5F]/50 rounded-[4px] shadow-[0_0_15px_rgba(0,255,95,0.1)]" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(-180deg)' }}>
                    {receipt.image && (
                        <button onClick={(e) => { e.stopPropagation(); onViewImage(); }} className="flex flex-col items-center gap-2 text-[#888] hover:text-[#00FF5F] transition p-2">
                            <ImageIcon size={20} />
                            <span className="text-[0.6rem] font-bold uppercase tracking-[1px]">Gambar</span>
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="flex flex-col items-center gap-2 text-[#888] hover:text-white transition p-2">
                        <Pencil size={20} />
                        <span className="text-[0.6rem] font-bold uppercase tracking-[1px]">Edit</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="flex flex-col items-center gap-2 text-[#888] hover:text-red-500 transition p-2">
                        <Trash2 size={20} />
                        <span className="text-[0.6rem] font-bold uppercase tracking-[1px]">Padam</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default function History({ receipts, onUpdate, onDelete }: { receipts: Receipt[], onUpdate: (r: Receipt) => void, onDelete: (id: string) => void }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewImage, setViewImage] = useState<string | null>(null);
    const [flippedId, setFlippedId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const editingReceipt = receipts.find(r => r.id === editingId);

    if (receipts.length === 0) {
        return (
            <div className="p-10 bg-[#0a0a0a] min-h-full flex flex-col items-center justify-center text-[#888888] pt-20">
                <p className="text-[0.8rem] font-bold uppercase tracking-[2px]">Tiada resit dipaparkan.</p>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-10 bg-[#0a0a0a] min-h-full" onClick={() => setFlippedId(null)}>
            <h2 className="text-[1.5rem] font-extrabold mb-8 tracking-[-1px] mt-4">Resit Terkini</h2>
            
            <div className="flex flex-col max-w-3xl">
                {receipts.map(receipt => (
                    <HistoryRow 
                        key={receipt.id} 
                        receipt={receipt} 
                        isFlipped={flippedId === receipt.id}
                        onToggle={() => setFlippedId(flippedId === receipt.id ? null : receipt.id)}
                        onEdit={() => setEditingId(receipt.id)} 
                        onDelete={() => setDeleteConfirmId(receipt.id)}
                        onViewImage={() => setViewImage(receipt.image!)}
                    />
                ))}
            </div>

            {editingReceipt && (
                <EditModal
                    receipt={editingReceipt}
                    onClose={() => setEditingId(null)}
                    onUpdate={(r) => { onUpdate(r); setEditingId(null); }}
                />
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-[60] bg-[#050505]/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#141414] border border-[#222] p-8 rounded-[4px] max-w-xs w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-white font-extrabold tracking-[-1px] mb-2 text-lg">Buang Resit ini?</h3>
                        <p className="text-[#888] text-[0.8rem] mb-8">Data yang dipadam tidak boleh dikembalikan.</p>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setDeleteConfirmId(null)} 
                                className="flex-1 py-3 text-[0.7rem] font-extrabold uppercase tracking-[2px] text-white bg-[#222] hover:bg-[#333] transition rounded-[4px]"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => { onDelete(deleteConfirmId); setDeleteConfirmId(null); setFlippedId(null); }} 
                                className="flex-1 py-3 text-[0.7rem] font-extrabold uppercase tracking-[2px] text-white bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition rounded-[4px]"
                            >
                                Padam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewImage && (
                <div className="fixed inset-0 z-50 bg-[#050505]/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <button onClick={() => setViewImage(null)} className="absolute top-10 right-10 text-white hover:text-[#00FF5F] transition bg-[#141414] p-3 rounded-full border border-[#222]">
                        <X size={24} />
                    </button>
                    {viewImage.startsWith('data:application/pdf') ? (
                        <iframe src={viewImage} className="w-full max-w-2xl h-[80vh] rounded-[4px] border border-[#222] shadow-2xl" title="PDF Viewer" />
                    ) : (
                        <img src={viewImage} className="max-w-full max-h-[85vh] rounded-[4px] object-contain border border-[#222] shadow-2xl" alt="Papar Resit" />
                    )}
                </div>
            )}
        </div>
    );
}
