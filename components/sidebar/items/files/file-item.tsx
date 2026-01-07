import { Button } from "@/components/ui/button"
import { FileIcon } from "@/components/ui/file-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChatbotUIContext } from "@/context/context"
import { FILE_DESCRIPTION_MAX, FILE_NAME_MAX } from "@/db/limits"
import { getFileFromStorage } from "@/db/storage/files"
import { Tables } from "@/supabase/types"
import { FC, useContext, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"
import { IconPaperclip } from "@tabler/icons-react"

interface FileItemProps {
  file: Tables<"files">
}

export const FileItem: FC<FileItemProps> = ({ file }) => {
  const {
    chatFiles,
    newMessageFiles,
    setNewMessageFiles,
    setShowFilesDisplay,
    setUseRetrieval
  } = useContext(ChatbotUIContext)
  const [name, setName] = useState(file.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(file.description)

  const isAttachedToChat =
    newMessageFiles.some(attachedFile => attachedFile.id === file.id) ||
    chatFiles.some(attachedFile => attachedFile.id === file.id)

  const getLinkAndView = async () => {
    const link = await getFileFromStorage(file.file_path)
    window.open(link, "_blank")
  }

  const handleAttachToChat = () => {
    setShowFilesDisplay(true)
    setUseRetrieval(true)

    setNewMessageFiles(prev => {
      const alreadyAttached =
        prev.some(attachedFile => attachedFile.id === file.id) ||
        chatFiles.some(attachedFile => attachedFile.id === file.id)

      if (alreadyAttached) return prev

      return [
        ...prev,
        {
          id: file.id,
          name: file.name,
          type: file.type,
          file: null
        }
      ]
    })
  }

  return (
    <SidebarItem
      item={file}
      isTyping={isTyping}
      contentType="files"
      icon={<FileIcon type={file.type} size={30} />}
      rowAction={
        <Button
          size="sm"
          variant="secondary"
          onClick={handleAttachToChat}
          disabled={isAttachedToChat}
          aria-label="Attach file to chat"
          title={isAttachedToChat ? "Already attached" : "Attach to chat"}
        >
          <IconPaperclip size={16} className="mr-1" />
          {isAttachedToChat ? "Attached" : "Attach"}
        </Button>
      }
      updateState={{ name, description }}
      renderInputs={() => (
        <>
          <div
            className="cursor-pointer underline hover:opacity-50"
            onClick={getLinkAndView}
          >
            View {file.name}
          </div>

          <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Attach to your next message
          </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAttachToChat}
              disabled={isAttachedToChat}
            >
              {isAttachedToChat ? "Attached" : "Attach"}
            </Button>
          </div>

          <div className="flex flex-col justify-between">
            <div>{file.type}</div>

            <div>{formatFileSize(file.size)}</div>

            <div>{file.tokens.toLocaleString()} tokens</div>
          </div>

          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="File name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={FILE_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>

            <Input
              placeholder="File description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={FILE_DESCRIPTION_MAX}
            />
          </div>
        </>
      )}
    />
  )
}

export const formatFileSize = (sizeInBytes: number): string => {
  let size = sizeInBytes
  let unit = "bytes"

  if (size >= 1024) {
    size /= 1024
    unit = "KB"
  }

  if (size >= 1024) {
    size /= 1024
    unit = "MB"
  }

  if (size >= 1024) {
    size /= 1024
    unit = "GB"
  }

  return `${size.toFixed(2)} ${unit}`
}
