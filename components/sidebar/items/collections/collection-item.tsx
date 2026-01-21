import { FileIcon } from "@/components/ui/file-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChatbotUIContext } from "@/context/context"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import { updateChat } from "@/db/chats"
import { COLLECTION_DESCRIPTION_MAX, COLLECTION_NAME_MAX } from "@/db/limits"
import { Tables } from "@/supabase/types"
import { CollectionFile } from "@/types"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import {
  IconBooks,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconInfoCircle,
  IconMessagePlus
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { ChatItem } from "../chat/chat-item"
import { SidebarUpdateItem } from "../all/sidebar-update-item"
import { CollectionFileSelect } from "./collection-file-select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "../files/file-item"

interface CollectionItemProps {
  collection: Tables<"collections">
}

export const CollectionItem: FC<CollectionItemProps> = ({ collection }) => {
  const { chats, files, setChats } = useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()

  const itemRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [collectionFiles, setCollectionFiles] = useState<CollectionFile[]>([])
  const [infoFile, setInfoFile] = useState<CollectionFile | null>(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const handleFileSelect = (
    file: CollectionFile,
    setSelectedCollectionFiles: React.Dispatch<
      React.SetStateAction<CollectionFile[]>
    >
  ) => {
    setSelectedCollectionFiles(prevState => {
      const isFileAlreadySelected = prevState.find(
        selectedFile => selectedFile.id === file.id
      )

      if (isFileAlreadySelected) {
        return prevState.filter(selectedFile => selectedFile.id !== file.id)
      } else {
        return [...prevState, file]
      }
    })
  }

  const collectionChats = chats.filter(
    chat => chat.collection_id === collection.id
  )

  const handleChatDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    chatId: string
  ) => {
    e.dataTransfer.setData("text/plain", chatId)
    e.dataTransfer.setData("contentType", "chats")
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const dragType = e.dataTransfer.getData("contentType")
    setIsDragOver(dragType === "chats")
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    const dragType = e.dataTransfer.getData("contentType")
    if (dragType !== "chats") return
    e.preventDefault()
    setIsDragOver(false)

    const chatId = e.dataTransfer.getData("text/plain")
    if (!chatId) return

    const chat = chats.find(item => item.id === chatId)
    if (!chat || chat.collection_id === collection.id) return

    try {
      const updatedChat = await updateChat(chatId, {
        collection_id: collection.id
      })
      setChats(prevChats =>
        prevChats.map(prevChat =>
          prevChat.id === updatedChat.id ? updatedChat : prevChat
        )
      )
    } catch (error) {
      toast.error(`Failed to move chat to collection. ${error}`)
    }
  }

  useEffect(() => {
    if (!isExpanded) return

    let isMounted = true

    const loadFiles = async () => {
      setIsLoadingFiles(true)
      try {
        const collectionData = await getCollectionFilesByCollectionId(
          collection.id
        )
        if (!isMounted) return
        setCollectionFiles(collectionData.files || [])
      } catch (error) {
        if (!isMounted) return
        toast.error(`Failed to load collection files. ${error}`)
        setCollectionFiles([])
      } finally {
        if (isMounted) {
          setIsLoadingFiles(false)
        }
      }
    }

    loadFiles()

    return () => {
      isMounted = false
    }
  }, [collection.id, files, isExpanded])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  return (
    <div
      ref={itemRef}
      className={cn("rounded focus:outline-none")}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Sheet
        open={isInfoOpen}
        onOpenChange={open => {
          setIsInfoOpen(open)
          if (!open) {
            setInfoFile(null)
          }
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>File Details</SheetTitle>
          </SheetHeader>

          {infoFile && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Name</div>
                <div className="font-medium">{infoFile.name}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Type</div>
                <div className="font-medium">{infoFile.type}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Description</div>
                <div className="font-medium">
                  {infoFile.description || "Not set"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Document Type</div>
                <div className="font-medium">
                  {infoFile.document_type || "Not set"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Genre</div>
                <div className="font-medium">
                  {infoFile.genre || "Not set"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Logline</div>
                <div className="font-medium whitespace-pre-wrap">
                  {infoFile.logline || "Not set"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Page Count</div>
                <div className="font-medium">
                  {infoFile.page_count ?? "Not set"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Size</div>
                <div className="font-medium">
                  {typeof infoFile.size === "number"
                    ? formatFileSize(infoFile.size)
                    : "Not set"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Tokens</div>
                <div className="font-medium">
                  {typeof infoFile.tokens === "number"
                    ? infoFile.tokens.toLocaleString()
                    : "Not set"}
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsInfoOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div
        tabIndex={0}
        className={cn(
          "hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center justify-between rounded p-2 hover:opacity-50 focus:outline-none",
          isDragOver && "bg-accent"
        )}
        onClick={() => setIsExpanded(prev => !prev)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <IconChevronDown stroke={3} />
          ) : (
            <IconChevronRight stroke={3} />
          )}

          <IconBooks size={30} />

          <div className="truncate text-sm font-semibold">{collection.name}</div>
        </div>

        {isHovering && (
          <div
            className="flex items-center space-x-2"
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <button
              className="hover:opacity-50"
              onClick={() => handleNewChat(collection.id)}
              type="button"
            >
              <IconMessagePlus size={18} />
            </button>

            <SidebarUpdateItem
              item={collection}
              isTyping={false}
              contentType="collections"
              updateState={{
                name,
                description
              }}
              renderInputs={(renderState: {
                startingCollectionFiles: CollectionFile[]
                setStartingCollectionFiles: React.Dispatch<
                  React.SetStateAction<CollectionFile[]>
                >
                selectedCollectionFiles: CollectionFile[]
                setSelectedCollectionFiles: React.Dispatch<
                  React.SetStateAction<CollectionFile[]>
                >
              }) => {
                return (
                  <>
                    <div className="space-y-1">
                      <Label>Files</Label>

                      <CollectionFileSelect
                        selectedCollectionFiles={
                          renderState.selectedCollectionFiles.length === 0
                            ? renderState.startingCollectionFiles
                            : [
                                ...renderState.startingCollectionFiles.filter(
                                  startingFile =>
                                    !renderState.selectedCollectionFiles.some(
                                      selectedFile =>
                                        selectedFile.id === startingFile.id
                                    )
                                ),
                                ...renderState.selectedCollectionFiles.filter(
                                  selectedFile =>
                                    !renderState.startingCollectionFiles.some(
                                      startingFile =>
                                        startingFile.id === selectedFile.id
                                    )
                                )
                              ]
                        }
                        onCollectionFileSelect={file =>
                          handleFileSelect(
                            file,
                            renderState.setSelectedCollectionFiles
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Name</Label>

                      <Input
                        placeholder="Collection name..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={COLLECTION_NAME_MAX}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Description</Label>

                      <Input
                        placeholder="Collection description..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={COLLECTION_DESCRIPTION_MAX}
                      />
                    </div>
                  </>
                )
              }}
            >
              <IconEdit className="hover:opacity-50" size={18} />
            </SidebarUpdateItem>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="ml-5 mt-2 space-y-4 border-l-2 pl-4">
          <div className="space-y-2">
            <div className="text-muted-foreground text-xs font-semibold uppercase">
              Files
            </div>

            {isLoadingFiles && (
              <div className="text-muted-foreground text-sm">
                Loading files...
              </div>
            )}

            {!isLoadingFiles && collectionFiles.length === 0 && (
              <div className="text-muted-foreground text-sm">No files.</div>
            )}

            {!isLoadingFiles &&
              collectionFiles.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between space-x-2 text-sm"
                >
                  <div className="flex min-w-0 items-center space-x-2">
                    <FileIcon type={file.type} size={22} />
                    <div className="truncate">{file.name}</div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`View details for ${file.name}`}
                    onClick={e => {
                      e.stopPropagation()
                      setInfoFile(file)
                      setIsInfoOpen(true)
                    }}
                  >
                    <IconInfoCircle size={18} />
                  </Button>
                </div>
              ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-xs font-semibold uppercase">
                Chats
              </div>

              <button
                className="text-muted-foreground flex items-center space-x-1 text-xs hover:opacity-70"
                onClick={() => handleNewChat(collection.id)}
                type="button"
              >
                <IconMessagePlus size={16} />
                <span>New Chat</span>
              </button>
            </div>

            {collectionChats.length === 0 && (
              <div className="text-muted-foreground text-sm">No chats.</div>
            )}

            {collectionChats.map(chat => (
              <div
                key={chat.id}
                draggable
                onDragStart={e => handleChatDragStart(e, chat.id)}
              >
                <ChatItem chat={chat} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
