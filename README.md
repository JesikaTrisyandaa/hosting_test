# CloudVision — Sistem Deteksi Awan BMKG Juanda

Website profesional untuk projek akhir magang di Stasiun Meteorologi Juanda.
Dibangun dengan **HTML, CSS, dan JavaScript murni** — tanpa framework, tanpa build tools.

---

## Cara Menjalankan di VS Code Lokal

### Opsi 1: Buka langsung (paling cepat)
1. Ekstrak folder ini.
2. Klik dua kali file `index.html` — website akan terbuka di browser.

### Opsi 2: Live Server (disarankan untuk pengembangan)
1. Buka folder ini di Visual Studio Code.
2. Install ekstensi **"Live Server"** (oleh Ritwick Dey) dari Marketplace.
3. Klik kanan pada `index.html` → **"Open with Live Server"**.
4. Browser akan terbuka otomatis dan halaman akan auto-reload setiap kali Anda menyimpan perubahan.

### Opsi 3: Python (jika sudah terinstall)
```bash
cd cloud-detection-website
python -m http.server 8000
```
Kemudian buka `http://localhost:8000` di browser.

---

## Struktur Folder

```
cloud-detection-website/
├── index.html        ← Halaman utama (semua section dalam satu file)
├── css/
│   └── styles.css    ← Styling lengkap (warna, layout, animasi)
├── js/
│   └── main.js       ← Logika interaksi & TEMPAT MENGHUBUNGKAN MODEL ANDA
├── images/           ← Gambar awan, satelit, dll.
└── README.md         ← File ini
```

---

## Menghubungkan Model Machine Learning Anda

Buka file **`js/main.js`** dan cari fungsi `runDetection()` (sekitar baris 175).

Saat ini fungsi tersebut menggunakan **simulasi acak**. Untuk menghubungkan model Anda yang sebenarnya:

### Contoh dengan Flask/FastAPI Backend

```javascript
async function runDetection(file) {
  showState("loading");
  const t0 = performance.now();

  // Kirim gambar ke backend Anda
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:5000/predict", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();

  // Format respons backend yang diharapkan:
  // {
  //   predictions: [
  //     { class: "Cumulus",       prob: 0.74 },
  //     { class: "Stratus",       prob: 0.10 },
  //     ...
  //   ]
  // }

  const inferenceMs = Math.round(performance.now() - t0);
  renderResult(data.predictions, inferenceMs);
}
```

### Contoh dengan TensorFlow.js (model langsung di browser)

```javascript
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('/model/model.json');

async function runDetection(file) {
  showState("loading");
  const t0 = performance.now();

  const img = await loadImage(file);
  const tensor = tf.browser.fromPixels(img)
    .resizeBilinear([224, 224])
    .div(255.0)
    .expandDims(0);

  const output = model.predict(tensor);
  const probs = await output.data();

  const predictions = CLOUD_CLASSES.map((c, i) => ({
    class: c.name,
    prob: probs[i],
  })).sort((a, b) => b.prob - a.prob);

  renderResult(predictions, Math.round(performance.now() - t0));
}
```

---

## Yang Bisa Anda Kustomisasi

| Apa yang ingin diubah          | File              | Lokasi                      |
|--------------------------------|-------------------|-----------------------------|
| Warna utama (biru → hijau dll) | `css/styles.css`  | `:root { --c-primary }`     |
| Daftar kelas awan              | `js/main.js`      | `CLOUD_CLASSES`             |
| Statistik di Hero              | `index.html`      | `.hero-stats`               |
| Akurasi per kelas              | `index.html`      | `.acc-list`                 |
| Info kontak                    | `index.html`      | `.contact-list`             |
| Logo / nama brand              | `index.html`      | `.brand`                    |

---

## Bagian-Bagian Website

1. **Hero** — Pembuka dengan judul utama dan statistik
2. **Tentang** — Penjelasan tujuan projek + foto stasiun
3. **Jenis Awan** — Galeri 10 genus awan (Cumulus, Stratus, dll.)
4. **Deteksi** — Demo interaktif upload gambar
5. **Metodologi** — Timeline 4 tahap pengembangan model
6. **Hasil Evaluasi** — Akurasi, precision, recall, F1-score per kelas
7. **Kontak** — Form pertanyaan + info stasiun

---

## Browser yang Didukung

- Chrome / Edge (versi 90+)
- Firefox (versi 88+)
- Safari (versi 14+)

Tampilan responsif untuk desktop, tablet, dan mobile.

---

**Selamat mengerjakan projek akhir!** 🌤️
