/* =============================================================
   CloudVision — Sistem Deteksi Awan BMKG Juanda
   Main JavaScript
   -------------------------------------------------------------
   File ini mengatur:
   1. Sticky navbar & mobile menu
   2. Smooth scroll & scroll-reveal animations
   3. Drag & drop upload + preview
   4. Fungsi runDetection() — TEMPAT MENGHUBUNGKAN MODEL ANDA
   5. Render hasil klasifikasi (probabilitas per kelas)
   6. Form kontak (simulasi pengiriman)
   ============================================================= */


/* ---------- 1. Daftar kelas awan ----------
   Sesuaikan dengan kelas dari model Anda.
   Urutan ini akan digunakan untuk menampilkan probabilitas. */
const CLOUD_CLASSES = [
  { name: "Cumulus",       label: "Awan kapas — cuaca cerah" },
  { name: "Stratus",       label: "Lapisan kabut tinggi" },
  { name: "Cumulonimbus",  label: "Awan badai — bahaya untuk penerbangan" },
  { name: "Altocumulus",   label: "Awan menengah berpetak" },
  { name: "Nimbostratus",  label: "Awan hujan terus-menerus" },
  { name: "Cirrus",        label: "Awan tinggi tipis dari kristal es" },
  { name: "Stratocumulus", label: "Lapisan awan rendah bergumpal" },
  { name: "Altostratus",   label: "Lapisan awan menengah keabu-abuan" },
  { name: "Cirrostratus",  label: "Lapisan tipis tinggi, halo matahari" },
  { name: "Cirrocumulus",  label: "Awan tinggi kecil bergerombol" },
];


/* ---------- 2. Navbar: sticky on scroll ---------- */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 30) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
});

/* ---------- 3. Mobile menu toggle ---------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");
navToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
document.querySelectorAll(".nav-links a").forEach((a) => {
  a.addEventListener("click", () => navLinks.classList.remove("open"));
});


/* ---------- 4. Scroll-reveal animation ---------- */
const revealEls = document.querySelectorAll(
  ".section-head, .feature-list li, .cloud-card, .t-step, .metric-card, .result-block, .contact-item, .contact-form, .image-card, .floating-card"
);
revealEls.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));


/* ---------- 5. Upload Card: drag & drop + file picker ---------- */
const uploadCard = document.getElementById("uploadCard");
const uploadEmpty = document.getElementById("uploadEmpty");
const uploadPreview = document.getElementById("uploadPreview");
const previewImg = document.getElementById("previewImg");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const resetBtn = document.getElementById("resetBtn");
const detectBtn = document.getElementById("detectBtn");

let selectedFile = null;

browseBtn?.addEventListener("click", () => fileInput.click());
uploadEmpty?.addEventListener("click", (e) => {
  if (e.target === uploadEmpty || e.target.closest(".upload-icon")) {
    fileInput.click();
  }
});

fileInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (file) handleFile(file);
});

["dragenter", "dragover"].forEach((evt) =>
  uploadCard?.addEventListener(evt, (e) => {
    e.preventDefault();
    uploadCard.classList.add("drag-over");
  })
);
["dragleave", "drop"].forEach((evt) =>
  uploadCard?.addEventListener(evt, (e) => {
    e.preventDefault();
    uploadCard.classList.remove("drag-over");
  })
);
uploadCard?.addEventListener("drop", (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith("image/")) handleFile(file);
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    alert("Mohon unggah file gambar (JPG / PNG).");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert("Ukuran file maksimal 10 MB.");
    return;
  }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    uploadEmpty.hidden = true;
    uploadPreview.hidden = false;
    resetResult();
  };
  reader.readAsDataURL(file);
}

resetBtn?.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  previewImg.src = "";
  uploadEmpty.hidden = false;
  uploadPreview.hidden = true;
  resetResult();
});

detectBtn?.addEventListener("click", () => {
  if (!selectedFile) return;
  runDetection(selectedFile);
});


/* ---------- 6. Result panel state ---------- */
const resultEmpty = document.getElementById("resultEmpty");
const resultLoading = document.getElementById("resultLoading");
const resultData = document.getElementById("resultData");
const resultClass = document.getElementById("resultClass");
const resultConfidence = document.getElementById("resultConfidence");
const resultMeta = document.getElementById("resultMeta");
const resultBars = document.getElementById("resultBars");
const resultTime = document.getElementById("resultTime");

function showState(state) {
  resultEmpty.hidden = state !== "empty";
  resultLoading.hidden = state !== "loading";
  resultData.hidden = state !== "data";
}
// function resetResult() {
//   showState("empty");
//   resultBars.innerHTML = "";
// }
function resetResult() {
  showState("empty");
  resultBars.innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {
  resetResult();
});


