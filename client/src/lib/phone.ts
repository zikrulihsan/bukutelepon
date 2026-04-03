export function formatWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const international = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned;
  return `https://wa.me/${international}`;
}

export function formatTelUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return `tel:+62${cleaned.slice(1)}`;
  return `tel:+${cleaned}`;
}
