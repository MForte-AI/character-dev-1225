import { Button } from "@/components/ui/button"
import { FileIcon } from "@/components/ui/file-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { ChatbotUIContext } from "@/context/context"
import {
  FILE_DESCRIPTION_MAX,
  FILE_GENRE_MAX,
  FILE_LOGLINE_MAX,
  FILE_NAME_MAX
} from "@/db/limits"
import { getFileFromStorage } from "@/db/storage/files"
import { Tables } from "@/supabase/types"
import { FC, useContext, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"
import { IconPaperclip } from "@tabler/icons-react"
import { DOCUMENT_TYPE_OPTIONS } from "./file-metadata"

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
  const [documentType, setDocumentType] = useState(file.document_type || "")
  const [logline, setLogline] = useState(file.logline || "")
  const [genre, setGenre] = useState(file.genre || "")
  const [pageCount, setPageCount] = useState(
    file.page_count ? file.page_count.toString() : ""
  )

  const parsedPageCount = pageCount.trim()
    ? Number.parseInt(pageCount, 10)
    : null
  const normalizedPageCount =
    parsedPageCount && parsedPageCount > 0 ? parsedPageCount : null

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
      updateState={{
        name,
        description,
        document_type: documentType || null,
        logline: logline.trim() || null,
        genre: genre.trim() || null,
        page_count: normalizedPageCount
      }}
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

          <div className="space-y-1">
            <Label>Document Type</Label>

            <Select
              value={documentType || "none"}
              onValueChange={value =>
                setDocumentType(value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a document type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">Select a document type</SelectItem>
                {DOCUMENT_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Logline</Label>

            <TextareaAutosize
              placeholder="Add a logline..."
              value={logline}
              onValueChange={setLogline}
              minRows={2}
              maxLength={FILE_LOGLINE_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Genre</Label>

            <Input
              placeholder="Add a genre..."
              value={genre}
              onChange={e => setGenre(e.target.value)}
              maxLength={FILE_GENRE_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Page Count</Label>

            <Input
              placeholder="Enter page count..."
              type="number"
              min={1}
              value={pageCount}
              onChange={e => setPageCount(e.target.value)}
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
