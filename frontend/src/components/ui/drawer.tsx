import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { focusRing, overlayBase } from '@/design-system/styles'

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close
export const DrawerPortal = DialogPrimitive.Portal

export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      overlayBase,
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = 'DrawerOverlay'

const drawerContentVariants = cva(
  'fixed z-50 flex flex-col border-border/60 bg-card shadow-xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        left: 'inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        right:
          'inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        full: '',
      },
    },
    compoundVariants: [
      { side: 'left', size: 'sm', className: 'w-72 max-w-[85vw]' },
      { side: 'left', size: 'md', className: 'w-80 max-w-[85vw]' },
      { side: 'left', size: 'lg', className: 'w-96 max-w-[90vw]' },
      { side: 'left', size: 'full', className: 'w-full' },
      { side: 'right', size: 'sm', className: 'w-80 max-w-[85vw]' },
      { side: 'right', size: 'md', className: 'max-w-xl w-full sm:w-[32rem]' },
      { side: 'right', size: 'lg', className: 'max-w-2xl w-full sm:w-[42rem]' },
      { side: 'right', size: 'full', className: 'w-full' },
      { side: 'bottom', size: 'sm', className: 'max-h-[40vh]' },
      { side: 'bottom', size: 'md', className: 'max-h-[60vh]' },
      { side: 'bottom', size: 'lg', className: 'max-h-[80vh]' },
      { side: 'bottom', size: 'full', className: 'h-full max-h-full' },
    ],
    defaultVariants: {
      side: 'right',
      size: 'md',
    },
  }
)

export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerContentVariants> {
  showCloseButton?: boolean
  overlay?: boolean
}

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(
  (
    {
      side = 'right',
      size = 'md',
      showCloseButton = true,
      overlay = true,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <DrawerPortal>
      {overlay && <DrawerOverlay />}
      <DialogPrimitive.Content
        ref={ref}
        className={cn(drawerContentVariants({ side, size }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              'absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100',
              focusRing
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DrawerPortal>
  )
)
DrawerContent.displayName = 'DrawerContent'

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1.5 border-b border-border/60 p-6', className)} {...props} />
  )
}

export function DrawerTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export function DrawerDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export function DrawerBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto p-6', className)} {...props} />
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-border/60 p-4 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  )
}
