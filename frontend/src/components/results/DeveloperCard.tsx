import { memo } from 'react'
import { Globe, Mail, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommitSnippet } from '@/components/results/CommitSnippet'
import { DeveloperActions } from '@/components/results/DeveloperActions'
import { useUIStore } from '@/stores/useUIStore'
import type { Developer } from '@/types'
import { formatNumber } from '@/lib/utils'

interface DeveloperCardProps {
  developer: Developer
  country: string
  userNumber: number
  index: number
}

export const DeveloperCard = memo(function DeveloperCard({
  developer,
  country,
  userNumber,
  index,
}: DeveloperCardProps) {
  const openDrawer = useUIStore((s) => s.openDeveloperDrawer)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Card
        className="card-lift h-full cursor-pointer overflow-hidden"
        onClick={() => openDrawer(developer)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openDrawer(developer)}
        aria-label={`View details for ${developer.username}`}
      >
        <CardContent className="p-4">
          <div className="mb-3 flex items-start gap-3">
            <span className="text-xs font-bold text-muted-foreground">#{userNumber}</span>
            <Avatar size="md" className="border border-border/60">
              <AvatarImage
                src={developer.avatar ?? `https://github.com/${developer.username}.png`}
                alt=""
              />
              <AvatarFallback>
                {developer.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">
                {developer.name ?? developer.username}
              </p>
              <p className="truncate text-xs text-muted-foreground">@{developer.username}</p>
            </div>
            {developer.primaryLanguage && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {developer.primaryLanguage}
              </Badge>
            )}
          </div>

          <div className="mb-3 space-y-1 rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <p className="truncate">{developer.location ?? country}</p>
            <p className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {formatNumber(developer.followers)} followers
              </span>
              <span>{developer.publicRepos} repos</span>
            </p>
          </div>

          {(developer.email || developer.website) && (
            <div className="mb-3 space-y-1 text-xs">
              {developer.email && (
                <p className="flex items-center gap-1 truncate text-primary">
                  <Mail className="h-3 w-3 shrink-0" />
                  {developer.email}
                </p>
              )}
              {developer.website && (
                <p className="flex items-center gap-1 truncate">
                  <Globe className="h-3 w-3 shrink-0" />
                  {developer.website}
                </p>
              )}
            </div>
          )}

          <div className="mb-3">
            <CommitSnippet
              activity={developer.activity}
              accountCreatedAt={developer.createdAt}
              compact
            />
          </div>

          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <DeveloperActions developer={developer} country={country} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
