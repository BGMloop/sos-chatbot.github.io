"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, PlusCircle, Calendar, Trash2, LineChart, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/lib/context/theme';
import dynamic from 'next/dynamic';

// Import DnD libraries with dynamic imports to prevent build errors
// If modules aren't available, they'll be loaded client-side only
const DndComponents = dynamic(() => 
  import('./components/DndComponents').then(mod => mod.default), 
  { ssr: false, loading: () => <p>Loading drag and drop...</p> }
);

// Define food item type
interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export default function CalorieTrackerPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { id: 1, name: 'Breakfast: Oatmeal with fruit', calories: 350, protein: 12, carbs: 60, fat: 6, time: '08:00 AM' },
    { id: 2, name: 'Snack: Protein bar', calories: 200, protein: 15, carbs: 20, fat: 8, time: '10:30 AM' },
    { id: 3, name: 'Lunch: Chicken salad', calories: 450, protein: 35, carbs: 25, fat: 15, time: '01:00 PM' },
    { id: 4, name: 'Dinner: Salmon with vegetables', calories: 520, protein: 40, carbs: 30, fat: 20, time: '07:00 PM' }
  ]);
  
  // New food item state
  const [newFoodName, setNewFoodName] = useState('');
  const [newCalories, setNewCalories] = useState('');
  
  // Move item in drag and drop
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = foodItems[dragIndex];
    const newItems = [...foodItems];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    setFoodItems(newItems);
  };
  
  // Remove item
  const removeItem = (id: number) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
  };
  
  // Add new food item
  const addFoodItem = () => {
    if (newFoodName && newCalories) {
      const newItem: FoodItem = {
        id: Date.now(),
        name: newFoodName,
        calories: parseInt(newCalories),
        protein: Math.floor(Math.random() * 30),
        carbs: Math.floor(Math.random() * 50),
        fat: Math.floor(Math.random() * 20),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setFoodItems([...foodItems, newItem]);
      setNewFoodName('');
      setNewCalories('');
    }
  };
  
  // Calculate totals
  const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = foodItems.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = foodItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = foodItems.reduce((sum, item) => sum + item.fat, 0);
  
  // Date navigation
  const goToNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };
  
  const goToPrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };
  
  return (
    <DndComponents
      foodItems={foodItems}
      moveItem={moveItem}
      removeItem={removeItem}
      isDarkMode={isDarkMode}
      currentDate={currentDate}
      goToPrevDay={goToPrevDay}
      goToNextDay={goToNextDay}
      totalCalories={totalCalories}
      totalProtein={totalProtein}
      totalCarbs={totalCarbs}
      totalFat={totalFat}
      newFoodName={newFoodName}
      setNewFoodName={setNewFoodName}
      newCalories={newCalories}
      setNewCalories={setNewCalories}
      addFoodItem={addFoodItem}
      onReturnToDashboard={() => router.push('/dashboard')}
    />
  );
} 