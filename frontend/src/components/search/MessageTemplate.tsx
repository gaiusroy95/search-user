import { useState } from 'react'
import { Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchStore } from '@/stores/useSearchStore'
import { applyTemplate } from '@/lib/utils'

const PREVIEW_VARS = {
  name: 'Alex Developer',
  github_username: 'alexdev',
  country: 'Japan',
  followers: 1250,
}

export function MessageTemplate() {
  const { messageTemplate, setMessageTemplate } = useSearchStore()
  const [showPreview, setShowPreview] = useState(false)
  const charCount = messageTemplate.content.length

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="col-span-full"
    >
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Message Template</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Message Subject</Label>
              <Input
                id="subject"
                value={messageTemplate.subject}
                onChange={(e) => setMessageTemplate({ subject: e.target.value })}
                placeholder="Opportunity for {{name}}"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Message Content</Label>
                <span className="text-xs text-muted-foreground">{charCount} chars</span>
              </div>
              <Textarea
                id="content"
                value={messageTemplate.content}
                onChange={(e) => setMessageTemplate({ content: e.target.value })}
                className="min-h-[160px] font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Variables: {'{{name}}'} {'{{github_username}}'} {'{{country}}'}{' '}
                {'{{followers}}'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((v) => !v)}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="rounded-lg border border-border bg-muted/40 p-4"
              >
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Preview
                </p>
                <p className="mb-3 text-sm font-semibold">
                  {applyTemplate(messageTemplate.subject, PREVIEW_VARS)}
                </p>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {applyTemplate(messageTemplate.content, PREVIEW_VARS)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
