'use client';
import { ChatBox } from '@/components/ChatBox';
import { Navigation } from '@/components/Navigation';
export default function ChatPage() {
    return (<div className="flex flex-col min-h-screen">
      <header className="border-b p-4">
        <Navigation />
      </header>
      
      <main className="flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">Chat</h1>
            <p className="text-gray-500">
              Chat with the AI assistant powered by DeepSeek R1-Zero
            </p>
          </div>
          
          <div className="flex-1 flex flex-col">
            <ChatBox />
          </div>
        </div>
      </main>
      
      <footer className="border-t p-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} SOS-Chatbot
      </footer>
    </div>);
}
