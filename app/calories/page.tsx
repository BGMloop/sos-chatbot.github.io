import CalorieTracker from "@/components/CalorieTracker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calorie Tracker - SOS Chatbot",
  description: "Analyze food images to estimate calories and nutritional information",
};

export default function CaloriesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Calorie Tracker</h1>
        <p className="text-gray-600 mb-8">
          Upload or take photos of your food to get AI-powered calorie and nutritional information estimates.
        </p>
        <CalorieTracker />
      </div>
    </main>
  );
} 