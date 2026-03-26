'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from 'next/navigation' 
import { useKeycloak } from "@react-keycloak/web"
import { useApi } from "@/lib/useApi"
import Image from "next/image"

import ChatItem from '@/assets/chat_item.png'
import VGCItem from '@/assets/VGC_item.png'
import CreatieChatIcon from "@/components/icons/CreatieChatIcon"
import WebChatIcon from "@/components/icons/WebChatIcon"
import logoutItem from "@/assets/Vector.png"
import FooterItem from "../FooterItem"

const MENU_CONFIG = {
  publicModules: [
    {
      id: 'documentenchat',
      label: 'DocumentenChat',
      icon: ChatItem,
      path: '/documentchat',
      moduleKey: 'Documenten chat',
      footerLabel: 'Doc. Chat',
      footerLabelLines: ['Doc.', 'Chat'],
    },
    {
      id: 'ggd-checks',
      label: 'GGD Checks',
      icon: VGCItem,
      path: '/GGD',
      moduleKey: 'GGD Checks',
      footerLabel: 'GGD Checks',
      footerLabelLines: ['GGD', 'Checks'],
    },
    {
      id: 'creatiechat',
      label: 'CreatieChat',
      icon: () => <CreatieChatIcon className="w-8 h-8" />,
      path: '/creatiechat',
      moduleKey: 'CreatieChat',
      footerLabel: 'Creatie Chat',
      footerLabelLines: ['Creatie', 'Chat'],
    },
    {
      id: 'webchat',
      label: 'WebChat',
      icon: () => <WebChatIcon className="w-8 h-8" />,
      path: '/webchat',
      moduleKey: 'WebChat',
      footerLabel: 'Web Chat',
      footerLabelLines: ['Web', 'Chat'],
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
        textLines: module.footerLabelLines || [module.footerLabel || module.label],
        route: module.path,
      }
    })
  }, [filteredModules])

  // Handle logout
  const handleLogout = useCallback(() => {
    if (keycloak?.authenticated) {
      keycloak.logout({ redirectUri: window.location.origin });
      return;
    }
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
    } catch (e) {
      /* ignore */
    }
    router.push("/");
  }, [keycloak, router])

  if (footerItems.length === 0 && !keycloak?.authenticated) {
    return null // Don't show footer if no modules available and not authenticated
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full bg-[#F9FBFA] border-t border-gray-200 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Menu Items */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-around">
            {footerItems.map((item, index) => (
              <FooterItem
                key={item.module.id || index}
                text={item.text}
                textLines={item.textLines}
                isActive={activeTab === item.text}
                onClick={() => handleClick(item.module)}
                image={item.image}
                iconComponent={item.iconComponent}
                isLogout={false}
              />
            ))}
          </div>

          {/* Vertical Separator and Logout */}
          {keycloak?.authenticated && (
            <div className="flex items-center gap-3 sm:gap-4 ml-2 sm:ml-4">
              <div className="h-12 w-px bg-gray-300"></div>
              <FooterItem
                text=""
                textLines={['Afmelden']}
                isActive={false}
                onClick={handleLogout}
                image={logoutItem}
                isLogout={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}