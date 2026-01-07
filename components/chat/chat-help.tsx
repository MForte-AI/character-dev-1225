import useHotkey from "@/lib/hooks/use-hotkey"
import { IconQuestionMark } from "@tabler/icons-react"
import Link from "next/link"
import { FC, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"

interface ChatHelpProps {}

export const ChatHelp: FC<ChatHelpProps> = ({}) => {
  useHotkey("/", () => setIsOpen(prevState => !prevState))

  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <IconQuestionMark className="bg-primary text-secondary size-[24px] cursor-pointer rounded-full p-0.5 opacity-60 hover:opacity-50 lg:size-[30px] lg:p-1" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link className="w-full cursor-pointer" href="/help">
            Script Whisperer Guide
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            className="w-full cursor-pointer"
            href="mailto:support@example.com?subject=Script%20Whisperer%20Support"
          >
            Contact Customer Service
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
