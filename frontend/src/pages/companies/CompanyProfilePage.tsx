import { Link, useParams } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Code2,
  ExternalLink,
  Globe,
  MapPin,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyableText } from '@/components/results/CopyableText'
import { EmptyState } from '@/components/ui/empty-state'
import { ProfilePageSkeleton } from '@/components/loading'
import { getApiErrorMessage } from '@/services/api'
import { useUserDetails } from '@/hooks/useUserDetails'
import { useActivityStore } from '@/stores/useActivityStore'
import {
  buildCompanyFromOrg,
  findKeyPeople,
  formatTeamSize,
} from '@/lib/companyProfile'
import { parseCompanySlug } from '@/lib/companyProfile'
import { personRoute, ROUTES } from '@/lib/routes'
import { useCompaniesStore } from '@/stores/useCompaniesStore'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useProspectStore } from '@/stores/useProspectStore'

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

export function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>()
  const slug = id?.trim() ?? ''
  const discoveryDevelopers = useDiscoveryStore((s) => s.developers)
  const prospects = useProspectStore((s) => s.prospects)

  const { data, isLoading, isError, error } = useUserDetails(slug)
  const logCompanyView = useActivityStore((s) => s.logCompanyView)
  const enrichFromProfile = useCompaniesStore((s) => s.enrichFromProfile)
  const loggedSlugRef = useRef<string | null>(null)

  useEffect(() => {
    if (!data?.user || !slug || loggedSlugRef.current === slug) return
    loggedSlugRef.current = slug

    const repos = data.projects.length > 0 ? data.projects : data.user.repositories
    const profile = buildCompanyFromOrg(slug, data.user, repos)
    const keyPeople = findKeyPeople(discoveryDevelopers, profile.name, slug)
    const pipelineMatches = prospects.filter(
      (p) => p.company && parseCompanySlug(p.company) === slug
    ).length
    const employeeCount = Math.max(keyPeople.length, pipelineMatches)
    const viewedAt = new Date().toISOString()

    logCompanyView(slug, profile.name)
    enrichFromProfile(profile, employeeCount, viewedAt)
  }, [
    slug,
    data,
    discoveryDevelopers,
    prospects,
    logCompanyView,
    enrichFromProfile,
  ])

  if (!slug) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <EmptyState title="No company selected" description="Invalid company URL." />
      </div>
    )
  }

  if (isLoading) return <ProfilePageSkeleton />

  if (isError || !data?.user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <EmptyState
          title="Company not found"
          description={getApiErrorMessage(error)}
          action={
            <Button variant="outline" asChild>
              <Link to={ROUTES.companies}>Back to Companies</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const repos = data.projects.length > 0 ? data.projects : data.user.repositories
  const company = buildCompanyFromOrg(slug, data.user, repos)
  const keyPeople = findKeyPeople(discoveryDevelopers, company.name, slug)
  const teamSizeLabel = formatTeamSize(company, keyPeople.length)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground" asChild>
        <Link to={ROUTES.companies}>
          <ArrowLeft className="h-4 w-4" />
          Companies
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Header / Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                  {company.avatar ? (
                    <img
                      src={company.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{company.industry}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {company.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {company.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 shrink-0" />
                      {company.publicRepos} public repos
                    </span>
                  </div>
                  {company.profileUrl && (
                    <a
                      href={company.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View on GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionCard title="Company Overview">
            {company.overview ? (
              <p className="text-sm leading-relaxed text-foreground/90">{company.overview}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No public description available for this organization.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Industry">
            <p className="text-sm font-medium">{company.industry}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Inferred from organization profile and repository signals.
            </p>
          </SectionCard>

          <SectionCard title="Team Size">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{teamSizeLabel}</p>
            </div>
            {keyPeople.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Based on developers in your discovery session linked to this company.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Technology Stack">
            {company.techStack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {company.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="font-normal">
                    {tech}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No language data from public repositories.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Key People">
            {keyPeople.length > 0 ? (
              <ul className="divide-y divide-border/60">
                {keyPeople.map((person) => (
                  <li key={person.username} className="flex items-center gap-3 py-3 first:pt-0">
                    <Avatar size="sm">
                      <AvatarImage
                        src={person.avatar ?? `https://github.com/${person.username}.png`}
                        alt=""
                      />
                      <AvatarFallback>
                        {person.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={personRoute(person.username)}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {person.name ?? person.username}
                      </Link>
                      {person.role && (
                        <p className="truncate text-xs text-muted-foreground">{person.role}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={personRoute(person.username)}>Profile</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No linked people yet. Run a Discover search to surface developers at this company.
              </p>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard title="Hiring Status">
            <div className="flex items-start gap-3">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <Badge variant={company.activelyHiring ? 'default' : 'secondary'}>
                  {company.hiringStatus}
                </Badge>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Derived from public organization description. Verify on the company website.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Website">
            {company.website ? (
              <CopyableText
                value={company.website}
                label="website"
                className="text-sm"
                icon={<Globe className="h-4 w-4 shrink-0 text-muted-foreground" />}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No website listed.</p>
            )}
          </SectionCard>

          <SectionCard title="Contact Page">
            {company.contactPageUrl ? (
              <div className="space-y-2">
                <a
                  href={company.contactPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {company.contactPageUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-xs text-muted-foreground">
                  Standard /contact path based on the company website.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No website available to derive a contact page.
              </p>
            )}
          </SectionCard>
        </aside>
      </div>
    </div>
  )
}
