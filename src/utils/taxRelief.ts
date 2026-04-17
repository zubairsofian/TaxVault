export interface TaxCategoryData {
    name: string;
    limit: number;
    description: string;
}

export const TAX_CATEGORIES: TaxCategoryData[] = [
    { name: 'Pelepasan Asas (Individu/Anak/Pasangan)', limit: 20000, description: 'Pelepasan automatik serta tanggungan asas' },
    { name: 'Yuran Pengajian Diri Sendiri', limit: 7000, description: 'Termasuk kursus peningkatan kemahiran (terhad RM2k)' },
    { name: 'Perubatan & Penjagaan Ibu Bapa', limit: 8000, description: 'Rawatan perubatan ibu bapa' },
    { name: 'Yuran Taska / Tadika', limit: 3000, description: 'Anak di bawah 6 tahun (taska berdaftar)' },
    { name: 'Peralatan Penyusuan Bayi', limit: 1000, description: 'Pembayar cukai wanita, anak < 2 tahun' },
    { name: 'Gaya Hidup (Komputer, Buku, Internet, dll)', limit: 2500, description: 'Termasuk telefon pintar, gimnasium' },
    { name: 'Peralatan & Aktiviti Sukan', limit: 1000, description: 'Alat sukan, sewaan fasiliti, yuran pertandingan' },
    { name: 'Perubatan (Serius/Kesuburan/Vaksin/Gigi)', limit: 10000, description: 'Termasuk vaksin & gigi (masing-masing terhad RM1k)' },
    { name: 'Peralatan Sokongan Asas OKU', limit: 6000, description: 'Untuk kegunaan diri, pasangan, anak, ibu bapa' },
    { name: 'Insurans Nyawa & KWSP', limit: 7000, description: 'Untuk swasta / awam tidak berpencen' },
    { name: 'Insurans Perubatan & Pendidikan', limit: 4000, description: 'Polisi kesihatan dan pendidikan' },
    { name: 'Simpanan SSPN', limit: 8000, description: 'Tabungan bersih (sehingga 2027)' },
    { name: 'Skim Persaraan Swasta (PRS)', limit: 3000, description: 'PRS & Anuiti Tertunda' },
    { name: 'Caruman PERKESO / SIP', limit: 350, description: 'SOCSO & Insurans Pekerjaan' },
    { name: 'Faedah Pinjaman Rumah', limit: 7000, description: 'Harga < RM500k: RM7k | Harga RM500k-RM750k: RM5k' },
    { name: 'Pemasangan Pengecas EV / Kompos', limit: 2500, description: 'Fasiliti EV dan kompos hijau' },
    { name: 'Lain-lain', limit: 0, description: 'Perbelanjaan umum tanpa pelepasan khas' }
];

export const CATEGORIES = TAX_CATEGORIES.map(c => c.name);
