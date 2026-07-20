export const SUPPORT_WHATSAPP_NUMBER = "919141718191"

export function buildWhatsAppLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
