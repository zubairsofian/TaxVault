import React, { useState, useRef } from 'react';
import { Receipt } from '../types';
import { syncToGAS } from '../utils/gas';
import { X, Camera, Wand2 } from 'lucide-react';
import { enhanceImageToPdfBase64 } from '../utils/imageProcessing';
import { CATEGORIES } from '../utils/taxRelief';

function guessCategory(title: string): string | null {
    const lowerTitle = title.toLowerCase();
    const keywordsMap = [
        { cat: 'Yuran Pengajian Diri Sendiri', words: ['yuran', 'pengajian', 'kursus', 'kemahiran', 'degree', 'master', 'phd'] },
        { cat: 'Perubatan & Penjagaan Ibu Bapa', words: ['jagaan', 'ibu', 'bapa', 'nursing', 'ayah', 'emak', 'mak'] },
        { cat: 'Yuran Taska / Tadika', words: ['taska', 'tadika', 'nursery', 'kindergarten', 'pengasuh'] },
        { cat: 'Peralatan Penyusuan Bayi', words: ['susu', 'pam', 'bayi', 'breastpump', 'pump', 'baby'] },
        { cat: 'Gaya Hidup (Komputer, Buku, Internet, dll)', words: ['laptop', 'komputer', 'telefon', 'phone', 'buku', 'internet', 'unifi', 'celcom', 'maxis', 'digi', 'gim', 'gym', 'ipad', 'tablet', 'newspaper', 'surat khabar', 'majalah'] },
        { cat: 'Peralatan & Aktiviti Sukan', words: ['sukan', 'raket', 'kasut sukan', 'bola', 'badminton', 'futsal', 'renang', 'marathon', 'sports'] },
        { cat: 'Perubatan (Serius/Kesuburan/Vaksin/Gigi)', words: ['klinik', 'ubat', 'hospital', 'farmasi', 'panadol', 'gigi', 'vaksin', 'mental', 'watson', 'guardian', 'caring'] },
        { cat: 'Peralatan Sokongan Asas OKU', words: ['oku', 'kerusi roda', 'wheelchair', 'tongkat', 'alat sokongan'] },
        { cat: 'Insurans Nyawa & KWSP', words: ['kwsp', 'epf', 'insurans nyawa', 'life insurance', 'takaful'] },
        { cat: 'Insurans Perubatan & Pendidikan', words: ['insurans perubatan', 'medical card', 'insurans pendidikan', 'education insurance'] },
        { cat: 'Simpanan SSPN', words: ['sspn', 'ptptn'] },
        { cat: 'Skim Persaraan Swasta (PRS)', words: ['prs', 'persaraan swasta', 'anuiti'] },
        { cat: 'Caruman PERKESO / SIP', words: ['perkeso', 'socso', 'sip', 'eis'] },
        { cat: 'Faedah Pinjaman Rumah', words: ['pinjaman rumah', 'faedah rumah', 'loan rumah', 'housing loan interest'] },
        { cat: 'Pemasangan Pengecas EV / Kompos', words: ['ev', 'pengecas ev', 'kompos', 'compost', 'tesla', 'charger'] },
        { cat: 'Lain-lain', words: ['makan', 'minum', 'kfc', 'mcd', 'petrol', 'minyak', 'toll', 'tol', 'parking', 'baju', 'seluar', 'kasut', 'shopee', 'lazada', 'grab'] }
    ];

    for (const { cat, words } of keywordsMap) {
        if (words.some(w => lowerTitle.includes(w))) {
            return cat;
        }
    }
    return null;
}

