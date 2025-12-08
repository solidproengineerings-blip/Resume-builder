import * as React from "react"

const useToast = () => {
  return {
    toast: (props: any) => console.log("Toast:", props),
  }
}

type ToastActionElement = React.ReactElement<any>

interface Toast {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Toaster = () => {
  return null
}

export { Toaster, useToast, type ToastActionElement, type Toast }
