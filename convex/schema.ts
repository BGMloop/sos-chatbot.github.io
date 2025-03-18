import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    title: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
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
});
