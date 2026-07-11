import { Skeleton, SkeletonCard, SkeletonPageHeader } from '@/components/ui/skeleton'

export function RoutePageFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in-0 duration-200 p-6 sm:px-8">
      <SkeletonPageHeader />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-in fade-in-0 duration-200 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-24" />
      <SkeletonPageHeader />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function LookupPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-in fade-in-0 duration-200 space-y-6 px-4 py-8">
      <SkeletonCard className="min-h-[180px]" />
      <SkeletonCard />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}

export function PipelinePageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in-0 duration-200 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <SkeletonPageHeader />
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-96 min-w-[260px] flex-1 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function VaultPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in-0 duration-200 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <SkeletonPageHeader />
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  )
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="animate-in fade-in-0 duration-200 space-y-6">
      <SkeletonPageHeader />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </div>
  )
}

export function DrawerContentSkeleton() {
  return (
    <div className="animate-in fade-in-0 duration-200 space-y-4 pr-8 pt-2">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}
