import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Unauthorized: Please sign in to create a chat");
      }

      const chat = await ctx.db.insert("chats", {
        title: args.title,
        userId: identity.subject,
        createdAt: Date.now(),
      });

      console.log("✅ Chat created successfully:", chat);
      return chat;
    } catch (error) {
      console.error("❌ Failed to create chat:", error);
      throw error;
    }
  },
});

export const listChats = query({
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        console.warn("⚠️ Unauthorized access attempt to list chats");
        return []; // Return empty array instead of throwing to handle gracefully
      }

      const chats = await ctx.db
        .query("chats")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .order("desc")
        .collect();

      console.log(`✅ Retrieved ${chats.length} chats for user:`, identity.subject);
      return chats;
    } catch (error) {
      console.error("❌ Failed to list chats:", error);
      return []; // Return empty array on error
    }
  },
});

export const deleteChat = mutation({
  args: { id: v.id("chats") },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Unauthorized: Please sign in to delete a chat");
      }

      const chat = await ctx.db.get(args.id);
      if (!chat) {
        throw new Error("Chat not found");
      }

      if (chat.userId !== identity.subject) {
        throw new Error("Unauthorized: You can only delete your own chats");
      }

      // Delete all messages in the chat
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", args.id))
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
      }

      // Delete the chat
      await ctx.db.delete(args.id);
      console.log("✅ Chat and messages deleted successfully:", args.id);
    } catch (error) {
      console.error("❌ Failed to delete chat:", error);
      throw error;
    }
  },
});

export const getChat = query({
  args: { id: v.id("chats"), userId: v.string() },
  handler: async (ctx, args) => {
    try {
      const chat = await ctx.db.get(args.id);

      if (!chat) {
        console.warn("⚠️ Chat not found:", args.id);
        return null;
      }

      if (chat.userId !== args.userId) {
        console.warn("⚠️ Unauthorized access attempt to chat:", args.id);
        return null;
      }

      console.log("✅ Chat retrieved successfully:", args.id);
      return chat;
    } catch (error) {
      console.error("❌ Error in getChat:", error);
      return null;
    }
  },
});
