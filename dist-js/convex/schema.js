import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    // Users table to store user data from Clerk
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        imageUrl: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_clerk_id", ["clerkId"]),
    chats: defineTable({
        title: v.string(),
        userId: v.string(),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    }).index("by_user", ["userId"]),
    messages: defineTable({
        chatId: v.id("chats"),
        content: v.string(),
        role: v.string(),
        createdAt: v.number(),
    }).index("by_chat", ["chatId"]),
    knowledgeDocuments: defineTable({
        fileName: v.string(),
        fileSize: v.number(),
        fileType: v.string(),
        content: v.string(),
        userId: v.string(),
        createdAt: v.number(),
        description: v.optional(v.string()),
        isEnabled: v.boolean(),
    }).index("by_user", ["userId"]),
    knowledge: defineTable({
        userId: v.string(),
        title: v.string(),
        content: v.string(),
        fileUrl: v.optional(v.string()),
        fileName: v.optional(v.string()),
        mimeType: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"]),
    tools: defineTable({
        name: v.string(),
        description: v.string(),
        status: v.string(),
        lastTested: v.number(),
        testPassed: v.boolean(),
        errorMessage: v.optional(v.string()),
    })
        .index("by_name", ["name"]),
});
