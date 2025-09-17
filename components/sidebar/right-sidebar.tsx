import { ChatbotUIContext } from "@/context/context"
import { IconX } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { Button } from "../ui/button"
import { FilePreview } from "../ui/file-preview"

interface RightSidebarProps {}

export const RightSidebar: FC<RightSidebarProps> = ({}) => {
  const {
    showFilePreview,
    filePreviewItem,
    filePreviewType,
    setShowFilePreview
  } = useContext(ChatbotUIContext)

  if (!showFilePreview) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowFilePreview(false)}
        >
          <IconX />
        </Button>
      </div>

      <FilePreview item={filePreviewItem} type={filePreviewType} />
    </div>
  )
}
