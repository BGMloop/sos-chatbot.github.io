"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UploadCloud, FileText, MoreVertical, Download, Trash } from "lucide-react";

interface KnowledgeDocument {
  _id: Id<"knowledgeDocuments">;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: number;
  description?: string;
  isEnabled: boolean;
}

export function KnowledgeManager() {
  const { user } = useUser();
  const userId = user?.id || "";
  
  // States
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convex queries and mutations
  const documents = useQuery(api.knowledge.listDocuments, { userId }) || [];
  const updateDocument = useMutation(api.knowledge.updateDocument);
  const deleteDocument = useMutation(api.knowledge.deleteDocument);

  // Handler for file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handler for file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("description", description);

      const response = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Upload successful",
          description: `${selectedFile.name} has been uploaded and added to your knowledge base`,
        });
        
        // Reset form
        setSelectedFile(null);
        setDescription("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(result.error || "Failed to upload document");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Toggle document enabled/disabled
  const toggleDocumentEnabled = async (documentId: Id<"knowledgeDocuments">, isEnabled: boolean) => {
    try {
      await updateDocument({ documentId, isEnabled: !isEnabled });
      toast({
        title: isEnabled ? "Document disabled" : "Document enabled",
        description: `The document has been ${isEnabled ? "disabled" : "enabled"} for use in conversations`,
      });
    } catch (error) {
      toast({
        title: "Failed to update document",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Delete a document
  const handleDeleteDocument = async (documentId: Id<"knowledgeDocuments">, fileName: string) => {
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        await deleteDocument({ documentId });
        toast({
          title: "Document deleted",
          description: `${fileName} has been deleted from your knowledge base`,
        });
      } catch (error) {
        toast({
          title: "Failed to delete document",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="knowledge-manager w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
          <CardDescription>
            Upload documents to enhance your AI assistant's knowledge. Documents are stored permanently
            and used to provide context for your conversations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <Label htmlFor="file">Upload a document</Label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".txt,.pdf,.doc,.docx,.csv,.md,.json"
              />
              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>
            <div className="grid gap-4">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for this document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Documents</h3>
        
        {documents.length === 0 ? (
          <div className="text-center p-6 bg-muted rounded-md">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No documents uploaded yet. Add documents to enhance your AI assistant's knowledge.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{doc.fileName}</CardTitle>
                      <CardDescription>
                        {formatFileSize(doc.fileSize)} • Added {new Date(doc.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteDocument(doc._id, doc.fileName)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`enable-${doc._id}`}
                        checked={doc.isEnabled}
                        onCheckedChange={() => toggleDocumentEnabled(doc._id, doc.isEnabled)}
                      />
                      <Label htmlFor={`enable-${doc._id}`} className="cursor-pointer">
                        {doc.isEnabled ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 