export default function AddReceipt({ onAdd }: { onAdd: (r: Receipt) => void }) {
   const [title, setTitle] = useState('');
   const [amount, setAmount] = useState('');
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const [category, setCategory] = useState(CATEGORIES[0]);
   const [isManualCategory, setIsManualCategory] = useState(false);
   const [fileData, setFileData] = useState<string | null>(null);
   const [isPdf, setIsPdf] = useState(false);
   
   // Progress trackings
   const [isProcessingImage, setIsProcessingImage] = useState(false);
   const [imageProgress, setImageProgress] = useState(0);
   
   const [isSaving, setIsSaving] = useState(false);
   const [saveProgress, setSaveProgress] = useState(0);

   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const newTitle = e.target.value;
       setTitle(newTitle);
       
       if (!isManualCategory) {
           const guessed = guessCategory(newTitle);
           if (guessed && CATEGORIES.includes(guessed)) {
               setCategory(guessed);
           }
       }
   };

   const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
       setCategory(e.target.value);
       setIsManualCategory(true);
   };

   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (file) {
           setIsProcessingImage(true);
           setImageProgress(0);
           try {
             const { base64Data, isPdfDocument } = await enhanceImageToPdfBase64(file, (p) => setImageProgress(p));
             setFileData(base64Data);
             setIsPdf(isPdfDocument);
           } catch (err) {
               console.error("Gagal proses gambar:", err);
               alert("Gagal memproses gambar resit.");
           } finally {
             setIsProcessingImage(false);
             setImageProgress(0);
           }
       }
   };

   const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       if (!title || !amount || !date || !category) return;
       
       setIsSaving(true);
       setSaveProgress(0);
       
       let interval: number;
       // Simulate progress while waiting for backend sync (if any)
       interval = window.setInterval(() => {
           setSaveProgress(prev => {
               if (prev >= 90) return 90;
               return prev + Math.floor(Math.random() * 10) + 5;
           });
       }, 300);

       const newReceipt: Receipt = {
           id: Date.now().toString(), 
           title, 
           amount: parseFloat(amount), 
           date, 
           category, 
           image: fileData,
           syncStatus: 'pending'
       };
       
       const success = await syncToGAS(newReceipt);
       if(success) newReceipt.syncStatus = 'synced';
       
       clearInterval(interval);
       setSaveProgress(100);
       
       // Short delay for visual completion
       setTimeout(() => {
           onAdd(newReceipt);
           setIsSaving(false);
           setTitle(''); setAmount(''); setFileData(null); setIsPdf(false); setIsManualCategory(false); setCategory(CATEGORIES[0]);
       }, 400);
   };

   return (
        <div className="p-6 md:p-10 bg-[#0a0a0a] min-h-full flex flex-col pt-10">
          <h2 className="text-[1.5rem] font-extrabold mb-8 tracking-[-1px]">Resit Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-6 flex-1 max-w-2xl w-full">
            <div>
              <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Tajuk</label>
              <input type="text" required value={title} onChange={handleTitleChange} disabled={isSaving || isProcessingImage} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] appearance-none outline-none focus:border-[#00FF5F] text-white transition-colors placeholder-[#444] disabled:opacity-50" placeholder="Cth: Makan tengahari KFC" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Jumlah (RM)</label>
                  <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} disabled={isSaving || isProcessingImage} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] appearance-none outline-none focus:border-[#00FF5F] text-white transition-colors placeholder-[#444] disabled:opacity-50" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Tarikh</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} disabled={isSaving || isProcessingImage} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] appearance-none outline-none focus:border-[#00FF5F] text-white transition-colors disabled:opacity-50" style={{colorScheme: 'dark'}} />
                </div>
            </div>
            <div>
              <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Kategori</label>
              <select value={category} onChange={handleCategoryChange} disabled={isSaving || isProcessingImage} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] appearance-none outline-none focus:border-[#00FF5F] text-white transition-colors disabled:opacity-50">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2 flex items-center justify-between">
                 <span>Dokumen Resit</span>
                 {fileData && isPdf && <span className="text-[#00FF5F] flex items-center gap-1"><Wand2 size={12}/> Auto-Enhanced PDF</span>}
              </label>
              
              {fileData && !isProcessingImage ? (
                <div className="relative rounded-[4px] overflow-hidden border border-[#222] bg-[#141414] p-2 inline-block group w-full">
                    {isPdf ? (
                        <iframe src={fileData} className="w-full h-48 rounded-[4px]" title="PDF Preview" />
                    ) : (
                        <img src={fileData} alt="Preview" className="h-48 w-full object-contain bg-black rounded-[4px]" />
                    )}
                    <button type="button" onClick={() => {setFileData(null); setIsPdf(false)}} className="absolute top-4 right-4 bg-black text-white p-2 rounded-full hover:text-[#00FF5F] shadow-lg transition z-10"><X size={16}/></button>
                </div>
              ) : (
                <div onClick={() => !isProcessingImage && !isSaving && fileInputRef.current?.click()} className="w-full border border-dashed border-[#222] bg-[#141414] rounded-[4px] p-8 flex flex-col items-center justify-center text-[#888888] hover:border-[#00FF5F] hover:text-white cursor-pointer transition relative overflow-hidden">
                    {isProcessingImage ? (
                        <div className="flex flex-col items-center z-10 w-full px-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF5F] mb-3"></div>
                            <span className="text-[0.8rem] font-black tracking-[1px] text-white mb-1">MEMPROSES GAMBAR... {imageProgress}%</span>
                            <div className="w-full h-1 bg-[#222] mt-3 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00FF5F] transition-all duration-300 relative" style={{ width: `${imageProgress}%` }}>
                                     <div className="absolute inset-0 bg-white/30 backdrop-blur-sm shadow-[0_0_10px_#00FF5F]"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Camera size={28} className="mb-3 opacity-50 z-10" />
                            <span className="text-[0.7rem] font-extrabold uppercase tracking-[2px] text-center z-10">Ambil Gambar<br/>(Auto PDF & Enhance)</span>
                            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        </>
                    )}
                </div>
              )}
            </div>
            
            <div className="pt-4 pb-12">
                <button disabled={isSaving || isProcessingImage} type="submit" className="w-full bg-[#00FF5F] text-black font-extrabold uppercase tracking-[2px] py-5 rounded-[4px] shadow-[0_0_20px_rgba(0,255,95,0.3)] hover:shadow-[0_0_30px_rgba(0,255,95,0.5)] transition flex flex-col justify-center items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? (
                        <>
                           <span>Menyelaras... {saveProgress}%</span>
                           <div className="w-32 h-[2px] bg-black/20 mt-1 rounded-full overflow-hidden">
                                <div className="h-full bg-black transition-all duration-300" style={{ width: `${saveProgress}%` }}></div>
                           </div>
                        </>
                    ) : 'Simpan Resit'}
                </button>
            </div>
          </form>
        </div>
   );
}
