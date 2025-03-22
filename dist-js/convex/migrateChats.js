import { action } from "./_generated/server";
/**
 * Migration action to add updatedAt field to existing chat records
 * Run this once after updating the schema to fix existing records
 */
export const addUpdatedAtToChats = action({
    handler: async (ctx) => {
        const { runMutation, runQuery } = ctx;
        // Get all chats
        const chats = await runQuery("chats:list");
        let updated = 0;
        let skipped = 0;
        // Update each chat that doesn't have an updatedAt field
        for (const chat of chats) {
            if (chat.updatedAt === undefined) {
                await runMutation("chats:update", {
                    id: chat._id,
                    updatedAt: chat.createdAt, // Set updatedAt to same as createdAt for existing chats
                });
                updated++;
            }
            else {
                skipped++;
            }
        }
        return {
            success: true,
            message: `Migration completed. Updated ${updated} chats, skipped ${skipped} chats.`
        };
    },
});
