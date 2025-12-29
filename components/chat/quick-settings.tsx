import { ChatbotUIContext } from "@/context/context"
import { getAssistantCollectionsByAssistantId } from "@/db/assistant-collections"
import { getAssistantFilesByAssistantId } from "@/db/assistant-files"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import useHotkey from "@/lib/hooks/use-hotkey"
import { resolveClaudeModelId } from "@/lib/models/llm/llm-list"
import { Tables } from "@/supabase/types"
import { LLMID } from "@/types"
import { IconChevronDown, IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { QuickSettingOption } from "./quick-setting-option"
interface QuickSettingsProps {}

export const QuickSettings: FC<QuickSettingsProps> = ({}) => {
  const { t } = useTranslation()

  useHotkey("p", () => setIsOpen(prevState => !prevState))

  const {
    assistants,
    selectedAssistant,
    chatSettings,
    setSelectedAssistant,
    setChatSettings,
    assistantImages,
    setChatFiles,
    setSelectedTools,
    setShowFilesDisplay,
    selectedWorkspace
  } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleSelectQuickSetting = async (
    item: Tables<"assistants"> | null,
    contentType: "assistants" | "remove"
  ) => {
    console.log({ item, contentType })
    if (contentType === "assistants" && item) {
      setSelectedAssistant(item as Tables<"assistants">)
      setLoading(true)
      let allFiles = []
      const assistantFiles = (await getAssistantFilesByAssistantId(item.id))
        .files
      allFiles = [...assistantFiles]
      const assistantCollections = (
        await getAssistantCollectionsByAssistantId(item.id)
      ).collections
      for (const collection of assistantCollections) {
        const collectionFiles = (
          await getCollectionFilesByCollectionId(collection.id)
        ).files
        allFiles = [...allFiles, ...collectionFiles]
      }
      const assistantTools = (await getAssistantToolsByAssistantId(item.id))
        .tools
      setSelectedTools(assistantTools)
      setChatFiles(
        allFiles.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          file: null
        }))
      )
      if (allFiles.length > 0) setShowFilesDisplay(true)
      setLoading(false)
    } else {
      setSelectedAssistant(null)
      setChatFiles([])
      setSelectedTools([])
      if (selectedWorkspace) {
        setChatSettings({
          model: resolveClaudeModelId(selectedWorkspace.default_model) as LLMID,
          prompt: selectedWorkspace.default_prompt,
          temperature: selectedWorkspace.default_temperature,
          contextLength: selectedWorkspace.default_context_length,
          includeProfileContext: selectedWorkspace.include_profile_context,
          includeWorkspaceInstructions:
            selectedWorkspace.include_workspace_instructions,
          embeddingsProvider: "openai"
        })
      }
      return
    }

    setChatSettings({
      model: resolveClaudeModelId(item.model) as LLMID,
      prompt: item.prompt,
      temperature: item.temperature,
      contextLength: item.context_length,
      includeProfileContext: item.include_profile_context,
      includeWorkspaceInstructions: item.include_workspace_instructions,
      embeddingsProvider: "openai"
    })
  }

  const checkIfModified = () => {
    if (!chatSettings) return false

    if (selectedAssistant) {
      return (
        selectedAssistant.include_profile_context !==
          chatSettings.includeProfileContext ||
        selectedAssistant.include_workspace_instructions !==
          chatSettings.includeWorkspaceInstructions ||
        selectedAssistant.context_length !== chatSettings.contextLength ||
        selectedAssistant.model !== chatSettings.model ||
        selectedAssistant.prompt !== chatSettings.prompt ||
        selectedAssistant.temperature !== chatSettings.temperature
      )
    }

    return false
  }

  const isModified = checkIfModified()

  const items = assistants.map(assistant => ({
    ...assistant,
    contentType: "assistants"
  }))

  const selectedAssistantImage =
    assistantImages.find(image => image.path === selectedAssistant?.image_path)
      ?.base64 || ""

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger asChild className="max-w-[400px]" disabled={loading}>
        <Button variant="ghost" className="flex space-x-3 text-lg">
          {selectedAssistant &&
            (selectedAssistantImage ? (
              <Image
                className="rounded"
                src={selectedAssistantImage}
                alt="Assistant"
                width={28}
                height={28}
              />
            ) : (
              <IconRobotFace
                className="bg-primary text-secondary border-primary rounded border-DEFAULT p-1"
                size={28}
              />
            ))}

          {loading ? (
            <div className="animate-pulse">Loading assistant...</div>
          ) : (
            <>
              <div className="overflow-hidden text-ellipsis">
                {isModified && selectedAssistant && "Modified "}

                {selectedAssistant?.name || t("Assistants")}
              </div>

              <IconChevronDown className="ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-[300px] max-w-[500px] space-y-4"
        align="start"
      >
        {assistants.length === 0 ? (
          <div className="p-8 text-center">No items found.</div>
        ) : (
          <>
            <Input
              ref={inputRef}
              className="w-full"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
            />

            {!!selectedAssistant && (
              <QuickSettingOption
                contentType="assistants"
                isSelected={true}
                item={selectedAssistant as Tables<"assistants">}
                onSelect={() => {
                  handleSelectQuickSetting(null, "remove")
                }}
                image={selectedAssistantImage}
              />
            )}

            {items
              .filter(
                item =>
                  item.name.toLowerCase().includes(search.toLowerCase()) &&
                  item.id !== selectedAssistant?.id
              )
              .map(({ contentType, ...item }) => (
                <QuickSettingOption
                  key={item.id}
                  contentType={contentType as "assistants"}
                  isSelected={false}
                  item={item}
                  onSelect={() =>
                    handleSelectQuickSetting(
                      item,
                      contentType as "assistants"
                    )
                  }
                  image={
                    contentType === "assistants"
                      ? assistantImages.find(
                          image =>
                            image.path ===
                            (item as Tables<"assistants">).image_path
                        )?.base64 || ""
                      : ""
                  }
                />
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
