'use client';

import { useWorkspace } from '@/context/WorkspaceContext';

export default function WorkspaceSwitcher() {
  const { workspaces, selectedOwnerId, setSelectedOwnerId } = useWorkspace();

  if (!workspaces) return null;

  const options = [
    workspaces.self,
    ...(workspaces.guestOf || []),
  ].filter(Boolean);

  if (!options.length) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600">Acting as:</span>
      <select
        className="border rounded px-2 py-1 text-xs"
        value={selectedOwnerId || ''}
        onChange={(e) => setSelectedOwnerId(e.target.value)}
      >
        {options.map((ws) => (
          <option key={ws.ownerId} value={ws.ownerId}>
            {ws.label}
          </option>
        ))}
      </select>
    </div>
  );
}
