import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, KeyRound } from 'lucide-react'
import axios from 'axios'
import { queryKeys } from '@/lib/queryKeys'
import { API_BASE_URL } from '@/lib/env'

async function fetchHealth() {
  const { data } = await axios.get<{ status: string; tokenConfigured: boolean }>(
    `${API_BASE_URL}/health`
  )
  return data
}

export function ApiSetupBanner() {
  const { data } = useQuery({
    queryKey: queryKeys.health(),
    queryFn: fetchHealth,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  })

  if (!data || data.tokenConfigured) return null

  return (
    <div
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3"
      role="status"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 text-sm text-amber-200 sm:items-center">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
        <p>
          <strong className="font-medium">GitHub token not configured.</strong>{' '}
          Without <code className="rounded bg-black/20 px-1">GITHUB_TOKEN</code> in{' '}
          <code className="rounded bg-black/20 px-1">backend/.env</code>, GitHub limits
          you to 60 API calls/hour and searches will fail.{' '}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-2"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Create a token
          </a>
        </p>
      </div>
    </div>
  )
}
