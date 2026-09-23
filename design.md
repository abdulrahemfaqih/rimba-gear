# Stitch Prompts — Your Brand Rental Alat Outdoor

Setiap screen di bawah dibuat **terpisah** (sesuai rekomendasi: 1 prompt = 1 generate di Stitch). Paste `DESIGN.md` dulu di awal sesi Stitch (kalau Stitch mendukung system context), lalu paste prompt tiap halaman satu per satu.

Prinsip desain di semua prompt: **hindari AI slop** — tidak ada gradient ungu generik, tidak ada glassmorphism berlebihan, tidak ada emoji sebagai ikon, tidak ada eyebrow text kecil di atas heading, tidak ada badge/dot animasi pulsing. Utamakan tipografi tegas, foto produk sebagai fokus, dan spacing yang jelas.

---

## DESIGN.md (paste sekali di awal, dipakai semua screen)

```
Brand: Your Brand — rental alat outdoor (tenda, carrier, alat masak, dll)
Mood: rugged, terpercaya, utilitarian-editorial, bukan playful/childish

Colors:
- Primary: #2F3D2A (hijau hutan tua) — CTA utama, header, elemen aktif
- Accent: #C1502E (terracotta/rust) — harga, badge penting, hover state
- Background: #F7F5EF (krem hangat, bukan putih polos)
- Surface: #FFFFFF (card, dengan hairline border #E4E1D6)
- Text-primary: #1E1E1A
- Text-secondary: #6B6B5F
- Border: #E4E1D6 (hairline 1px)
- Success: #3F7D45
- Error: #B3261E

Typography:
- Heading: grotesque sans bold (Space Grotesk / Archivo), weight 600-700, tracking sedikit rapat
  - H1: 40-48px, line-height 1.1
  - H2: 24-28px, line-height 1.2
- Body: Inter, weight 400, 15-16px, line-height 1.6
- Label/caption: Inter, weight 500, 12-13px, uppercase, letter-spacing wide, warna text-secondary

Spacing: 8px grid — card padding 24px, gap antar card 16px, section spacing 64-96px

Shape: radius kecil-menengah (4-8px) untuk card & button — bukan pillowy 20px+. Foto produk bisa tanpa radius (sharp) untuk kesan rugged.

Elevation: flat dominant, depth via hairline border #E4E1D6, bukan shadow tebal. Hover state: shadow tipis 0 1px 3px rgba(0,0,0,0.06).

Components: button primary solid hijau tua teks putih radius 6px; button secondary outline hijau tua; badge harga pill kecil warna terracotta teks putih; input field border hairline radius 6px padding 12px.

Rules to never break:
- Tidak ada emoji sebagai icon di UI
- Tidak ada teks kecil "EYEBROW LABEL" di atas H1/H2
- Tidak ada dot/badge dengan animasi pulsing
- Semua konten pakai data produk nyata (bukan lorem ipsum)
```

---

## 1. Landing Page (`/`)

Buatkan landing page untuk situs rental alat outdoor bernama Your Brand.

Layout:
- Navbar: logo kiri, menu "Kategori", "Cara Sewa", ikon keranjang kanan dengan badge jumlah item
- Hero: foto tenda/camping full-bleed dengan overlay gelap tipis, headline "Sewa Alat Camping, Siap Berangkat Akhir Pekan Ini", subheadline singkat, tombol CTA "Lihat Semua Alat" mengarah ke halaman kategori
- Section kategori unggulan: grid 4 kolom (desktop) berisi foto + nama kategori — tampilkan minimal: Tenda, Carrier, Alat Masak, Penerangan
- Section "Cara Sewa" — 3 langkah bernomor: "1. Pilih alat & durasi sewa", "2. Isi data diri di checkout", "3. Konfirmasi via WhatsApp, alat siap diambil"
- Section produk contoh: card "Bivak Set" — foto tenda bivak, harga mulai Rp38.000, tombol "Lihat Detail"
- Footer sederhana: alamat, nomor WA, jam operasional

Gunakan palet & tipografi dari DESIGN.md. Konten harus konkret (bukan lorem ipsum).

---

## 2. Halaman Semua Kategori (`/kategori`)

Buatkan halaman grid semua kategori alat.

