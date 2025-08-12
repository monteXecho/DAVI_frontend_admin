'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from 'next/navigation' 

import ChatItem from '@/assets/chat_item.png'
import BKRItem from '@/assets/BKR_item.png'
import VGCItem from '@/assets/VGC_item.png'
import uursItem from '@/assets/uurs_item.png'
import FooterItem from "../FooterItem"

export default function Footer () {
  const [activeTab, setActiveTab] = useState(null)
  const router = useRouter()
  const pathname = usePathname() 

  // Set active tab based on the current route
  useEffect(() => {
    // Define route-to-tab mapping
    const routeToTab = {
      '/document': 'Chat',
      '/bkr': 'BKR',
      '/vgc': 'VGC',
      '/3-uurs': '3-uurs'
    }

    const tab = routeToTab[pathname] || null  // Get the corresponding tab
    setActiveTab(tab)  // Set the active tab
  }, [pathname])  // Trigger this effect whenever pathname changes

  const handleClick = (label) => {
    setActiveTab(label)
    if (label === 'Chat') {
      router.push('/document')
    } else if (label === 'BKR') {
      router.push('/bkr')
    } else if (label === 'VGC') {
      router.push('/vgc')
    } else if (label === '3-uurs') {
      router.push('/3-uurs')
    }
  }

  // Array of footer items with relevant data
  const footerItems = [
    {
      image: ChatItem,
      text: 'Chat',
      route: '/document',
      width: '45px',
      height: '49px',
      gap: '2',
    },
    {
      image: VGCItem,
      text: 'VGC',
      route: '/vgc',
      width: '43px',
      height: '43px',
      gap: '3',
    },
    {
      image: BKRItem,
      text: 'BKR',
      route: '/bkr',
      width: '42px',
      height: '44px',
      gap: '3',
    },
    {
      image: uursItem,
      text: '3-uurs',
      route: '/3-uurs',
      width: '43px',
      height: '43px',
      gap: '3',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full h-[120px] flex items-center px-[30px] justify-between bg-[#F9FBFA]">
      {footerItems.map((item, index) => (
        <FooterItem
          key={index}
          text={item.text}
          isActive={activeTab === item.text}
          onClick={() => handleClick(item.text)}
          image={item.image}
          width={item.width}
          height={item.height}
          gap={item.gap}
        />
      ))}
    </div>
  )
}