"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, PlusCircle, Calendar, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

// DnD imports wrapped in try-catch to handle potential missing modules
let DndProvider: any;
let useDrag: any;
let useDrop: any;
let HTML5Backend: any;

try {
  const dndModule = require('react-dnd');
  const dndHtml5Module = require('react-dnd-html5-backend');
  
  DndProvider = dndModule.DndProvider;
  useDrag = dndModule.useDrag;
  useDrop = dndModule.useDrop;
  HTML5Backend = dndHtml5Module.HTML5Backend;
} catch (error) {
  // Create fallback components if imports fail
  DndProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  useDrag = () => [{ isDragging: false }, () => null];
  useDrop = () => [{ isOver: false }, () => null];
  HTML5Backend = {};
  
  console.warn('react-dnd modules not available, using fallbacks');
}

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

// Define drag item interface
interface DragItem {
  index: number;
  type: string;
}

// Define item type for drag and drop
const ItemTypes = {
  FOOD: 'food'
};

// Props for the DndComponents
interface DndComponentsProps {
  foodItems: FoodItem[];
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  removeItem: (id: number) => void;
  isDarkMode: boolean;
  currentDate: Date;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  newFoodName: string;
  setNewFoodName: (name: string) => void;
  newCalories: string;
  setNewCalories: (calories: string) => void;
  addFoodItem: () => void;
  onReturnToDashboard: () => void;
}

// Draggable food item component
const DraggableFoodItem = ({ item, index, moveItem, removeItem, isDarkMode }: { 
  item: FoodItem,
  index: number, 
  moveItem: (dragIndex: number, hoverIndex: number) => void,
  removeItem: (id: number) => void,
  isDarkMode: boolean
}) => {
  // Check if dependencies are properly loaded
  const dndEnabled = typeof useDrag === 'function' && typeof useDrop === 'function';
  
  // If DnD is disabled, render a non-draggable version
  if (!dndEnabled) {
    return (
      <div 
        className={`p-3 mb-2 rounded-lg border flex items-center justify-between ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
            {item.time.slice(0, 2)}
          </div>
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <div className="text-xs text-gray-500">{item.time}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <span className="text-sm font-medium">{item.calories} cal</span>
            <span className="text-xs text-gray-500">P: {item.protein}g</span>
            <span className="text-xs text-gray-500">C: {item.carbs}g</span>
            <span className="text-xs text-gray-500">F: {item.fat}g</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => removeItem(item.id)}
            className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  // With drag and drop enabled
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FOOD,
    item: { index, type: ItemTypes.FOOD },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  const [, drop] = useDrop({
    accept: ItemTypes.FOOD,
    hover: (draggedItem: DragItem, monitor: any) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });
  
  return (
    <div 
      ref={(node) => drag(drop(node))} 
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`p-3 mb-2 rounded-lg border flex items-center justify-between cursor-move ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
          {item.time.slice(0, 2)}
        </div>
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <div className="text-xs text-gray-500">{item.time}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <span className="text-sm font-medium">{item.calories} cal</span>
          <span className="text-xs text-gray-500">P: {item.protein}g</span>
          <span className="text-xs text-gray-500">C: {item.carbs}g</span>
          <span className="text-xs text-gray-500">F: {item.fat}g</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => removeItem(item.id)}
          className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const DndComponents: React.FC<DndComponentsProps> = (props) => {
  const {
    foodItems,
    moveItem,
    removeItem,
    isDarkMode,
    currentDate,
    goToPrevDay,
    goToNextDay,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    newFoodName,
    setNewFoodName,
    newCalories,
    setNewCalories,
    addFoodItem,
    onReturnToDashboard
  } = props;
  
  // Check if DnD is properly loaded
  const dndEnabled = typeof DndProvider === 'function';
  
  // The actual content of the page
  const Content = () => (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <header className="border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calorie Tracker</h1>
          <Button 
            variant="outline" 
            onClick={onReturnToDashboard}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </header>
      
      <main className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Total Calories */}
          <div className={`rounded-lg border p-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } flex flex-col items-center justify-center text-center col-span-1`}>
            <div className="text-sm text-gray-500 mb-2">Daily Calories</div>
            <div className="relative">
              <svg className="w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={isDarkMode ? "#374151" : "#f3f4f6"}
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (totalCalories / 2500) * 440}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{totalCalories}</span>
                <span className="text-sm text-gray-500">/ 2500 cal</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full mt-6">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500">Protein</span>
                <span className="font-medium">{totalProtein}g</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500">Carbs</span>
                <span className="font-medium">{totalCarbs}g</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500">Fat</span>
                <span className="font-medium">{totalFat}g</span>
              </div>
            </div>
          </div>
          
          {/* Middle & Right Columns - Food Log */}
          <div className={`rounded-lg border p-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } col-span-2`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Food Log</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={goToPrevDay}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm">
                  {currentDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                
                <Button variant="ghost" size="icon" onClick={goToNextDay}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Add food form */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter food name"
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                />
              </div>
              <div className="w-24">
                <Input
                  placeholder="Calories"
                  type="number"
                  value={newCalories}
                  onChange={(e) => setNewCalories(e.target.value)}
                />
              </div>
              <Button onClick={addFoodItem}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            {/* Draggable food list */}
            <div>
              <p className="text-sm text-gray-500 mb-2">
                {dndEnabled ? 'Drag items to reorder' : 'Food items'}
              </p>
              {foodItems.map((item, index) => (
                <DraggableFoodItem
                  key={item.id}
                  item={item}
                  index={index}
                  moveItem={moveItem}
                  removeItem={removeItem}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
  
  // Conditionally wrap with DndProvider if available
  if (dndEnabled) {
    try {
      return (
        <DndProvider backend={HTML5Backend}>
          <Content />
        </DndProvider>
      );
    } catch (error) {
      console.error('Error with DndProvider:', error);
      return <Content />;
    }
  }
  
  return <Content />;
};

export default DndComponents; 