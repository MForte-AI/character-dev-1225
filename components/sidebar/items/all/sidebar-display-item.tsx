import { ChatbotUIContext } from "@/context/context"
import { createChat } from "@/db/chats"
import { resolveClaudeModelId } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { ContentType, DataItemType } from "@/types"
import { useRouter } from "next/navigation"
import { FC, useContext, useRef, useState } from "react"
import { SidebarUpdateItem } from "./sidebar-update-item"

interface SidebarItemProps {
  item: DataItemType
  isTyping: boolean
  contentType: ContentType
  icon: React.ReactNode
  updateState: any
  renderInputs: (renderState: any) => JSX.Element
  rowAction?: React.ReactNode
}

export const SidebarItem: FC<SidebarItemProps> = ({
  item,
  contentType,
  updateState,
  renderInputs,
  icon,
  isTyping,
  rowAction
}) => {
  const { selectedWorkspace, setChats, setSelectedAssistant, profile } =
    useContext(ChatbotUIContext)

  const router = useRouter()

  const itemRef = useRef<HTMLDivElement>(null)

  const [isHovering, setIsHovering] = useState(false)

  const actionMap = {
    chats: async (item: any) => { },
    presets: async (item: any) => { },
    prompts: async (item: any) => { },
    files: async (item: any) => { },
    collections: async (item: any) => { },
    assistants: async (assistant: Tables<"assistants">) => {
      if (!selectedWorkspace) return

      console.log("Creating chat for assistant:", assistant.name)

      const createdChat = await createChat({
        user_id: profile?.user_id || assistant.user_id,
        workspace_id: selectedWorkspace.id,
        assistant_id: assistant.id,
        context_length: assistant.context_length,
        include_profile_context: assistant.include_profile_context,
        include_workspace_instructions:
          assistant.include_workspace_instructions,
        model: resolveClaudeModelId(assistant.model),
        name: `Chat with ${assistant.name}`,
        prompt: assistant.prompt,
        temperature: assistant.temperature,
        embeddings_provider: "openai"
      })

      console.log("Chat created:", createdChat.id)

      setChats(prevState => [createdChat, ...prevState])
      setSelectedAssistant(assistant)

      const redirectUrl = `/${selectedWorkspace.id}/chat/${createdChat.id}`
      console.log("Redirecting to:", redirectUrl)

      return router.push(redirectUrl)
    },
    tools: async (item: any) => { },
    models: async (item: any) => { }
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  // const handleClickAction = async (
  //   e: React.MouseEvent<SVGSVGElement, MouseEvent>
  // ) => {
  //   e.stopPropagation()

  //   const action = actionMap[contentType]

  //   await action(item as any)
  // }

  // Check if this is a system assistant
  const isSystemAssistant = 'is_system' in item && item.is_system === true

  // For system assistants, clicking should start a chat
  const handleClick = async () => {
    console.log("handleClick called", { isSystemAssistant, contentType, item })
    if (isSystemAssistant && contentType === 'assistants') {
      console.log("About to call action")
      const action = actionMap[contentType]
      try {
        await action(item as any)
        console.log("Action completed successfully")
      } catch (error) {
        console.error("Error in action:", error)
      }
    }
  }

  // System assistants just render the display without edit functionality
  if (isSystemAssistant) {
    return (
      <div
        ref={itemRef}
        className={cn(
          "hover:bg-accent flex w-full cursor-pointer items-center rounded p-2 hover:opacity-50 focus:outline-none"
        )}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {icon}

        <div className="ml-3 min-w-0 flex-1 truncate text-sm font-semibold">
          {item.name}
        </div>

        {rowAction && (
          <div
            className="ml-auto shrink-0 pl-2"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            {rowAction}
          </div>
        )}
      </div>
    )
  }

  // Regular items use SidebarUpdateItem for editing
  return (
    <SidebarUpdateItem
      item={item}
      isTyping={isTyping}
      contentType={contentType}
      updateState={updateState}
      renderInputs={renderInputs}
    >
      <div
        ref={itemRef}
        className={cn(
          "hover:bg-accent flex w-full cursor-pointer items-center rounded p-2 hover:opacity-50 focus:outline-none"
        )}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {icon}

        <div className="ml-3 min-w-0 flex-1 truncate text-sm font-semibold">
          {item.name}
        </div>

        {rowAction && (
          <div
            className="ml-auto shrink-0 pl-2"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            {rowAction}
          </div>
        )}
      </div>
    </SidebarUpdateItem>
  )
}
