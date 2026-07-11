import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Developer } from '@/types'
import { useProspectStore } from '@/stores/useProspectStore'
import { formatNumber } from '@/lib/utils'

const CHART_COLORS = [
  'oklch(0.55 0.18 265)',
  'oklch(0.65 0.15 200)',
  'oklch(0.6 0.16 145)',
  'oklch(0.7 0.14 85)',
  'oklch(0.55 0.2 25)',
  'oklch(0.5 0.12 300)',
]

interface AnalyticsDashboardProps {
  developers: Developer[]
}

function bucketFollowers(n: number): string {
  if (n < 100) return '0–99'
  if (n < 500) return '100–499'
  if (n < 1000) return '500–999'
  if (n < 5000) return '1K–5K'
  return '5K+'
}

function bucketRepos(n: number): string {
  if (n < 10) return '0–9'
  if (n < 30) return '10–29'
  if (n < 50) return '30–49'
  return '50+'
}

export function AnalyticsDashboard({ developers }: AnalyticsDashboardProps) {
  const prospects = useProspectStore((s) => s.prospects)

  const stats = useMemo(() => {
    const countries: Record<string, number> = {}
    const languages: Record<string, number> = {}
    const followersBuckets: Record<string, number> = {}
    const reposBuckets: Record<string, number> = {}

    for (const d of developers) {
      const country = d.location?.split(',').pop()?.trim() ?? 'Unknown'
      countries[country] = (countries[country] || 0) + 1

      if (d.primaryLanguage) {
        languages[d.primaryLanguage] = (languages[d.primaryLanguage] || 0) + 1
      }

      const fb = bucketFollowers(d.followers)
      followersBuckets[fb] = (followersBuckets[fb] || 0) + 1

      const rb = bucketRepos(d.publicRepos)
      reposBuckets[rb] = (reposBuckets[rb] || 0) + 1
    }

    const toChart = (obj: Record<string, number>) =>
      Object.entries(obj)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)

    return {
      countries: toChart(countries),
      languages: toChart(languages),
      followers: Object.entries(followersBuckets).map(([name, value]) => ({
        name,
        value,
      })),
      repos: Object.entries(reposBuckets).map(([name, value]) => ({
        name,
        value,
      })),
      uniqueCountries: Object.keys(countries).length,
      topLanguage: toChart(languages)[0]?.name ?? '—',
    }
  }, [developers])

  const summaryCards = [
    { title: 'Developers Found', value: developers.length },
    { title: 'Saved Prospects', value: prospects.length },
    { title: 'Countries', value: stats.uniqueCountries },
    { title: 'Top Language', value: stats.topLanguage },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Insights from your latest discovery session.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {typeof card.value === 'number'
                  ? formatNumber(card.value)
                  : card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Developers by Country">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.countries}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="oklch(0.55 0.18 265)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Developers by Language">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stats.languages}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name }) => name}
              >
                {stats.languages.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Followers Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.followers}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="oklch(0.6 0.16 145)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Repositories Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.repos}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="oklch(0.65 0.15 200)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
