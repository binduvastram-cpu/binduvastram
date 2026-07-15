"use client"

const WHATSAPP_NUMBER = "917795092349"
const DEFAULT_MESSAGE = "Hi Bindu Vastram, I'd like to know more about your sarees."

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center boty-shadow boty-transition hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" aria-hidden="true">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.61 1.912 6.48L4 29l7.72-1.876A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.627 28 15S22.629 3 16.001 3zm0 21.6c-1.97 0-3.812-.55-5.383-1.505l-.386-.23-4.583 1.114 1.145-4.47-.252-.398A9.55 9.55 0 0 1 5.4 15c0-5.845 4.755-10.6 10.601-10.6S26.6 9.155 26.6 15 21.847 24.6 16.001 24.6zm5.815-7.938c-.318-.16-1.884-.93-2.176-1.036-.292-.107-.505-.16-.717.16-.213.318-.824 1.036-1.01 1.249-.187.213-.373.24-.692.08-.318-.16-1.344-.495-2.56-1.578-.947-.845-1.586-1.888-1.772-2.207-.187-.318-.02-.49.14-.649.144-.143.318-.373.478-.56.16-.187.213-.32.32-.532.106-.213.053-.4-.027-.56-.08-.16-.717-1.728-.982-2.366-.259-.622-.522-.538-.717-.548-.186-.009-.399-.011-.612-.011-.213 0-.559.08-.851.4-.292.32-1.117 1.09-1.117 2.66 0 1.568 1.144 3.083 1.303 3.296.16.213 2.252 3.44 5.457 4.822.763.33 1.358.527 1.822.674.766.244 1.463.21 2.014.127.614-.092 1.884-.77 2.15-1.513.265-.744.265-1.38.186-1.513-.08-.133-.293-.213-.612-.373z" />
      </svg>
    </a>
  )
}
