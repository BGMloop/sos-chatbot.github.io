import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
/**
 * Create a new user in the database triggered by Clerk webhook
 */
export const createUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user with this Clerk ID already exists
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        if (existingUser) {
            console.log(`User ${args.clerkId} already exists, skipping creation`);
            return existingUser._id;
        }
        // Create the user
        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            email: args.email,
            firstName: args.firstName,
            lastName: args.lastName,
            imageUrl: args.imageUrl,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        console.log(`Created new user: ${userId} (Clerk ID: ${args.clerkId})`);
        return userId;
    },
});
/**
 * Update an existing user in the database triggered by Clerk webhook
 */
export const updateUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        // Find the user by Clerk ID
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        if (!existingUser) {
            console.log(`User ${args.clerkId} not found, creating instead of updating`);
            // Create the user if they don't exist
            return await ctx.db.insert("users", {
                clerkId: args.clerkId,
                email: args.email,
                firstName: args.firstName,
                lastName: args.lastName,
                imageUrl: args.imageUrl,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
        // Update the user
        await ctx.db.patch(existingUser._id, {
            email: args.email,
            firstName: args.firstName,
            lastName: args.lastName,
            imageUrl: args.imageUrl,
            updatedAt: Date.now(),
        });
        console.log(`Updated user: ${existingUser._id} (Clerk ID: ${args.clerkId})`);
        return existingUser._id;
    },
});
/**
 * Delete a user from the database triggered by Clerk webhook
 */
export const deleteUser = mutation({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        // Find the user by Clerk ID
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        if (!existingUser) {
            console.log(`User ${args.clerkId} not found, nothing to delete`);
            return null;
        }
        // Delete the user's chats
        const userChats = await ctx.db
            .query("chats")
            .filter((q) => q.eq(q.field("userId"), existingUser._id))
            .collect();
        for (const chat of userChats) {
            // Delete all messages in the chat
            const chatMessages = await ctx.db
                .query("messages")
                .filter((q) => q.eq(q.field("chatId"), chat._id))
                .collect();
            for (const message of chatMessages) {
                await ctx.db.delete(message._id);
            }
            // Delete the chat
            await ctx.db.delete(chat._id);
        }
        // Delete the user
        await ctx.db.delete(existingUser._id);
        console.log(`Deleted user: ${existingUser._id} (Clerk ID: ${args.clerkId})`);
        return existingUser._id;
    },
});
/**
 * Get a user by Clerk ID
 */
export const getUserByClerkId = query({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .first();
    },
});
