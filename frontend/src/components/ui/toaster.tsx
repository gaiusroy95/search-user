import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useToastStore } from '@/stores/useToastStore'

export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          open={t.open}
          onOpenChange={(open) => !open && dismiss(t.id)}
          variant={t.variant}
        >
          <div className="grid gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose className="rounded-md p-1 opacity-70 hover:opacity-100">
            ×
          </ToastClose>
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
