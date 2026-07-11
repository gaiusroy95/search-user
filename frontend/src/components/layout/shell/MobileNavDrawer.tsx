import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer'
import { AppSidebar } from './AppSidebar'

interface MobileNavDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNavDrawer({ open, onOpenChange }: MobileNavDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="left"
        size="md"
        showCloseButton
        className="md:hidden border-r-0 p-0"
      >
        <DrawerTitle className="sr-only">Navigation menu</DrawerTitle>
        <AppSidebar
          collapsed={false}
          onToggleCollapse={() => {}}
          showCollapseToggle={false}
          className="w-full border-r-0"
          onNavigate={() => onOpenChange(false)}
        />
        <DrawerClose className="sr-only">Close menu</DrawerClose>
      </DrawerContent>
    </Drawer>
  )
}
