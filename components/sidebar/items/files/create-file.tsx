import { ACCEPTED_FILE_TYPES } from "@/components/chat/chat-hooks/use-select-file-handler"
import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
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
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useState } from "react"
import { DOCUMENT_TYPE_OPTIONS } from "./file-metadata"

interface CreateFileProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateFile: FC<CreateFileProps> = ({ isOpen, onOpenChange }) => {
  const { profile, selectedWorkspace, collections } =
    useContext(ChatbotUIContext)

  const [name, setName] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState("")
  const [documentType, setDocumentType] = useState<string>("")
  const [logline, setLogline] = useState("")
  const [genre, setGenre] = useState("")
  const [pageCount, setPageCount] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("")

  const handleSelectedFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const file = e.target.files[0]

    if (!file) return

    setSelectedFile(file)
    const fileNameWithoutExtension = file.name.split(".").slice(0, -1).join(".")
    setName(fileNameWithoutExtension)
  }

  if (!profile) return null
  if (!selectedWorkspace) return null

  const parsedPageCount = pageCount.trim()
    ? Number.parseInt(pageCount, 10)
    : null
  const isValidPageCount = Boolean(parsedPageCount && parsedPageCount > 0)
  const isCreateDisabled = !selectedFile || !isValidPageCount

  return (
    <SidebarCreateItem
      contentType="files"
      createState={
        {
          file: selectedFile,
          collectionId: selectedCollectionId || null,
          user_id: profile.user_id,
          name,
          description,
          document_type: documentType || null,
          logline: logline.trim() || null,
          genre: genre.trim() || null,
          page_count: parsedPageCount,
          file_path: "",
          size: selectedFile?.size || 0,
          tokens: 0,
          type: selectedFile?.type || 0
        } as TablesInsert<"files">
      }
      isOpen={isOpen}
      isTyping={isTyping}
      isCreateDisabled={isCreateDisabled}
      onOpenChange={onOpenChange}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>File</Label>

            <Input
              type="file"
              onChange={handleSelectedFile}
              accept={ACCEPTED_FILE_TYPES}
            />
          </div>

          <div className="space-y-1">
            <Label>Collection (optional)</Label>

            <Select
              value={selectedCollectionId || "none"}
              onValueChange={value =>
                setSelectedCollectionId(value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No collection" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">No collection</SelectItem>
                {collections.map(collection => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
