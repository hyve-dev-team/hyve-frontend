import { Toaster as Sonner } from "sonner"

const Toaster = () => {
  return (
    <Sonner
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "bg-white border border-[#FF630033] shadow-lg rounded-xl",
          title: "text-black font-medium",
          description: "text-gray-500 text-sm",
          actionButton:
            "bg-[#FF6300] text-white hover:bg-[#e65a00]",
        },
      }}
    />
  )
}

export default Toaster