import {
  AtSign,
  Building2,
  Calendar,
  Code2,
  Globe,
  Mail,
  MapPin,
  Star,
  Users,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { CommitMeta } from '@/components/results/CommitMeta'
import { DrawerContentSkeleton } from '@/components/loading'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserDetails } from '@/hooks/useUserDetails'
import { useUIStore } from '@/stores/useUIStore'
import { formatDate, formatNumber } from '@/lib/utils'

function SeparatorLine() {
  return <div className="my-4 h-px bg-border" />
}

export function DeveloperDetailsDrawer() {
  const selectedDeveloper = useUIStore((s) => s.selectedDeveloper)
  const drawerOpen = useUIStore((s) => s.drawerOpen)
  const closeDeveloperDrawer = useUIStore((s) => s.closeDeveloperDrawer)

  const { data, isLoading } = useUserDetails(
    selectedDeveloper?.username,
    drawerOpen && Boolean(selectedDeveloper?.username)
  )

  const dev = data?.user ?? selectedDeveloper

  return (
    <Sheet open={drawerOpen} onOpenChange={(open) => !open && closeDeveloperDrawer()}>
      <SheetContent aria-describedby="drawer-description">
        {isLoading && !data ? (
          <DrawerContentSkeleton />
        ) : dev ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-4 pr-8">
                <img
                  src={dev.avatar ?? `https://github.com/${dev.username}.png`}
                  alt=""
                  className="h-16 w-16 rounded-full border border-border"
                />
                <div>
                  <SheetTitle>{dev.name ?? dev.username}</SheetTitle>
                  <SheetDescription id="drawer-description">
                    @{dev.username}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {isLoading && (
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}

              {dev.bio && (
                <p className="text-sm text-muted-foreground">{dev.bio}</p>
              )}

              <SeparatorLine />

              <section aria-label="Profile information">
                <h3 className="mb-3 text-sm font-semibold">Profile Information</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <dd>{dev.location ?? '—'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <dd>{dev.company ?? '—'}</dd>
                  </div>
                  {dev.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <dd>Joined {new Date(dev.createdAt).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <SeparatorLine />

              <section aria-label="GitHub statistics">
                <h3 className="mb-3 text-sm font-semibold">GitHub Statistics</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Followers', value: formatNumber(dev.followers), icon: Users },
                    { label: 'Following', value: formatNumber(dev.following), icon: Users },
                    { label: 'Repos', value: dev.publicRepos, icon: Code2 },
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border bg-muted/30 p-3 text-center"
                    >
                      <Icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-semibold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </section>

              {dev.languages.length > 0 && (
                <>
                  <SeparatorLine />
                  <section aria-label="Languages">
                    <h3 className="mb-3 text-sm font-semibold">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {dev.languages.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {dev.activity && (
                <>
                  <SeparatorLine />
                  <section aria-label="Commit activity">
                    <h3 className="mb-3 text-sm font-semibold">Commit Activity</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Account created</dt>
                        <dd>{formatDate(dev.activity.accountCreatedAt)}</dd>
                      </div>
                      {dev.activity.lastCommitAt && (
                        <div>
                          <dt className="text-muted-foreground">Last commit</dt>
                          <dd>{formatDate(dev.activity.lastCommitAt)}</dd>
                        </div>
                      )}
                    </dl>
                    {dev.activity.recentCommits[0] && (
                      <div className="mt-3">
                        <CommitMeta commit={dev.activity.recentCommits[0]} />
                      </div>
                    )}
                  </section>
                </>
              )}

              {dev.repositories.length > 0 && (
                <>
                  <SeparatorLine />
                  <section aria-label="Repositories">
                    <h3 className="mb-3 text-sm font-semibold">Repositories</h3>
                    <ul className="space-y-3">
                      {dev.repositories.map((repo) => (
                        <li
                          key={repo.name}
                          className="rounded-lg border border-border p-3 text-sm"
                        >
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                          >
                            {repo.name}
                          </a>
                          {repo.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {repo.language && <span>{repo.language}</span>}
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {repo.stars}
                            </span>
                            {repo.createdAt && (
                              <span>Created {formatDate(repo.createdAt)}</span>
                            )}
                          </div>
                          {repo.latestCommit && (
                            <CommitMeta commit={repo.latestCommit} />
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}

              <SeparatorLine />

              <section aria-label="Public contact information">
                <h3 className="mb-3 text-sm font-semibold">Public Contact Information</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {dev.email ? (
                      <a href={`mailto:${dev.email}`} className="text-primary hover:underline">
                        {dev.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Not public</span>
                    )}
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {dev.website ? (
                      <a
                        href={dev.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:underline"
                      >
                        {dev.website}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </li>
                  <li className="flex items-center gap-2">
                    <AtSign className="h-4 w-4 text-muted-foreground" />
                    {dev.twitter ? (
                      <a
                        href={`https://twitter.com/${dev.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        @{dev.twitter}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </li>
                </ul>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