Layout:
- Navbar sama seperti landing page
- Heading "Kategori Alat" + subteks singkat jumlah kategori
- Grid card kategori (3 kolom desktop, 2 kolom tablet, 1 kolom mobile): tiap card berisi foto representatif, nama kategori, jumlah produk (mis. "12 alat tersedia")
- Kategori yang ditampilkan (default): Tenda, Carrier, Alat Masak, Elektronik, Penerangan, Survival, Perlengkapan Pribadi, Perlengkapan Tambahan
- Klik card mengarah ke halaman produk per kategori

Gunakan DESIGN.md untuk warna & spacing. Card pakai hairline border, hover state shadow tipis.

---

## 3. Halaman Produk per Kategori (`/kategori/[slug]`)

Buatkan halaman list produk untuk kategori "Tenda".

Layout:
- Breadcrumb: Beranda / Kategori / Tenda
- Heading "Tenda" + jumlah produk
- Grid produk 3 kolom (desktop): tiap card berisi foto produk, nama produk, "Mulai dari Rp38.000/sewa", tombol "Lihat Detail"
- Contoh produk nyata untuk isi grid:
  1. "Bivak Set" — ukuran 3x4 meter, mulai Rp38.000
  2. "Tenda Dome 4 Orang" — mulai Rp55.000
  3. "Flysheet 4x6 Meter" — mulai Rp45.000
  4. "Matras Camping" — mulai Rp15.000
- (Opsional) search/filter bar di atas grid

Gunakan DESIGN.md. Foto produk jadi fokus utama tiap card, harga ditampilkan dengan warna accent (terracotta).

---

## 4. Detail Produk (`/produk/[slug]`)

Buatkan halaman detail produk untuk "Bivak Set".

Layout:
- Breadcrumb: Beranda / Kategori Tenda / Bivak Set
- Kiri: galeri foto produk (foto utama besar + thumbnail kecil di bawah/samping) — tampilkan tenda bivak warna merah, tas carry, dan pasak/tiang
- Kanan:
  - Nama produk "Bivak Set"
  - Deskripsi singkat: "Ukuran 3 x 4 meter. Paket lengkap: flysheet, tiang, pasak, tali."
  - Label "Pilih Durasi Sewa" + pilihan chip/tombol horizontal: "2 Hari — Rp38.000", "3 Hari — Rp52.000", "4 Hari — Rp62.000", "5 Hari — Rp72.000" (satu chip aktif/terpilih dengan warna primary)
  - Harga total besar yang otomatis mengikuti chip terpilih
  - Tombol "Tambah ke Keranjang" (full width, warna primary)
- Section bawah: deskripsi lengkap produk (spesifikasi, isi paket)

Gunakan DESIGN.md. Chip durasi harus jelas kondisi default/selected-nya, tanpa animasi pulsing.

---

## 5. Halaman Keranjang (`/keranjang`)

Buatkan halaman keranjang belanja.

Layout:
- Heading "Keranjang Sewa"
- List item (2-3 contoh): tiap baris berisi foto kecil, nama produk, durasi terpilih (dengan opsi ubah), harga, ikon hapus
- Contoh isi:
  1. Bivak Set — 3 Hari — Rp52.000
  2. Tenda Dome 4 Orang — 2 Hari — Rp40.000
- Ringkasan di kanan/bawah (sticky di mobile): Subtotal per item, Total keseluruhan, tombol "Checkout" (full width, primary)
- State kosong (kalau keranjang kosong): ilustrasi sederhana + teks "Keranjang masih kosong" + tombol "Mulai Pilih Alat"

Gunakan DESIGN.md.

---

## 6. Halaman Checkout (`/checkout`)

Buatkan halaman checkout.

Layout:
- Heading "Checkout"
- Kiri: Form —
  - Nama Lengkap (input teks)
  - Nomor WhatsApp (input teks)
  - Alamat (textarea, opsional)
  - Upload Foto KTP/SIM/KTM (dropzone/upload area dengan preview foto setelah dipilih)
- Kanan (card ringkasan, sticky): daftar item disewa + durasi + harga, garis pemisah, Total Harga besar
- Tombol bawah: "Konfirmasi via WhatsApp" (full width, primary, ikon WhatsApp kecil di sisi teks — bukan emoji, pakai icon outline)
- Teks kecil di bawah tombol: "Data kamu akan dikirim ke admin lewat WhatsApp untuk konfirmasi ketersediaan"

