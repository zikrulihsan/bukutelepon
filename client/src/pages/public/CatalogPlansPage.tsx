import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiArrowRight,
  HiCheck,
  HiChatBubbleLeftRight,
  HiChevronDown,
  HiOutlineBuildingStorefront,
  HiOutlineDevicePhoneMobile,
  HiOutlinePhoto,
  HiOutlineSparkles,
} from "react-icons/hi2";

type BillingPeriod = "monthly" | "yearly";

const plans = [
  {
    name: "Pro",
    description: "Mulai tampil profesional dan mudah ditemukan.",
    monthly: "29rb",
    yearly: "299rb",
    badge: null,
    featured: false,
    features: ["1 halaman katalog bisnis", "Tampilkan hingga 20 produk atau jasa", "Tautan WhatsApp langsung", "Foto, harga, dan deskripsi produk", "Bantuan pengaturan awal"],
  },
  {
    name: "Special Pro",
    description: "Untuk bisnis yang ingin tampil lebih menonjol.",
    monthly: "49rb",
    yearly: "500rb",
    badge: "PALING LARIS",
    featured: true,
    features: ["Semua fitur Pro", "Produk & jasa tanpa batas", "Prioritas tampil di pencarian", "Badge bisnis unggulan", "Dukungan prioritas via WhatsApp"],
  },
];

const faqs = [
  ["Apakah saya perlu bisa desain atau coding?", "Tidak perlu. Kami bantu siapkan tampilan awal, lalu Anda dapat memperbarui katalog dengan mudah."],
  ["Bisa ganti paket di kemudian hari?", "Bisa. Anda dapat meningkatkan paket kapan saja sesuai kebutuhan bisnis."],
  ["Bagaimana cara memulai?", "Pilih paket yang Anda inginkan. Tim kami akan menghubungi Anda melalui WhatsApp untuk menyiapkan katalog."],
];

function formatPeriod(period: BillingPeriod) {
  return period === "monthly" ? "bulan" : "tahun";
}

