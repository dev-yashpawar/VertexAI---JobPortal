import * as React from "react"
import { cn } from "../../lib/utils"

export function StatusBadge({ status, className }) {
  const styles = {
    applied: "bg-gray-100 text-gray-600",
    shortlisted: "bg-accent-light text-accent",
    accepted: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-600",
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-accent-light text-accent",
    open: "bg-gray-100 text-gray-600",
    resolved: "bg-accent-light text-accent",
    closed: "bg-gray-200 text-gray-500",
  }

  // Fallback to applied style if status not found
  const appliedStyle = styles[status?.toLowerCase()] || styles.applied

  return (
    <span className={cn(`px-2 py-1 rounded-md text-xs font-medium capitalize table-cell align-middle text-center inline-block`, appliedStyle, className)}>
      {status}
    </span>
  )
}
