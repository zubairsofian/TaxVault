import React, { useState, useMemo } from 'react';
import { Receipt } from '../types';
import { TAX_CATEGORIES } from '../utils/taxRelief';
import { Calculator } from 'lucide-react';
import { formatRM } from '../utils/format';

interface TaxCalculationResult {
    taxable: number;
    baseTax: number;
    nextTax: number;
    totalTax: number;
    rate: number;
}

const calculateTax = (chargeableIncome: number): TaxCalculationResult => {
    // Current LHDN individual tax rates (example approximation for 2024/2025 brackets)
    const brackets = [
        { limit: 5000, rate: 0.00, base: 0 },
        { limit: 20000, rate: 0.01, base: 0 },
        { limit: 35000, rate: 0.03, base: 150 },
        { limit: 50000, rate: 0.06, base: 600 },
        { limit: 70000, rate: 0.11, base: 1500 },
        { limit: 100000, rate: 0.19, base: 3700 },
        { limit: 400000, rate: 0.25, base: 9400 },
        { limit: 600000, rate: 0.26, base: 84400 },
        { limit: 2000000, rate: 0.28, base: 136400 },
        { limit: Infinity, rate: 0.30, base: 528400 }
    ];

    let taxBase = 0;
    let taxRate = 0;
    let prevLimit = 0;
    let levelTax = 0;

    for (let i = 0; i < brackets.length; i++) {
        if (chargeableIncome <= brackets[i].limit) {
            taxBase = brackets[i].base;
            taxRate = brackets[i].rate;
            levelTax = (chargeableIncome - prevLimit) * taxRate;
            break;
        }
        prevLimit = brackets[i].limit;
    }

    return {
        taxable: chargeableIncome,
        baseTax: taxBase,
        nextTax: levelTax,
        totalTax: taxBase + levelTax,
        rate: taxRate * 100
    };
}


