"use client";

import React, { useState } from "react";
import { Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/lib/context/theme";

// Simple loading fallback
function SettingsLoading() {
  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-6">
        <div className="w-full">
          <div className="h-8 w-60 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { isDarkMode, setDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  
  // Show loading state while auth is initializing
  if (!isLoaded) {
    return <SettingsLoading />;
  }
  
  // Redirect if not authenticated, but only after checking auth state
  if (isLoaded && !user) {
    return redirect("/");
  }
  
  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-6">
        <div className="flex w-full justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Customize your chat experience and preferences
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Customize the visual appearance of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                <p className="text-sm text-gray-500">Switch between light and dark themes</p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={isDarkMode} 
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="font-medium">Enable Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications for new messages</p>
              </div>
              <Switch 
                id="notifications" 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound" className="font-medium">Sound Effects</Label>
                <p className="text-sm text-gray-500">Play sound when receiving messages</p>
              </div>
              <Switch 
                id="sound" 
                checked={sound} 
                onCheckedChange={setSound}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Review your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label className="font-medium">Email</Label>
              <p className="text-sm">{user?.primaryEmailAddress?.emailAddress || "No email available"}</p>
            </div>
            
            <div className="space-y-1">
              <Label className="font-medium">Username</Label>
              <p className="text-sm">{user?.username || user?.fullName || "No username available"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 