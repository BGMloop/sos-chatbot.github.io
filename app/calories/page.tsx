import CalorieTracker from "@/components/CalorieTracker";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Calorie Tracker - SOS Chatbot",
  description: "Analyze food images to estimate calories and nutritional information",
};

export default function CaloriesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Calorie Tracker</h1>
            <p className="text-gray-600">
              Upload or take photos of your food to get AI-powered calorie and nutritional information estimates.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <CalorieTracker />
      </div>
    </main>
  );
} 