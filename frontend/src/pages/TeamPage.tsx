import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCollaborationErrorMessage } from '@/services/collaborationApi'
import { formatRelativeTime } from '@/lib/activityCenter'
import { ROUTES } from '@/lib/routes'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { ROLE_LABELS, type WorkspaceRole } from '@/types/collaboration'

const INVITE_ROLES: WorkspaceRole[] = ['admin', 'recruiter', 'viewer']

export function TeamPage() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const workspace = useWorkspaceStore((s) => s.getActiveWorkspace())
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const members = useWorkspaceStore((s) => s.members)
  const auditLogs = useWorkspaceStore((s) => s.auditLogs)
  const loadMembers = useWorkspaceStore((s) => s.loadMembers)
  const loadAuditLogs = useWorkspaceStore((s) => s.loadAuditLogs)
  const inviteTeamMember = useWorkspaceStore((s) => s.inviteTeamMember)
  const changeMemberRole = useWorkspaceStore((s) => s.changeMemberRole)
  const removeTeamMember = useWorkspaceStore((s) => s.removeTeamMember)
  const createTeamWorkspace = useWorkspaceStore((s) => s.createTeamWorkspace)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)
  const { canInviteMembers, canManageMembers, canReadAudit, role } = usePermissions()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('recruiter')
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    void loadMembers()
    if (canReadAudit) void loadAuditLogs()
  }, [token, loadMembers, loadAuditLogs, canReadAudit, workspace?.id])

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Users className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">Team collaboration</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to share candidate pools, pipeline stages, comments, and notifications.
        </p>
        <Button asChild className="mt-6">
          <Link to={ROUTES.auth}>Sign in to your team</Link>
        </Button>
      </div>
    )
  }

  const handleInvite = async () => {
    setError(null)
    try {
      await inviteTeamMember(inviteEmail, inviteRole)
      setInviteEmail('')
    } catch (err) {
      setError(getCollaborationErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {workspace?.name ?? 'No workspace selected'} · signed in as {user?.name}
          </p>
        </div>
        <div className="flex gap-2">
          {role && <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>}
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Workspaces</CardTitle>
            <CardDescription>Switch between team workspaces you belong to.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-left text-sm hover:bg-muted/30"
                onClick={() => void setActiveWorkspace(ws.id)}
              >
                <span>{ws.name}</span>
                <Badge variant="outline">{ws.role ? ROLE_LABELS[ws.role] : 'Member'}</Badge>
              </button>
            ))}
            <div className="flex gap-2 pt-2">
              <Input
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="New workspace name"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => void createTeamWorkspace(newWorkspaceName).then(() => setNewWorkspaceName(''))}
                disabled={!newWorkspaceName.trim()}
              >
                Create
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Roles & permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">Owner</strong> — full control</p>
            <p><strong className="text-foreground">Admin</strong> — manage members, pipeline, audit</p>
            <p><strong className="text-foreground">Recruiter</strong> — edit pipeline & comment</p>
            <p><strong className="text-foreground">Viewer</strong> — read-only access</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium">{member.user?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                </div>
                {canManageMembers && member.role !== 'owner' ? (
                  <Select
                    value={member.role}
                    onValueChange={(v) =>
                      void changeMemberRole(member.id, v as WorkspaceRole)
                    }
                  >
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVITE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                )}
                {canManageMembers && member.role !== 'owner' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void removeTeamMember(member.id)}
                  >
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {canInviteMembers && (
            <div className="rounded-lg border border-dashed border-border/60 p-4">
              <Label className="flex items-center gap-1.5 text-sm">
                <UserPlus className="h-3.5 w-3.5" />
                Invite teammate
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                User must register first, then you can add them by email.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="max-w-xs"
                />
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as WorkspaceRole)}>
                  <SelectTrigger className="h-9 w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVITE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => void handleInvite()} disabled={!inviteEmail.trim()}>
                  Invite
                </Button>
              </div>
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {canReadAudit && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Audit log</CardTitle>
            <CardDescription>Workspace actions for compliance and debugging.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {auditLogs.slice(0, 25).map((log) => (
                <li
                  key={log.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
                >
                  <span>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground">
                      {' '}
                      · {log.actor?.name ?? 'System'}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(log.at)}
                  </span>
                </li>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-xs text-muted-foreground">No audit entries yet.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
