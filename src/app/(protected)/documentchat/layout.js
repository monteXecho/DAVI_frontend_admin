import RightSidebar from "@/components/layout/RightSidebar"

export default function DocumentLayout({ children }) {
  return (    
    <div className="flex w-full h-full">
        {children}
        <RightSidebar />
    </div>
  )
}
