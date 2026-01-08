export default function HelpPage() {
  return (
    <div className="flex size-full justify-center">
      <div className="w-full max-w-2xl space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Script Whisperer Guide</h1>
          <p className="text-muted-foreground">
            A quick start guide for working with files and chats.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Attach files to a chat</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Use the + button in the chat input for device uploads.</li>
            <li>
              Type # in the chat input to open Script Whisperer Files and attach
              existing files.
            </li>
            <li>
              Use the Attach button on any file row in the sidebar to add it to
              the next message.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Use retrieval</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              The file toggle in the chat input enables retrieval for attached
              files.
            </li>
            <li>
              If you do not want files used in a reply, disable retrieval for
              that message.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Need help?</h2>
          <p className="text-muted-foreground">
            Customer service is still being set up. The help menu includes a
            placeholder email for now.
          </p>
        </div>
      </div>
    </div>
  )
}
