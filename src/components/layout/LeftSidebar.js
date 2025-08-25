'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from 'next/navigation' 

import userPhoto from '@/assets/user_photo.jpg'
import MenuButton from '@/components/buttons/MenuButton'

import ChatItem from '@/assets/chat_item.png'
import BKRItem from '@/assets/BKR_item.png'
import VGCItem from '@/assets/VGC_item.png'
import uursItem from '@/assets/uurs_item.png'
import RollenItem from '@/assets/rollen_item.png'
import GebruikersItem from '@/assets/gebruikers_item.png'
import DocumentenItem from '@/assets/documenten_item.png'
import InstellingenItem from '@/assets/instellingen_item.png'

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState(null)
  const router = useRouter()
  const pathname = usePathname() 

  const icons = {
    Documentenchat: ChatItem,
    BKR: BKRItem,
    VGC: VGCItem,
    '3-uurs': uursItem,
    Rollen: RollenItem,
    Gebruikers: GebruikersItem,
    Documenten: DocumentenItem,
    Instellingen: InstellingenItem,
  }


  // Set active tab based on the current route
  useEffect(() => {
    // Define route-to-tab mapping
    const routeToTab = {
      '/documentchat': 'Documentenchat',
      '/bkr': 'BKR',
      '/vgc': 'VGC',
      '/3-uurs': '3-uurs',
      '/rollen': 'Rollen',
      '/rol-pz': 'Rollen',
      '/gebruikers': 'Gebruikers',
      '/documenten': 'Documenten',
      '/instellingen': 'Instellingen',
    }

    const tab = routeToTab[pathname] || null  // Get the corresponding tab
    setActiveTab(tab)  // Set the active tab
  }, [pathname])  // Trigger this effect whenever pathname changes

  const handleClick = (label) => {
    setActiveTab(label)
    if (label === 'Documentenchat') {
      router.push('/documentchat')
    } else if (label === 'BKR') {
      router.push('/bkr')
    } else if (label === 'VGC') {
      router.push('/vgc')
    } else if (label === '3-uurs') {
      router.push('/3-uurs')
    } else if (label === 'Rollen') {
      router.push('/rollen')
    } else if (label === 'Gebruikers') {
      router.push('/gebruikers')
    } else if (label === 'Documenten') {
      router.push('/documenten')
    } else if (label === 'Instellingen') {
      router.push('/instellingen')
    }
  }

  return (
    <div className="flex flex-col justify-between items-center w-[29.93vw] xl:w-[431px] h-full bg-[#F9FBFA] pb-[147px]">
      <div className="w-full flex flex-col gap-[33px] pt-[60px] pl-[9.02vw] xl:pl-[130px] pr-[21px]">
        <div className="font-extrabold text-[40px] leading-none tracking-normal font-montserrat text-[#23BD92] cursor-pointer"
            onClick={() => {router.push('/'); setActiveTab(null)}}
        >
          DAVI
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 w-[19.44vw] xl:w-[280px]">
            {['Documentenchat', 'BKR', 'VGC', '3-uurs'].map(label => (
              <MenuButton
                key={label}
                text={label}
                image={icons[label]}
                isActive={activeTab === label}
                onClick={() => handleClick(label)}
              />
            ))}
          </div>
          
          <div className="w-full h-[1px] bg-[#C5BEBE]"></div>

          <div className="flex flex-col gap-6 w-[19.44vw] xl:w-[280px]">
            {['Rollen', 'Gebruikers', 'Documenten', 'Instellingen'].map(label => (
              <MenuButton
                key={label}
                text={label}
                image={icons[label]}
                isActive={activeTab === label}
                onClick={() => handleClick(label)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-14 h-14 rounded-full border-2 border-[#23BD92]">
        <Image src={userPhoto} alt="photo" className="w-full h-full rounded-full object-cover" />
      </div>
    </div>
  )
}
