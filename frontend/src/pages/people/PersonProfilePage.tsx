import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  GitCommit,
  Globe,
  Link2,
  Mail,
  MapPin,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyableText } from '@/components/results/CopyableText'
import { CommitMeta } from '@/components/results/CommitMeta'
import { EmptyState } from '@/components/ui/empty-state'
import { ProfilePageSkeleton } from '@/components/loading'
import { getApiErrorMessage } from '@/services/api'
import { useUserDetails } from '@/hooks/useUserDetails'
import { analyzeDeveloper } from '@/lib/developerAnalysis'
import {
  collectSkills,
  generatePersonInsights,
  getPersonContact,
  inferRole,
} from '@/lib/personProfile'
import { ROUTES } from '@/lib/routes'
import { formatDate, formatNumber } from '@/lib/utils'
import type { RepositorySummary } from '@/types'

function SectionCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function ProjectRow({ repo }: { repo: RepositorySummary }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-primary hover:underline"
        >
          {repo.name}
        </a>
        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
          <span className="flex items-center gap-0.5">
            <Star className="h-3 w-3" />
            {repo.stars}
          </span>
        </div>
      </div>
      {repo.description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {repo.description}
        </p>
      )}
      {repo.latestCommit && <CommitMeta commit={repo.latestCommit} />}
    </div>
  )
}

export function PersonProfilePage() {
  const { id } = useParams<{ id: string }>()
  const username = id?.trim() ?? ''

  const { data, isLoading, isError, error } = useUserDetails(username)

  if (!username) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <EmptyState title="No profile selected" description="Invalid profile URL." />
      </div>
    )
  }

  if (isLoading) return <ProfilePageSkeleton />

  if (isError || !data?.user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <EmptyState
          title="Profile not found"
          description={getApiErrorMessage(error)}
          action={
            <Button variant="outline" asChild>
              <Link to={ROUTES.people}>Back to People</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const dev = data.user
  const projects = data.projects.length > 0 ? data.projects : dev.repositories
  const analysis = analyzeDeveloper(dev)
  const contact = getPersonContact(dev, analysis)
  const insights = generatePersonInsights(dev, analysis)
  const skills = collectSkills(dev)
  const role = inferRole(dev)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground" asChild>
        <Link to={ROUTES.people}>
          <ArrowLeft className="h-4 w-4" />
          People
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <Avatar size="xl" className="ring-2 ring-border/60">
                  <AvatarImage
                    src={dev.avatar ?? `https://github.com/${dev.username}.png`}
                    alt=""
                  />
                  <AvatarFallback>{dev.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {dev.name ?? dev.username}
                  </h1>
                  <p className="mt-1 text-base text-muted-foreground">{role}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {dev.company && (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 shrink-0" />
                        {dev.company}
                      </span>
                    )}
                    {dev.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {dev.location}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {formatNumber(dev.followers)} followers
                    </span>
                    <span className="text-muted-foreground">{dev.publicRepos} repos</span>
                    <a
                      href={dev.profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      @{dev.username}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Professional Summary */}
          <SectionCard title="Professional Summary">
            {dev.bio ? (
              <p className="text-sm leading-relaxed text-foreground/90">{dev.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No public bio available.</p>
            )}
          </SectionCard>

          {/* 3. Technical Skills */}
          <SectionCard title="Technical Skills">
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No language data available.</p>
            )}
          </SectionCard>

          {/* 4. GitHub Activity */}
          <SectionCard title="GitHub Activity">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {dev.createdAt && (
                <div>
                  <dt className="text-muted-foreground">Member since</dt>
                  <dd className="mt-0.5 font-medium">
                    {new Date(dev.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </dd>
                </div>
              )}
              {dev.activity?.lastCommitAt && (
                <div>
                  <dt className="text-muted-foreground">Last commit</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(dev.activity.lastCommitAt)}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Following</dt>
                <dd className="mt-0.5 font-medium">{formatNumber(dev.following)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contact score</dt>
                <dd className="mt-0.5 font-medium">
                  {analysis.score}/100 · {analysis.levelLabel}
                </dd>
              </div>
            </dl>
            {dev.activity?.recentCommits?.[0] && (
              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <GitCommit className="h-3.5 w-3.5" />
                  Recent commit
                </p>
                <CommitMeta commit={dev.activity.recentCommits[0]} />
              </div>
            )}
          </SectionCard>

          {/* 5. Projects */}
          <SectionCard title="Projects">
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 6).map((repo) => (
                  <ProjectRow key={repo.name} repo={repo} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No public repositories listed.</p>
            )}
          </SectionCard>

          {/* 6. Company Info */}
          <SectionCard title="Company Info">
            {dev.company ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium">{dev.company}</p>
                {dev.location && (
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {dev.location}
                  </p>
                )}
                {contact.companyWebsite && (
                  <a
                    href={contact.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Company website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No company listed on profile.</p>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-6">
          {/* 7. Contact Methods */}
          <SectionCard title="Contact">
            <div className="space-y-4">
              {contact.businessEmail ? (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Business email</p>
                  <CopyableText
                    value={contact.businessEmail}
                    label="business email"
                    className="text-sm"
                    icon={<Mail className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No business email on file.</p>
              )}
              {contact.companyWebsite && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Company website</p>
                  <CopyableText
                    value={contact.companyWebsite}
                    label="website"
                    className="text-sm"
                    icon={<Globe className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  />
                </div>
              )}
              {contact.linkedIn && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">LinkedIn</p>
                  <a
                    href={contact.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Link2 className="h-4 w-4" />
                    View profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </SectionCard>

          {/* 8. AI Insights */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Skill summary
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{insights.skillSummary}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Strength analysis
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{insights.strengthAnalysis}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Outreach suggestion
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{insights.outreachSuggestion}</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