Gunakan DESIGN.md. Form input pakai border hairline radius 6px.

---

## 7. Halaman Konfirmasi Terkirim (`/checkout/sukses`)

Buatkan halaman konfirmasi singkat sebelum redirect ke WhatsApp.

Layout:
- Card tengah (centered, max-width kecil): ikon centang outline (bukan emoji), heading "Pesanan Terkirim", teks "Kamu akan diarahkan ke WhatsApp untuk konfirmasi dengan admin"
- Ringkasan singkat: total harga, jumlah item
- Tombol "Buka WhatsApp Sekarang" kalau redirect otomatis gagal

Gunakan DESIGN.md, layout sederhana dan tenang.

---

## 8. Admin — Login (`/admin/login`)

Buatkan halaman login admin sederhana.

Layout:
- Card tengah (centered, max-width kecil) di atas background krem polos
- Logo/nama brand di atas card
- Form: Username, Password, tombol "Masuk" (full width, primary)
- Tanpa elemen dekoratif berlebihan — halaman ini fungsional, bukan marketing

Gunakan DESIGN.md.

---

## 9. Admin — Dashboard (`/admin`)

Buatkan halaman dashboard admin.

Layout:
- Sidebar kiri: logo, menu (Dashboard, Kategori, Produk, Pesanan), fixed
- Konten utama:
  - Baris kartu ringkasan (3-4 kartu): "Pesanan Baru: 5", "Total Produk: 42", "Total Kategori: 8"
  - Tabel pesanan terbaru (5 baris): Nama Penyewa, Total Harga, Status (badge warna sesuai status), Tanggal

Gunakan DESIGN.md, gaya dashboard utilitarian — bukan card mengambang dengan shadow tebal, tapi hairline border.

---

## 10. Admin — Kelola Kategori (`/admin/kategori`)

Buatkan halaman kelola kategori di panel admin.

Layout:
- Sidebar sama seperti dashboard
- Heading "Kelola Kategori" + tombol "Tambah Kategori" (kanan atas)
- Tabel: kolom Foto, Nama Kategori, Urutan, Status (Aktif/Nonaktif toggle), Aksi (Edit/Hapus)
- Contoh baris: Tenda, Carrier, Alat Masak, Elektronik, Penerangan, Survival, Perlengkapan Pribadi, Perlengkapan Tambahan
- Modal/panel tambah-edit kategori: input Nama, upload Foto, input Urutan, toggle Aktif

Gunakan DESIGN.md.

---

## 11. Admin — Kelola Produk (`/admin/produk`)

Buatkan halaman kelola produk di panel admin (list + form tambah/edit dalam satu prompt, dua state).

**State List:**
- Sidebar sama seperti dashboard
- Heading "Kelola Produk" + filter dropdown kategori + tombol "Tambah Produk"
- Tabel: Foto, Nama Produk, Kategori, Harga Mulai Dari, Status, Aksi

**State Form Tambah/Edit** (tampilkan sebagai panel/modal terpisah):
- Input Nama Produk
- Dropdown Kategori
- Textarea Deskripsi
- Upload foto (multi, dengan preview thumbnail)
- Bagian "Tier Harga Sewa" — tabel dinamis dengan kolom "Durasi (hari)" dan "Harga (Rp)", tombol "+ Tambah Durasi" di bawah tabel, tiap baris ada tombol hapus
  - Contoh isi default: 2 hari / 38000, 3 hari / 52000, 4 hari / 62000, 5 hari / 72000
- Tombol "Simpan Produk"

Gunakan DESIGN.md.

---

## 12. Admin — Kelola Pesanan (`/admin/pesanan`)

Buatkan halaman kelola pesanan (list + detail dalam satu prompt, dua state).

**State List:**
- Sidebar sama seperti dashboard
- Heading "Kelola Pesanan"
- Tabel: Nama Penyewa, No. HP, Total Harga, Jumlah Item, Status (badge), Tanggal, Aksi "Lihat Detail"

**State Detail** (panel/modal):
- Data diri: Nama, No. HP, Alamat
- Preview foto KTP/SIM/KTM (gambar dengan border)
- List item disewa: nama produk, durasi, harga — dengan total di bawah
- Dropdown ubah status: Baru / Dikonfirmasi / Selesai / Dibatalkan

Gunakan DESIGN.md.
