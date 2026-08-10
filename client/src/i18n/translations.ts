export type Lang = "id" | "en";

export const LANGUAGES: { code: Lang; label: string; nativeLabel: string }[] = [
  { code: "id", label: "Indonesian", nativeLabel: "Indonesia" },
  { code: "en", label: "English", nativeLabel: "English" },
];

/**
 * Indonesian is the source of truth: every key lives here first, and `en`
 * below is typed against it so a missing translation is a compile error.
 * Placeholders use `{name}` and are filled in by `t(key, vars)`.
 */
const id = {
  // ── Bottom navigation ──
  "nav.home": "Beranda",
  "nav.search": "Cari",
  "nav.saved": "Tersimpan",
  "nav.contribute": "Kontribusi",
  "nav.account": "Akun",
  "nav.brand": "Buku Telepon",

  // ── Common ──
  "common.back": "Kembali",
  "common.close": "Tutup",
  "common.save": "Simpan",
  "common.cancel": "Batal",
  "common.edit": "Edit",
  "common.optional": "Opsional",
  "common.yes": "Ya",
  "common.notYet": "Belum",
  "common.verified": "Terverifikasi",
  "common.contactsCount": "{count} kontak",
  "common.reviewsCount": "{count} ulasan",
  "common.inCity": "di {city}",
  "common.language": "Bahasa",
  "common.loading": "Memuat...",

  // ── Filters ──
  "filter.all": "Semua",
  "filter.verified": "Terverifikasi",
  "filter.unverified": "Belum Verifikasi",
  "filter.clear": "Hapus filter",

  // ── Statuses ──
  "status.approved": "Disetujui",
  "status.rejected": "Ditolak",
  "status.pending": "Menunggu",

  // ── Categories (DB names are Indonesian; translated by slug) ──
  "category.kesehatan": "Kesehatan",
  "category.pendidikan": "Pendidikan",
  "category.kuliner": "Kuliner",
  "category.jasa": "Jasa",
  "category.pemerintah": "Pemerintah",
  "category.darurat": "Darurat",
  "category.transportasi": "Transportasi",
  "category.wisata": "Wisata",
  "category.penginapan": "Penginapan",

  // ── Home / MainScreen ──
  "home.help": "Bantuan",
  "home.helpWhatsappText": "Permisi admin cari kontak, saya ingin bertanya",
  "home.nearYou": "sekitarmu",
  "home.thisCity": "kota ini",
  "home.searchInCity": "Cari kontak di {city}...",
  "home.searchPlaceholder": "Cari kontak…",
  "home.selectCity": "Pilih Kota",
  "home.statContacts": "kontak",
  "home.statCategories": "kategori",
  "home.statThisWeek": "minggu ini",
  "home.emergencyTitle": "Panggilan Darurat",
  "home.emergencySubtitle": "Polisi · Ambulans · Damkar",
  "home.categories": "Kategori",
  "home.recent": "Terbaru",
  "home.seeAll": "Lihat semua",
  "home.noContactsInCity": "Belum ada kontak di {city}",

  // ── Emergency numbers ──
  "emergency.emergency": "Darurat",
  "emergency.police": "Polisi",
  "emergency.ambulance": "Ambulans",
  "emergency.fire": "Pemadam",
  "emergency.sar": "SAR",
  "emergency.electricity": "PLN",

  // ── Search ──
  "search.emptyTitle": "Cari kontak",
  "search.emptyHint": "Ketik nama atau pilih kategori",
  "search.resultsFor": "Hasil \"{query}\"",
  "search.noResults": "Tidak ada kontak ditemukan",

  // ── Contact card / detail actions ──
  "contact.whatsapp": "WhatsApp",
  "contact.call": "Telepon",
  "contact.copyNumber": "Salin nomor",
  "contact.save": "Simpan kontak",
  "contact.unsave": "Hapus dari tersimpan",
  "contact.photo": "foto",
  "contact.viewAria": "Lihat {name}",

  // ── Contact detail ──
  "detail.notFound": "Kontak tidak ditemukan",
  "detail.phone": "Telepon",
  "detail.address": "Alamat",
  "detail.website": "Website",
  "detail.maps": "Google Maps",
  "detail.viewOnMaps": "Lihat di Google Maps",
  "detail.about": "Tentang",
  "detail.share": "Bagikan kontak ini",
  "detail.reviews": "Ulasan",
  "detail.anonymous": "Anonim",
  "detail.noReviews": "Belum ada ulasan",
  "detail.beFirstReview": "Jadilah yang pertama memberikan ulasan",

  // ── Relative time ──
  "time.today": "Hari ini",
  "time.yesterday": "Kemarin",
  "time.daysAgo": "{count} hari lalu",
  "time.weeksAgo": "{count} minggu lalu",
  "time.monthsAgo": "{count} bulan lalu",
  "time.yearsAgo": "{count} tahun lalu",

  // ── Saved page ──
  "saved.title": "Kontak Tersimpan",
  "saved.subtitle": "Kontak yang kamu simpan untuk akses cepat",
  "saved.emptyTitle": "Belum ada kontak tersimpan",
  "saved.emptyHint": "Simpan kontak dari halaman beranda untuk akses cepat",

  // ── City picker ──
  "city.pickTitle": "Pilih Kota",
  "city.pickSubtitle": "Temukan kontak di kota kamu",

  // ── Auth ──
  "auth.login": "Masuk",
  "auth.loginTitle": "Masuk",
  "auth.register": "Daftar",
  "auth.registerTitle": "Daftar",
  "auth.registerFree": "Daftar Gratis",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.confirmPassword": "Konfirmasi Password",
  "auth.fullName": "Nama Lengkap",
  "auth.minChars": "Minimal 8 karakter",
  "auth.passwordMatch": "Password cocok",
  "auth.passwordMismatch": "Password tidak cocok",
  "auth.passwordMismatchError": "Password dan konfirmasi password tidak cocok",
  "auth.loginFailed": "Login gagal",
  "auth.registerFailed": "Registrasi gagal",
  "auth.noAccount": "Belum punya akun?",
  "auth.haveAccount": "Sudah punya akun?",
  "auth.forgotPassword": "Lupa password?",
  "auth.forgotPasswordTitle": "Lupa Password",
  "auth.forgotPasswordSubtitle": "Masukkan email akunmu, kami akan mengirim tautan untuk mengatur ulang password.",
  "auth.sendResetLink": "Kirim Tautan Reset",
  "auth.resetEmailSent": "Kalau email tersebut terdaftar, tautan reset password sudah dikirim. Cek kotak masuk dan folder spam.",
  "auth.resetRequestFailed": "Gagal mengirim tautan reset",
  "auth.backToLogin": "Kembali ke halaman masuk",
  "auth.resetPasswordTitle": "Atur Password Baru",
  "auth.resetPasswordSubtitle": "Buat password baru untuk akunmu.",
  "auth.newPassword": "Password Baru",
  "auth.savePassword": "Simpan Password",
  "auth.resetPasswordSuccess": "Password berhasil diubah. Mengalihkan...",
  "auth.resetPasswordFailed": "Gagal mengubah password",
  "auth.resetLinkInvalid": "Tautan reset tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.",

  // ── Account ──
  "account.signInTitle": "Masuk ke Akun",
  "account.signInSubtitle":
    "Masuk atau daftar untuk menyimpan kontak, berkontribusi, dan melihat semua data direktori.",
  "account.adminDashboard": "Admin Dashboard",
  "account.savedContacts": "Kontak Tersimpan",
  "account.contributeContact": "Kontribusi Kontak",
  "account.signOut": "Keluar",

  // ── Guest / contribution wall ──
  "guest.limitReached":
    "Anda telah melihat {count} kontak gratis. Daftar dan kontribusi untuk akses penuh!",
  "wall.title": "Masuk untuk Lihat Semua",
  "wall.subtitle": "Masuk atau daftar untuk mengakses semua kontak di direktori.",

  // ── Onboarding ──
  "onboarding.title": "Bantu Lengkapi Kontak Di Kotamu! 🤝",
  "onboarding.description":
    "Kamu bisa menambahkan kontak penting ke portal ini agar bermanfaat bagi warga di kotamu.",
  "onboarding.button": "Mengerti!",

  // ── PWA install banner ──
  "pwa.title": "Pasang CariKontak",
  "pwa.subtitle": "Akses lebih cepat · Bisa dipakai offline",
  "pwa.install": "Pasang",
  "pwa.iosTitle": "Pasang di iPhone kamu",
  "pwa.iosTap": "Ketuk",
  "pwa.iosThen": "lalu «Tambah ke Layar Utama»",
  "pwa.addToHome": "Tambah ke Layar Utama",

  // ── Submit / contribute ──
  "submit.title": "Kontribusi",
  "submit.subtitle": "Bantu lengkapi direktori kotamu",
  "submit.signInTitle": "Kontribusi Kontak",
  "submit.signInSubtitle": "Masuk terlebih dahulu untuk menambahkan kontak ke direktori.",
  "submit.successTitle": "Kontak Terkirim!",
  "submit.successSubtitle":
    "Terima kasih atas kontribusimu. Kontak akan ditinjau oleh admin sebelum ditampilkan.",
  "submit.addMore": "Tambah Lagi",
  "submit.viewHistory": "Lihat Riwayat",
  "submit.tabHistory": "Riwayat",
  "submit.tabManual": "Tambah",
  "submit.tabImport": "Impor",
  "submit.statTotal": "Total",
  "submit.noContributions": "Belum ada kontribusi",
  "submit.noContributionsHint": "Mulai tambahkan kontak untuk kotamu",
  "submit.addContact": "Tambah Kontak",
  "submit.send": "Kirim Kontak",

  // ── Contact form ──
  "form.name": "Nama Bisnis / Tempat",
  "form.namePlaceholder": "Contoh: RS Harapan Kita",
  "form.phone": "Nomor Telepon",
  "form.phonePlaceholder": "Contoh: 021-1234567",
  "form.city": "Kota",
  "form.selectCity": "Pilih Kota",
  "form.category": "Kategori",
  "form.selectCategory": "Pilih Kategori",
  "form.address": "Alamat",
  "form.addressPlaceholder": "Jl. Contoh No. 123",
  "form.website": "Website",
  "form.websitePlaceholder": "https://contoh.com",
  "form.mapsUrl": "Link Google Maps",
  "form.mapsUrlPlaceholder": "https://maps.google.com/...",
  "form.description": "Deskripsi",
  "form.descriptionPlaceholder": "Deskripsi singkat tentang tempat ini...",
  "form.photo": "Foto",
  "form.uploadPhoto": "Upload foto",
  "form.uploadPhotoOptional": "Upload foto (opsional)",
  "form.uploadingPhoto": "Mengupload foto...",

  // ── Import ──
  "import.pickFromPhone": "Pilih dari Kontak HP",
  "import.uploadFile": "Upload .vcf / .csv",
  "import.selectedCount": "{selected}/{total} dipilih",
  "import.selectedOf": "{selected} dari {total} dipilih",
  "import.removeAll": "Hapus Semua",
  "import.selectCityRequired": "Pilih kota *",
  "import.selectCategoryRequired": "Pilih kategori *",
  "import.sendCount": "Kirim {count} Kontak",
  "import.reviewNote": "Kontak akan ditinjau admin sebelum ditampilkan",
  "import.emptyTitle": "Belum ada kontak diimpor",
  "import.emptyHintPicker": "Pilih dari kontak HP atau upload file VCF/CSV",
  "import.emptyHintFile": "Upload file VCF/CSV yang diekspor dari kontak HP",
  "import.bulkSuccess": "{count} kontak berhasil dikirim untuk ditinjau!",
  "import.bulkError": "Gagal mengirim kontak. Coba lagi.",

  // ── Errors ──
  "error.uploadPhoto": "Gagal mengupload foto",
  "error.uploadTooLarge": "Ukuran foto maksimal 1 MB. Perkecil dulu fotonya.",
  "error.uploadInvalidType": "File harus berupa gambar (JPG, PNG, atau WebP).",
  "error.uploadNotSignedIn": "Sesi kamu sudah berakhir. Silakan masuk lagi, lalu ulangi upload.",
  "error.submitContact": "Gagal mengirim kontak",

  // ── Admin ──
  "admin.badge": "Admin",
  "admin.dashboard": "Dashboard",
  "admin.contacts": "Kontak",
  "admin.addContact": "Tambah Kontak",
  "admin.reviews": "Ulasan",
  "admin.users": "Pengguna",
  "admin.totalContacts": "Total Kontak",
  "admin.pendingReview": "Menunggu Review",
  "admin.totalUsers": "Total Pengguna",
  "admin.totalReviews": "Total Ulasan",
  "admin.colName": "Nama",
  "admin.colEmail": "Email",
  "admin.colRole": "Role",
  "admin.colContributions": "Kontribusi",
  "admin.colRegistered": "Terdaftar",
  "admin.manageReviews": "Kelola Ulasan",
  "admin.manageContacts": "Kelola Kontak",
  "admin.noReviewsWithStatus": "Tidak ada ulasan {status}",
  "admin.noContactsWithStatus": "Tidak ada kontak {status}",
  "admin.noComment": "(Tanpa komentar)",
  "admin.reviewFor": "Untuk",
  "admin.reviewBy": "Oleh",
  "admin.approve": "Setuju",
  "admin.reject": "Tolak",
  "admin.phone": "Telepon",
  "admin.uploading": "Mengupload...",
  "admin.saving": "Menyimpan...",
  "admin.importTitle": "Impor Kontak",
  "admin.importSubtitle": "Impor dari kontak HP atau file VCF/CSV, langsung approved.",
  "admin.importFailed": "Gagal mengimpor kontak.",
  "admin.importFileButton": "Upload File (.vcf / .csv)",
  "admin.importing": "Mengimpor...",
  "admin.importCount": "Impor {count} Kontak",
  "admin.importSuccess": "{count} kontak berhasil diimpor!",
  "admin.manualTitle": "Tambah Manual",
  "admin.manualSubtitle": "Input satu kontak, langsung approved.",
  "admin.addSuccess": "Kontak berhasil ditambahkan!",
  "admin.addFailed": "Gagal menambahkan kontak. Periksa kembali data yang diisi.",
  "admin.saveFailed": "Gagal menyimpan perubahan.",
  "admin.namePlaceholder": "Nama kontak / tempat",
  "admin.descriptionPlaceholder": "Deskripsi singkat...",

  // ── Pagination ──
  "pagination.prev": "Sebelumnya",
  "pagination.next": "Selanjutnya",
} as const;

