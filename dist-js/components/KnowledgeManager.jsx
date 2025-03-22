"use client";
import { useState, useRef, lazy, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UploadCloud, FileText, MoreVertical, Trash } from "lucide-react";
// Lazy load non-critical components
const Dialog = lazy(() => import("@/components/ui/dialog").then(mod => ({
    default: mod.Dialog
})));
const DialogContent = lazy(() => import("@/components/ui/dialog").then(mod => ({
    default: mod.DialogContent
})));
const DialogDescription = lazy(() => import("@/components/ui/dialog").then(mod => ({
    default: mod.DialogDescription
})));
const DialogFooter = lazy(() => import("@/components/ui/dialog").then(mod => ({
    default: mod.DialogFooter
})));
const DialogHeader = lazy(() => import("@/components/ui/dialog").then(mod => ({
    default: mod.DialogHeader
})));
const DialogTitle = lazy(() => import("@/components/ui/dialog").then(mod => ({
    default: mod.DialogTitle
})));
const DialogTrigger = lazy(() => import("@/components/ui/dialog").then(mod => ({
    default: mod.DialogTrigger
})));
// Lazy load dropdown menu
const DropdownMenu = lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({
    default: mod.DropdownMenu
})));
const DropdownMenuContent = lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({
    default: mod.DropdownMenuContent
})));
const DropdownMenuItem = lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({
    default: mod.DropdownMenuItem
})));
const DropdownMenuTrigger = lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({
    default: mod.DropdownMenuTrigger
})));
// Simple fallback for lazy loaded components
function ComponentFallback() {
    return <div className="animate-pulse h-10 w-full bg-gray-100 rounded"></div>;
}
export function KnowledgeManager() {
    const { user, isLoaded: userLoaded } = useUser();
    const userId = (user === null || user === void 0 ? void 0 : user.id) || "";
    // States
    const [uploading, setUploading] = useState(false);
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    // Convex queries and mutations - only fetch when user is loaded
    const documents = useQuery(api.knowledge.listDocuments, userLoaded && userId ? { userId } : "skip") || [];
    const updateDocument = useMutation(api.knowledge.updateDocument);
    const deleteDocument = useMutation(api.knowledge.deleteDocument);
    // Handler for file selection - memoized to avoid recreating on every render
    const handleFileChange = (e) => {
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
            }
            else {
                throw new Error(result.error || "Failed to upload document");
            }
        }
        catch (error) {
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Failed to upload file",
                variant: "destructive",
            });
        }
        finally {
            setUploading(false);
        }
    };
    // Toggle document enabled/disabled
    const toggleDocumentEnabled = async (documentId, isEnabled) => {
        try {
            await updateDocument({ documentId, isEnabled: !isEnabled });
            toast({
                title: isEnabled ? "Document disabled" : "Document enabled",
                description: `The document has been ${isEnabled ? "disabled" : "enabled"} for use in conversations`,
            });
        }
        catch (error) {
            toast({
                title: "Failed to update document",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive",
            });
        }
    };
    // Delete a document
    const handleDeleteDocument = async (documentId, fileName) => {
        if (confirm(`Are you sure you want to delete ${fileName}?`)) {
            try {
                await deleteDocument({ documentId });
                toast({
                    title: "Document deleted",
                    description: `${fileName} has been deleted from your knowledge base`,
                });
            }
            catch (error) {
                toast({
                    title: "Failed to delete document",
                    description: error instanceof Error ? error.message : "An error occurred",
                    variant: "destructive",
                });
            }
        }
    };
    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + ' bytes';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    // Show loading state while user is being loaded
    if (!userLoaded) {
        return (<div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
      </div>);
    }
    return (<div className="knowledge-manager w-full max-w-4xl mx-auto space-y-6">
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
              <Input ref={fileInputRef} id="file" type="file" onChange={handleFileChange} accept=".txt,.pdf,.doc,.docx,.csv,.md,.json"/>
              {selectedFile && (<div className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>)}
            </div>
            <div className="grid gap-4">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea id="description" placeholder="Add a description for this document..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3}/>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full sm:w-auto">
              {uploading ? (<>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Uploading...
                </>) : (<>
                  <UploadCloud className="mr-2 h-4 w-4"/>
                  Upload Document
                </>)}
            </Button>
        </CardFooter>
      </Card>

      <h2 className="text-xl font-semibold mt-8 mb-4">Your Documents</h2>
      {!documents.length ? (<div className="text-center p-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No documents have been uploaded yet</p>
          </div>) : (<div className="grid gap-4">
            {documents.map((doc) => (<Card key={doc._id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="h-8 w-8 text-blue-500"/>
                    <div>
                      <h3 className="font-medium">{doc.fileName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                      {doc.description && (<p className="text-sm mt-1">{doc.description}</p>)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={doc.isEnabled} onCheckedChange={() => toggleDocumentEnabled(doc._id, doc.isEnabled)} aria-label={doc.isEnabled ? "Disable document" : "Enable document"}/>
                      <span className="text-sm text-muted-foreground">
                        {doc.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <Suspense fallback={<ComponentFallback />}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteDocument(doc._id, doc.fileName)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4"/>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </Suspense>
                    </div>
                  </div>
                </CardContent>
              </Card>))}
          </div>)}
    </div>);
}
