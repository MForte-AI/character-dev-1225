export const useChats = () => {
  return {
    getChats: () => {
      console.log("Fetching chats...")
      return []
    },
    addChat: (chat: any) => {
      console.log("Adding chat:", chat)
    }
  }
}
