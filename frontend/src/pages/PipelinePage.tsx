import { PipelineModule } from '@/components/pipeline/PipelineModule'
import { PipelinePageSkeleton } from '@/components/loading'
import { useStoreHydrated } from '@/hooks/useStoreHydrated'
import { useProspectStore } from '@/stores/useProspectStore'

export function PipelinePage() {
  const hydrated = useStoreHydrated(useProspectStore.persist)

  if (!hydrated) {
    return <PipelinePageSkeleton />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PipelineModule />
    </div>
  )
}
