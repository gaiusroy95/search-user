import { memo, useMemo } from 'react'
import {
  Building2,
  GitCommit,
  Globe,
  Mail,
  MapPin,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CopyableText } from '@/components/results/CopyableText'
import { DeveloperActions } from '@/components/results/DeveloperActions'
import { DeveloperBadgePanel } from '@/components/results/DeveloperBadgePanel'
import { analyzeDeveloper } from '@/lib/developerAnalysis'
import { useUIStore } from '@/stores/useUIStore'
import type { Developer } from '@/types'
import { formatNumber } from '@/lib/utils'

interface DiscoverProfileCardProps {
  developer: Developer
  country: string
  index: number
}

export const DiscoverProfileCard = memo(function DiscoverProfileCard({
  developer,
  country,
  index,
}: DiscoverProfileCardProps) {
  const openDrawer = useUIStore((s) => s.openDeveloperDrawer)
  const analysis = useMemo(() => analyzeDeveloper(developer), [developer])

  const topLanguages = useMemo(() => {
    const langs = new Set<string>()
    if (developer.primaryLanguage) langs.add(developer.primaryLanguage)
    developer.languages.slice(0, 3).forEach((l) => langs.add(l))
    return Array.from(langs).slice(0, 4)
  }, [developer])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.32), duration: 0.25 }}
    >
      <Card
        className="group flex h-full cursor-pointer flex-col overflow-hidden border-border/60 bg-card transition-all duration-200 hover:border-border hover:shadow-md"
        onClick={() => openDrawer(developer)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openDrawer(developer)}
        aria-label={`View profile for ${developer.username}`}
      >
        <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
          <div className="flex items-start gap-4">
            <Avatar size="lg" className="ring-2 ring-background">
              <AvatarImage
                src={developer.avatar ?? `https://github.com/${developer.username}.png`}
                alt=""
              />
              <AvatarFallback>
                {developer.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold tracking-tight">
                {developer.name ?? developer.username}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                @{developer.username}
              </p>
              {(developer.company || developer.location) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {developer.company && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{developer.company}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{developer.location ?? country}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          {developer.bio && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {developer.bio}
            </p>
          )}

          <DeveloperBadgePanel analysis={analysis} compact />

          {topLanguages.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {topLanguages.map((lang) => (
                <Badge key={lang} variant="secondary" className="text-[11px] font-normal">
                  {lang}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
            <div>
              <p className="text-sm font-semibold tabular-nums">
                {formatNumber(developer.followers)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Followers
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold tabular-nums">{developer.publicRepos}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Repos</p>
            </div>
            <div>
              <p className="text-sm font-semibold tabular-nums">
                {formatNumber(developer.following)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Following
              </p>
            </div>
          </div>

          <div
            className="space-y-1.5"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {(developer.email || analysis.contactEmail) && (
              <CopyableText
                value={developer.email || analysis.contactEmail || ''}
                label="email"
                className="text-xs text-primary"
                icon={<Mail className="h-3.5 w-3.5 shrink-0" />}
              />
            )}
            {developer.website && (
              <CopyableText
                value={developer.website}
                label="website"
                className="text-xs"
                icon={<Globe className="h-3.5 w-3.5 shrink-0" />}
              />
            )}
          </div>

          {developer.activity?.lastCommitAt && (
            <div className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <GitCommit className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Last commit{' '}
                {new Date(developer.activity.lastCommitAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          <div
            className="mt-auto border-t border-border/40 pt-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <DeveloperActions developer={developer} country={country} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
})
