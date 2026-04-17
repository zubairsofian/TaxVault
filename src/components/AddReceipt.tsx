import React, { useState, useRef } from 'react';
import { Receipt } from '../types';
import { syncToGAS } from '../utils/gas';
import { X, Camera, Wand2 } from 'lucide-react';
import { enhanceImageToPdfBase64 } from '../utils/imageProcessing';

export const CATEGORIES = ['Makanan & Minuman', 'Pengangkutan & Petrol', 'Utiliti bil', 'Membeli-belah', 'Kesihatan', 'Pendidikan', 'Lain-lain'];

export default function AddReceipt({ onAdd }: { onAdd: (r: Receipt) => void }) {
   const [title, setTitle] = useState('');
   const [amount, setAmount] = useState('');
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const [category, setCategory] = useState(CATEGORIES[0]);
   const [fileData, setFileData] = useState<string | null>(null); // To store base64 PDF or basic Image
   const [isPdf, setIsPdf] = useState(false);
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

   const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       if (!title || !amount || !date || !category) return;
       setIsLoading(true);
       
       const newReceipt: Receipt = {
           id: Date.now().toString(), 
           title, 
           amount: parseFloat(amount), 
           date, 
           category, 
           image: fileData, // store the enhanced PDF base64
           syncStatus: 'pending'
       };
       
       // Try sync, background sync is generally handled gracefully
       const success = await syncToGAS(newReceipt);
       if(success) newReceipt.syncStatus = 'synced';
       
       onAdd(newReceipt);
       setIsLoading(false);
       setTitle(''); setAmount(''); setFileData(null); setIsPdf(false);
   };

   return (
        <div className="p-6 md:p-10 bg-[#0a0a0a] min-h-full flex flex-col pt-10">
          <h2 className="text-[1.5rem] font-extrabold mb-8 tracking-[-1px]">Resit Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-6 flex-1 max-w-2xl w-full">
            <div>
              <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Tajuk</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] appearance-none outline-none focus:border-[#00FF5F] text-white transition-colors placeholder-[#444]" placeholder="Cth: Makan tengahari" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Jumlah (RM)</label>
                  <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] appearance-none outline-none focus:border-[#00FF5F] text-white transition-colors placeholder-[#444]" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Tarikh</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] appearance-none outline-none focus:border-[#00FF5F] text-white transition-colors" style={{colorScheme: 'dark'}} />
                </div>
            </div>
            <div>
              <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] appearance-none outline-none focus:border-[#00FF5F] text-white transition-colors">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2 flex items-center justify-between">
                 <span>Dokumen Resit</span>
                 {fileData && isPdf && <span className="text-[#00FF5F] flex items-center gap-1"><Wand2 size={12}/> Auto-Enhanced PDF</span>}
              </label>
              
              {fileData ? (
                <div className="relative rounded-[4px] overflow-hidden border border-[#222] bg-[#141414] p-2 inline-block group w-full">
                    {isPdf ? (
                        <iframe src={fileData} className="w-full h-48 rounded-[4px]" title="PDF Preview" />
                    ) : (
                        <img src={fileData} alt="Preview" className="h-48 w-full object-contain bg-black rounded-[4px]" />
                    )}
                    <button type="button" onClick={() => {setFileData(null); setIsPdf(false)}} className="absolute top-4 right-4 bg-black text-white p-2 rounded-full hover:text-[#00FF5F] shadow-lg transition z-10"><X size={16}/></button>
                </div>
              ) : (
                <div onClick={() => !isLoading && fileInputRef.current?.click()} className="w-full border border-dashed border-[#222] bg-[#141414] rounded-[4px] p-8 flex flex-col items-center justify-center text-[#888888] hover:border-[#00FF5F] hover:text-white cursor-pointer transition">
                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF5F] mb-3"></div>
                            <span className="text-[0.7rem] font-extrabold uppercase tracking-[2px]">Memproses AI Enhancement...</span>
                        </div>
                    ) : (
                        <>
                            <Camera size={28} className="mb-3 opacity-50" />
                            <span className="text-[0.7rem] font-extrabold uppercase tracking-[2px] text-center">Ambil Gambar<br/>(Auto PDF & Enhance)</span>
                            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        </>
                    )}
                </div>
              )}
            </div>
            <div className="pt-4 pb-12">
                <button disabled={isLoading} type="submit" className="w-full bg-[#00FF5F] text-black font-extrabold uppercase tracking-[2px] py-5 rounded-[4px] shadow-[0_0_20px_rgba(0,255,95,0.3)] hover:shadow-[0_0_30px_rgba(0,255,95,0.5)] transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Menyelaras...' : 'Simpan Resit'}
                </button>
            </div>
          </form>
        </div>
   );
}
