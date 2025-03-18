import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Get all knowledge documents for a user
export const listDocuments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get a specific knowledge document
export const getDocument = query({
  args: { documentId: v.id("knowledgeDocuments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

// Create a new knowledge document
export const createDocument = mutation({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    content: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("knowledgeDocuments", {
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      content: args.content,
      userId: args.userId,
      createdAt: Date.now(),
      description: args.description,
      isEnabled: true,
    });
  },
});

// Update a knowledge document
export const updateDocument = mutation({
  args: {
    documentId: v.id("knowledgeDocuments"),
    fileName: v.optional(v.string()),
    description: v.optional(v.string()),
    isEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { documentId, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    // Only perform update if there are changes
    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(documentId, filteredUpdates);
    }
    
    return await ctx.db.get(documentId);
  },
});

// Delete a knowledge document
export const deleteDocument = mutation({
  args: { documentId: v.id("knowledgeDocuments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.documentId);
    return { success: true };
  },
});

// Get all enabled knowledge content for a user
// This is used to provide context to the LLM
export const getKnowledgeContext = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("knowledgeDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isEnabled"), true))
      .collect();
      
    return documents.map(doc => ({
      fileName: doc.fileName,
      content: doc.content,
      description: doc.description || "",
    }));
  },
}); 