/* ===============================================================
   7. runDetection(file)
   ---------------------------------------------------------------
   *** INI TEMPAT ANDA MENGHUBUNGKAN MODEL ANDA ***

   Saat ini fungsi ini menggunakan SIMULASI hasil agar UI dapat
   ditampilkan tanpa backend. Untuk menggunakan model Anda yang
   sebenarnya, ganti blok di dalam komentar "REPLACE" di bawah.

   Contoh integrasi dengan REST API Flask/FastAPI Anda:
   ----------------------------------------------------------------
   const formData = new FormData();
   formData.append("image", file);
   const res = await fetch("http://localhost:5000/predict", {
     method: "POST",
     body: formData,
   });
   const data = await res.json();
   //  data = {
   //    predictions: [
   //      { class: "Cumulus",       prob: 0.74 },
   //      { class: "Stratus",       prob: 0.10 },
   //      ...
   //    ],
   //    inference_ms: 245
   //  }
   renderResult(data.predictions, data.inference_ms);
   ----------------------------------------------------------------
   =============================================================== */
// async function runDetection(file) {
//   showState("loading");
//   const t0 = performance.now();

//   // ============ REPLACE: panggilan model Anda di sini ============
//   // Saat ini menggunakan simulasi acak.
//   // await new Promise((r) => setTimeout(r, 1400));
//   // const predictions = simulatePredictions();
//   if (!window.cloudModel) {
//     console.log("Mulai load model...");
//     window.cloudModel = await tf.loadLayersModel("./model/model.json");
//     console.log("Model berhasil diload:", window.cloudModel);
//   }



//   // Load model
//   if (!window.cloudModel) {
//     window.cloudModel = await tf.loadLayersModel("./model/model.json");
//   }

//   // Ambil gambar preview
//   const img = document.getElementById("previewImg");

//   // Preprocessing gambar
//   const tensor = tf.browser.fromPixels(img)
//     .resizeNearestNeighbor([224, 224])
//     .toFloat()
//     .div(255.0)
//     .expandDims();

//   // Prediksi
//   const output = window.cloudModel.predict(tensor);
//   const probs = await output.data();

//   // Mapping hasil prediksi
//   const predictions = CLOUD_CLASSES.map((c, i) => ({
//     class: c.name,
//     prob: probs[i]
//   })).sort((a, b) => b.prob - a.prob);

//   // Bersihkan memory
//   tensor.dispose();
//   output.dispose();
//   // ===============================================================

//   const inferenceMs = Math.round(performance.now() - t0);
//   renderResult(predictions, inferenceMs);
// }

async function runDetection(file) {
  showState("loading");
  const t0 = performance.now();

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  const inferenceMs = Math.round(performance.now() - t0);
  renderResult(data.predictions, inferenceMs);
}

/* Simulasi probabilitas — hasilkan distribusi yang masuk akal */
function simulatePredictions() {
  // Tentukan top class secara acak
  const top = CLOUD_CLASSES[Math.floor(Math.random() * 6)];
  const topProb = 0.62 + Math.random() * 0.32;        // 62 – 94 %
  const remaining = 1 - topProb;

  // Sebar sisanya ke kelas lain
  const others = CLOUD_CLASSES.filter((c) => c.name !== top.name);
  const weights = others.map(() => Math.random());
  const wSum = weights.reduce((a, b) => a + b, 0);
  const otherPreds = others.map((c, i) => ({
    class: c.name,
    prob: (weights[i] / wSum) * remaining,
  }));

  return [{ class: top.name, prob: topProb }, ...otherPreds].sort(
    (a, b) => b.prob - a.prob
  );
}

/* ---------- 8. Render hasil klasifikasi ---------- */
function renderResult(predictions, inferenceMs) {
  showState("data");
  const top = predictions[0];
  const meta = CLOUD_CLASSES.find((c) => c.name === top.class);

  resultClass.textContent = top.class;
  resultConfidence.textContent = (top.prob * 100).toFixed(1) + "%";
  resultMeta.textContent = meta ? meta.label : "";
  resultTime.textContent = `${inferenceMs} ms`;

  resultBars.innerHTML = "";
  predictions.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = "bar-row" + (idx === 0 ? " top" : "");
    row.innerHTML = `
      <span class="bar-name">${p.class}</span>
      <span class="bar-track"><span class="bar-fill"></span></span>
      <span class="bar-pct">${(p.prob * 100).toFixed(1)}%</span>
    `;
    resultBars.appendChild(row);
    // animate bar in next frame
    requestAnimationFrame(() => {
      row.querySelector(".bar-fill").style.width = (p.prob * 100).toFixed(1) + "%";
    });
  });
}


/* ---------- 9. Contact form: simulasi submit ---------- */
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
contactForm?.addEventListener("submit", () => {
  formNote.hidden = false;
  contactForm.querySelectorAll("input, textarea").forEach((el) => (el.value = ""));
  setTimeout(() => (formNote.hidden = true), 4500);
  return false;
});
