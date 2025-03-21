import React, { useState } from 'react';
import { 
  Share2, Copy, Twitter, Facebook, Linkedin, Mail, 
  Link, Check, X, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ShareConversationProps {
  chatId: string;
  messages: any[];
  title?: string;
  buttonOnly?: boolean;
}

export default function ShareConversation({ 
  chatId, 
  messages, 
  title = 'Conversation', 
  buttonOnly = false 
}: ShareConversationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState('link');
  const [expiryDays, setExpiryDays] = useState(7);
  const [includeSystemMessages, setIncludeSystemMessages] = useState(false);
  
  // Generate a shareable link for the conversation
  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${chatId}?exp=${expiryDays}d&sys=${includeSystemMessages ? 1 : 0}`;
  };
  
  // Format conversation as text
  const getConversationText = () => {
    const formattedTitle = `# ${title}\n\n`;
    
    const formattedMessages = messages
      .filter(msg => includeSystemMessages || msg.role !== 'system')
      .map(msg => {
        const sender = msg.role === 'user' ? 'Human' : 
                      msg.role === 'assistant' ? 'AI' : 'System';
        return `${sender}: ${msg.content}`;
      })
      .join('\n\n');
      
    return formattedTitle + formattedMessages;
  };
  
  // Copy conversation to clipboard
  const copyConversation = () => {
    const text = getConversationText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Copy link to clipboard
  const copyLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Download conversation as text file
  const downloadConversation = () => {
    const text = getConversationText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Share to social media
  const shareToSocial = (platform: string) => {
    const shareLink = encodeURIComponent(generateShareableLink());
    const shareTitle = encodeURIComponent(`Check out my conversation: ${title}`);
    
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${shareLink}&text=${shareTitle}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${shareTitle}&body=${shareLink}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <>
      <div className="relative">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsOpen(true)}
          className={`rounded-full ${!buttonOnly ? 'hover:bg-accent hover:text-accent-foreground' : ''}`}
          title="Share Conversation"
        >
          <Share2 className="h-5 w-5" />
        </Button>
        
        {!buttonOnly && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Share Conversation</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="include-system" 
                checked={includeSystemMessages}
                onChange={(e) => setIncludeSystemMessages(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="include-system" className="text-sm">
                Include system messages
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Expiry:</label>
              <div className="flex gap-2">
                {[1, 7, 30, 0].map((days) => (
                  <Button 
                    key={days}
                    variant={expiryDays === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExpiryDays(days)}
                    className="flex-1"
                  >
                    {days === 0 ? "Never" : `${days} day${days > 1 ? 's' : ''}`}
                  </Button>
                ))}
              </div>
            </div>
            
            <Tabs defaultValue="link" onValueChange={setActiveShareTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link">Share Link</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              
              <TabsContent value="link" className="space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={generateShareableLink()}
                    readOnly
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={copyLink}
                    className={copied ? "bg-green-50 text-green-600" : ""}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex justify-center space-x-4 py-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => shareToSocial('twitter')}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share on Twitter</p>
                      </TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => shareToSocial('facebook')}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share on Facebook</p>
                      </TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => shareToSocial('linkedin')}
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share on LinkedIn</p>
                      </TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => shareToSocial('email')}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share via Email</p>
                      </TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                </div>
              </TabsContent>
              
              <TabsContent value="export" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Export the conversation as a file or copy it to clipboard.
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={copyConversation}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={downloadConversation}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download as Text
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-xs text-gray-500">
              Note: Shared conversations are stored securely and can be accessed by anyone with the link.
              {expiryDays > 0 && ` This link will expire in ${expiryDays} day${expiryDays > 1 ? 's' : ''}.`}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 