export type TranslationKey = keyof typeof id;

const en: Record<TranslationKey, string> = {
  // ── Bottom navigation ──
  "nav.home": "Home",
  "nav.search": "Search",
  "nav.saved": "Saved",
  "nav.contribute": "Contribute",
  "nav.account": "Account",
  "nav.brand": "Phone Book",

  // ── Common ──
  "common.back": "Back",
  "common.close": "Close",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.edit": "Edit",
  "common.optional": "Optional",
  "common.yes": "Yes",
  "common.notYet": "Not yet",
  "common.verified": "Verified",
  "common.contactsCount": "{count} contacts",
  "common.reviewsCount": "{count} reviews",
  "common.inCity": "in {city}",
  "common.language": "Language",
  "common.loading": "Loading...",

  // ── Filters ──
  "filter.all": "All",
  "filter.verified": "Verified",
  "filter.unverified": "Unverified",
  "filter.clear": "Clear filters",

  // ── Statuses ──
  "status.approved": "Approved",
  "status.rejected": "Rejected",
  "status.pending": "Pending",

  // ── Categories ──
  "category.kesehatan": "Health",
  "category.pendidikan": "Education",
  "category.kuliner": "Food & Drink",
  "category.jasa": "Services",
  "category.pemerintah": "Government",
  "category.darurat": "Emergency",
  "category.transportasi": "Transport",
  "category.wisata": "Tourism",
  "category.penginapan": "Lodging",

  // ── Home / MainScreen ──
  "home.help": "Help",
  "home.helpWhatsappText": "Hello CariKontak admin, I have a question",
  "home.nearYou": "your area",
  "home.thisCity": "this city",
  "home.searchInCity": "Search contacts in {city}...",
  "home.searchPlaceholder": "Search contacts…",
  "home.selectCity": "Select City",
  "home.statContacts": "contacts",
  "home.statCategories": "categories",
  "home.statThisWeek": "this week",
  "home.emergencyTitle": "Emergency Calls",
  "home.emergencySubtitle": "Police · Ambulance · Fire",
  "home.categories": "Categories",
  "home.recent": "Recent",
  "home.seeAll": "See all",
  "home.noContactsInCity": "No contacts in {city} yet",

  // ── Emergency numbers ──
  "emergency.emergency": "Emergency",
  "emergency.police": "Police",
  "emergency.ambulance": "Ambulance",
  "emergency.fire": "Fire Dept",
  "emergency.sar": "Search & Rescue",
  "emergency.electricity": "Electricity",

  // ── Search ──
  "search.emptyTitle": "Search contacts",
  "search.emptyHint": "Type a name or pick a category",
  "search.resultsFor": "Results for \"{query}\"",
  "search.noResults": "No contacts found",

  // ── Contact card / detail actions ──
  "contact.whatsapp": "WhatsApp",
  "contact.call": "Call",
  "contact.copyNumber": "Copy number",
  "contact.save": "Save contact",
  "contact.unsave": "Remove from saved",
  "contact.photo": "photo",
  "contact.viewAria": "View {name}",

  // ── Contact detail ──
  "detail.notFound": "Contact not found",
  "detail.phone": "Phone",
  "detail.address": "Address",
  "detail.website": "Website",
  "detail.maps": "Google Maps",
  "detail.viewOnMaps": "View on Google Maps",
  "detail.about": "About",
  "detail.share": "Share this contact",
  "detail.reviews": "Reviews",
  "detail.anonymous": "Anonymous",
  "detail.noReviews": "No reviews yet",
  "detail.beFirstReview": "Be the first to leave a review",

  // ── Relative time ──
  "time.today": "Today",
  "time.yesterday": "Yesterday",
  "time.daysAgo": "{count} days ago",
  "time.weeksAgo": "{count} weeks ago",
  "time.monthsAgo": "{count} months ago",
  "time.yearsAgo": "{count} years ago",

  // ── Saved page ──
  "saved.title": "Saved Contacts",
  "saved.subtitle": "Contacts you saved for quick access",
  "saved.emptyTitle": "No saved contacts yet",
  "saved.emptyHint": "Save contacts from the home page for quick access",

  // ── City picker ──
  "city.pickTitle": "Select City",
  "city.pickSubtitle": "Find contacts in your city",

  // ── Auth ──
  "auth.login": "Sign In",
  "auth.loginTitle": "Sign In",
  "auth.register": "Sign Up",
  "auth.registerTitle": "Sign Up",
  "auth.registerFree": "Sign Up Free",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.confirmPassword": "Confirm Password",
  "auth.fullName": "Full Name",
  "auth.minChars": "At least 8 characters",
  "auth.passwordMatch": "Passwords match",
  "auth.passwordMismatch": "Passwords don't match",
  "auth.passwordMismatchError": "Password and confirmation do not match",
  "auth.loginFailed": "Sign in failed",
  "auth.registerFailed": "Registration failed",
  "auth.noAccount": "Don't have an account?",
  "auth.haveAccount": "Already have an account?",
  "auth.forgotPassword": "Forgot password?",
  "auth.forgotPasswordTitle": "Forgot Password",
  "auth.forgotPasswordSubtitle": "Enter your account email and we'll send you a link to reset your password.",
  "auth.sendResetLink": "Send Reset Link",
  "auth.resetEmailSent": "If that email is registered, a password reset link has been sent. Check your inbox and spam folder.",
  "auth.resetRequestFailed": "Failed to send reset link",
  "auth.backToLogin": "Back to sign in",
  "auth.resetPasswordTitle": "Set a New Password",
  "auth.resetPasswordSubtitle": "Create a new password for your account.",
  "auth.newPassword": "New Password",
  "auth.savePassword": "Save Password",
  "auth.resetPasswordSuccess": "Password updated. Redirecting...",
  "auth.resetPasswordFailed": "Failed to update password",
  "auth.resetLinkInvalid": "This reset link is invalid or has expired. Please request a new one.",

  // ── Account ──
  "account.signInTitle": "Sign in to your account",
  "account.signInSubtitle":
    "Sign in or register to save contacts, contribute, and see the full directory.",
  "account.adminDashboard": "Admin Dashboard",
  "account.savedContacts": "Saved Contacts",
  "account.contributeContact": "Contribute a Contact",
  "account.signOut": "Sign out",

  // ── Guest / contribution wall ──
  "guest.limitReached":
    "You have viewed {count} free contacts. Register and contribute for full access!",
  "wall.title": "Sign in to see everything",
  "wall.subtitle": "Sign in or register to access every contact in the directory.",

  // ── Onboarding ──
  "onboarding.title": "Help complete your city's contacts! 🤝",
  "onboarding.description":
    "You can add important contacts to this portal so they're useful for everyone in your city.",
  "onboarding.button": "Got it!",

  // ── PWA install banner ──
  "pwa.title": "Install CariKontak",
  "pwa.subtitle": "Faster access · Works offline",
  "pwa.install": "Install",
  "pwa.iosTitle": "Install on your iPhone",
  "pwa.iosTap": "Tap",
  "pwa.iosThen": "then “Add to Home Screen”",
  "pwa.addToHome": "Add to Home Screen",

  // ── Submit / contribute ──
  "submit.title": "Contribute",
  "submit.subtitle": "Help complete your city's directory",
  "submit.signInTitle": "Contribute a Contact",
  "submit.signInSubtitle": "Sign in first to add contacts to the directory.",
  "submit.successTitle": "Contact submitted!",
  "submit.successSubtitle":
    "Thanks for contributing. An admin will review the contact before it appears.",
  "submit.addMore": "Add Another",
  "submit.viewHistory": "View History",
  "submit.tabHistory": "History",
  "submit.tabManual": "Add",
  "submit.tabImport": "Import",
  "submit.statTotal": "Total",
  "submit.noContributions": "No contributions yet",
  "submit.noContributionsHint": "Start adding contacts for your city",
  "submit.addContact": "Add Contact",
  "submit.send": "Submit Contact",

  // ── Contact form ──
  "form.name": "Business / Place Name",
  "form.namePlaceholder": "e.g. Harapan Kita Hospital",
  "form.phone": "Phone Number",
  "form.phonePlaceholder": "e.g. 021-1234567",
  "form.city": "City",
  "form.selectCity": "Select City",
  "form.category": "Category",
  "form.selectCategory": "Select Category",
  "form.address": "Address",
  "form.addressPlaceholder": "123 Example Street",
  "form.website": "Website",
  "form.websitePlaceholder": "https://example.com",
  "form.mapsUrl": "Google Maps Link",
  "form.mapsUrlPlaceholder": "https://maps.google.com/...",
  "form.description": "Description",
  "form.descriptionPlaceholder": "A short description of this place...",
  "form.photo": "Photo",
  "form.uploadPhoto": "Upload photo",
  "form.uploadPhotoOptional": "Upload photo (optional)",
  "form.uploadingPhoto": "Uploading photo...",

  // ── Import ──
  "import.pickFromPhone": "Pick from Phone Contacts",
  "import.uploadFile": "Upload .vcf / .csv",
  "import.selectedCount": "{selected}/{total} selected",
  "import.selectedOf": "{selected} of {total} selected",
  "import.removeAll": "Remove All",
  "import.selectCityRequired": "Select city *",
  "import.selectCategoryRequired": "Select category *",
  "import.sendCount": "Submit {count} Contacts",
  "import.reviewNote": "Contacts are reviewed by an admin before they appear",
  "import.emptyTitle": "No contacts imported yet",
  "import.emptyHintPicker": "Pick from your phone contacts or upload a VCF/CSV file",
  "import.emptyHintFile": "Upload a VCF/CSV file exported from your phone contacts",
  "import.bulkSuccess": "{count} contacts submitted for review!",
  "import.bulkError": "Failed to submit contacts. Please try again.",

  // ── Errors ──
  "error.uploadPhoto": "Failed to upload photo",
  "error.uploadTooLarge": "Photos must be 1 MB or smaller. Please resize it first.",
  "error.uploadInvalidType": "The file must be an image (JPG, PNG, or WebP).",
  "error.uploadNotSignedIn": "Your session has expired. Please sign in again, then retry the upload.",
  "error.submitContact": "Failed to submit contact",

  // ── Admin ──
  "admin.badge": "Admin",
  "admin.dashboard": "Dashboard",
  "admin.contacts": "Contacts",
  "admin.addContact": "Add Contact",
  "admin.reviews": "Reviews",
  "admin.users": "Users",
  "admin.totalContacts": "Total Contacts",
  "admin.pendingReview": "Pending Review",
  "admin.totalUsers": "Total Users",
  "admin.totalReviews": "Total Reviews",
  "admin.colName": "Name",
  "admin.colEmail": "Email",
  "admin.colRole": "Role",
  "admin.colContributions": "Contributed",
  "admin.colRegistered": "Registered",
  "admin.manageReviews": "Manage Reviews",
  "admin.manageContacts": "Manage Contacts",
  "admin.noReviewsWithStatus": "No {status} reviews",
  "admin.noContactsWithStatus": "No {status} contacts",
  "admin.noComment": "(No comment)",
  "admin.reviewFor": "For",
  "admin.reviewBy": "By",
  "admin.approve": "Approve",
  "admin.reject": "Reject",
  "admin.phone": "Phone",
  "admin.uploading": "Uploading...",
  "admin.saving": "Saving...",
  "admin.importTitle": "Import Contacts",
  "admin.importSubtitle": "Import from phone contacts or a VCF/CSV file — approved instantly.",
  "admin.importFailed": "Failed to import contacts.",
  "admin.importFileButton": "Upload File (.vcf / .csv)",
  "admin.importing": "Importing...",
  "admin.importCount": "Import {count} Contacts",
  "admin.importSuccess": "{count} contacts imported!",
  "admin.manualTitle": "Manual Add",
  "admin.manualSubtitle": "Add a single contact — approved instantly.",
  "admin.addSuccess": "Contact added successfully!",
  "admin.addFailed": "Failed to add contact. Please double-check the data.",
  "admin.saveFailed": "Failed to save changes.",
  "admin.namePlaceholder": "Contact / place name",
  "admin.descriptionPlaceholder": "Short description...",

  // ── Pagination ──
  "pagination.prev": "Previous",
  "pagination.next": "Next",
};

export const translations: Record<Lang, Record<TranslationKey, string>> = { id, en };
