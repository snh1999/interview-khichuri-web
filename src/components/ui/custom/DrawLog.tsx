import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/useMediaQuery.ts"
import { type ComponentProps, createContext, type ReactNode, useContext } from "react"

const DrawLogContext = createContext(false)
const useDrawLogContext = () => useContext(DrawLogContext)

interface DrawLogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

function DrawLog({ open, onOpenChange, children }: DrawLogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return (
    <DrawLogContext.Provider value={isDesktop}>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={(o, _details) => onOpenChange?.(o)}>
          {children}
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={(o, _details) => onOpenChange?.(o)}>
          {children}
        </Drawer>
      )}
    </DrawLogContext.Provider>
  )
}

function DrawLogTrigger(props: ComponentProps<typeof DialogTrigger>) {
  const isDesktop = useDrawLogContext()
  const Comp = isDesktop ? DialogTrigger : DrawerTrigger
  return <Comp {...props} />
}

interface DrawLogContentProps extends Omit<ComponentProps<typeof DialogContent>, "render"> {}

function DrawLogContent({ className, ...props }: DrawLogContentProps) {
  const isDesktop = useDrawLogContext()
  const Comp = isDesktop ? DialogContent : DrawerContent
  return (
    <Comp
      className={cn("flex flex-col sm:max-w-xl",
        isDesktop
          ? "max-h-[95vh]"
          : "max-h-[80vh] [&_form]:flex [&_form]:min-h-0 [&_form]:flex-1 [&_form]:flex-col",
        className)}
      {...props}
    />
  )
}

function DrawLogHeader({ className, ...props }: ComponentProps<typeof DialogHeader>) {
  const isDesktop = useDrawLogContext()
  const Comp = isDesktop ? DialogHeader : DrawerHeader
  return (
    <Comp
      className={cn("shrink-0 p-2 text-left", className)}
      {...props}
    />
  )
}

function DrawLogTitle(props: ComponentProps<typeof DialogTitle>) {
  const isDesktop = useDrawLogContext()
  const Comp = isDesktop ? DialogTitle : DrawerTitle
  return <Comp {...props} />
}

function DrawLogDescription(props: ComponentProps<typeof DialogDescription>) {
  const isDesktop = useDrawLogContext()
  const Comp = isDesktop ? DialogDescription : DrawerDescription
  return <Comp {...props} />
}

function DrawLogBody({ className, ...props }: ComponentProps<"div">) {
  const isDesktop = useDrawLogContext()
  return (
    <div
      className={cn("space-y-4 overflow-y-auto no-scrollbar",
        isDesktop ? "max-h-[75vh] -mx-4 px-6" : "p-4",
        className)} {...props} />
  )
}

function DrawLogFooter({ className, ...props }: ComponentProps<typeof DialogFooter>) {
  const isDesktop = useDrawLogContext()
  const Comp = isDesktop ? DialogFooter : DrawerFooter
  return (
    <Comp
      className={cn(
        isDesktop ? "pt-4" : "sticky bottom-0 z-10 bg-popover pt-4",
        isDesktop && "sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DrawLogClose(props: ComponentProps<typeof DialogClose>) {
  const isDesktop = useDrawLogContext()
  const Comp = isDesktop ? DialogClose : DrawerClose
  return <Comp {...props} />
}

export {
  DrawLog,
  DrawLogTrigger,
  DrawLogContent,
  DrawLogHeader,
  DrawLogTitle,
  DrawLogDescription,
  DrawLogBody,
  DrawLogFooter,
  DrawLogClose,
}
