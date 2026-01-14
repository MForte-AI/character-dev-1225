import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { ChatbotUIContext } from "@/context/context"
import { PROMPT_NAME_MAX } from "@/db/limits"
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useState } from "react"

interface CreatePromptProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreatePrompt: FC<CreatePromptProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)
  const [isTyping, setIsTyping] = useState(false)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [isStandard, setIsStandard] = useState(false)

  const isAdmin = profile?.user_role === "admin"

  if (!profile) return null
  if (!selectedWorkspace) return null

  return (
    <SidebarCreateItem
      contentType="prompts"
      isOpen={isOpen}
      isTyping={isTyping}
      onOpenChange={onOpenChange}
      createState={
        {
          user_id: profile.user_id,
          name,
          content,
          sharing: isAdmin && isStandard ? "public" : "private"
        } as TablesInsert<"prompts">
      }
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
                checked={isStandard}
                onCheckedChange={setIsStandard}
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
              placeholder="Prompt content..."
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
