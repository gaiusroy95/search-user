import axios from 'axios'
import type {
  LookupResponse,
  SearchFilters,
  SearchResponse,
  VaultCategory,
  VaultRecord,
} from '@/types'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

export async function getUserDetails(username: string): Promise<LookupResponse> {
  const { data } = await client.get<LookupResponse>(`/users/${encodeURIComponent(username)}`)
  return data
}

export async function lookupUserByEmail(email: string): Promise<LookupResponse> {
  const { data } = await client.post<LookupResponse>('/lookup-user', { email })
  return data
}

export async function searchDevelopers(
  filters: SearchFilters,
  page = 1
): Promise<SearchResponse> {
  const payload = {
    country: filters.country,
    maxFollowers: filters.maxFollowers || undefined,
    maxRepos: filters.maxRepos || undefined,
    maxFollowing: filters.maxFollowing || undefined,
    type: filters.type,
    limit: filters.limit ?? 10,
    page,
  }
  const { data } = await client.post<SearchResponse>('/search-users', payload)
  return data
}

export interface VaultData {
  categories: VaultCategory[]
  records: VaultRecord[]
}

export async function fetchVault(password: string): Promise<VaultData> {
  const { data } = await client.get<VaultData>('/vault', {
    headers: { 'X-Vault-Password': password },
  })
  return data
}

export async function saveVault(
  password: string,
  vault: VaultData
): Promise<void> {
  await client.put('/vault', {
    password,
    categories: vault.categories,
    records: vault.records,
  })
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? error.message
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}
