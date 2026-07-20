"use client"

import { XCircle } from "lucide-react"
import { useCancellationRequests } from "@/components/boty/cancellation-requests-store"

export default function AdminCancellationsPage() {
  const { requests, hydrated, approve, reject, remove } = useCancellationRequests()

  if (!hydrated) return null

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-1">Cancellation Requests</h1>
      <p className="text-muted-foreground mb-6">{requests.length} total requests from customers.</p>

      {requests.length === 0 ? (
        <div className="bg-card rounded-2xl boty-shadow p-10 text-center">
          <XCircle className="w-10 h-10 text-muted-foreground/50 mb-3 mx-auto" />
          <p className="text-muted-foreground">No cancellation requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-card rounded-2xl boty-shadow p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Order #{req.orderCode}</span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    req.status === "Pending"
                      ? "bg-amber-100 text-amber-700"
                      : req.status === "Approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {req.customerName} • {req.customerPhone}
              </p>
              {req.reason && <p className="text-sm text-foreground/80 mb-2">Reason: {req.reason}</p>}
              <p className="text-xs text-muted-foreground mb-4">
                Requested {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <div className="flex gap-2">
                {req.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => approve(req.id, req.orderId)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium boty-transition hover:bg-primary/90"
                    >
                      Approve (cancels order)
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(req.id)}
                      className="px-4 py-2 border border-border text-foreground rounded-full text-xs font-medium boty-transition hover:bg-muted"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => remove(req.id)}
                  className="px-4 py-2 text-destructive rounded-full text-xs font-medium boty-transition hover:bg-destructive/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
