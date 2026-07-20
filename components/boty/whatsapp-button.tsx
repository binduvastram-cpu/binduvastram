"use client"

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { usePathname } from "next/navigation"
import { SUPPORT_WHATSAPP_NUMBER, buildWhatsAppLink } from "@/lib/whatsapp"

const DEFAULT_MESSAGE =
  "Hello Bindu Vastram! I came across your collection and would love to know more — could you share details on pricing, fabric, and availability? Looking forward to hearing from you."

const DRAG_THRESHOLD = 6
const BUTTON_SIZE = 56
const EDGE_MARGIN = 8

export function WhatsAppButton() {
  const pathname = usePathname()
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const drag = useRef<{ startX: number; startY: number; originLeft: number; originTop: number; moved: boolean } | null>(null)

  if (pathname?.startsWith("/admin")) return null

  const clamp = (left: number, top: number) => {
    const maxLeft = window.innerWidth - BUTTON_SIZE - EDGE_MARGIN
    const maxTop = window.innerHeight - BUTTON_SIZE - EDGE_MARGIN
    return {
      left: Math.min(Math.max(left, EDGE_MARGIN), Math.max(maxLeft, EDGE_MARGIN)),
      top: Math.min(Math.max(top, EDGE_MARGIN), Math.max(maxTop, EDGE_MARGIN)),
    }
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      originLeft: rect.left,
      originTop: rect.top,
      moved: false,
    }
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      drag.current.moved = true
    }
    if (drag.current.moved) {
      setPos(clamp(drag.current.originLeft + dx, drag.current.originTop + dy))
    }
  }

  const handlePointerUp = () => {
    if (!drag.current) return
    const wasDrag = drag.current.moved
    drag.current = null
    if (!wasDrag) {
      setShowConfirm(true)
    }
  }

  const confirmChat = () => {
    setShowConfirm(false)
    window.open(buildWhatsAppLink(SUPPORT_WHATSAPP_NUMBER, DEFAULT_MESSAGE), "_blank", "noopener,noreferrer")
  }

  return (
    <div
      className={pos ? "fixed z-40" : "fixed bottom-6 right-6 z-40"}
      style={pos ? { left: pos.left, top: pos.top } : undefined}
    >
      {showConfirm && (
        <div className="absolute bottom-full right-0 mb-3 w-64 bg-background rounded-2xl boty-shadow p-4 border border-border/50">
          <p className="text-sm text-foreground mb-3">Want to chat with our team on WhatsApp?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmChat}
              className="flex-1 bg-[#25D366] text-white text-sm font-medium rounded-full py-2 boty-transition hover:opacity-90"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="flex-1 border border-border text-foreground text-sm font-medium rounded-full py-2 boty-transition hover:bg-muted"
            >
              No
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label="Chat with us on WhatsApp"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center boty-shadow boty-transition hover:scale-105 touch-none cursor-grab active:cursor-grabbing"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" aria-hidden="true">
          <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.61 1.912 6.48L4 29l7.72-1.876A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.627 28 15S22.629 3 16.001 3zm0 21.6c-1.97 0-3.812-.55-5.383-1.505l-.386-.23-4.583 1.114 1.145-4.47-.252-.398A9.55 9.55 0 0 1 5.4 15c0-5.845 4.755-10.6 10.601-10.6S26.6 9.155 26.6 15 21.847 24.6 16.001 24.6zm5.815-7.938c-.318-.16-1.884-.93-2.176-1.036-.292-.107-.505-.16-.717.16-.213.318-.824 1.036-1.01 1.249-.187.213-.373.24-.692.08-.318-.16-1.344-.495-2.56-1.578-.947-.845-1.586-1.888-1.772-2.207-.187-.318-.02-.49.14-.649.144-.143.318-.373.478-.56.16-.187.213-.32.32-.532.106-.213.053-.4-.027-.56-.08-.16-.717-1.728-.982-2.366-.259-.622-.522-.538-.717-.548-.186-.009-.399-.011-.612-.011-.213 0-.559.08-.851.4-.292.32-1.117 1.09-1.117 2.66 0 1.568 1.144 3.083 1.303 3.296.16.213 2.252 3.44 5.457 4.822.763.33 1.358.527 1.822.674.766.244 1.463.21 2.014.127.614-.092 1.884-.77 2.15-1.513.265-.744.265-1.38.186-1.513-.08-.133-.293-.213-.612-.373z" />
        </svg>
      </button>
    </div>
  )
}
