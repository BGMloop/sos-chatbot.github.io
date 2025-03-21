import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calorie Tracker - SOS Chatbot",
  description: "Analyze food images to estimate calories and nutritional information",
};

export default function CaloriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 