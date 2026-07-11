import axios from 'axios'
import type {
  AuditLogEntry,
  AuthUser,
  ProspectComment,
  Workspace,
  WorkspaceMember,
  WorkspaceNotification,
  WorkspaceRole,
} from '@/types/collaboration'
import type { Prospect } from '@/types'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

let authToken: string | null = null

export function setCollaborationAuthToken(token: string | null) {
  authToken = token
}

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

export async function registerUser(input: {
  email: string
  name: string
  password: string
}) {
  const { data } = await client.post<{
    token: string
    user: AuthUser
    workspace: Workspace
    workspaces: Workspace[]
  }>('/auth/register', input)
  return data
}

export async function loginUser(input: { email: string; password: string }) {
  const { data } = await client.post<{
    token: string
    user: AuthUser
    workspaces: Workspace[]
  }>('/auth/login', input)
  return data
}

export async function fetchMe() {
  const { data } = await client.get<{ user: AuthUser; workspaces: Workspace[] }>('/auth/me')
  return data
}

export async function fetchWorkspaces() {
  const { data } = await client.get<{ workspaces: Workspace[] }>('/workspaces')
  return data.workspaces
}

export async function createWorkspace(name: string) {
  const { data } = await client.post<{ workspace: Workspace }>('/workspaces', { name })
  return data.workspace
}

export async function fetchWorkspaceProspects(workspaceId: string) {
  const { data } = await client.get<{ prospects: Prospect[] }>(
    `/workspaces/${workspaceId}/prospects`
  )
  return data.prospects
}

export async function createWorkspaceProspect(workspaceId: string, prospect: Prospect) {
  const { data } = await client.post<{ prospect: Prospect }>(
    `/workspaces/${workspaceId}/prospects`,
    { prospect }
  )
  return data.prospect
}

export async function patchWorkspaceProspect(
  workspaceId: string,
  prospectId: string,
  patch: Partial<Prospect>
) {
  const { data } = await client.patch<{ prospect: Prospect }>(
    `/workspaces/${workspaceId}/prospects/${prospectId}`,
    patch
  )
  return data.prospect
}

export async function deleteWorkspaceProspect(workspaceId: string, prospectId: string) {
  await client.delete(`/workspaces/${workspaceId}/prospects/${prospectId}`)
}

export async function fetchMembers(workspaceId: string) {
  const { data } = await client.get<{ members: WorkspaceMember[] }>(
    `/workspaces/${workspaceId}/members`
  )
  return data.members
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole
) {
  const { data } = await client.post<{ member: WorkspaceMember }>(
    `/workspaces/${workspaceId}/members`,
    { email, role }
  )
  return data.member
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole
) {
  const { data } = await client.patch<{ member: WorkspaceMember }>(
    `/workspaces/${workspaceId}/members/${memberId}`,
    { role }
  )
  return data.member
}

export async function removeMember(workspaceId: string, memberId: string) {
  await client.delete(`/workspaces/${workspaceId}/members/${memberId}`)
}

export async function fetchComments(workspaceId: string, prospectId: string) {
  const { data } = await client.get<{ comments: ProspectComment[] }>(
    `/workspaces/${workspaceId}/prospects/${prospectId}/comments`
  )
  return data.comments
}

export async function postComment(
  workspaceId: string,
  prospectId: string,
  body: string
) {
  const { data } = await client.post<{ comment: ProspectComment }>(
    `/workspaces/${workspaceId}/prospects/${prospectId}/comments`,
    { body }
  )
  return data.comment
}

export async function fetchNotifications(workspaceId: string) {
  const { data } = await client.get<{ notifications: WorkspaceNotification[] }>(
    `/workspaces/${workspaceId}/notifications`
  )
  return data.notifications
}

export async function markNotificationRead(workspaceId: string, notificationId: string) {
  const { data } = await client.patch<{ notification: WorkspaceNotification }>(
    `/workspaces/${workspaceId}/notifications/${notificationId}/read`
  )
  return data.notification
}

export async function markAllNotificationsRead(workspaceId: string) {
  await client.patch(`/workspaces/${workspaceId}/notifications/read-all`)
}

export async function fetchAuditLogs(workspaceId: string) {
  const { data } = await client.get<{ logs: AuditLogEntry[] }>(
    `/workspaces/${workspaceId}/audit`
  )
  return data.logs
}

export function getCollaborationErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const path = error.config?.url ?? ''
    if (status === 404 && path.includes('/auth/')) {
      return 'Authentication API is unavailable. Restart the backend with npm run dev:backend.'
    }
    if (status === 404 && (path.includes('/integrations') || path.includes('/prospects'))) {
      return 'Workspace API route not found. Restart the backend with npm run dev:backend.'
    }
    return error.response?.data?.error ?? error.message
  }
  if (error instanceof Error) return error.message
  return 'Request failed'
}

/** Shared authenticated API client for workspace-scoped endpoints. */
export { client as apiClient }
