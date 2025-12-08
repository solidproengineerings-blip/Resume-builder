import * as React from "react"

// Placeholder Sonner toaster
export const Toaster = () => {
  return null
}

export const toast = {
  success: (message: string, options?: any) => console.log("Success:", message),
  error: (message: string, options?: any) => console.log("Error:", message),
  info: (message: string, options?: any) => console.log("Info:", message),
  warning: (message: string, options?: any) => console.log("Warning:", message),
  message: (message: string, options?: any) => console.log("Message:", message),
}
