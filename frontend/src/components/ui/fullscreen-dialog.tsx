"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/libs/utils"

function FullscreenDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="fullscreen-dialog" {...props} />
}

function FullscreenDialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="fullscreen-dialog-trigger" {...props} />
}

function FullscreenDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="fullscreen-dialog-portal" {...props} />
}

function FullscreenDialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="fullscreen-dialog-close" {...props} />
}

function FullscreenDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="fullscreen-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-white",
        className
      )}
      {...props}
    />
  )
}

function FullscreenDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <FullscreenDialogPortal>
      <FullscreenDialogOverlay />
      <DialogPrimitive.Content
        data-slot="fullscreen-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom fixed inset-0 z-50 flex flex-col overflow-hidden duration-300",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="group focus-visible:border-ring focus-visible:ring-ring/50 absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all outline-none hover:bg-white/20 focus-visible:ring-[3px] disabled:pointer-events-none z-10">
          <XIcon
            size={20}
            className="opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </FullscreenDialogPortal>
  )
}

function FullscreenDialogHeader({ 
  className, 
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fullscreen-dialog-header"
      className={cn(
        "flex flex-col gap-2 px-6 py-4 border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10",
        className
      )}
      {...props}
    />
  )
}

function FullscreenDialogBody({ 
  className, 
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fullscreen-dialog-body"
      className={cn(
        "flex-1 overflow-y-auto bg-gray-50/50",
        className
      )}
      {...props}
    />
  )
}

function FullscreenDialogFooter({ 
  className, 
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fullscreen-dialog-footer"
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4 border-t bg-white/95 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

function FullscreenDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="fullscreen-dialog-title"
      className={cn("text-xl font-semibold leading-tight", className)}
      {...props}
    />
  )
}

function FullscreenDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="fullscreen-dialog-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

export {
  FullscreenDialog,
  FullscreenDialogClose,
  FullscreenDialogContent,
  FullscreenDialogDescription,
  FullscreenDialogBody,
  FullscreenDialogFooter,
  FullscreenDialogHeader,
  FullscreenDialogOverlay,
  FullscreenDialogPortal,
  FullscreenDialogTitle,
  FullscreenDialogTrigger,
}
