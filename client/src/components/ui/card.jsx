import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-surface border border-border rounded-xl p-5 shadow-sm text-primary",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
