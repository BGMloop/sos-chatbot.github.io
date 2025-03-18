import Link from "next/link";
import { MessageCircle, Menu, Home, Settings, X, ImageIcon } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <div className="flex justify-between items-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <div className="grid gap-4 py-4">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <MessageCircle className="h-5 w-5" />
              Chat
            </Link>
            <Link
              href="/calories"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <ImageIcon className="h-5 w-5" />
              Calorie Tracker
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex gap-6 items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Home className="h-5 w-5" />
          Home
        </Link>
        <Link
          href="/chat"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <MessageCircle className="h-5 w-5" />
          Chat
        </Link>
        <Link
          href="/calories"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <ImageIcon className="h-5 w-5" />
          Calorie Tracker
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  );
} 