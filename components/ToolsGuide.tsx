"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";

const TOOL_EXAMPLES = [
  {
    name: "Web Search",
    description: "Search the web for real-time information (DuckDuckGo)",
    examples: [
      "Search the web for latest AI advancements in healthcare",
      "Find information about climate change policies in Europe",
      "Look up recent news about quantum computing breakthroughs"
    ]
  },
  {
    name: "Wikipedia",
    description: "Search for factual information on Wikipedia",
    examples: [
      "Tell me about quantum computing from Wikipedia",
      "What does Wikipedia say about climate change?",
      "Use Wikipedia to find information about the history of artificial intelligence"
    ]
  },
  {
    name: "Google Books",
    description: "Search for books and literary references",
    examples: [
      "Search Google Books for machine learning books",
      "Find books by Haruki Murakami using Google Books",
      "What are the most popular psychology books according to Google Books?"
    ]
  },
  {
    name: "YouTube Transcript",
    description: "Get transcripts from YouTube videos",
    examples: [
      "Get the transcript for this YouTube video: https://www.youtube.com/watch?v=VIDEO_ID",
      "Show me what is said in this YouTube video: https://www.youtube.com/watch?v=VIDEO_ID",
      "Extract and summarize the transcript from this YouTube video: https://www.youtube.com/watch?v=VIDEO_ID"
    ]
  },
  {
    name: "Math (WolframAlpha)",
    description: "Perform mathematical calculations",
    examples: [
      "Calculate the integral of x^2 sin(x) using WolframAlpha",
      "Use WolframAlpha to solve the equation 3x^2 + 2x - 5 = 0",
      "Compute the derivative of log(x) * e^x with WolframAlpha"
    ]
  },
  {
    name: "Exchange Rates",
    description: "Get currency exchange information",
    examples: [
      "Show the current exchange rate between USD and EUR",
      "Convert 100 USD to Japanese Yen using the exchange rate tool",
      "What is the current exchange rate for British Pound to USD?"
    ]
  },
  {
    name: "News Search",
    description: "Search for news articles by topic",
    examples: [
      "Show me news about technology",
      "Find recent articles about climate change",
      "What's the latest news on artificial intelligence?"
    ]
  },
  {
    name: "News Headlines",
    description: "Get top headlines by country and category",
    examples: [
      "Show me top headlines in the US",
      "What are the latest business headlines in the UK?",
      "Get today's technology news headlines"
    ]
  }
];

export function ToolsGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleGuide = () => setIsOpen(!isOpen);

  return (
    <div className="tools-guide-container">
      <Button
        onClick={toggleGuide}
        variant="outline"
        size="sm"
        className="tools-guide-button flex items-center gap-2"
      >
        <InfoIcon size={16} />
        {isOpen ? "Hide Tool Guide" : "Tool Examples"}
      </Button>

      {isOpen && (
        <div className="tools-guide-content mt-2 p-4 rounded-md border bg-background shadow-sm">
          <h3 className="text-lg font-medium mb-2">How to Use AI Tools</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Here are examples of how to ask questions to use each available tool. For best results, be direct and specific in your requests:
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            {TOOL_EXAMPLES.map((tool, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-sm font-medium">
                  {tool.name}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                  <div className="examples space-y-2">
                    {tool.examples.map((example, idx) => (
                      <div key={idx} className="example">
                        <p className="text-sm bg-muted p-2 rounded-md">{example}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
} 