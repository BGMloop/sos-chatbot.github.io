import React, { useState } from 'react';
import { 
  Wrench, Calculator, CreditCard, Cloud, Newspaper, BookOpen, 
  Search, Globe, ChevronRight, ArrowRight, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ToolExample {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
  category: string;
}

interface ToolsExamplesProps {
  onExampleClick?: (example: string) => void;
  buttonOnly?: boolean;
}

export default function ToolsExamples({ 
  onExampleClick, 
  buttonOnly = false 
}: ToolsExamplesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [copied, setCopied] = useState<string | null>(null);

  const tools: ToolExample[] = [
    {
      id: 'math',
      name: 'Math Calculator',
      description: 'Solve mathematical calculations with precision.',
      icon: <Calculator className="h-5 w-5" />,
      examples: [
        'Calculate 15% of 230',
        'Solve the equation x^2 + 5x + 6 = 0',
        'What is the derivative of sin(2x)'
      ],
      category: 'utilities'
    },
    {
      id: 'currency',
      name: 'Currency Exchange',
      description: 'Convert between different currencies using real-time rates.',
      icon: <CreditCard className="h-5 w-5" />,
      examples: [
        'Convert 100 USD to EUR',
        'Convert from: USD, to: JPY, amount: 50',
        'What is the exchange rate between GBP and CAD?'
      ],
      category: 'utilities'
    },
    {
      id: 'weather',
      name: 'Weather',
      description: 'Get current weather conditions and forecasts for any location.',
      icon: <Cloud className="h-5 w-5" />,
      examples: [
        'What\'s the weather in London?',
        'Show me the weather forecast for Tokyo',
        'Current temperature in New York City'
      ],
      category: 'information'
    },
    {
      id: 'news',
      name: 'News Search',
      description: 'Search for recent news articles by topic.',
      icon: <Newspaper className="h-5 w-5" />,
      examples: [
        'Find news about artificial intelligence',
        'Show me recent news about climate change',
        'Search for technology news'
      ],
      category: 'information'
    },
    {
      id: 'headlines',
      name: 'News Headlines',
      description: 'Get top headlines by country and category.',
      icon: <Newspaper className="h-5 w-5" />,
      examples: [
        'Show top headlines in the US',
        'What are the latest business headlines in the UK?',
        'Show technology news headlines for Germany'
      ],
      category: 'information'
    },
    {
      id: 'books',
      name: 'Google Books',
      description: 'Search for books and get details like authors, publish dates, and summaries.',
      icon: <BookOpen className="h-5 w-5" />,
      examples: [
        'Find books by Yuval Noah Harari',
        'Search for the book "Dune" by Frank Herbert',
        'Get information about "The Great Gatsby"'
      ],
      category: 'search'
    },
    {
      id: 'wikipedia',
      name: 'Wikipedia Search',
      description: 'Look up information from Wikipedia articles.',
      icon: <Search className="h-5 w-5" />,
      examples: [
        'Search Wikipedia for quantum physics',
        'What does Wikipedia say about the Roman Empire?',
        'Look up "artificial intelligence" on Wikipedia'
      ],
      category: 'search'
    },
    {
      id: 'websearch',
      name: 'Web Search',
      description: 'Search the web for real-time information on any topic.',
      icon: <Globe className="h-5 w-5" />,
      examples: [
        'Search the web for latest AI advancements',
        'Find information about renewable energy technologies',
        'Look up best practices for urban gardening'
      ],
      category: 'search'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Tools' },
    { id: 'utilities', name: 'Utilities' },
    { id: 'information', name: 'Information' },
    { id: 'search', name: 'Search' }
  ];

  const filteredTools = activeCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  const handleExampleClick = (example: string) => {
    if (onExampleClick) {
      onExampleClick(example);
      setIsOpen(false);
    }
  };

  const copyExample = (example: string) => {
    navigator.clipboard.writeText(example).then(() => {
      setCopied(example);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className={`rounded-full ${!buttonOnly ? 'hover:bg-accent hover:text-accent-foreground' : ''}`}
          title="Tool Examples"
        >
          <Wrench className="h-5 w-5" />
        </Button>
        
        {!buttonOnly && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" /> Available Tools & Examples
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="all" onValueChange={setActiveCategory} className="w-full mt-4">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-500">
                Click on an example to use it in your conversation, or copy it to use later.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTools.map(tool => (
                  <Card key={tool.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{tool.name}</h3>
                          <Badge variant="outline" className="text-xs font-normal capitalize">
                            {tool.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{tool.description}</p>

                        <div className="mt-3 space-y-2">
                          {tool.examples.map((example, index) => (
                            <div 
                              key={`${tool.id}-example-${index}`}
                              className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-accent/50 cursor-pointer group"
                            >
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                              <div className="flex-1">{example}</div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => copyExample(example)}
                                >
                                  {copied === example ? 
                                    <Check className="h-4 w-4" /> : 
                                    <Copy className="h-4 w-4" />
                                  }
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleExampleClick(example)}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Tabs>
          
          <div className="mt-6 text-xs text-gray-500">
            Note: All tools are available in any conversation. Simply ask questions that require their functionality.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 