import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLE_LABELS } from '@/types/collaboration'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

export function WorkspaceSwitcher() {
  const token = useAuthStore((s) => s.token)
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)

  if (!token || workspaces.length === 0) return null

  return (
    <Select
      value={activeWorkspaceId ?? undefined}
      onValueChange={(id) => void setActiveWorkspace(id)}
    >
      <SelectTrigger className="hidden h-9 w-[160px] md:flex">
        <SelectValue placeholder="Workspace" />
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((ws) => (
          <SelectItem key={ws.id} value={ws.id}>
            {ws.name}
            {ws.role ? ` · ${ROLE_LABELS[ws.role]}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
