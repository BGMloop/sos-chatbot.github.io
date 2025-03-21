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
      "Search the web for recent advances in AI ethics",
      "Find the latest information about COVID-19 vaccines",
      "What are the best practices for container gardening?"
    ]
  },
  {
    name: "Wikipedia",
    description: "Search for factual information on Wikipedia",
    examples: [
      "Search Wikipedia for information about black holes",
      "What does Wikipedia say about the history of the internet?",
      "Look up \"renewable energy\" on Wikipedia"
    ]
  },
  {
    name: "Google Books",
    description: "Search for books and get author, publication and summary information",
    examples: [
      "Find books about machine learning",
      "Search for books by Neil Gaiman",
      "Tell me about the book \"1984\" by George Orwell"
    ]
  },
  {
    name: "Math Calculator",
    description: "Solve mathematical calculations, equations, and more",
    examples: [
      "Calculate (145 * 38) / 12",
      "Solve the equation 3x^2 - 12x + 9 = 0",
      "Convert 128 pounds to kilograms"
    ]
  },
  {
    name: "Currency Exchange",
    description: "Convert between different currencies using real-time rates",
    examples: [
      "Convert 100 USD to EUR",
      "Convert from: GBP, to: JPY, amount: 75",
      "What is the current exchange rate between USD and CAD?"
    ]
  },
  {
    name: "Weather",
    description: "Get current weather conditions and forecasts for any location",
    examples: [
      "What is the current weather in New York City?",
      "Show me the temperature in Paris, France",
      "Is it going to rain today in London?"
    ]
  },
  {
    name: "News Search",
    description: "Search for recent news articles by topic",
    examples: [
      "Find news about SpaceX rocket launches",
      "Show me recent news about electric vehicles",
      "What are the latest developments in quantum computing?"
    ]
  },
  {
    name: "News Headlines",
    description: "Get top headlines by country and category",
    examples: [
      "Show top headlines from the US",
      "Get the latest business headlines for the UK",
      "What are today's technology news headlines in Germany?"
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