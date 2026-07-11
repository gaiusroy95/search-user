import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Building2, Code2, Globe, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { CompanyDirectoryEntry } from '@/lib/companiesDirectory'
import { companyRoute } from '@/lib/routes'
import { cn } from '@/lib/utils'

interface CompanyCardProps {
  company: CompanyDirectoryEntry
  className?: string
}

export const CompanyCard = memo(function CompanyCard({ company, className }: CompanyCardProps) {
  return (
    <Link to={companyRoute(company.slug)} className={cn('group block h-full', className)}>
      <Card className="flex h-full flex-col border-border/60 transition-all duration-200 hover:border-border hover:shadow-md">
        <div className="flex items-start gap-4 border-b border-border/40 bg-muted/20 p-5">
          <Avatar size="lg" className="ring-2 ring-background">
            {company.avatar ? (
              <AvatarImage src={company.avatar} alt="" />
            ) : (
              <AvatarFallback>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold tracking-tight group-hover:text-primary">
              {company.name}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{company.industry}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {company.activelyHiring ? (
                <Badge variant="default" className="text-[10px]">
                  Hiring
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {company.hiringStatus}
                </Badge>
              )}
              {company.enriched && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  Verified org
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Team size
              </div>
              <p className="mt-1 font-medium tabular-nums">{company.teamSizeLabel}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                Open roles
              </div>
              <p className="mt-1 font-medium tabular-nums">
                {company.openRoles > 0 ? 'Hiring signal' : 'None listed'}
              </p>
            </div>
          </div>

          <div className="mt-auto space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">@{company.githubOrg}</span>
            </div>
            {company.domain && (
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{company.domain}</span>
              </div>
            )}
            {company.country && <p className="truncate">{company.country}</p>}
          </div>
        </div>
      </Card>
    </Link>
  )
})

export function CompanyCardSkeleton() {
  return (
    <Card className="min-h-[280px] animate-pulse border-border/60">
      <div className="flex gap-4 border-b border-border/40 bg-muted/20 p-5">
        <div className="h-12 w-12 rounded-full bg-muted/80" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-2/3 rounded bg-muted/80" />
          <div className="h-3 w-1/2 rounded bg-muted/80" />
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-lg bg-muted/80" />
          <div className="h-16 rounded-lg bg-muted/80" />
        </div>
        <div className="h-3 w-1/2 rounded bg-muted/80" />
        <div className="h-3 w-2/3 rounded bg-muted/80" />
      </div>
    </Card>
  )
}
