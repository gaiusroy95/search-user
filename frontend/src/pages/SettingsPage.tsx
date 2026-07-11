import { Link } from 'react-router-dom'

import { Moon, Plug, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Switch } from '@/components/ui/switch'

import { Label } from '@/components/ui/label'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useUIStore } from '@/stores/useUIStore'

import { ROUTES } from '@/lib/routes'



export function SettingsPage() {

  const darkMode = useUIStore((s) => s.darkMode)

  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode)



  return (

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <p className="mt-1 text-sm text-muted-foreground">

        Application preferences.

      </p>



      <div className="mt-8 max-w-lg space-y-4 rounded-xl border border-border/60 bg-card p-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}

            <Label htmlFor="dark-mode">Dark mode</Label>

          </div>

          <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />

        </div>

      </div>



      <Card className="mt-6 max-w-lg border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plug className="h-4 w-4" />
            Integrations
          </CardTitle>
          <CardDescription>
            Connect GitHub, ATS, email, and Slack with OAuth and background sync.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link to={ROUTES.integrations}>Manage integrations</Link>
          </Button>
        </CardContent>
      </Card>



      <Button variant="ghost" className="mt-6 px-0" asChild>

        <Link to={ROUTES.dashboard}>Back to Dashboard</Link>

      </Button>

    </div>

  )

}


