"use client"

import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SidebarSwitcher } from "@/components/sidebar/sidebar-switcher"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { Tabs } from "@/components/ui/tabs"
import useHotkey from "@/lib/hooks/use-hotkey"
import { cn } from "@/lib/utils"
import { ContentType } from "@/types"
import { IconChevronCompactRight } from "@tabler/icons-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FC, useContext, useState } from "react"
import { useSelectFileHandler } from "../chat/chat-hooks/use-select-file-handler"
import { CommandK } from "../utility/command-k"
import { ChatbotUIContext } from "@/context/context"

export const SIDEBAR_WIDTH = 350

interface DashboardProps {
  children: React.ReactNode
}

export const Dashboard: FC<DashboardProps> = ({ children }) => {
  useHotkey("s", () => setShowSidebar(prevState => !prevState))

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabValue = searchParams.get("tab") || "chats"

  const { handleSelectDeviceFile } = useSelectFileHandler()

  const [contentType, setContentType] = useState<ContentType>(
    tabValue as ContentType
  )
  const [showSidebar, setShowSidebar] = useState(
    localStorage.getItem("showSidebar") === "true"
  )
  const { showFilePreview } = useContext(ChatbotUIContext)
  const [isDragging, setIsDragging] = useState(false)

  const onFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const files = event.dataTransfer.files
    const file = files[0]

    handleSelectDeviceFile(file)

    setIsDragging(false)
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleToggleSidebar = () => {
    setShowSidebar(prevState => !prevState)
    localStorage.setItem("showSidebar", String(!showSidebar))
  }

  const shouldShowSidebar = showSidebar && !showFilePreview

  return (
    <div className="flex size-full">
      <CommandK />

      <ResizablePanelGroup direction="horizontal" autoSaveId="dashboard-layout">
        <ResizablePanel className={showFilePreview ? "hidden md:flex" : "flex"}>
          <div
            className={cn(
              "duration-200 dark:border-none " +
                (showSidebar ? "border-r-2" : "")
            )}
            style={{
              // Sidebar
              minWidth: shouldShowSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
              maxWidth: shouldShowSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
              width: shouldShowSidebar ? `${SIDEBAR_WIDTH}px` : "0px"
            }}
          >
            {shouldShowSidebar && (
              <Tabs
                className="flex h-full"
                value={contentType}
                onValueChange={tabValue => {
                  setContentType(tabValue as ContentType)
                  router.replace(`${pathname}?tab=${tabValue}`)
                }}
              >
                <SidebarSwitcher onContentTypeChange={setContentType} />

                <Sidebar contentType={contentType} showSidebar={showSidebar} />
              </Tabs>
            )}
          </div>

          <div
            className="bg-muted/50 relative w-screen min-w-[90%] grow flex-col sm:flex sm:min-w-fit"
            onDrop={onFileDrop}
            onDragOver={onDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            {isDragging ? (
              <div className="flex h-full items-center justify-center bg-black/50 text-2xl text-white">
                drop file here
              </div>
            ) : (
              children
            )}

            {!showFilePreview && (
              <Button
                className={cn(
                  "absolute left-[4px] top-[50%] z-10 size-[32px] cursor-pointer"
                )}
                style={{
                  // marginLeft: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
                  transform: showSidebar ? "rotate(180deg)" : "rotate(0deg)"
                }}
                variant="ghost"
                size="icon"
                onClick={handleToggleSidebar}
              >
                <IconChevronCompactRight size={24} />
              </Button>
            )}
          </div>
        </ResizablePanel>

        {showFilePreview && (
          <>
            <ResizableHandle withHandle className="hidden md:flex" />
            <ResizablePanel
              className="sm:w-full"
              defaultSize={40}
              minSize={30}
              maxSize={50}
            >
              <RightSidebar />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
