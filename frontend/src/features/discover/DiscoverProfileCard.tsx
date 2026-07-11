import { memo } from 'react'
import { Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { CopyableText } from '@/components/results/CopyableText'
import { DeveloperActions } from '@/components/results/DeveloperActions'
import type { Developer } from '@/types'

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
  const displayName = developer.name?.trim() || developer.username
  const email = developer.email?.trim() || null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.12), duration: 0.2 }}
    >
      <Card className="flex h-full flex-col overflow-hidden border-border/60 bg-card">
        <div className="flex items-start gap-4 px-5 py-4">
          <Avatar size="lg" className="ring-2 ring-background">
            <AvatarImage
              src={developer.avatar ?? `https://github.com/${developer.username}.png`}
              alt=""
            />
            <AvatarFallback>
              {developer.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="truncate text-base font-semibold tracking-tight">{displayName}</p>
              <a
                href={developer.profile}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                @{developer.username}
              </a>
            </div>

            {email ? (
              <CopyableText
                value={email}
                label="email"
                className="text-sm text-primary"
                icon={<Mail className="h-3.5 w-3.5 shrink-0" />}
              />
            ) : (
              <p className="text-xs text-muted-foreground">No email found</p>
            )}
          </div>
        </div>

        <div className="mt-auto border-t border-border/40 px-5 py-4">
          <DeveloperActions developer={developer} country={country} />
        </div>
      </Card>
    </motion.div>
  )
})
