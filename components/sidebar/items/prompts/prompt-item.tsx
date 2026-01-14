import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { usePromptAndCommand } from "@/components/chat/chat-hooks/use-prompt-and-command"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [promptVariables, setPromptVariables] = useState<
    { name: string; value: string }[]
  >([])
  const [promptVariablesSource, setPromptVariablesSource] = useState<
    string | null
  >(null)
  const [showPromptVariables, setShowPromptVariables] = useState(false)
  const isReadOnly = profile ? prompt.user_id !== profile.user_id : false
  const isAdmin = profile?.user_role === "admin"
  const { handleSelectPrompt } = usePromptAndCommand()
  const { handleFocusChatInput } = useChatHandler()

  const currentPromptContent = isReadOnly ? prompt.content : content
  const promptForUse = {
    ...prompt,
    content: currentPromptContent
  }

  const openPromptPreview = () => setIsPreviewOpen(true)

  const handleUsePrompt = () => {
    const regex = /\{\{.*?\}\}/g
    const matches = currentPromptContent.match(regex)

    if (matches) {
      const newPromptVariables = matches.map(match => ({
        name: match.replace(/\{\{|\}\}/g, ""),
        value: ""
      }))

      setPromptVariables(newPromptVariables)
      setPromptVariablesSource(currentPromptContent)
      setIsPreviewOpen(false)
      setShowPromptVariables(true)
      return
    }

    handleSelectPrompt(promptForUse)
    handleFocusChatInput()
    setIsPreviewOpen(false)
  }

  const handleSubmitPromptVariables = () => {
    const newPromptContent = promptVariables.reduce(
      (prevContent, variable) =>
        prevContent.replace(
          new RegExp(`\\{\\{${variable.name}\\}\\}`, "g"),
          variable.value
        ),
      promptVariablesSource ?? currentPromptContent
    )

    handleSelectPrompt({
      ...prompt,
      content: newPromptContent
    })
    handleFocusChatInput()
    setShowPromptVariables(false)
    setPromptVariables([])
    setPromptVariablesSource(null)
  }

  const handleCancelPromptVariables = () => {
    setShowPromptVariables(false)
    setPromptVariables([])
    setPromptVariablesSource(null)
  }

  const handleKeydownPromptVariables = (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (!isTyping && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitPromptVariables()
    }
  }

  if (isReadOnly) {
    return (
      <>
        <div
          className={cn(
            "hover:bg-accent flex w-full cursor-pointer items-center rounded p-2 hover:opacity-50"
          )}
          onClick={openPromptPreview}
        >
          <IconPencil size={30} />

          <div className="ml-3 min-w-0 flex-1 truncate text-sm font-semibold">
            {prompt.name}
          </div>

          <div className="text-muted-foreground mr-3 text-xs uppercase">
            Standard
          </div>

          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={e => {
              e.stopPropagation()
              handleUsePrompt()
            }}
          >
            Use
          </Button>
        </div>

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{prompt.name}</DialogTitle>
            </DialogHeader>

            <div className="text-sm whitespace-pre-wrap">{prompt.content}</div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button onClick={handleUsePrompt}>Use Prompt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showPromptVariables}
          onOpenChange={setShowPromptVariables}
        >
          <DialogContent onKeyDown={handleKeydownPromptVariables}>
            <DialogHeader>
              <DialogTitle>Enter Prompt Variables</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {promptVariables.map((variable, index) => (
                <div key={index} className="flex flex-col space-y-2">
                  <Label>{variable.name}</Label>

                  <TextareaAutosize
                    placeholder={`Enter a value for ${variable.name}...`}
                    value={variable.value}
                    onValueChange={value => {
                      const newPromptVariables = [...promptVariables]
                      newPromptVariables[index].value = value
                      setPromptVariables(newPromptVariables)
                    }}
                    minRows={3}
                    maxRows={6}
                    onCompositionStart={() => setIsTyping(true)}
                    onCompositionEnd={() => setIsTyping(false)}
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={handleCancelPromptVariables}>
                Cancel
              </Button>
              <Button onClick={handleSubmitPromptVariables}>Use Prompt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <SidebarItem
        item={prompt}
        isTyping={isTyping}
        contentType="prompts"
        icon={<IconPencil size={30} />}
        updateState={{ name, content, sharing }}
        rowAction={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={e => {
                e.stopPropagation()
                handleUsePrompt()
              }}
            >
              Use
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={e => {
                e.stopPropagation()
                openPromptPreview()
              }}
            >
              Preview
            </Button>
          </div>
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{prompt.name}</DialogTitle>
          </DialogHeader>

          <div className="text-sm whitespace-pre-wrap">
            {currentPromptContent}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleUsePrompt}>Use Prompt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showPromptVariables}
        onOpenChange={setShowPromptVariables}
      >
        <DialogContent onKeyDown={handleKeydownPromptVariables}>
          <DialogHeader>
            <DialogTitle>Enter Prompt Variables</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {promptVariables.map((variable, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <Label>{variable.name}</Label>

                <TextareaAutosize
                  placeholder={`Enter a value for ${variable.name}...`}
                  value={variable.value}
                  onValueChange={value => {
                    const newPromptVariables = [...promptVariables]
                    newPromptVariables[index].value = value
                    setPromptVariables(newPromptVariables)
                  }}
                  minRows={3}
                  maxRows={6}
                  onCompositionStart={() => setIsTyping(true)}
                  onCompositionEnd={() => setIsTyping(false)}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleCancelPromptVariables}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPromptVariables}>Use Prompt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
