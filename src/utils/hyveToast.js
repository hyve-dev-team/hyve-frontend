import { toast } from "sonner"
import { CheckCircle, AlertCircle } from "lucide-react"
import React from "react"

export const hyveSuccess = (message, description) => {
  toast.success(message, {
    description,
    icon: React.createElement(CheckCircle, { size: 18, color: "#16a34a" }),
  })
}

export const hyveError = (message, description) => {
  toast.error(message, {
    description,
    icon: React.createElement(AlertCircle, { size: 18, color: "#dc2626" }),
  })
}