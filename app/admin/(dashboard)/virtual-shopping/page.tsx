"use client"

import { Video } from "lucide-react"
import { useVirtualShopping } from "@/components/boty/virtual-shopping-store"
import type { VirtualShoppingRequest } from "@/lib/types"

const STATUS_OPTIONS: VirtualShoppingRequest["status"][] = ["pending", "confirmed", "completed"]

export default function AdminVirtualShoppingPage() {
  const { requests, hydrated, updateStatus } = useVirtualShopping()

  if (!hydrated) return null

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-1">Virtual Shopping Requests</h1>
      <p className="text-muted-foreground mb-6">{requests.length} booking requests.</p>

      {requests.length === 0 ? (
        <div className="bg-card rounded-2xl boty-shadow p-10 text-center">
          <Video className="w-10 h-10 text-muted-foreground/50 mb-3 mx-auto" />
          <p className="text-muted-foreground">No requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-card rounded-2xl boty-shadow p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-medium text-foreground">{request.name}</p>
                  <p className="text-sm text-muted-foreground">{request.phone}</p>
                </div>
                <select
                  value={request.status}
                  onChange={(e) => updateStatus(request.id, e.target.value as VirtualShoppingRequest["status"])}
                  className="bg-background border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/50 capitalize"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              {request.productName && (
                <p className="text-sm text-primary mb-1">Product: {request.productName}</p>
              )}
              <p className="text-sm text-foreground/80 mb-1">{request.topic}</p>
              <p className="text-xs text-muted-foreground">
                Preferred: {request.preferredDate} at {request.preferredTime}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
