"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { Book, Copy, Check, Smartphone, Settings2, ChevronDown } from "lucide-react";

// Define message themes
type MessageTheme = 'ios' | 'android' | 'default';
type FormatStyle = 'book' | 'modern' | 'message';

interface BookFormattingProps {
  content: string;
  title?: string;
  author?: string;
  onRetry?: () => void;
}

export function BookFormatting({
  content,
  title = "AI Response",
  author = "SOS Chatbot",
  onRetry
}: BookFormattingProps) {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formatStyle, setFormatStyle] = useState<FormatStyle>('book');
  const [activeSection, setActiveSection] = useState<'title' | 'content'>('content');
  const [messageTheme, setMessageTheme] = useState<MessageTheme>('ios');
  const [dropCapEnabled, setDropCapEnabled] = useState(true);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');

  // Detect chapter headings using regex
  const parseChapters = (text: string) => {
    // Split content into sections based on headings
    const chapters = text.split(/^(#+\s+.*$)/gm).filter(Boolean);
    
    // Group chapters into pairs of headers and content
    const result = [];
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].match(/^#+\s+.*$/m)) {
        // This is a header, grab it and the next chunk as content
        const header = chapters[i];
        const content = i + 1 < chapters.length ? chapters[i + 1] : '';
        result.push({ header, content });
        i++; // Skip the content we just used
      } else {
        // This is content without a header, make it into chapter 1
        result.push({ header: '# Chapter 1', content: chapters[i] });
      }
    }
    
    return result.length > 0 ? result : [{ header: '# Chapter 1', content: text }];
  };

  const chapters = parseChapters(content);

  const renderTitlePage = () => (
    <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 border-b border-gray-200">
      <h1 className={`text-3xl font-${fontFamily} font-bold mb-6`}>{title}</h1>
      <div className="my-4 w-16 border-t border-gray-400"></div>
      <p className={`text-lg text-gray-600 italic mb-8 font-${fontFamily}`}>by {author}</p>
      <div className="mt-8 text-sm text-gray-500">
        <p>SOS Chatbot Publications</p>
        <p>{new Date().getFullYear()}</p>
      </div>
    </div>
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
      });
  };

  const renderChapter = (chapter: { header: string; content: string }, index: number) => {
    const level = (chapter.header.match(/^(#+)/) || ['#'])[0].length;
    const title = chapter.header.replace(/^#+\s+/, '');
    
    return (
      <div key={index} className="mb-8 page-break-before">
        <h2 className={`font-${fontFamily} text-${4 - Math.min(level, 3)}xl font-bold mb-4 text-center`}>
          {level === 1 ? `Chapter ${index + 1}` : ''}
          {level === 1 ? <div className="text-lg mt-1">{title}</div> : title}
        </h2>
        
        <div className="max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              // Override default paragraph rendering
              p: ({ children }) => {
                // Detect if paragraph might be dialogue
                const text = children?.toString() || '';
                const isDialogue = text.trim().startsWith('"') && text.includes('"');
                
                // Detect if paragraph might be poetry
                const isPoetry = text.split("\n").length > 1;
                
                if (isPoetry) {
                  return (
                    <div className="verse-format my-4">
                      {text.split("\n").map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </div>
                  );
                }
                
                if (isDialogue) {
                  return <p className="hanging-indent mb-3">{children}</p>;
                }
                
                return (
                  <p className={`${dropCapEnabled && index === 0 ? 'first-letter-drop' : 'indent-6'} mb-4 leading-relaxed`}>
                    {children}
                  </p>
                );
              },
              
              // Handle blockquotes with special styling
              blockquote: ({ children }) => (
                <blockquote className="book-blockquote">
                  {children}
                </blockquote>
              ),
              
              // Format poetry/verse with hanging indents
              pre: ({ children }) => (
                <pre className="whitespace-pre-wrap my-6 pl-8 pr-4 text-sm border-l-2 border-r-2 border-gray-200 py-4 font-serif">
                  {children}
                </pre>
              ),
              
              // Style headings within chapters
              h3: ({ children }) => (
                <h3 className={`text-xl font-${fontFamily} font-semibold mt-8 mb-4`}>{children}</h3>
              ),
              
              // Style dialogue with hanging indents
              li: ({ children }) => (
                <li className="pl-4 -indent-4 mb-2">{children}</li>
              ),

              // Add styling for other elements
              ul: ({ children }) => <ul className="list-disc pl-5 mb-4">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-4">{children}</ol>,
              code: ({ children }) => <code className="bg-cream rounded px-1 py-0.5 font-mono text-sm">{children}</code>,
              img: ({ src, alt }) => (
                <div className="my-6 text-center">
                  <img src={src} alt={alt} className="max-w-full mx-auto rounded" />
                  {alt && <p className="text-sm text-gray-600 mt-2 italic">{alt}</p>}
                </div>
              )
            }}
          >
            {chapter.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  const renderBookContent = () => (
    <div className={`bg-cream font-${fontFamily} text-gray-900 px-6 pt-4 pb-8`}>
      {activeSection === 'title' ? renderTitlePage() : (
        <div>
          {chapters.map((chapter, index) => renderChapter(chapter, index))}
        </div>
      )}
    </div>
  );

  const renderModernContent = () => (
    <div className="bg-white text-gray-900 px-6 pt-4 pb-8">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div className="max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ children }) => <p className="mb-4">{children}</p>,
            h2: ({ children }) => <h2 className="text-xl font-bold mt-6 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold mt-5 mb-2">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc pl-5 mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 mb-4">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>
            ),
            code: ({ children }) => <code className="bg-gray-100 rounded px-1 py-0.5">{children}</code>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );

  const renderMessageBubble = () => {
    let bubbleClass = 'bg-white rounded-lg p-4 text-black';
    
    // Apply different message styling based on theme
    if (messageTheme === 'ios') {
      bubbleClass = 'bg-gray-100 rounded-2xl p-4 text-black mx-4 my-2 shadow-sm';
    } else if (messageTheme === 'android') {
      bubbleClass = 'bg-blue-600 rounded-lg p-4 text-white mx-4 my-2';
    }
    
    return (
      <div className={`max-w-md mx-auto ${messageTheme === 'ios' ? 'font-sans' : ''}`}>
        {/* Message header - like the contact name */}
        <div className={`text-center mb-4 ${messageTheme === 'ios' ? 'text-gray-600' : 'text-gray-800'}`}>
          <p className="font-medium">{author}</p>
          <p className="text-xs">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        
        <div className={bubbleClass}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {content}
          </ReactMarkdown>
        </div>
        
        {/* Timestamp */}
        <div className="text-xs text-gray-500 text-right mt-1 mr-4">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="bg-white border-t border-gray-200 p-4">
      <h3 className="font-medium text-sm mb-2">Formatting Options</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {formatStyle === 'book' && (
          <>
            <div>
              <label className="text-sm text-gray-700 block mb-1">Font Family</label>
              <select 
                value={fontFamily} 
                onChange={(e) => setFontFamily(e.target.value as 'serif' | 'sans')}
                className="w-full p-2 border rounded"
              >
                <option value="serif">Serif (Book Style)</option>
                <option value="sans">Sans-Serif (Modern)</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="dropCap" 
                checked={dropCapEnabled}
                onChange={() => setDropCapEnabled(!dropCapEnabled)} 
                className="mr-2"
              />
              <label htmlFor="dropCap" className="text-sm text-gray-700">Enable Drop Caps</label>
            </div>
          </>
        )}
        
        {formatStyle === 'message' && (
          <div>
            <label className="text-sm text-gray-700 block mb-1">Message Theme</label>
            <select 
              value={messageTheme} 
              onChange={(e) => setMessageTheme(e.target.value as MessageTheme)}
              className="w-full p-2 border rounded"
            >
              <option value="ios">iOS Style</option>
              <option value="android">Android Style</option>
              <option value="default">Default</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Format Style Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-gray-50">
        <div className="flex space-x-2">
          <Button
            variant={formatStyle === 'book' ? "default" : "ghost"}
            size="sm"
            onClick={() => setFormatStyle('book')}
            className="text-xs"
          >
            <Book className="h-4 w-4 mr-1" />
            Book
          </Button>
          <Button
            variant={formatStyle === 'modern' ? "default" : "ghost"}
            size="sm"
            onClick={() => setFormatStyle('modern')}
            className="text-xs"
          >
            Modern
          </Button>
          <Button
            variant={formatStyle === 'message' ? "default" : "ghost"}
            size="sm"
            onClick={() => setFormatStyle('message')}
            className="text-xs"
          >
            <Smartphone className="h-4 w-4 mr-1" />
            Message
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {formatStyle === 'book' && (
            <>
              <Button
                variant={activeSection === 'title' ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSection('title')}
                className="text-xs"
              >
                Title Page
              </Button>
              <Button
                variant={activeSection === 'content' ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSection('content')}
                className="text-xs"
              >
                Content
              </Button>
            </>
          )}
          
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <Settings2 className="h-4 w-4 mr-1" />
            Settings
          </Button>
          
          <Button
            onClick={copyToClipboard}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            {copied ? (
              <><Check className="h-3 w-3 mr-1" /> Copied</>
            ) : (
              <><Copy className="h-3 w-3 mr-1" /> Copy</>
            )}
          </Button>
          
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && renderSettings()}
      
      {/* Content Area */}
      <div className={`${formatStyle === 'book' ? `font-${fontFamily} bg-cream` : 'bg-white'}`}>
        {formatStyle === 'book' && renderBookContent()}
        {formatStyle === 'modern' && renderModernContent()}
        {formatStyle === 'message' && renderMessageBubble()}
      </div>
    </div>
  );
} 