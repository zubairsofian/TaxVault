import React, { useState, useRef } from 'react';
import { Receipt } from '../types';
import { CATEGORIES } from '../utils/taxRelief';
import { X, Camera, Wand2 } from 'lucide-react';
import { enhanceImageToPdfBase64 } from '../utils/imageProcessing';

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

export default function EditModal({ receipt, onClose, onUpdate }: { receipt: Receipt, onClose: () => void, onUpdate: (r: Receipt) => void }) {
   const [title, setTitle] = useState(receipt.title);
   const [amount, setAmount] = useState(receipt.amount.toString());
   const [date, setDate] = useState(receipt.date);
   const [category, setCategory] = useState(receipt.category);
   const [isManualCategory, setIsManualCategory] = useState(false);
   const [fileData, setFileData] = useState<string | null>(receipt.image);
   
   const [isPdf, setIsPdf] = useState(receipt.image?.startsWith('data:application/pdf') || false);
   
   const [isProcessingImage, setIsProcessingImage] = useState(false);
   const [imageProgress, setImageProgress] = useState(0);

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
                <button type="button" onClick={onClose} disabled={isProcessingImage} className="text-[#888888] hover:text-[#00FF5F] transition disabled:opacity-50"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                    <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Tajuk</label>
                    <input disabled={isProcessingImage} type="text" required value={title} onChange={handleTitleChange} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] outline-none focus:border-[#00FF5F] text-white disabled:opacity-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Jumlah (RM)</label>
                        <input disabled={isProcessingImage} type="number" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] outline-none focus:border-[#00FF5F] text-white disabled:opacity-50" />
                    </div>
                    <div>
                        <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Tarikh</label>
                        <input disabled={isProcessingImage} type="date" required value={date} onChange={e=>setDate(e.target.value)} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] outline-none focus:border-[#00FF5F] text-white disabled:opacity-50" style={{colorScheme: 'dark'}} />
                    </div>
                </div>
                <div>
                    <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2">Kategori</label>
                    <select disabled={isProcessingImage} value={category} onChange={handleCategoryChange} className="w-full p-4 bg-[#141414] border border-[#222] rounded-[4px] outline-none focus:border-[#00FF5F] text-white disabled:opacity-50">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="pb-4">
                    <label className="block text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] mb-2 flex items-center justify-between">
                         <span>Muat Naik Baru</span>
                         {fileData && isPdf && <span className="text-[#00FF5F] flex items-center gap-1"><Wand2 size={12}/> Auto-Enhanced PDF</span>}
                    </label>
                    
                    {fileData && !isProcessingImage ? (
                        <div className="relative inline-block w-full bg-[#141414] p-2 rounded-[4px] border border-[#222]">
                            {isPdf ? (
                                <iframe src={fileData} className="w-full h-48 rounded-[4px]" title="PDF Preview" />
                            ) : (
                                <img src={fileData} alt="Preview" className="h-48 w-full object-contain bg-black rounded-[4px]" />
                            )}
                            <button type="button" onClick={() => {setFileData(null); setIsPdf(false)}} className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded-[4px] hover:text-[#00FF5F] z-10"><X size={14}/></button>
                        </div>
                    ) : (
                        <div onClick={() => !isProcessingImage && fileInputRef.current?.click()} className="w-full py-8 border border-dashed border-[#222] bg-[#141414] rounded-[4px] text-center flex flex-col items-center justify-center text-[0.7rem] font-extrabold uppercase tracking-[2px] text-[#888888] hover:border-[#00FF5F] hover:text-white cursor-pointer transition relative overflow-hidden">
                            {isProcessingImage ? (
                                <div className="flex flex-col items-center z-10 w-full px-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF5F] mb-3"></div>
                                    <span className="text-[0.8rem] font-black text-white tracking-[1px] mb-1">MEMPROSES {imageProgress}%</span>
                                    <div className="w-full h-1 bg-[#222] mt-3 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#00FF5F] transition-all duration-300 relative" style={{ width: `${imageProgress}%` }}>
                                             <div className="absolute inset-0 bg-white/30 backdrop-blur-sm shadow-[0_0_10px_#00FF5F]"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Camera size={24} className="mb-3 opacity-50 z-10" />
                                    Ambil Gambar (Auto PDF)
                                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={isProcessingImage} className="w-full bg-[#00FF5F] text-black font-extrabold uppercase tracking-[2px] py-4 rounded-[4px] shadow-[0_0_20px_rgba(0,255,95,0.3)] hover:shadow-[0_0_30px_rgba(0,255,95,0.5)] transition flex items-center justify-center gap-2 disabled:opacity-50">
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    </div>
   )
}
