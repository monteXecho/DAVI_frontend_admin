'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from 'next/navigation' 
import { useKeycloak } from '@react-keycloak/web'

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
import CompanyItem from '@/assets/company_item.png'

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState(null)
  const router = useRouter()
  const pathname = usePathname() 
  const { keycloak } = useKeycloak()

  const isSuperAdmin = 
    keycloak?.authenticated &&
    keycloak?.tokenParsed?.realm_access?.roles?.includes("super_admin")

  const isCompanyAdmin = 
    keycloak?.authenticated &&
    keycloak?.tokenParsed?.realm_access?.roles?.includes("company_admin")

  const isCompanyUser = 
    keycloak?.authenticated &&
    keycloak?.tokenParsed?.realm_access?.roles?.includes("company_user")

  const icons = {
    Documentenchat: ChatItem,
    'GGD Checks': VGCItem,
    Compagnies: CompanyItem,
    Rollen: RollenItem,
    Gebruikers: GebruikersItem,
    Documenten: DocumentenItem,
    Instellingen: InstellingenItem,
  }

  useEffect(() => {
    const routeToTab = {
      '/documentchat': 'Documentenchat',
      '/GGD': 'GGD Checks',
      '/compagnies': 'Compagnies',
      '/rollen': 'Rollen',
      '/rol-pz': 'Rollen',
      '/gebruikers': 'Gebruikers',
      '/documenten': 'Documenten',
      '/instellingen': 'Instellingen',
    }

    const tab = routeToTab[pathname] || null 
    setActiveTab(tab) 
  }, [pathname]) 
  
  const handleClick = (label) => {
    setActiveTab(label)
    if (label === 'Documentenchat') {
      router.push('/documentchat')
    } 
    else if (label === 'GGD Checks') {
      router.push('/GGD')
    }
    else if (label === 'Rollen') {
      router.push('/rollen')
    } else if (label === 'Compagnies') {
      router.push('/compagnies')
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
            {['Documentenchat', 'GGD Checks'].map(label => (
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
            {isSuperAdmin && (
              <MenuButton
                text="Compagnies"
                image={icons["Compagnies"]}
                isActive={activeTab === "Compagnies"}
                onClick={() => handleClick("Compagnies")}
              />
            )}
            
            {(isSuperAdmin || isCompanyAdmin) && ['Rollen', 'Gebruikers', 'Documenten', 'Instellingen'].map(label => (
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
