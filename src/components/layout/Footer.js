'use client'

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from 'next/navigation' 
import { useKeycloak } from "@react-keycloak/web"
import { useApi } from "@/lib/useApi"
import Image from "next/image"

import ChatItem from '@/assets/chat_item.png'
import VGCItem from '@/assets/VGC_item.png'
import CreatieChatIcon from "@/components/icons/CreatieChatIcon"
import WebChatIcon from "@/components/icons/WebChatIcon"
import FooterItem from "../FooterItem"

const MENU_CONFIG = {
  publicModules: [
    {
      id: 'documentenchat',
      label: 'DocumentenChat',
      icon: ChatItem,
      path: '/documentchat',
      moduleKey: 'Documenten chat',
      footerLabel: 'Chat',
      footerWidth: '45px',
      footerHeight: '49px',
      footerGap: '2',
    },
    {
      id: 'ggd-checks',
      label: 'GGD Checks',
      icon: VGCItem,
      path: '/GGD',
      moduleKey: 'GGD Checks',
      footerLabel: 'GGD Checks',
      footerWidth: '43px',
      footerHeight: '43px',
      footerGap: '3',
    },
    {
      id: 'creatiechat',
      label: 'CreatieChat',
      icon: () => <CreatieChatIcon className="w-8 h-8" />,
      path: '/creatiechat',
      moduleKey: 'CreatieChat',
      footerLabel: 'CreatieChat',
      footerWidth: '43px',
      footerHeight: '43px',
      footerGap: '3',
    },
    {
      id: 'webchat',
      label: 'WebChat',
      icon: () => <WebChatIcon className="w-8 h-8" />,
      path: '/webchat',
      moduleKey: 'WebChat',
      footerLabel: 'WebChat',
      footerWidth: '43px',
      footerHeight: '43px',
      footerGap: '3',
    }
  ],
}

export default function Footer () {
  const [activeTab, setActiveTab] = useState(null)
  const router = useRouter()
  const pathname = usePathname()
  const { keycloak, initialized } = useKeycloak()
  const { getUser } = useApi()
  const [user, setUser] = useState(null)
  const [userRoles, setUserRoles] = useState({
    isSuperAdmin: false,
    isCompanyAdmin: false,
    isCompanyUser: false
  })

  // Load user data and roles
  useEffect(() => {
    if (!initialized || !keycloak?.authenticated) return

    const roles = keycloak.tokenParsed?.realm_access?.roles || []
    setUserRoles({
      isSuperAdmin: roles.includes('super_admin'),
      isCompanyAdmin: roles.includes('company_admin'),
      isCompanyUser: roles.includes('company_user')
    })

    const loadUser = async () => {
      try {
        const userData = await getUser()
        setUser(userData)
      } catch (err) {
        console.error('Failed to load user:', err)
      }
    }
    loadUser()
  }, [initialized, keycloak?.authenticated, keycloak?.tokenParsed, getUser])

  // Filter modules based on user permissions (same logic as LeftSidebar)
  const filteredModules = useMemo(() => {
    if (userRoles.isSuperAdmin) {
      return MENU_CONFIG.publicModules
    } else if (userRoles.isCompanyUser) {
      const currentUser = user
      
      if (!currentUser) {
        return []
      }
      
      return MENU_CONFIG.publicModules.filter(module => {
        // Check both company-level and user-level module permissions
        const companyModules = currentUser?.company_modules || []
        const companyModule = companyModules.find(m => m.name === module.moduleKey)
        
        const userModules = currentUser?.modules || {}
        const userModule = userModules[module.moduleKey]
        
        const companyHasModule = companyModule?.enabled === true
        const userHasModule = userModule?.enabled === true
        
        return companyHasModule && userHasModule
      })
    } else if (userRoles.isCompanyAdmin) {
      // Company admins don't see public modules in footer (they use admin sidebar)
      return []
    }
    
    return []
  }, [user, userRoles])

  // Map pathname to active tab
  useEffect(() => {
    const matchedModule = filteredModules.find(m => pathname.startsWith(m.path))
    if (matchedModule) {
      setActiveTab(matchedModule.footerLabel || matchedModule.label)
    } else {
      setActiveTab(null)
    }
  }, [pathname, filteredModules])

  const handleClick = (module) => {
    setActiveTab(module.footerLabel || module.label)
    router.push(module.path)
  }

  // Convert filtered modules to footer items
  const footerItems = useMemo(() => {
    return filteredModules.map(module => {
      const isImageIcon = typeof module.icon !== 'function'
      
      return {
        module,
        image: isImageIcon ? module.icon : null,
        iconComponent: !isImageIcon ? module.icon : null,
        text: module.footerLabel || module.label,
        route: module.path,
        width: module.footerWidth || '43px',
        height: module.footerHeight || '43px',
        gap: module.footerGap || '3',
      }
    })
  }, [filteredModules])

  if (footerItems.length === 0) {
    return null // Don't show footer if no modules available
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full h-[120px] flex items-center px-[30px] justify-between bg-[#F9FBFA]">
      {footerItems.map((item, index) => (
        <FooterItem
          key={item.module.id || index}
          text={item.text}
          isActive={activeTab === item.text}
          onClick={() => handleClick(item.module)}
          image={item.image}
          iconComponent={item.iconComponent}
          width={item.width}
          height={item.height}
          gap={item.gap}
        />
      ))}
    </div>
  )
}