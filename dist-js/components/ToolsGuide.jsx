"use client";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
const TOOL_EXAMPLES = [
    {
        name: "Web Search",
        description: "Search the web for real-time information (DuckDuckGo)",
        examples: [
            "Search the web for the latest AI advancements in healthcare",
            "Find information about renewable energy technologies",
            "Look up best practices for hydroponic gardening"
        ]
    },
    {
        name: "Wikipedia",
        description: "Search for factual information on Wikipedia",
        examples: [
            "Search Wikipedia for quantum computing",
            "What does Wikipedia say about climate change?",
            "Look up 'artificial intelligence' on Wikipedia"
        ]
    },
    {
        name: "Google Books",
        description: "Search for books and literary references",
        examples: [
            "Find books by Yuval Noah Harari",
            "Search for the book 'Dune' by Frank Herbert",
            "Get information about The Great Gatsby"
        ]
    },
    {
        name: "Math Calculator",
        description: "Perform mathematical calculations using WolframAlpha",
        examples: [
            "Calculate 15% of 230",
            "Solve the equation x^2 + 5x + 6 = 0",
            "What is the derivative of sin(2x)?"
        ]
    },
    {
        name: "Currency Exchange",
        description: "Get currency exchange information",
        examples: [
            "Convert 100 USD to EUR",
            "Convert from: USD, to: JPY, amount: 50",
            "What is the exchange rate between GBP and CAD?"
        ]
    },
    {
        name: "Weather",
        description: "Get weather information for any location",
        examples: [
            "What's the weather in London?",
            "Show me the weather forecast for Tokyo",
            "Current temperature in New York City"
        ]
    },
    {
        name: "News Search",
        description: "Search for news articles by topic",
        examples: [
            "Find news about artificial intelligence",
            "Show me recent news about climate change",
            "Search for technology news"
        ]
    },
    {
        name: "News Headlines",
        description: "Get top headlines by country and category",
        examples: [
            "Show top headlines in the US",
            "What are the latest business headlines in the UK?",
            "Show technology news headlines for Germany"
        ]
    }
];
export function ToolsGuide() {
    const [isOpen, setIsOpen] = useState(false);
    const toggleGuide = () => setIsOpen(!isOpen);
    return (<div className="tools-guide-container">
      <Button onClick={toggleGuide} variant="outline" size="sm" className="tools-guide-button flex items-center gap-2">
        <InfoIcon size={16}/>
        {isOpen ? "Hide Tool Guide" : "Tool Examples"}
      </Button>

      {isOpen && (<div className="tools-guide-content mt-2 p-4 rounded-md border bg-background shadow-sm">
          <h3 className="text-lg font-medium mb-2">How to Use AI Tools</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Here are examples of how to ask questions to use each available tool. For best results, be direct and specific in your requests:
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            {TOOL_EXAMPLES.map((tool, index) => (<AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-sm font-medium">
                  {tool.name}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                  <div className="examples space-y-2">
                    {tool.examples.map((example, idx) => (<div key={idx} className="example">
                        <p className="text-sm bg-muted p-2 rounded-md">{example}</p>
                      </div>))}
                  </div>
                </AccordionContent>
              </AccordionItem>))}
          </Accordion>
        </div>)}
    </div>);
}
