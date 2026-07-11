import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  AtSign,
  Building2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Search,
  Star,
  Users,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LookupPageSkeleton } from '@/components/loading'
import { lookupUserByEmail, getApiErrorMessage } from '@/services/api'
import { CommitMeta } from '@/components/results/CommitMeta'
import { formatDate, formatNumber } from '@/lib/utils'
import { toast } from '@/stores/useToastStore'

export function UserLookupPage() {
  const [email, setEmail] = useState('')

  const lookup = useMutation({
    mutationFn: (value: string) => lookupUserByEmail(value),
    onError: (error) => {
      toast({
        title: 'Lookup failed',
        description: getApiErrorMessage(error),
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = email.trim()
    if (!value) {
      toast({
        title: 'Email required',
        description: 'Enter a Gmail or public email address.',
        variant: 'destructive',
      })
      return
    }
    lookup.mutate(value)
  }

  const user = lookup.data?.user
  const projects = lookup.data?.projects ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">User Lookup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter a public email (e.g. Gmail) to find a GitHub profile and projects.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={lookup.isPending} className="w-full sm:w-auto">
                <Search className="h-4 w-4" />
                Get User Info
              </Button>
            </div>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Only public GitHub emails are searchable. You can also enter a GitHub username.
          </p>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {lookup.isPending && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LookupPageSkeleton />
          </motion.div>
        )}

        {user && !lookup.isPending && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={user.avatar ?? `https://github.com/${user.username}.png`}
                    alt=""
                    className="h-16 w-16 rounded-full border border-border"
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle>{user.name ?? user.username}</CardTitle>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    {user.primaryLanguage && (
                      <Badge variant="secondary" className="mt-2">
                        {user.primaryLanguage}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.profile} target="_blank" rel="noopener noreferrer">
                      Profile
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.bio && (
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                )}

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email ?? 'Not public'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.location ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{user.company ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatNumber(user.followers)} followers ·{' '}
                      {formatNumber(user.following)} following
                    </span>
                  </div>
                  {user.website && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-primary hover:underline"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  {user.twitter && (
                    <div className="flex items-center gap-2">
                      <AtSign className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`https://twitter.com/${user.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        @{user.twitter}
                      </a>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {user.activity && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Commit Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Account created:</span>{' '}
                    {formatDate(user.activity.accountCreatedAt)}
                  </p>
                  {user.activity.lastCommitAt && (
                    <p>
                      <span className="text-muted-foreground">Last commit:</span>{' '}
                      {formatDate(user.activity.lastCommitAt)}
                    </p>
                  )}
                  {user.activity.recentCommits[0] && (
                    <CommitMeta commit={user.activity.recentCommits[0]} />
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Projects ({projects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No public repositories found.</p>
                ) : (
                  <ul className="space-y-3">
                    {projects.map((project) => (
                      <li
                        key={project.url}
                        className="flex items-start justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="min-w-0">
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                          >
                            {project.name}
                          </a>
                          {project.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {project.language && <span>{project.language}</span>}
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {project.stars}
                            </span>
                            {project.createdAt && (
                              <span>Created {formatDate(project.createdAt)}</span>
                            )}
                          </div>
                          {project.latestCommit && (
                            <CommitMeta commit={project.latestCommit} />
                          )}
                        </div>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label={`Open ${project.name}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
