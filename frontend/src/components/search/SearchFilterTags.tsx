import { Badge } from '@/components/ui/badge'
import { useSearchStore } from '@/stores/useSearchStore'

export function SearchFilterTags() {
  const { country, maxFollowers, maxRepos, maxFollowing, type } = useSearchStore()

  const tags: string[] = []
  if (country) tags.push(country)
  if (maxFollowers) tags.push(`≤${maxFollowers} followers`)
  if (maxRepos) tags.push(`≤${maxRepos} repos`)
  if (maxFollowing) tags.push(`≤${maxFollowing} following`)
  if (type) tags.push(type)

  if (!tags.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  )
}
