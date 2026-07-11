import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  FolderPlus,
  LayoutGrid,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Table2,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { VaultPageSkeleton } from '@/components/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { copyToClipboard } from '@/lib/clipboard'
import { useVaultAuthStore } from '@/stores/useVaultAuthStore'
import { useVaultStore } from '@/stores/useVaultStore'
import type { VaultCategory, VaultFieldType, VaultRecord } from '@/types'

function VaultPasswordGate() {
  const unlock = useVaultAuthStore((s) => s.unlock)
  const loadFromServer = useVaultStore((s) => s.loadFromServer)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unlock(password)) {
      setError('Incorrect password.')
      return
    }
    setError('')
    await loadFromServer()
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Lock className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold">Saved Data</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Enter the vault password to access your saved categories and records.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vault-password">Password</Label>
          <Input
            id="vault-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full">
          Unlock
        </Button>
      </form>
    </div>
  )
}

interface FieldRow {
  name: string
  type: VaultFieldType
}

function CreateCategoryForm({ onDone }: { onDone: () => void }) {
  const addCategory = useVaultStore((s) => s.addCategory)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [fields, setFields] = useState<FieldRow[]>([
    { name: 'address', type: 'line' },
    { name: 'password', type: 'line' },
    { name: 'backup codes', type: 'textarea' },
    { name: 'recovery email', type: 'line' },
  ])

  const addFieldRow = () =>
    setFields((f) => [...f, { name: '', type: 'line' }])
  const updateField = (i: number, patch: Partial<FieldRow>) =>
    setFields((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))
  const removeField = (i: number) =>
    setFields((f) => f.filter((_, idx) => idx !== i))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validFields = fields.filter((f) => f.name.trim())
    if (!name.trim()) {
      setError('Please enter a category name.')
      return
    }
    if (validFields.length === 0) {
      setError('Please add at least one field with a name.')
      return
    }
    setError('')
    try {
      addCategory(name, validFields)
      onDone()
    } catch {
      setError('Failed to create category. Please try again.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">New Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Category name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. gmail"
            />
          </div>
          <div className="space-y-2">
            <Label>Fields</Label>
            {fields.map((field, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  className="flex-1"
                  value={field.name}
                  onChange={(e) => updateField(i, { name: e.target.value })}
                  placeholder="Field name"
                />
                <Select
                  value={field.type}
                  onValueChange={(v) =>
                    updateField(i, { type: v as VaultFieldType })
                  }
                >
                  <SelectTrigger className="w-32" aria-label="Field input type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">One line</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(i)}
                  disabled={fields.length <= 1}
                  aria-label="Remove field"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addFieldRow}>
              <Plus className="h-4 w-4" />
              Add field
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit">Create category</Button>
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function RecordForm({
  category,
  record,
  onDone,
}: {
  category: VaultCategory
  record?: VaultRecord
  onDone: () => void
}) {
  const addRecord = useVaultStore((s) => s.addRecord)
  const updateRecord = useVaultStore((s) => s.updateRecord)
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (record) return { ...record.values }
    return Object.fromEntries(category.fields.map((f) => [f.id, '']))
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (record) {
      updateRecord(record.id, values)
    } else {
      addRecord(category.id, values)
    }
    onDone()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {record ? 'Edit' : 'Add'} {category.name} record
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {category.fields.map((field) => {
            const isSensitive = field.name.toLowerCase().includes('password')
            const onChange = (
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => setValues((v) => ({ ...v, [field.id]: e.target.value }))

            return (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.name}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.id}
                    value={values[field.id] ?? ''}
                    onChange={onChange}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={isSensitive ? 'password' : 'text'}
                    value={values[field.id] ?? ''}
                    onChange={onChange}
                  />
                )}
              </div>
            )
          })}
          <div className="flex gap-2">
            <Button type="submit">{record ? 'Save changes' : 'Save record'}</Button>
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const LONG_VALUE_THRESHOLD = 100

function FieldValue({
  name,
  value,
  type,
}: {
  name: string
  value: string
  type?: VaultFieldType
}) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const sensitive = name.toLowerCase().includes('password')
  const isLong =
    value.length > LONG_VALUE_THRESHOLD || value.split('\n').length > 3

  const handleCopy = async () => {
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const displayValue = sensitive
    ? '••••••••'
    : isLong && !expanded
      ? `${value.slice(0, LONG_VALUE_THRESHOLD).split('\n').slice(0, 3).join('\n')}…`
      : value

  return (
    <div className="text-sm">
      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <span className="font-medium text-muted-foreground">{name}: </span>
          <span
            className={`cursor-pointer break-all hover:underline ${
              sensitive
                ? 'font-mono'
                : type === 'textarea'
                  ? 'whitespace-pre-wrap'
                  : ''
            }`}
            onClick={handleCopy}
            title="Click to copy"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
          >
            {displayValue}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Copy ${name}`}
          title="Copy"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {isLong && !sensitive && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? 'Show less' : 'Detail'}
        </button>
      )}
    </div>
  )
}

type VaultViewMode = 'cards' | 'table'

function AllDataTable({
  records,
  categories,
  onEdit,
}: {
  records: VaultRecord[]
  categories: VaultCategory[]
  onEdit: (record: VaultRecord, category: VaultCategory) => void
}) {
  const removeRecord = useVaultStore((s) => s.removeRecord)

  const rows = records
    .map((record) => {
      const category = categories.find((c) => c.id === record.categoryId)
      if (!category) return null
      return { record, category }
    })
    .filter(Boolean) as { record: VaultRecord; category: VaultCategory }[]

  if (!rows.length) return null

  const fieldColumns = Array.from(
    new Map(
      categories.flatMap((c) =>
        c.fields.map((f) => [f.name.toLowerCase(), f.name] as const)
      )
    ).values()
  )

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Category</th>
            {fieldColumns.map((name) => (
              <th key={name} className="px-3 py-2">
                {name}
              </th>
            ))}
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ record, category }) => (
            <tr
              key={record.id}
              className="border-b border-border/60 last:border-0 hover:bg-muted/20"
            >
              <td className="px-3 py-2 font-medium">{category.name}</td>
              {fieldColumns.map((colName) => {
                const field = category.fields.find(
                  (f) => f.name.toLowerCase() === colName.toLowerCase()
                )
                const value = field ? record.values[field.id] ?? '' : ''
                const sensitive = colName.toLowerCase().includes('password')
                return (
                  <td key={colName} className="max-w-[200px] truncate px-3 py-2">
                    {value ? (sensitive ? '••••••••' : value) : '—'}
                  </td>
                )
              })}
              <td className="px-3 py-2 text-right">
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(record, category)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRecord(record.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecordCard({
  record,
  category,
  onEdit,
}: {
  record: VaultRecord
  category: VaultCategory
  onEdit: () => void
}) {
  const removeRecord = useVaultStore((s) => s.removeRecord)

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary">{category.name}</Badge>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeRecord(record.id)}
              aria-label="Delete record"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        {category.fields.map((field) => {
          const value = record.values[field.id]
          if (!value) return null
          return (
            <FieldValue
              key={field.id}
              name={field.name}
              value={value}
              type={field.type}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}

function VaultContent() {
  const lock = useVaultAuthStore((s) => s.lock)
  const categories = useVaultStore((s) => s.categories)
  const records = useVaultStore((s) => s.records)
  const synced = useVaultStore((s) => s.synced)
  const syncing = useVaultStore((s) => s.syncing)
  const syncError = useVaultStore((s) => s.syncError)
  const loadFromServer = useVaultStore((s) => s.loadFromServer)
  const removeCategory = useVaultStore((s) => s.removeCategory)

  useEffect(() => {
    loadFromServer()
  }, [loadFromServer])

  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<VaultViewMode>('table')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [editingRecord, setEditingRecord] = useState<VaultRecord | null>(null)
  const [addingRecord, setAddingRecord] = useState(false)

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = records
    if (selectedCategoryId) {
      list = list.filter((r) => r.categoryId === selectedCategoryId)
    }
    if (!q) return list

    return list.filter((record) => {
      const category = categories.find((c) => c.id === record.categoryId)
      if (!category) return false
      if (category.name.toLowerCase().includes(q)) return true
      return category.fields.some((field) => {
        const val = record.values[field.id] ?? ''
        return (
          field.name.toLowerCase().includes(q) || val.toLowerCase().includes(q)
        )
      })
    })
  }, [records, categories, query, selectedCategoryId])

  if (syncing && !synced && records.length === 0 && categories.length === 0) {
    return <VaultPageSkeleton />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Saved Data</h1>
          <p className="text-sm text-muted-foreground">
            Synced across browsers. Organize credentials by category and search all records.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant={synced ? 'secondary' : 'outline'}>
              {syncing ? 'Syncing…' : synced ? 'Synced to server' : 'Local changes pending'}
            </Badge>
            {syncError && (
              <span className="text-destructive">{syncError}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadFromServer()}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync now
          </Button>
          <Button variant="outline" size="sm" onClick={lock}>
            <LogOut className="h-4 w-4" />
            Lock
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search all categories and fields..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Categories
          </p>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              setShowCreateCategory(true)
              setAddingRecord(false)
              setEditingRecord(null)
            }}
          >
            <FolderPlus className="h-4 w-4" />
            New category
          </Button>
          <Button
            variant={selectedCategoryId === null ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedCategoryId(null)}
          >
            All categories
          </Button>
          {categories.map((cat) => (
            <div key={cat.id} className="flex gap-1">
              <Button
                variant={selectedCategoryId === cat.id ? 'secondary' : 'ghost'}
                className="flex-1 justify-start"
                onClick={() => {
                  setSelectedCategoryId(cat.id)
                  setShowCreateCategory(false)
                  setAddingRecord(false)
                  setEditingRecord(null)
                }}
              >
                {cat.name}
                <Badge variant="outline" className="ml-auto text-xs">
                  {records.filter((r) => r.categoryId === cat.id).length}
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (selectedCategoryId === cat.id) setSelectedCategoryId(null)
                  removeCategory(cat.id)
                }}
                aria-label={`Delete ${cat.name}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </aside>

        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          {showCreateCategory && (
            <CreateCategoryForm onDone={() => setShowCreateCategory(false)} />
          )}

          {addingRecord && selectedCategory && (
            <RecordForm
              category={selectedCategory}
              onDone={() => setAddingRecord(false)}
            />
          )}

          {editingRecord && selectedCategory && (
            <RecordForm
              category={selectedCategory}
              record={editingRecord}
              onDone={() => setEditingRecord(null)}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                {selectedCategory ? selectedCategory.name : 'All saved data'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
                {selectedCategoryId ? ` in ${selectedCategory?.name}` : ' across all categories'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategory && (
                <Button
                  size="sm"
                  onClick={() => {
                    setAddingRecord(true)
                    setEditingRecord(null)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add record
                </Button>
              )}
              <div className="flex rounded-lg border border-border p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('table')}
                  aria-label="Table view"
                >
                  <Table2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('cards')}
                  aria-label="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              {query
                ? 'No records match your search.'
                : categories.length === 0
                  ? 'Create a category (e.g. gmail) to start saving data.'
                  : 'No records yet. Select a category and add one.'}
            </div>
          ) : viewMode === 'table' ? (
            <AllDataTable
              records={filteredRecords}
              categories={categories}
              onEdit={(record, category) => {
                setSelectedCategoryId(category.id)
                setEditingRecord(record)
                setAddingRecord(false)
              }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredRecords.map((record) => {
                const category = categories.find((c) => c.id === record.categoryId)
                if (!category) return null
                return (
                  <RecordCard
                    key={record.id}
                    record={record}
                    category={category}
                    onEdit={() => {
                      setSelectedCategoryId(category.id)
                      setEditingRecord(record)
                      setAddingRecord(false)
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SavedDataPage() {
  const unlocked = useVaultAuthStore((s) => s.unlocked)

  if (!unlocked) {
    return <VaultPasswordGate />
  }

  return <VaultContent />
}
