'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from 'next/navigation' 

import userPhoto from '@/assets/user_photo.jpg'
import MenuButton from '@/components/MenuButton'

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState(null)
  const router = useRouter()
  const pathname = usePathname() 

  // Set active tab based on the current route
  useEffect(() => {
    // Define route-to-tab mapping
    const routeToTab = {
      '/document': 'Documenten',
      '/bkr': 'BKR',
      '/vgc': 'VGC',
      '/3-uurs': '3-uurs'
    }

    const tab = routeToTab[pathname] || null  // Get the corresponding tab
    setActiveTab(tab)  // Set the active tab
  }, [pathname])  // Trigger this effect whenever pathname changes

  const handleClick = (label) => {
    setActiveTab(label)
    if (label === 'Documenten') {
      router.push('/document')
    } else if (label === 'BKR') {
      router.push('/bkr')
    } else if (label === 'VGC') {
      router.push('/vgc')
    } else if (label === '3-uurs') {
      router.push('/3-uurs')
    }
  }

  return (
    <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
      <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
        <div className="font-extrabold text-xl leading-none tracking-normal font-montserrat text-[#23BD92] cursor-pointer"
            onClick={() => {router.push('/'); setActiveTab(null)}}
        >
          DAVI
        </div>
        <div className="flex flex-col gap-6 w-[19.44vw] xl:w-[280px] h-[50px]">
          {['Documenten', 'BKR', 'VGC', '3-uurs'].map(label => (
            <MenuButton
              key={label}
              text={label}
              isActive={activeTab === label}
              onClick={() => handleClick(label)}
            />
          ))}
        </div>
      </div>

      <div className="w-14 h-14 rounded-full border-2 border-[#23BD92] overflow-hidden">
        <Image src={userPhoto} alt="photo" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
