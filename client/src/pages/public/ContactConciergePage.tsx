import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiMagnifyingGlass,
  HiMapPin,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClipboardDocumentList,
  HiOutlineShieldCheck,
  HiSparkles,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import { useCity } from "../../context/CityContext";
import { useI18n } from "../../i18n/LanguageContext";
import { BrandLogo } from "../../components/shared/BrandLogo";

const WHATSAPP_NUMBER = "6282338588078";

export default function ContactConciergePage() {
  const navigate = useNavigate();
  const { city } = useCity();
  const { lang } = useI18n();
  const [requestType, setRequestType] = useState("usaha");
  const [request, setRequest] = useState("");
  const [area, setArea] = useState(city?.name ?? "");

  const copy = lang === "en" ? {
    back: "Back",
    badge: "CARIKONTAK CONCIERGE",
    title: "Can't find the contact you need?",
    accent: "Let us search for it.",
    description: "Tell us the business, service, or professional you are looking for. Our team will help research and verify the contact.",
    stepTitle: "How it works",
    steps: [
      ["Share what you need", "Tell us the name, type of service, and area."],
      ["We research it", "The CariKontak team searches available trusted sources."],
      ["Receive it on WhatsApp", "We send the best available contact directly to you."],
    ],
    formTitle: "Request a contact search",
    formDescription: "The more detail you provide, the easier it is for us to help.",
    typeLabel: "What type of contact?",
    typeOptions: [["usaha", "Business"], ["layanan", "Service"], ["profesional", "Professional"], ["lainnya", "Other"]],
    requestLabel: "What are you looking for?",
    requestPlaceholder: "Example: reliable AC repair available today",
    areaLabel: "Area or city",
    areaPlaceholder: "Example: Sumbawa Besar",
    action: "Send request via WhatsApp",
    note: "Your request is sent directly to the CariKontak team. Sending the form does not guarantee that every contact can be found.",
    emergency: "For emergencies, use the emergency contacts on the homepage.",
    handledBy: "Handled directly by the CariKontak team",
    whatsappIntro: "Hello CariKontak team, please help me find a contact.",
  } : {
    back: "Kembali",
    badge: "JASTIP CARI KONTAK",
    title: "Tidak menemukan kontak yang dibutuhkan?",
    accent: "Biar kami bantu carikan.",
    description: "Ceritakan usaha, layanan, atau tenaga profesional yang Anda cari. Tim kami akan membantu menelusuri dan memeriksa kontaknya.",
    stepTitle: "Cara kerjanya",
    steps: [
      ["Ceritakan kebutuhan", "Sebutkan nama, jenis layanan, dan wilayah pencarian."],
      ["Kami bantu telusuri", "Tim CariKontak mencari dari sumber yang tersedia dan tepercaya."],
      ["Terima lewat WhatsApp", "Kontak terbaik yang tersedia akan kami kirim langsung."],
    ],
    formTitle: "Titip pencarian kontak",
    formDescription: "Semakin lengkap informasinya, semakin mudah kami membantu.",
    typeLabel: "Jenis kontak yang dicari",
    typeOptions: [["usaha", "Usaha"], ["layanan", "Layanan"], ["profesional", "Tenaga profesional"], ["lainnya", "Lainnya"]],
    requestLabel: "Apa yang Anda cari?",
    requestPlaceholder: "Contoh: jasa servis AC yang bisa datang hari ini",
    areaLabel: "Wilayah atau kota",
    areaPlaceholder: "Contoh: Sumbawa Besar",
    action: "Kirim permintaan lewat WhatsApp",
    note: "Permintaan dikirim langsung ke tim CariKontak. Pengiriman formulir tidak menjamin semua kontak dapat ditemukan.",
    emergency: "Untuk kondisi darurat, gunakan daftar kontak darurat di halaman utama.",
    handledBy: "Ditangani langsung oleh tim CariKontak",
    whatsappIntro: "Halo tim CariKontak, saya ingin titip pencarian kontak.",
  };

  const submitRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedType = copy.typeOptions.find(([value]) => value === requestType)?.[1] ?? requestType;
    const message = [
      copy.whatsappIntro,
      "",
      `${copy.typeLabel}: ${selectedType}`,
      `${copy.requestLabel}: ${request.trim()}`,
      `${copy.areaLabel}: ${area.trim()}`,
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const stepIcons = [HiOutlineClipboardDocumentList, HiMagnifyingGlass, HiOutlineChatBubbleLeftRight];

  return (
    <div className="min-h-screen bg-[#F4F7F5] pb-10 text-[#08234B]">
      <header className="sticky top-0 z-30 border-b border-[#E4EBE6] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-[13px] font-extrabold text-[#53667F] active:scale-95">
            <HiArrowLeft className="h-5 w-5" /> {copy.back}
          </button>
          <span className="inline-flex items-center gap-1.5 text-[16px] font-extrabold tracking-[-.04em] text-primary-700"><BrandLogo decorative className="h-7 w-7" />CariKontak</span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        <section className="relative overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_88%_18%,rgba(104,225,159,.38),transparent_28%),linear-gradient(145deg,#063E32,#087157)] px-5 pb-6 pt-7 text-white shadow-[0_14px_30px_rgba(5,77,57,.2)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-extrabold tracking-[.12em] text-[#D7F7E5]"><HiSparkles className="h-3.5 w-3.5" /> {copy.badge}</span>
          <h1 className="mt-5 text-[30px] font-extrabold leading-[33px] tracking-[-.06em]">{copy.title} <span className="text-[#A9F1C8]">{copy.accent}</span></h1>
          <p className="mt-3 text-[13px] font-medium leading-5 text-white/80">{copy.description}</p>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-bold text-[#D7F7E5]"><HiOutlineShieldCheck className="h-5 w-5" /> {copy.handledBy}</div>
        </section>

        <section className="mt-7">
          <h2 className="text-[18px] font-extrabold tracking-[-.04em]">{copy.stepTitle}</h2>
          <div className="mt-3 space-y-2.5">
            {copy.steps.map(([title, description], index) => {
              const Icon = stepIcons[index];
              return <div key={title} className="flex gap-3 rounded-2xl border border-[#E2EAE4] bg-white p-3.5 shadow-[0_3px_9px_rgba(16,46,70,.04)]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E1F5E8] text-primary-700"><Icon className="h-5 w-5" /></span><div><h3 className="text-[13px] font-extrabold">{index + 1}. {title}</h3><p className="mt-0.5 text-[11.5px] font-medium leading-[17px] text-[#71809A]">{description}</p></div></div>;
            })}
          </div>
        </section>

        <section className="mt-7 rounded-[24px] border border-[#DDE7E0] bg-white p-5 shadow-[0_8px_22px_rgba(16,46,70,.07)]">
          <h2 className="text-[20px] font-extrabold tracking-[-.045em]">{copy.formTitle}</h2>
          <p className="mt-1 text-[12px] font-medium leading-5 text-[#71809A]">{copy.formDescription}</p>
          <form onSubmit={submitRequest} className="mt-5 space-y-4">
            <label className="block text-[12px] font-extrabold text-[#344054]">{copy.typeLabel}<select value={requestType} onChange={(event) => setRequestType(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-[#DDE5E0] bg-[#F8FAF8] px-3.5 text-[13px] font-semibold text-[#26364D] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">{copy.typeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="block text-[12px] font-extrabold text-[#344054]">{copy.requestLabel}<textarea required value={request} onChange={(event) => setRequest(event.target.value)} placeholder={copy.requestPlaceholder} rows={4} className="mt-1.5 w-full resize-none rounded-xl border border-[#DDE5E0] bg-[#F8FAF8] px-3.5 py-3 text-[13px] font-medium leading-5 text-[#26364D] outline-none placeholder:text-[#A1ACBA] focus:border-primary-500 focus:ring-2 focus:ring-primary-100" /></label>
            <label className="block text-[12px] font-extrabold text-[#344054]">{copy.areaLabel}<span className="relative mt-1.5 block"><HiMapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-700" /><input required value={area} onChange={(event) => setArea(event.target.value)} placeholder={copy.areaPlaceholder} className="h-12 w-full rounded-xl border border-[#DDE5E0] bg-[#F8FAF8] pl-10 pr-3.5 text-[13px] font-semibold text-[#26364D] outline-none placeholder:text-[#A1ACBA] focus:border-primary-500 focus:ring-2 focus:ring-primary-100" /></span></label>
            <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#08A85A] text-[13px] font-extrabold text-white shadow-[0_7px_16px_rgba(8,168,90,.22)] active:scale-[.98]"><FaWhatsapp className="h-5 w-5" /> {copy.action}</button>
          </form>
          <p className="mt-3 flex gap-2 text-[10.5px] font-medium leading-4 text-[#8290A5]"><HiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />{copy.note}</p>
        </section>

        <p className="mt-5 text-center text-[11px] font-semibold leading-4 text-[#7C899D]">{copy.emergency}</p>
      </main>
    </div>
  );
}
