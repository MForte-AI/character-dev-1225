export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="size-12 animate-spin rounded-full border-y-2 border-blue-500"></div>
      <span className="ml-4 text-lg">Loading...</span>
    </div>
  )
}
