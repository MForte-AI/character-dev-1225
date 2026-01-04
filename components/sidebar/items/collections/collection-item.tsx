import { FileIcon } from "@/components/ui/file-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChatbotUIContext } from "@/context/context"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import { COLLECTION_DESCRIPTION_MAX, COLLECTION_NAME_MAX } from "@/db/limits"
import { Tables } from "@/supabase/types"
import { CollectionFile } from "@/types"
import {
  IconBooks,
  IconChevronDown,
  IconChevronRight,
  IconEdit
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { ChatItem } from "../chat/chat-item"
import { SidebarUpdateItem } from "../all/sidebar-update-item"
import { CollectionFileSelect } from "./collection-file-select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CollectionItemProps {
  collection: Tables<"collections">
}

export const CollectionItem: FC<CollectionItemProps> = ({ collection }) => {
  const { chats, files } = useContext(ChatbotUIContext)

  const itemRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [collectionFiles, setCollectionFiles] = useState<CollectionFile[]>([])

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
  }, [collection.id, isExpanded, files.length])

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
      <div
        tabIndex={0}
        className={cn(
          "hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center justify-between rounded p-2 hover:opacity-50 focus:outline-none"
        )}
        onClick={() => setIsExpanded(prev => !prev)}
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
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
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
                  className="flex items-center space-x-2 text-sm"
                >
                  <FileIcon type={file.type} size={22} />
                  <div className="truncate">{file.name}</div>
                </div>
              ))}
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground text-xs font-semibold uppercase">
              Chats
            </div>

            {collectionChats.length === 0 && (
              <div className="text-muted-foreground text-sm">No chats.</div>
            )}

            {collectionChats.map(chat => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
