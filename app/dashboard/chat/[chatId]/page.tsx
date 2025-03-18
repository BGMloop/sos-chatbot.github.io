import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { getCurrentUser } from "@/lib/auth";
import ChatContainer from "./ChatContainer";

interface ChatPageProps {
  params: {
    chatId: Id<"chats">;
  };
}

const ChatPage = async ({ params }: ChatPageProps) => {
  const userId = await getCurrentUser();
  const { chatId } = await params;
  let chat = null;
  let retries = 3;

  try {
    const convex = getConvexClient();

    while (!chat && retries > 0) {
      try {
        chat = await convex.query(api.chats.getChat, {
          id: chatId,
          userId
        });
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!chat) {
      throw new Error('Chat not found');
    }

    return <ChatContainer chatId={chatId} title={chat.title} />;
  } catch (err) {
    console.error('Error loading chat:', err);
    return (
      <div className="flex-1 space-y-5 p-4">
        <div className="text-red-500">
          Error loading chat. Please try refreshing the page.
        </div>
      </div>
    );
  }
};

export default ChatPage;
