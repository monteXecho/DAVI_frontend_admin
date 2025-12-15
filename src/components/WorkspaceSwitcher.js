'use client';

import { useWorkspace } from '@/context/WorkspaceContext';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useApi } from '@/lib/useApi';

// Helper function to get user initials for avatar
const getInitials = (name, email) => {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
};

// User Avatar Component
const UserAvatar = ({ name, email, isActive, size = 32 }) => {
  const initials = getInitials(name, email);
  const sizeClass = size === 32 ? 'w-8 h-8' : size === 24 ? 'w-6 h-6' : 'w-10 h-10';
  const textSize = size === 32 ? 'text-xs' : size === 24 ? 'text-[10px]' : 'text-sm';
  
  return (
    <div
      className={`
        ${sizeClass} rounded-full flex items-center justify-center font-semibold
        ${isActive 
          ? 'bg-[#23BD92] text-white ring-2 ring-[#23BD92] ring-offset-2 ring-offset-white' 
          : 'bg-gradient-to-br from-[#23BD92] to-[#1ea87a] text-white'
        }
        transition-all duration-200 shadow-sm
      `}
    >
      <span className={textSize}>{initials}</span>
    </div>
  );
};

export default function WorkspaceSwitcher() {
  const { workspaces, selectedOwnerId, setSelectedOwnerId } = useWorkspace();
  const router = useRouter();
  const { getUser } = useApi();
  const [currentUser, setCurrentUser] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transitionInfo, setTransitionInfo] = useState(null); // { from: string, to: string }

  // Calculate options with useMemo - MUST be defined before useCallback that uses it
  const options = useMemo(() => {
    if (!workspaces) return [];
    
    const selfOwnerId = workspaces.self?.ownerId;
    const allOptions = [
      workspaces.self,
      ...(workspaces.guestOf || []),
    ].filter(Boolean);
    
    // Remove duplicates based on ownerId - but allow same ownerId for company users
    // (self workspace = default access, guest workspace = teamlid permissions)
    const seen = new Set();
    const uniqueOptions = [];
    
    allOptions.forEach((ws, index) => {
      if (!ws.ownerId) return; // Skip if no ownerId
      
      // If this is the self workspace, always add it
      if (ws.ownerId === selfOwnerId && workspaces.self === ws) {
        seen.add(ws.ownerId);
        uniqueOptions.push({
          ...ws,
          uniqueKey: `self-${ws.ownerId}`,
          isSelf: true,
        });
        return;
      }
      
      // For guest workspaces with same ownerId as self:
      // - For company users: allow both (self = default, guest = teamlid permissions)
      // - For company admins: skip (they're the same workspace)
      // We can't easily detect user type here, so we'll allow both if they have different permissions
      // The key difference: self has permissions: null, guest has permissions object
      const isGuestWithSameOwner = ws.ownerId === selfOwnerId && workspaces.self !== ws;
      if (isGuestWithSameOwner) {
        // Allow it - represents teamlid permissions vs default permissions
        uniqueOptions.push({
          ...ws,
          uniqueKey: `guest-${ws.ownerId}-${index}`,
          isGuest: true,
        });
        return;
      }
      
      // Add guest workspace if not seen before
      if (!seen.has(ws.ownerId)) {
        seen.add(ws.ownerId);
        uniqueOptions.push({
          ...ws,
          uniqueKey: ws.ownerId || `workspace-${index}`,
          isGuest: true,
        });
      }
    });
    
    return uniqueOptions;
  }, [workspaces]);

  // Get display info for workspace - MUST be useCallback and defined before any conditional logic
  const getWorkspaceInfo = useCallback((ws, workspaces) => {
    // Check if this is the "self" workspace (not a guest workspace)
    // For company users: self workspace has permissions: null, guest workspace has permissions object
    const isSelf = ws.isSelf || (workspaces?.self?.ownerId === ws.ownerId && !ws.permissions);
    const isGuest = ws.isGuest || (ws.permissions !== null && ws.permissions !== undefined);
    const isDefault = isSelf || (ws.ownerId === currentUser?.user_id && !isGuest);
    
    return {
      title: isDefault ? 'Standaard rol' : 'Teamlid rol',
      subtitle: isDefault 
        ? 'Eigen werkruimte' 
        : ws.owner 
          ? `voor ${ws.owner.name || ws.owner.email || 'beheerder'}`
          : ws.label || 'Onbekende rol',
      name: isDefault 
        ? (currentUser?.name || currentUser?.email || 'Jij')
        : (ws.owner?.name || ws.owner?.email || 'Beheerder'),
      email: isDefault 
        ? currentUser?.email 
        : ws.owner?.email,
      isDefault,
      isSelf,
      isGuest,
      icon: isDefault ? '👤' : '👥'
    };
  }, [currentUser]);

  // Handle workspace change - must be defined before useEffect hooks
  const handleWorkspaceChange = useCallback(async (newOwnerId, isGuest = false) => {
    // For company users with same ownerId: distinguish by isGuest flag
    const newWorkspace = options.find(ws => {
      if (ws.ownerId === newOwnerId) {
        // If both self and guest exist with same ownerId, match by isGuest flag
        const hasBoth = options.some(w => w.ownerId === newOwnerId && w.isSelf) && 
                       options.some(w => w.ownerId === newOwnerId && w.isGuest);
        if (hasBoth) {
          return (ws.isGuest && isGuest) || (ws.isSelf && !isGuest);
        }
        return true;
      }
      return false;
    });
    
    if (!newWorkspace) return;
    
    // Check if already selected (considering isGuest for same ownerId)
    const currentWorkspace = options.find(ws => {
      if (ws.ownerId === selectedOwnerId) {
        const hasBoth = options.some(w => w.ownerId === selectedOwnerId && w.isSelf) && 
                       options.some(w => w.ownerId === selectedOwnerId && w.isGuest);
        if (hasBoth) {
          // Need to check which one is currently selected
          const storedIsGuest = typeof window !== 'undefined' 
            ? window.localStorage.getItem('daviActingOwnerIsGuest') === 'true'
            : false;
          return (ws.isGuest && storedIsGuest) || (ws.isSelf && !storedIsGuest);
        }
        return true;
      }
      return false;
    });
    
    if (currentWorkspace && currentWorkspace.ownerId === newWorkspace.ownerId && 
        currentWorkspace.isSelf === newWorkspace.isSelf && 
        currentWorkspace.isGuest === newWorkspace.isGuest) {
      setIsOpen(false);
      return;
    }
    
    const getRoleDisplayName = (ws) => {
      if (!ws) return 'Onbekende rol';
      if (ws.isSelf || (ws.ownerId === currentUser?.user_id && !ws.isGuest)) {
        return 'Standaard rol';
      }
      if (ws.owner) {
        return `Teamlid rol voor ${ws.owner.name || ws.owner.email || 'beheerder'}`;
      }
      return ws.label || 'Onbekende rol';
    };
    
    const fromRole = getRoleDisplayName(currentWorkspace);
    const toRole = getRoleDisplayName(newWorkspace);
    
    // Show transition overlay
    setTransitionInfo({ from: fromRole, to: toRole });
    setIsSwitching(true);
    setIsOpen(false);
    
    try {
      // Update localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('daviActingOwnerId', newOwnerId);
        window.localStorage.setItem('daviActingOwnerIsGuest', String(newWorkspace.isGuest || false));
        if (newWorkspace?.label) {
          window.localStorage.setItem('daviActingOwnerLabel', newWorkspace.label);
        }
        if (currentUser?.user_id) {
          window.localStorage.setItem('daviActingOwnerUserId', String(currentUser.user_id));
        }
        window.sessionStorage.setItem('daviActingOwnerSelectedForSession', 'true');
      }
      
      // Update context
      setSelectedOwnerId(newOwnerId);
      
      // Show transition for 1.5 seconds, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Failed to switch workspace:', err);
      setIsSwitching(false);
      setTransitionInfo(null);
    }
  }, [selectedOwnerId, setSelectedOwnerId, options, currentUser, router]);

  // Fetch current user to determine if it's their own workspace
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, [getUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('.workspace-switcher-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Conditional returns AFTER all hooks
  if (!workspaces) return null;
  if (!options.length || options.length < 2) return null;

  const selectedWorkspace = options.find(ws => ws.ownerId === selectedOwnerId);
  const selectedInfo = selectedWorkspace ? getWorkspaceInfo(selectedWorkspace, workspaces) : null;

  return (
    <>
      {/* Full-screen Role Transition Overlay */}
      {transitionInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#F5FBF8] via-white to-[#E8F5EE]">
          <div className="text-center px-6 max-w-2xl">
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="text-4xl font-extrabold text-[#23BD92] leading-none mb-2">
                DAVI
              </div>
            </div>

            {/* Transition Animation */}
            <div className="mb-8 flex items-center justify-center gap-8 flex-wrap">
              {/* From Role */}
              <div className="flex flex-col items-center gap-3">
                <UserAvatar 
                  name={transitionInfo.from.includes('voor') 
                    ? transitionInfo.from.split('voor')[1]?.trim() || 'Beheerder'
                    : currentUser?.name || currentUser?.email || 'Jij'
                  }
                  email={currentUser?.email}
                  isActive={false}
                  size={64}
                />
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Van</div>
                  <div className="text-base font-semibold text-gray-700 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 max-w-[200px]">
                    {transitionInfo.from}
                  </div>
                </div>
              </div>

              {/* Arrow Animation */}
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-10 h-10 text-[#23BD92] animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>

              {/* To Role */}
              <div className="flex flex-col items-center gap-3 animate-fade-in">
                <UserAvatar 
                  name={transitionInfo.to.includes('voor') 
                    ? transitionInfo.to.split('voor')[1]?.trim() || 'Beheerder'
                    : currentUser?.name || currentUser?.email || 'Jij'
                  }
                  email={currentUser?.email}
                  isActive={true}
                  size={64}
                />
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Naar</div>
                  <div className="text-base font-semibold text-[#23BD92] px-4 py-2 bg-[#D6F5EB] rounded-lg shadow-sm border border-[#23BD92] max-w-[200px]">
                    {transitionInfo.to}
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="h-5 w-5 border-3 border-[#23BD92] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-base font-medium">Rol wordt gewisseld...</span>
              </div>
              <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-[#23BD92] to-[#1ea87a] rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="workspace-switcher-container relative w-full">
      <span className="text-[10px] uppercase tracking-[0.12em] text-gray-500 font-semibold mb-2 block">
        Rol wisselen
      </span>
      
      {/* Selected Workspace Button */}
      <button
        onClick={() => !isSwitching && setIsOpen(!isOpen)}
        disabled={isSwitching}
        className={`
          w-full relative flex items-center gap-3 px-3 py-2.5
          bg-white border rounded-lg
          transition-all duration-200
          ${isOpen 
            ? 'border-[#23BD92] shadow-md ring-1 ring-[#23BD92]' 
            : 'border-gray-200 hover:border-[#23BD92] hover:shadow-sm'
          }
          ${isSwitching ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isSwitching ? (
          <div className="flex items-center justify-center w-full gap-2">
            <div className="h-4 w-4 border-2 border-[#23BD92] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500">Wisselen...</span>
          </div>
        ) : (
          <>
            {selectedInfo && (
              <>
                <UserAvatar 
                  name={selectedInfo.name} 
                  email={selectedInfo.email}
                  isActive={true}
                  size={32}
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">
                    {selectedInfo.title}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {selectedInfo.subtitle}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && !isSwitching && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="py-1">
            {options.map((ws) => {
              const info = getWorkspaceInfo(ws, workspaces);
              // For selection: check if this workspace matches selectedOwnerId
              // For company users with same ownerId: distinguish by isSelf vs isGuest
              let isSelected = false;
              if (ws.ownerId === selectedOwnerId) {
                // Check if both self and guest exist with same ownerId
                const hasBoth = options.some(w => w.ownerId === selectedOwnerId && w.isSelf) && 
                               options.some(w => w.ownerId === selectedOwnerId && w.isGuest);
                if (hasBoth) {
                  // Need to check which one is currently selected using stored flag
                  const storedIsGuest = typeof window !== 'undefined' 
                    ? window.localStorage.getItem('daviActingOwnerIsGuest') === 'true'
                    : false;
                  isSelected = (ws.isGuest && storedIsGuest) || (ws.isSelf && !storedIsGuest);
                } else {
                  isSelected = true;
                }
              }
              
              return (
                <button
                  key={ws.uniqueKey || ws.ownerId || `workspace-${ws.label}`}
                  onClick={() => handleWorkspaceChange(ws.ownerId, ws.isGuest)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5
                    transition-colors duration-150
                    ${isSelected 
                      ? 'bg-[#D6F5EB] text-[#23BD92]' 
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <UserAvatar 
                    name={info.name} 
                    email={info.email}
                    isActive={isSelected}
                    size={32}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className={`text-xs font-semibold truncate ${isSelected ? 'text-[#23BD92]' : 'text-gray-900'}`}>
                      {info.title}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {info.subtitle}
                    </div>
                  </div>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-[#23BD92]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
