import { memo, useMemo } from 'react'
import { Globe, Mail, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CommitSnippet } from '@/components/results/CommitSnippet'
import { CopyableText } from '@/components/results/CopyableText'
import { DeveloperBadgePanel } from '@/components/results/DeveloperBadgePanel'
import { DeveloperActions } from '@/components/results/DeveloperActions'
import { analyzeDeveloper } from '@/lib/developerAnalysis'
import { useUIStore } from '@/stores/useUIStore'
import type { Developer } from '@/types'
import { formatNumber } from '@/lib/utils'

interface DeveloperListItemProps {
  developer: Developer
  country: string
  userNumber: number
}

export const DeveloperListItem = memo(function DeveloperListItem({
  developer,
  country,
  userNumber,
}: DeveloperListItemProps) {
  const openDrawer = useUIStore((s) => s.openDeveloperDrawer)
  const analysis = useMemo(() => analyzeDeveloper(developer), [developer])

  return (
    <div
      className="flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-start"
      onClick={() => openDrawer(developer)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openDrawer(developer)}
      aria-label={`View details for ${developer.username}`}
    >
      <span className="w-8 shrink-0 text-center text-sm font-semibold text-muted-foreground">
        #{userNumber}
      </span>
      <img
        src={developer.avatar ?? `https://github.com/${developer.username}.png`}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full border border-border"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{developer.name ?? developer.username}</p>
          <span className="text-sm text-muted-foreground">@{developer.username}</span>
          {developer.primaryLanguage && (
            <Badge variant="secondary" className="text-xs">
              {developer.primaryLanguage}
            </Badge>
          )}
        </div>

        <div className="mt-2">
          <DeveloperBadgePanel analysis={analysis} compact />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{developer.location ?? country}</span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatNumber(developer.followers)} / {formatNumber(developer.following)}
          </span>
          <span>{developer.publicRepos} repos</span>
        </div>

        <div
          className="mt-2 flex flex-wrap gap-3 text-xs"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {(developer.email || analysis.contactEmail) && (
            <CopyableText
              value={developer.email || analysis.contactEmail || ''}
              label="email"
              className="text-primary"
              icon={<Mail className="h-3 w-3 shrink-0" />}
            />
          )}
          {developer.website && (
            <CopyableText
              value={developer.website}
              label="website"
              icon={<Globe className="h-3 w-3 shrink-0" />}
            />
          )}
        </div>

        <div className="mt-2 max-w-xl">
          <CommitSnippet
            activity={developer.activity}
            accountCreatedAt={developer.createdAt}
            compact
          />
        </div>
      </div>
      <div
        className="shrink-0"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DeveloperActions developer={developer} country={country} compact />
      </div>
    </div>
  )
})
