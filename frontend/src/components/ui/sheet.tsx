/**
 * @deprecated Prefer `@/components/ui/drawer` — kept for backward compatibility.
 */
export {
  Drawer as Sheet,
  DrawerTrigger as SheetTrigger,
  DrawerClose as SheetClose,
  DrawerHeader as SheetHeader,
  DrawerTitle as SheetTitle,
  DrawerDescription as SheetDescription,
} from './drawer'

import * as React from 'react'
import { DrawerContent, type DrawerContentProps } from './drawer'

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DrawerContent>,
  Omit<DrawerContentProps, 'side'>
>(({ className, ...props }, ref) => (
  <DrawerContent ref={ref} side="right" size="md" className={className} {...props} />
))
SheetContent.displayName = 'SheetContent'
