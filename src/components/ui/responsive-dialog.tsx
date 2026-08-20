"use client"

import * as React from "react"

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
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const ResponsiveDialogContext = React.createContext<boolean | null>(null)

function useResponsiveDialogContext() {
  const context = React.useContext(ResponsiveDialogContext)
  if (context === null) {
    throw new Error(
      "ResponsiveDialog.* must be used within a ResponsiveDialog.",
    )
  }
  return context
}

function ResponsiveDialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}) {
  const isMobile = useIsMobile()
  return (
    <ResponsiveDialogContext.Provider value={isMobile}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      )}
    </ResponsiveDialogContext.Provider>
  )
}

function ResponsiveDialogTrigger({
  render,
  children,
}: {
  render?: React.ReactElement
  children?: React.ReactNode
}) {
  const isMobile = useResponsiveDialogContext()
  const Trigger = isMobile ? DrawerTrigger : DialogTrigger
  return <Trigger render={render}>{children}</Trigger>
}

function ResponsiveDialogContent({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const isMobile = useResponsiveDialogContext()
  if (isMobile) {
    return <DrawerContent>{children}</DrawerContent>
  }
  return <DialogContent className={className}>{children}</DialogContent>
}

function ResponsiveDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useResponsiveDialogContext()
  const Header = isMobile ? DrawerHeader : DialogHeader
  return <Header className={cn(className)} {...props} />
}

function ResponsiveDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useResponsiveDialogContext()
  const Footer = isMobile ? DrawerFooter : DialogFooter
  return <Footer className={cn(className)} {...props} />
}

function ResponsiveDialogBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useResponsiveDialogContext()
  return (
    <div
      className={cn(
        isMobile && "min-h-0 flex-1 overflow-y-auto px-4 py-4",
        className,
      )}
      {...props}
    />
  )
}

function ResponsiveDialogTitle({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const isMobile = useResponsiveDialogContext()
  const Title = isMobile ? DrawerTitle : DialogTitle
  return <Title className={className}>{children}</Title>
}

function ResponsiveDialogDescription({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const isMobile = useResponsiveDialogContext()
  const Description = isMobile ? DrawerDescription : DialogDescription
  return <Description className={className}>{children}</Description>
}

function ResponsiveDialogClose({
  className,
  render,
  children,
}: {
  className?: string
  render?: React.ReactElement
  children?: React.ReactNode
}) {
  const isMobile = useResponsiveDialogContext()
  const Close = isMobile ? DrawerClose : DialogClose
  return (
    <Close className={className} render={render}>
      {children}
    </Close>
  )
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogBody,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogClose,
}
