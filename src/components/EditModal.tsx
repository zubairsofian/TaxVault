import React, { useState, useRef } from 'react';
import { Receipt } from '../types';
import { CATEGORIES } from './AddReceipt';
import { X, Camera, Wand2 } from 'lucide-react';
import { enhanceImageToPdfBase64 } from '../utils/imageProcessing';

export default function EditModal({ receipt, onClose, onUpdate }: { receipt: Receipt, onClose: () => void, onUpdate: (r: Receipt) => void }) {
   const [title, setTitle] = useState(receipt.title);
   const [amount, setAmount] = useState(receipt.amount.toString());
   const [date, setDate] = useState(receipt.date);
   const [category, setCategory] = useState(receipt.category);
   const [fileData, setFileData] = useState<string | null>(receipt.image);
   
   // Base64 that starts with 'data:application/pdf' is PDF
   const [isPdf, setIsPdf] = useState(receipt.image?.startsWith('data:application/pdf') || false);
   const [isLoading, setIsLoading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (file) {
           setIsLoading(true);
           try {
             const { base64Data, isPdfDocument } = await enhanceImageToPdfBase64(file);
             setFileData(base64Data);
             setIsPdf(isPdfDocument);
           } catch (err) {
               console.error("Gagal proses gambar:", err);
               alert("Gagal memproses gambar resit.");
           } finally {
             setIsLoading(false);
           }
       }
   };

   const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       if (!title || !amount || !date || !category) return;
       onUpdate({
           ...receipt,
           title,
           amount: parseFloat(amount),
           date,
           category,
           image: fileData
       });
   };

   return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-[4px] w-full max-w-md p-8 animate-in zoom-in-95 relative">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-[1.2rem] font-extrabold tracking-[-1px]">KEMASKINI RESIT</h2>
                <button type="button" onClick={onClose} disabled={isLoading} className="text-[#888888] hover:text-[#00FF5F] transition disabled:opacity-50"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                    <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Tajuk</label>
                    <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] outline-none focus:border-[#00FF5F] text-white" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Jumlah (RM)</label>
                        <input type="number" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] outline-none focus:border-[#00FF5F] text-white" />
                    </div>
                    <div>
                        <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Tarikh</label>
                        <input type="date" required value={date} onChange={e=>setDate(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] outline-none focus:border-[#00FF5F] text-white" style={{colorScheme: 'dark'}} />
                    </div>
                </div>
                <div>
                    <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Kategori</label>
                    <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] outline-none focus:border-[#00FF5F] text-white">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="pb-4">
                    <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2 flex items-center justify-between">
                         <span>Muat Naik Baru</span>
                         {fileData && isPdf && <span className="text-[#00FF5F] flex items-center gap-1"><Wand2 size={12}/> Auto-Enhanced PDF</span>}
                    </label>
                    
                    {fileData ? (
                        <div className="relative inline-block w-full bg-[#141414] p-2 rounded-[4px] border border-[#222]">
                            {isPdf ? (
                                <iframe src={fileData} className="w-full h-48 rounded-[4px]" title="PDF Preview" />
                            ) : (
                                <img src={fileData} alt="Preview" className="h-48 w-full object-contain bg-black rounded-[4px]" />
                            )}
                            <button type="button" onClick={() => {setFileData(null); setIsPdf(false)}} className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded-[4px] hover:text-[#00FF5F] z-10"><X size={14}/></button>
                        </div>
                    ) : (
                        <div onClick={() => !isLoading && fileInputRef.current?.click()} className="w-full py-8 border border-dashed border-[#222] bg-[#141414] rounded-[4px] text-center flex flex-col items-center justify-center text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] hover:border-[#00FF5F] hover:text-white cursor-pointer transition">
                            {isLoading ? (
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF5F] mb-3"></div>
                                    <span>Memproses AI Enhancement...</span>
                                </div>
                            ) : (
                                <>
                                    <Camera size={24} className="mb-3 opacity-50" />
                                    Ambil Gambar (Auto PDF)
                                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="w-full bg-[#00FF5F] text-black font-extrabold uppercase tracking-[2px] py-4 rounded-[4px] shadow-[0_0_20px_rgba(0,255,95,0.3)] hover:shadow-[0_0_30px_rgba(0,255,95,0.5)] transition flex items-center justify-center gap-2 disabled:opacity-50">
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    </div>
   )
}
