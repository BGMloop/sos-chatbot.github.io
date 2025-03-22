import { useState, useRef, useEffect } from 'react';
import { sendChatRequest, sendFileRequest } from '@/lib/chat-api';
import { debugLog } from '@/lib/debug';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { ChatSettings } from '@/components/ChatSettings';
export function ChatBox({ chatId, initialMessages = [], showFileUpload = true }) {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const messagesEndRef = useRef(null);
    const playNotificationSound = useNotificationSound();
    // Scroll to bottom when messages change
    useEffect(() => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    // Handle file selection
    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };
    // Clear file selection
    const clearFile = () => {
        setFile(null);
        // Reset the file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() && !file) {
            setError('Please enter a message or upload a file');
            return;
        }
        // Play the notification sound
        playNotificationSound();
        setError(null);
        setIsLoading(true);
        // Add user message to the list
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        // Create a placeholder for the assistant's response
        const responseIndex = messages.length;
        setMessages(prev => [
            ...prev,
            { role: 'assistant', content: '' }
        ]);
        try {
            if (file) {
                // If we have a file, use the file upload API
                debugLog('chat', 'Sending file request', { fileName: file.name });
                await sendFileRequest({
                    message: input,
                    file,
                    chatId,
                    onToken: (token) => {
                        setMessages(prev => {
                            const updated = [...prev];
                            updated[responseIndex + 1] = Object.assign(Object.assign({}, updated[responseIndex + 1]), { content: updated[responseIndex + 1].content + token });
                            return updated;
                        });
                    },
                    onError: (errorMsg) => {
                        setError(errorMsg);
                    },
                    onDone: () => {
                        setIsLoading(false);
                        clearFile();
                    }
                });
            }
            else {
                // Otherwise, use the regular chat API
                debugLog('chat', 'Sending chat request');
                await sendChatRequest({
                    messages: [...messages, userMessage],
                    chatId,
                    onToken: (token) => {
                        setMessages(prev => {
                            const updated = [...prev];
                            updated[responseIndex + 1] = Object.assign(Object.assign({}, updated[responseIndex + 1]), { content: updated[responseIndex + 1].content + token });
                            return updated;
                        });
                    },
                    onError: (errorMsg) => {
                        setError(errorMsg);
                    },
                    onDone: () => {
                        setIsLoading(false);
                    }
                });
            }
        }
        catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message. Please try again.');
            setIsLoading(false);
        }
    };
    return (<div className="flex flex-col h-full">
      {/* Chat Header with Settings */}
      <div className="p-2 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium">Chat Session</h2>
        <ChatSettings />
      </div>
      
      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (<div key={index} className={`p-3 rounded-lg ${message.role === 'user'
                ? 'bg-blue-100 ml-12'
                : message.role === 'assistant'
                    ? 'bg-gray-100 mr-12'
                    : 'bg-yellow-100 text-sm italic'}`}>
            {message.content || (message.role === 'assistant' && isLoading && index === messages.length - 1
                ? 'Thinking...'
                : '')}
          </div>))}
        <div ref={messagesEndRef}/>
      </div>
      
      {/* Error Message */}
      {error && (<div className="p-2 m-2 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>)}
      
      {/* File Preview */}
      {file && (<div className="p-2 m-2 bg-gray-100 text-sm rounded-md flex justify-between items-center">
          <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
          <button onClick={clearFile} className="text-red-500 hover:text-red-700">
            Remove
          </button>
        </div>)}
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-2 border-t">
        <div className="flex items-center space-x-2">
          {showFileUpload && (<label className="cursor-pointer">
              <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" disabled={isLoading}/>
              <span className="p-2 text-gray-500 hover:text-gray-700">
                📎
              </span>
            </label>)}
          
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className="flex-1 p-2 border rounded-md" disabled={isLoading}/>
          
          <button type="submit" disabled={isLoading || (!input.trim() && !file)} className={`p-2 rounded-md ${isLoading || (!input.trim() && !file)
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
            Send
          </button>
        </div>
      </form>
    </div>);
}