export default function Simulation({ receipts }: { receipts: Receipt[] }) {
    // Helper to calculate total spent per category based on current receipts
    const getCategoryTotal = (catName: string) => {
        return receipts.filter(r => r.category === catName).reduce((sum, r) => sum + r.amount, 0);
    }

    const defaultGayaHidup = getCategoryTotal('Gaya Hidup (Komputer, Buku, Internet, dll)');
    const defaultInsurans = getCategoryTotal('Insurans Nyawa & KWSP') + getCategoryTotal('Insurans Perubatan & Pendidikan');
    const defaultMedikal = getCategoryTotal('Perubatan & Penjagaan Ibu Bapa');

    // Forms states
    const [gaji, setGaji] = useState('');
    const [bonus, setBonus] = useState('');
    
    // Potongan Bulanan
    const [kwsp, setKwsp] = useState('');
    const [perkeso, setPerkeso] = useState('');
    
    // Tanggungan
    const [status, setStatus] = useState('bujang');
    const [anakBawah18, setAnakBawah18] = useState('');
    const [anakIPT, setAnakIPT] = useState('');
    
    // Pelepasan states (pre-populated by default if receipts exist)
    const [gayaHidup, setGayaHidup] = useState(defaultGayaHidup ? defaultGayaHidup.toString() : '');
    const [insurans, setInsurans] = useState(defaultInsurans ? defaultInsurans.toString() : '');
    const [medikalIbuBapa, setMedikalIbuBapa] = useState(defaultMedikal ? defaultMedikal.toString() : '');
    
    const [zakat, setZakat] = useState('');

    // Computation
    const results = useMemo(() => {
        const vGaji = Number(gaji) || 0;
        const vBonus = Number(bonus) || 0;
        const pendapatanTahunan = (vGaji * 12) + vBonus;

        const vKwsp = Number(kwsp) || 0;
        const pelepasanKwsp = Math.min(vKwsp * 12, 4000); 
        
        const vPerkeso = Number(perkeso) || 0;
        const pelepasanPerkeso = Math.min(vPerkeso * 12, 350);

        const pelepasanAsas = 9000;
        const pelepasanPasangan = status === 'kahwin' ? 4000 : 0;
        
        const vAnakBawah18 = Number(anakBawah18) || 0;
        const pelepasanAnak18 = vAnakBawah18 * 2000;
        
        const vAnakIPT = Number(anakIPT) || 0;
        const pelepasanAnakIPT = vAnakIPT * 8000;

        const vGayaHidup = Number(gayaHidup) || 0;
        const pelepasanGayaHidup = Math.min(vGayaHidup, 2500);

        const vInsurans = Number(insurans) || 0;
        const pelepasanInsurans = Math.min(vInsurans, 7000); // simplify overall insurans claims limit to max ~7k per user's prompt request structure

        const vMedikalIbuBapa = Number(medikalIbuBapa) || 0;
        const pelepasanMedikal = Math.min(vMedikalIbuBapa, 8000);

        const jumlahPelepasan = pelepasanAsas + pelepasanKwsp + pelepasanPerkeso + 
                                pelepasanPasangan + pelepasanAnak18 + pelepasanAnakIPT + 
                                pelepasanGayaHidup + pelepasanInsurans + pelepasanMedikal;

        let pendapatanBercukai = pendapatanTahunan - jumlahPelepasan;
        if (pendapatanBercukai < 0) pendapatanBercukai = 0;

        const cukaiKira = calculateTax(pendapatanBercukai);
        
        // Rebat section
        let rebatAsas = 0;
        if (pendapatanBercukai < 35000) {
            rebatAsas = 400; // Asas individu self
        }
        
        const vZakat = Number(zakat) || 0;
        const totalRebat = rebatAsas + vZakat;

        let finalTax = cukaiKira.totalTax - totalRebat;
        if (finalTax < 0) finalTax = 0;

        return {
            pendapatanTahunan,
            jumlahPelepasan,
            pendapatanBercukai,
            cukaiKira,
            totalRebat,
            finalTax
        };
    }, [gaji, bonus, kwsp, perkeso, status, anakBawah18, anakIPT, gayaHidup, insurans, medikalIbuBapa, zakat]);

    return (
        <div className="p-6 md:p-10 bg-[#0a0a0a] min-h-full flex flex-col pt-10">
            <h2 className="text-[1.5rem] font-extrabold mb-2 tracking-[-1px] uppercase">Simulasi LHDN '25</h2>
            <p className="text-[0.7rem] uppercase tracking-[1px] text-[#888] mb-8 leading-relaxed">
                Pengiraan kadar taksiran ini bersifat simulasi (*Berdasarkan bajet tahun taksiran LHDN 2024/2025). Masukkan anggaran butiran tanpa koma.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Form Section */}
                <div className="space-y-8">
                    
                    {/* Seksyen 1 */}
                    <div className="bg-[#141414] border border-[#222] p-6 rounded-[4px]">
                        <h3 className="text-[#00FF5F] text-[0.7rem] font-extrabold uppercase tracking-[2px] mb-4">1. Pendapatan</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[0.65rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Gaji Kasar + Elaun (Sebulan)</label>
                                <input type="number" min="0" value={gaji} onChange={e=>setGaji(e.target.value)} placeholder="0.00" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                            </div>
                            <div>
                                <label className="block text-[0.65rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Bonus Tahunan (Jika ada)</label>
                                <input type="number" min="0" value={bonus} onChange={e=>setBonus(e.target.value)} placeholder="0.00" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Seksyen 2 */}
                    <div className="bg-[#141414] border border-[#222] p-6 rounded-[4px]">
                        <h3 className="text-[#00FF5F] text-[0.7rem] font-extrabold uppercase tracking-[2px] mb-4">2. Potongan Wajib</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[0.65rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Caruman KWSP (Sebulan)</label>
                                <input type="number" min="0" value={kwsp} onChange={e=>setKwsp(e.target.value)} placeholder="0.00" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                            </div>
                            <div>
                                <label className="block text-[0.65rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Caruman PERKESO / SIP (Sebulan)</label>
                                <input type="number" min="0" value={perkeso} onChange={e=>setPerkeso(e.target.value)} placeholder="0.00" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Seksyen 3 */}
                    <div className="bg-[#141414] border border-[#222] p-6 rounded-[4px]">
                        <h3 className="text-[#00FF5F] text-[0.7rem] font-extrabold uppercase tracking-[2px] mb-4">3. Tanggungan</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[0.65rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Status</label>
                                <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none">
                                    <option value="bujang">Bujang</option>
                                    <option value="kahwin">Berkahwin</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[0.6rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Anak &lt; 18thn</label>
                                    <input type="number" min="0" value={anakBawah18} onChange={e=>setAnakBawah18(e.target.value)} placeholder="0" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[0.6rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Anak di IPT</label>
                                    <input type="number" min="0" value={anakIPT} onChange={e=>setAnakIPT(e.target.value)} placeholder="0" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seksyen 4 */}
                    <div className="bg-[#141414] border border-[#222] p-6 rounded-[4px]">
                        <h3 className="text-[#00FF5F] text-[0.7rem] font-extrabold uppercase tracking-[2px] mb-4">4. Pelepasan Cukai Tambahan</h3>
                        <p className="text-[0.55rem] uppercase tracking-[1px] text-[#666] mb-4">Gaya Hidup & Perubatan telah diisi awal menerusi rekod resit jika ada.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[0.65rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Gaya Hidup (Maks RM2,500)</label>
                                <input type="number" min="0" value={gayaHidup} onChange={e=>setGayaHidup(e.target.value)} placeholder="0.00" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                            </div>
                            <div>
                                <label className="block text-[0.65rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Insurans Hayat & Perubatan</label>
                                <input type="number" min="0" value={insurans} onChange={e=>setInsurans(e.target.value)} placeholder="0.00" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                            </div>
                            <div>
                                <label className="block text-[0.65rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Perubatan Ibu Bapa (Maks RM8,000)</label>
                                <input type="number" min="0" value={medikalIbuBapa} onChange={e=>setMedikalIbuBapa(e.target.value)} placeholder="0.00" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Seksyen 5 */}
                    <div className="bg-[#141414] border border-[#222] p-6 rounded-[4px]">
                        <h3 className="text-[#00FF5F] text-[0.7rem] font-extrabold uppercase tracking-[2px] mb-4">5. Rebat / Zakat</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[0.65rem] font-bold uppercase tracking-[1px] text-[#888888] mb-1">Zakat Fitrah & Pendapatan Dibayar</label>
                                <input type="number" min="0" value={zakat} onChange={e=>setZakat(e.target.value)} placeholder="0.00" className="w-full p-3 bg-black border border-[#222] rounded-[4px] text-white focus:border-[#00FF5F] outline-none" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Result Section (Sticky on desktop) */}
                <div className="relative">
                    <div className="lg:sticky lg:top-28 space-y-4">
                        
                        <div className="bg-[#050505] border border-[#222] rounded-[4px] p-6 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                            <h3 className="flex items-center gap-2 text-[#fff] text-[1rem] font-extrabold tracking-[-1px] mb-6">
                                <Calculator size={20} className="text-[#00FF5F]" /> Ringkasan Pengiraan
                            </h3>
                            
                            <div className="space-y-4 text-[0.8rem]">
                                <div className="flex justify-between border-b border-[#222] pb-2">
                                    <span className="text-[#888] font-bold uppercase tracking-[1px] text-[0.65rem]">1. Pendapatan Tahunan</span>
                                    <span className="font-mono">{formatRM(results.pendapatanTahunan)}</span>
                                </div>
                                <div className="flex justify-between border-b border-[#222] pb-2">
                                    <span className="text-[#888] font-bold uppercase tracking-[1px] text-[0.65rem]">2. Tolak: Pelepasan Kasar</span>
                                    <span className="font-mono text-red-400">-{formatRM(results.jumlahPelepasan)}</span>
                                </div>
                                
                                <div className="flex justify-between bg-[#141414] p-3 rounded-[4px]">
                                    <span className="text-white font-bold uppercase tracking-[1px] text-[0.7rem]">A. Pendapatan Bercukai</span>
                                    <span className="font-mono font-bold text-[#00FF5F]">{formatRM(results.pendapatanBercukai)}</span>
                                </div>

                                {/* Analisis Cukai Section */}
                                {results.pendapatanBercukai > 0 && (
                                    <div className="pt-2">
                                        <div className="flex justify-between pb-1">
                                            <span className="text-[#888] text-[0.65rem]">Cukai Asas</span>
                                            <span className="text-[#888] text-[0.65rem]">{formatRM(results.cukaiKira.baseTax)}</span>
                                        </div>
                                        <div className="flex justify-between pb-2 border-b border-[#222]">
                                            <span className="text-[#888] text-[0.65rem]">
                                                Baki pada kadar {results.cukaiKira.rate.toFixed(0)}%
                                            </span>
                                            <span className="text-[#888] text-[0.65rem]">{formatRM(results.cukaiKira.nextTax)}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 pb-2">
                                            <span className="text-[#888] font-bold uppercase tracking-[1px] text-[0.65rem]">3. Cukai Dikenakan</span>
                                            <span className="font-mono">{formatRM(results.cukaiKira.totalTax)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#222] pb-2">
                                            <span className="text-[#888] font-bold uppercase tracking-[1px] text-[0.65rem]">4. Tolak: Rebat Zakat/Fitrah</span>
                                            <span className="font-mono text-red-400">-{formatRM(results.totalRebat)}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={`flex flex-col justify-center text-center p-6 rounded-[4px] mt-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${results.finalTax > 0 ? 'bg-[#00FF5F] text-black' : 'bg-[#141414] border border-[#00FF5F]/30 text-white'}`}>
                                    <div className="text-[0.65rem] font-extrabold uppercase tracking-[2px] opacity-80 mb-2">B. Anggaran Cukai Perlu Bayar</div>
                                    <div className="text-[2.2rem] font-black tracking-[-1.5px] leading-none mb-1">
                                        RM {results.finalTax.toLocaleString('ms-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </div>
                                    {results.finalTax <= 0 ? (
                                        <div className="text-[0.6rem] font-bold uppercase tracking-[1px] text-[#00FF5F] mt-2 border border-[#00FF5F] py-1 px-3 rounded-full inline-block mx-auto">Tidak Perlu Bayar Cukai!</div>
                                    ) : (
                                        <div className="text-[0.6rem] font-bold uppercase tracking-[1px] opacity-70 mt-2">*Sila sediakan dana ini.</div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
