"use client"

import { Mail } from "lucide-react"
import { useLeads } from "@/components/boty/leads-store"

export default function AdminLeadsPage() {
  const { leads, hydrated, markRedeemed } = useLeads()

  if (!hydrated) return null

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-1">Leads</h1>
      <p className="text-muted-foreground mb-6">
        Captured from the first-time-buyer discount popup. {leads.length} total.
      </p>

      {leads.length === 0 ? (
        <div className="bg-card rounded-2xl boty-shadow p-10 text-center">
          <Mail className="w-10 h-10 text-muted-foreground/50 mb-3 mx-auto" />
          <p className="text-muted-foreground">No leads captured yet.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-card rounded-2xl boty-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-background text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Phone</th>
                  <th className="text-left px-5 py-3">Coupon</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-border/50">
                    <td className="px-5 py-3 text-foreground font-medium">{lead.firstName} {lead.lastName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{lead.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{lead.phone}</td>
                    <td className="px-5 py-3 text-foreground font-mono text-xs">{lead.couponCode}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${lead.redeemed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {lead.redeemed ? "Redeemed" : "Unredeemed"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3">
                      {!lead.redeemed && (
                        <button
                          type="button"
                          onClick={() => markRedeemed(lead.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Mark Redeemed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-card rounded-2xl boty-shadow p-4">
                <p className="font-medium text-foreground">{lead.firstName} {lead.lastName}</p>
                <p className="text-sm text-muted-foreground">{lead.email}</p>
                <p className="text-sm text-muted-foreground">{lead.phone}</p>
                <p className="text-xs font-mono text-foreground mt-1">{lead.couponCode}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full ${lead.redeemed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {lead.redeemed ? "Redeemed" : "Unredeemed"}
                  </span>
                  {!lead.redeemed && (
                    <button
                      type="button"
                      onClick={() => markRedeemed(lead.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark Redeemed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            These welcome codes are separate from the Coupons feature — mark a lead Redeemed manually once they use theirs.
          </p>
        </>
      )}
    </div>
  )
}
