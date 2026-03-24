import { PrismaClient, ContactStatus, ReviewStatus, Role, TrustLevel } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const USER_ID = "00000000-0000-0000-0000-000000000002";

async function main() {
  // ── Profiles ────────────────────────────────────────────────────────────────
  await prisma.profile.upsert({
    where: { id: ADMIN_ID },
    update: {},
    create: {
      id: ADMIN_ID,
      email: "admin@bukutelepon.id",
      name: "Admin BukuTelepon",
      role: Role.ADMIN,
      trustLevel: TrustLevel.ID_VERIFIED,
      hasContributed: true,
      contributedAt: new Date("2025-01-01"),
    },
  });

  await prisma.profile.upsert({
    where: { id: USER_ID },
    update: {},
    create: {
      id: USER_ID,
      email: "user@bukutelepon.id",
      name: "Budi Santoso",
      role: Role.USER,
      trustLevel: TrustLevel.EMAIL_VERIFIED,
      hasContributed: true,
      contributedAt: new Date("2025-02-01"),
    },
  });

  console.log("✓ Profiles seeded");

  // ── Cities ───────────────────────────────────────────────────────────────────
  const cityData = [
    { name: "Jakarta Selatan", province: "DKI Jakarta",           slug: "jakarta-selatan" },
    { name: "Surabaya",        province: "Jawa Timur",            slug: "surabaya" },
    { name: "Bandung",         province: "Jawa Barat",            slug: "bandung" },
    { name: "Medan",           province: "Sumatera Utara",        slug: "medan" },
    { name: "Semarang",        province: "Jawa Tengah",           slug: "semarang" },
    { name: "Makassar",        province: "Sulawesi Selatan",      slug: "makassar" },
    { name: "Palembang",       province: "Sumatera Selatan",      slug: "palembang" },
    { name: "Mataram",         province: "Nusa Tenggara Barat",   slug: "mataram" },
    { name: "Lombok Barat",    province: "Nusa Tenggara Barat",   slug: "lombok-barat" },
    { name: "Sumbawa Besar",   province: "Nusa Tenggara Barat",   slug: "sumbawa-besar" },
  ];

  const cities: Record<string, string> = {};
  for (const c of cityData) {
    const city = await prisma.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    cities[c.slug] = city.id;
  }

  console.log("✓ Cities seeded");

  // ── Categories ───────────────────────────────────────────────────────────────
  const categoryData = [
    { name: "Kesehatan",   slug: "kesehatan",   icon: "🏥" },
    { name: "Pendidikan",  slug: "pendidikan",  icon: "🎓" },
    { name: "Kuliner",     slug: "kuliner",     icon: "🍽️" },
    { name: "Jasa",        slug: "jasa",        icon: "🔧" },
    { name: "Pemerintah",  slug: "pemerintah",  icon: "🏛️" },
    { name: "Darurat",     slug: "darurat",     icon: "🚨" },
    { name: "Transportasi",slug: "transportasi",icon: "🚗" },
    { name: "Hiburan",     slug: "hiburan",     icon: "🎭" },
  ];

  const cats: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    cats[c.slug] = cat.id;
  }

  console.log("✓ Categories seeded");

  // ── Contacts ─────────────────────────────────────────────────────────────────
  const contactData = [
    {
      name: "RS Pondok Indah",
      phone: "0821-1234-5001",
      address: "Jl. Metro Duta Kav. UE, Pondok Indah, Jakarta Selatan",
      description: "Rumah sakit swasta terkemuka dengan fasilitas lengkap dan dokter spesialis.",
      citySlug: "jakarta-selatan", catSlug: "kesehatan",
      avgRating: 4.7, reviewCount: 9,
    },
    {
      name: "Puskesmas Kebayoran Baru",
      phone: "0821-1234-5002",
      address: "Jl. Melawai Raya No.12, Kebayoran Baru, Jakarta Selatan",
      description: "Pusat kesehatan masyarakat melayani warga Kebayoran Baru dan sekitarnya.",
      citySlug: "jakarta-selatan", catSlug: "kesehatan",
      avgRating: 4.0, reviewCount: 5,
    },
    {
      name: "SMAN 70 Jakarta",
      phone: "0821-1234-5003",
      address: "Jl. Bulungan No.25, Kebayoran Baru, Jakarta Selatan",
      description: "Sekolah menengah atas negeri favorit di Jakarta Selatan.",
      citySlug: "jakarta-selatan", catSlug: "pendidikan",
      avgRating: 4.5, reviewCount: 7,
    },
    {
      name: "Warung Padang Bu Rini",
      phone: "0821-1234-5004",
      address: "Jl. Kemang Raya No.88, Kemang, Jakarta Selatan",
      description: "Warung masakan Padang autentik dengan rendang dan gulai terbaik.",
      citySlug: "jakarta-selatan", catSlug: "kuliner",
      avgRating: 4.8, reviewCount: 10,
    },
    {
      name: "RS Dr. Soetomo",
      phone: "0821-1234-5005",
      address: "Jl. Mayjend Prof. Dr. Moestopo No.6-8, Surabaya",
      description: "Rumah sakit umum daerah terbesar di Jawa Timur.",
      citySlug: "surabaya", catSlug: "kesehatan",
      avgRating: 4.2, reviewCount: 8,
    },
    {
      name: "Universitas Airlangga",
      phone: "0821-1234-5006",
      address: "Jl. Airlangga No.4-6, Airlangga, Surabaya",
      description: "Salah satu universitas terbaik dan tertua di Indonesia.",
      citySlug: "surabaya", catSlug: "pendidikan",
      avgRating: 4.6, reviewCount: 6,
    },
    {
      name: "Sate Klopo Ondomohen",
      phone: "0821-1234-5007",
      address: "Jl. Walikota Mustajab No.36, Surabaya",
      description: "Sate klopo legendaris khas Surabaya sejak tahun 1945.",
      citySlug: "surabaya", catSlug: "kuliner",
      avgRating: 4.9, reviewCount: 10,
    },
    {
      name: "Bengkel Maju Motor",
      phone: "0821-1234-5008",
      address: "Jl. Ahmad Yani No.120, Surabaya",
      description: "Bengkel motor terpercaya, melayani semua merk dengan teknisi berpengalaman.",
      citySlug: "surabaya", catSlug: "jasa",
      avgRating: 4.3, reviewCount: 4,
    },
    {
      name: "RS Hasan Sadikin",
      phone: "0821-1234-5009",
      address: "Jl. Pasteur No.38, Pasteur, Bandung",
      description: "Rumah sakit umum pusat terbesar di Jawa Barat.",
      citySlug: "bandung", catSlug: "kesehatan",
      avgRating: 4.1, reviewCount: 7,
    },
    {
      name: "Institut Teknologi Bandung",
      phone: "0821-1234-5010",
      address: "Jl. Ganesha No.10, Lb. Siliwangi, Bandung",
      description: "Perguruan tinggi teknik terkemuka di Indonesia.",
      citySlug: "bandung", catSlug: "pendidikan",
      avgRating: 4.9, reviewCount: 9,
    },
    {
      name: "Surabi Enhaii Merdeka",
      phone: "0821-1234-5011",
      address: "Jl. Dr. Djundjunan No.114, Pasteur, Bandung",
      description: "Surabi khas Bandung dengan berbagai topping unik sejak 2002.",
      citySlug: "bandung", catSlug: "kuliner",
      avgRating: 4.6, reviewCount: 6,
    },
    {
      name: "Polres Medan Kota",
      phone: "0821-1234-5012",
      address: "Jl. Jend. A. Yani No.1, Medan",
      description: "Kepolisian resort Kota Medan untuk laporan dan pelayanan keamanan.",
      citySlug: "medan", catSlug: "pemerintah",
      avgRating: 3.5, reviewCount: 3,
    },
    {
      name: "RS Pirngadi Medan",
      phone: "0821-1234-5013",
      address: "Jl. Prof. H.M. Yamin No.47, Medan",
      description: "Rumah sakit umum daerah Kota Medan dengan layanan 24 jam.",
      citySlug: "medan", catSlug: "kesehatan",
      avgRating: 3.8, reviewCount: 5,
    },
    {
      name: "Mie Aceh Titi Bobrok",
      phone: "0821-1234-5014",
      address: "Jl. Setia Budi No.85, Medan",
      description: "Mie Aceh legendaris khas Medan dengan cita rasa autentik dan pedas.",
      citySlug: "medan", catSlug: "kuliner",
      avgRating: 4.7, reviewCount: 8,
    },
    {
      name: "Bandara Ahmad Yani",
      phone: "0821-1234-5015",
      address: "Jl. Puad Ahmad Yani, Wates, Semarang",
      description: "Bandar udara internasional melayani penerbangan domestik dan internasional.",
      citySlug: "semarang", catSlug: "transportasi",
      avgRating: 4.2, reviewCount: 6,
    },
    {
      name: "Lunpia Gang Lombok",
      phone: "0821-1234-5016",
      address: "Jl. Gang Lombok No.11, Semarang",
      description: "Lunpia basah legendaris khas Semarang, berdiri sejak tahun 1930.",
      citySlug: "semarang", catSlug: "kuliner",
      avgRating: 4.8, reviewCount: 9,
    },
    {
      name: "RS Wahidin Sudirohusodo",
      phone: "0821-1234-5017",
      address: "Jl. Perintis Kemerdekaan Km.11, Makassar",
      description: "Rumah sakit umum pusat terbesar di Kawasan Timur Indonesia.",
      citySlug: "makassar", catSlug: "kesehatan",
      avgRating: 4.0, reviewCount: 4,
    },
    {
      name: "Coto Makassar Nusantara",
      phone: "0821-1234-5018",
      address: "Jl. Nusantara No.32, Makassar",
      description: "Coto Makassar autentik dengan kuah kacang khas yang kaya rempah.",
      citySlug: "makassar", catSlug: "kuliner",
      avgRating: 4.9, reviewCount: 10,
    },
    {
      name: "Dinas Pemadam Kebakaran Mataram",
      phone: "0821-1234-5019",
      address: "Jl. Pejanggik No.12, Mataram",
      description: "Layanan pemadam kebakaran Kota Mataram, siap 24 jam.",
      citySlug: "mataram", catSlug: "darurat",
      avgRating: 4.5, reviewCount: 2,
    },
    {
      name: "Taman Wisata Senggigi",
      phone: "0821-1234-5020",
      address: "Jl. Raya Senggigi, Lombok Barat",
      description: "Kawasan wisata pantai Senggigi dengan berbagai pilihan hotel dan restoran.",
      citySlug: "lombok-barat", catSlug: "hiburan",
      avgRating: 4.6, reviewCount: 7,
    },
  ];

  const contactIds: string[] = [];

  for (const c of contactData) {
    const submittedById = contactIds.length % 3 === 0 ? ADMIN_ID : USER_ID;

    const contact = await prisma.contact.upsert({
      where: {
        // Use a synthetic unique check by phone
        id: (await prisma.contact.findFirst({ where: { phone: c.phone } }))?.id ?? "00000000-0000-0000-0000-000000000000",
      },
      update: {},
      create: {
        name: c.name,
        phone: c.phone,
        address: c.address,
        description: c.description,
        status: ContactStatus.APPROVED,
        avgRating: c.avgRating,
        reviewCount: c.reviewCount,
        cityId: cities[c.citySlug],
        categoryId: cats[c.catSlug],
        submittedById,
      },
    });

    contactIds.push(contact.id);
  }

  console.log(`✓ ${contactIds.length} Contacts seeded`);

  // ── Reviews ──────────────────────────────────────────────────────────────────
  const reviewData = [
    {
      contactIdx: 0, rating: 5,
      comment: "Pelayanan sangat baik, dokter dan perawat ramah. Fasilitas lengkap dan bersih.",
    },
    {
      contactIdx: 3, rating: 5,
      comment: "Rendangnya juara! Autentik banget rasanya, cocok untuk makan siang.",
    },
    {
      contactIdx: 4, rating: 4,
      comment: "Pelayanan cukup baik meski antrean panjang. Dokter spesialis lengkap.",
    },
    {
      contactIdx: 6, rating: 5,
      comment: "Sate kloponya memang legendary, wajib coba kalau ke Surabaya!",
    },
    {
      contactIdx: 9, rating: 5,
      comment: "Kampus terbaik di Indonesia! Fasilitas modern dan dosen berkualitas.",
    },
    {
      contactIdx: 13, rating: 5,
      comment: "Mie Acehnya pedas dan gurih, porsinya besar. Harga terjangkau juga.",
    },
    {
      contactIdx: 15, rating: 5,
      comment: "Lunpia basahnya enak banget! Isinya penuh dan kulit lumpianya tipis.",
    },
    {
      contactIdx: 17, rating: 5,
      comment: "Coto Makassarnya autentik sekali. Kuahnya kaya rempah, daging empuk.",
    },
    {
      contactIdx: 18, rating: 4,
      comment: "Respon cepat dan petugas profesional. Terima kasih atas bantuan cepatnya.",
    },
    {
      contactIdx: 19, rating: 4,
      comment: "Pantai Senggigi sangat indah. Sunset-nya luar biasa, pasti balik lagi!",
    },
  ];

  for (const r of reviewData) {
    const contactId = contactIds[r.contactIdx];
    if (!contactId) continue;

    await prisma.review.upsert({
      where: { contactId_authorId: { contactId, authorId: USER_ID } },
      update: {},
      create: {
        rating: r.rating,
        comment: r.comment,
        status: ReviewStatus.APPROVED,
        contactId,
        authorId: USER_ID,
      },
    });
  }

  console.log(`✓ ${reviewData.length} Reviews seeded`);
  console.log("\n✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
