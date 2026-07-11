import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyToClipboard } from '@/lib/clipboard'
import { cn } from '@/lib/utils'

interface CopyableTextProps {
  value: string
  label?: string
  masked?: boolean
  className?: string
  icon?: React.ReactNode
}

export function CopyableText({
  value,
  label,
  masked,
  className,
  icon,
}: CopyableTextProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div
      className={cn('group flex min-w-0 items-center gap-1', className)}
      onClick={handleCopy}
      onKeyDown={(e) => e.key === 'Enter' && handleCopy(e as unknown as React.MouseEvent)}
      role="button"
      tabIndex={0}
      title="Click to copy"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate hover:underline">
        {masked ? '••••••••' : value}
        {label && !masked && <span className="sr-only"> {label}</span>}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground"
        aria-label={`Copy ${label || 'value'}`}
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  )
}