export default function CatalogPlansPage() {
  const [period, setPeriod] = useState<BillingPeriod>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcf8] text-[#08234B]">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Kembali ke beranda CariKontak">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-700 text-white shadow-[0_6px_14px_rgba(0,105,75,.20)]"><HiOutlineBuildingStorefront className="h-5 w-5" /></span>
          <span className="text-[18px] font-extrabold tracking-[-.05em]">CariKontak</span>
        </Link>
        <a href="#paket" className="rounded-full border border-[#DCE7DF] bg-white px-4 py-2 text-[13px] font-bold text-primary-700 transition hover:border-primary-300 hover:bg-primary-50">Lihat paket</a>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-14 lg:px-10 lg:pb-24">
          <div className="absolute left-[6%] top-5 -z-0 h-64 w-64 rounded-full bg-[#DDF5E7] blur-3xl" aria-hidden="true" />
          <div className="absolute right-[4%] top-24 -z-0 h-52 w-52 rounded-full bg-[#FFF0C5] blur-3xl" aria-hidden="true" />
          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#CDE9D7] bg-white/80 px-3.5 py-2 text-[12px] font-extrabold tracking-[.03em] text-primary-700 shadow-sm"><HiOutlineSparkles className="h-4 w-4" /> KATALOG ONLINE UNTUK BISNIS LOKAL</p>
              <h1 className="mt-5 text-[40px] font-extrabold leading-[1.04] tracking-[-.065em] text-[#08234B] sm:text-[54px]">Produkmu pantas <span className="text-primary-700">lebih mudah ditemukan.</span></h1>
              <p className="mt-5 max-w-lg text-[16px] font-medium leading-7 tracking-[-.02em] text-[#60708A]">Buat katalog online yang rapi, bagikan lewat WhatsApp, dan bantu calon pelanggan menemukan produk terbaikmu.</p>
              <div className="mt-7 flex flex-wrap gap-3 text-[13px] font-bold text-[#426071]">
                <span className="inline-flex items-center gap-1.5"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#DDF5E7] text-primary-700"><HiCheck className="h-3.5 w-3.5" /></span> Tanpa ribet</span>
                <span className="inline-flex items-center gap-1.5"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#DDF5E7] text-primary-700"><HiCheck className="h-3.5 w-3.5" /></span> Siap dibagikan</span>
                <span className="inline-flex items-center gap-1.5"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#DDF5E7] text-primary-700"><HiCheck className="h-3.5 w-3.5" /></span> Dukungan lokal</span>
              </div>
              <a href="#paket" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-700 px-5 py-3.5 text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(0,105,75,.23)] transition hover:bg-primary-800 active:scale-[.98]">Buat katalog sekarang <HiArrowRight className="h-4 w-4" /></a>
            </div>

            <div className="relative mx-auto w-full max-w-[450px]">
              <div className="absolute -right-5 top-14 h-24 w-24 rounded-[30px] bg-[#DDF5E7]" aria-hidden="true" />
              <div className="relative rounded-[30px] bg-[#0B5944] p-3 shadow-[0_25px_55px_rgba(7,50,38,.25)]">
                <div className="overflow-hidden rounded-[22px] bg-[#F8FBF8]">
                  <div className="flex items-center gap-2 bg-[linear-gradient(112deg,#E2F3E7,#F8FBF8)] px-4 py-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#D0ECDD] text-primary-700"><HiOutlineBuildingStorefront className="h-4 w-4" /></div>
                    <div><p className="text-[10px] font-bold text-[#8491A4]">Katalog oleh</p><p className="text-[13px] font-extrabold">Toko Rasa Sumbawa</p></div>
                    <span className="ml-auto rounded-full bg-white px-2 py-1 text-[9px] font-extrabold text-primary-700 shadow-sm">Buka</span>
                  </div>
                  <div className="p-3.5">
                    <div className="relative h-32 overflow-hidden rounded-xl bg-[#E7CEAC]">
                      <img src="/storefront/madu-sumbawa.jpg" alt="Contoh produk madu dalam katalog" className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-full bg-[#FFEE9B] px-2 py-1 text-[9px] font-extrabold text-[#815B00]">Terlaris</span>
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3"><div><p className="text-[14px] font-extrabold">Madu Sumbawa Asli</p><p className="mt-1 text-[11px] font-medium text-[#7D8BA1]">Panen pilihan dari peternak lokal</p></div><p className="shrink-0 text-[13px] font-extrabold text-primary-700">Rp85rb</p></div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="h-14 overflow-hidden rounded-lg bg-[#E8EFE7]"><img src="/storefront/abon-sapi.jpg" alt="" className="h-full w-full object-cover" /></div>
                      <div className="grid place-items-center rounded-lg border border-dashed border-[#B8D7C4] bg-[#F4FAF5] text-center"><HiOutlinePhoto className="h-4 w-4 text-primary-700" /><span className="mt-0.5 text-[9px] font-bold text-primary-700">+ produk lain</span></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E7ECE8] px-4 py-2.5"><span className="text-[10px] font-bold text-[#7D8BA1]">Mudah dipesan dari WhatsApp</span><span className="grid h-6 w-6 place-items-center rounded-full bg-[#DDF5E7] text-primary-700"><HiChatBubbleLeftRight className="h-3.5 w-3.5" /></span></div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-4 flex items-center gap-2.5 rounded-2xl border border-white bg-white px-3 py-2.5 shadow-[0_10px_25px_rgba(8,35,75,.12)]"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#DDF5E7] text-primary-700"><HiOutlineDevicePhoneMobile className="h-4 w-4" /></span><span><strong className="block text-[11px] font-extrabold">Siap di HP</strong><span className="block text-[10px] font-medium text-[#7D8BA1]">Nyaman untuk pelanggan</span></span></div>
            </div>
          </div>
        </section>

        <section id="paket" className="border-y border-[#E4ECE5] bg-white px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-[12px] font-extrabold tracking-[.13em] text-primary-700">PAKET BERLANGGANAN</p>
              <h2 className="mt-3 text-[32px] font-extrabold tracking-[-.055em] sm:text-[40px]">Pilih ruang terbaik untuk bisnismu</h2>
              <p className="mx-auto mt-3 max-w-md text-[14px] font-medium leading-6 text-[#71809A]">Mulai dari yang sederhana. Naikkan paket saat katalog dan bisnismu berkembang.</p>
              <div className="mt-7 inline-flex rounded-full bg-[#EDF3EE] p-1">
                <button type="button" onClick={() => setPeriod("monthly")} className={`rounded-full px-4 py-2 text-[12px] font-extrabold transition ${period === "monthly" ? "bg-white text-[#08234B] shadow-sm" : "text-[#71809A]"}`}>Bulanan</button>
                <button type="button" onClick={() => setPeriod("yearly")} className={`rounded-full px-4 py-2 text-[12px] font-extrabold transition ${period === "yearly" ? "bg-white text-[#08234B] shadow-sm" : "text-[#71809A]"}`}>Tahunan <span className="ml-1 text-primary-700">Lebih hemat</span></button>
              </div>
            </div>

            <div className="mt-11 grid gap-5 md:grid-cols-2 md:items-stretch">
              {plans.map((plan) => {
                const price = period === "monthly" ? plan.monthly : plan.yearly;
                const message = encodeURIComponent(`Halo, saya ingin berlangganan paket ${plan.name} (${period === "monthly" ? "bulanan" : "tahunan"}) untuk membuat katalog bisnis.`);
                return <article key={plan.name} className={`relative flex flex-col rounded-[25px] p-6 sm:p-7 ${plan.featured ? "bg-[#0B5944] text-white shadow-[0_18px_35px_rgba(4,79,58,.22)]" : "border border-[#DAE5DD] bg-[#FCFDFC]"}`}>
                  {plan.badge && <span className="absolute -top-3 left-6 rounded-full bg-[#FFE78D] px-3 py-1 text-[10px] font-black tracking-[.08em] text-[#6B4A00]">{plan.badge}</span>}
                  <h3 className="text-[23px] font-extrabold tracking-[-.05em]">{plan.name}</h3>
                  <p className={`mt-2 min-h-10 text-[13px] font-medium leading-5 ${plan.featured ? "text-[#CDE9D7]" : "text-[#71809A]"}`}>{plan.description}</p>
                  <div className="mt-6 flex items-end gap-1"><span className="text-[42px] font-extrabold leading-none tracking-[-.07em]">Rp{price}</span><span className={`mb-1 text-[13px] font-bold ${plan.featured ? "text-[#CDE9D7]" : "text-[#71809A]"}`}>/{formatPeriod(period)}</span></div>
                  {period === "yearly" && <p className={`mt-2 text-[11px] font-bold ${plan.featured ? "text-[#AEEBC7]" : "text-primary-700"}`}>Tagihan sekali setahun</p>}
                  <ul className={`mt-6 space-y-3 border-t pt-6 ${plan.featured ? "border-white/15" : "border-[#E5ECE6]"}`}>{plan.features.map((feature) => <li key={feature} className={`flex gap-2.5 text-[13px] font-semibold ${plan.featured ? "text-white" : "text-[#426071]"}`}><span className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full ${plan.featured ? "bg-[#60D392] text-[#0B5944]" : "bg-[#DDF5E7] text-primary-700"}`}><HiCheck className="h-3 w-3" /></span>{feature}</li>)}</ul>
                  <a href={`https://wa.me/6282338588078?text=${message}`} target="_blank" rel="noreferrer" className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[13px] font-extrabold transition active:scale-[.98] ${plan.featured ? "bg-[#DDF5E7] text-primary-800 hover:bg-white" : "bg-primary-700 text-white hover:bg-primary-800"}`}>Pilih {plan.name} <HiArrowRight className="h-4 w-4" /></a>
                </article>;
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:py-20">
          <div><p className="text-[12px] font-extrabold tracking-[.13em] text-primary-700">PERTANYAAN UMUM</p><h2 className="mt-3 text-[31px] font-extrabold leading-[1.08] tracking-[-.06em]">Semua yang perlu Anda tahu untuk mulai.</h2><p className="mt-4 text-[14px] font-medium leading-6 text-[#71809A]">Masih ragu? Hubungi kami dan ceritakan kebutuhan katalog Anda.</p><a href="https://wa.me/6282338588078" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[13px] font-extrabold text-primary-700">Tanya lewat WhatsApp <HiArrowRight className="h-4 w-4" /></a></div>
          <div className="divide-y divide-[#E1EAE3] rounded-2xl border border-[#E1EAE3] bg-white px-5 sm:px-6">{faqs.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-[14px] font-extrabold"><span>{question}</span><HiChevronDown className={`h-5 w-5 shrink-0 text-primary-700 transition-transform ${openFaq === index ? "rotate-180" : ""}`} /></button>{openFaq === index && <p className="-mt-1 pb-5 text-[13px] font-medium leading-6 text-[#71809A]">{answer}</p>}</div>)}</div>
        </section>
      </main>

      <footer className="border-t border-[#E4ECE5] bg-white px-5 py-7 text-center text-[12px] font-medium text-[#8090A6]">© {new Date().getFullYear()} CariKontak · Katalog sederhana untuk bisnis lokal.</footer>
    </div>
  );
}
