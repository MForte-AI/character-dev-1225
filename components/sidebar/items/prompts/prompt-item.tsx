import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { ChatbotUIContext } from "@/context/context"
import { PROMPT_NAME_MAX } from "@/db/limits"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { IconPencil } from "@tabler/icons-react"
import { FC, useContext, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"

interface PromptItemProps {
  prompt: Tables<"prompts">
}

export const PromptItem: FC<PromptItemProps> = ({ prompt }) => {
  const { profile } = useContext(ChatbotUIContext)
  const [name, setName] = useState(prompt.name)
  const [content, setContent] = useState(prompt.content)
  const [sharing, setSharing] = useState(prompt.sharing)
  const [isTyping, setIsTyping] = useState(false)
  const isReadOnly = profile ? prompt.user_id !== profile.user_id : false
  const isAdmin = profile?.user_role === "admin"

  if (isReadOnly) {
    return (
      <div
        className={cn(
          "hover:bg-accent flex w-full items-center rounded p-2 hover:opacity-50"
        )}
      >
        <IconPencil size={30} />

        <div className="ml-3 min-w-0 flex-1 truncate text-sm font-semibold">
          {prompt.name}
        </div>

        <div className="text-muted-foreground text-xs uppercase">
          Standard
        </div>
      </div>
    )
  }

  return (
    <SidebarItem
      item={prompt}
      isTyping={isTyping}
      contentType="prompts"
      icon={<IconPencil size={30} />}
      updateState={{ name, content, sharing }}
      renderInputs={() => (
        <>
          {isAdmin && (
            <div className="flex items-center justify-between rounded border px-3 py-2">
              <div className="space-y-1">
                <div className="text-sm font-semibold">Standard prompt</div>
                <div className="text-muted-foreground text-xs">
                  Visible to all users.
                </div>
              </div>

              <Switch
                checked={sharing === "public"}
                onCheckedChange={checked =>
                  setSharing(checked ? "public" : "private")
                }
              />
            </div>
          )}

          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Prompt name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={PROMPT_NAME_MAX}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => setIsTyping(false)}
            />
          </div>

          <div className="space-y-1">
            <Label>Prompt</Label>

            <TextareaAutosize
              placeholder="Prompt..."
              value={content}
              onValueChange={setContent}
              minRows={6}
              maxRows={20}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => setIsTyping(false)}
            />
          </div>
        </>
      )}
    />
  )
}
