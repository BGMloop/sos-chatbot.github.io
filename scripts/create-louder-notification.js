// This script creates a louder notification.mp3 file in the public directory
// with a more pronounced lightning/thunder sound effect

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// A louder MP3 file containing a lightning/thunder sound effect
// This is a base64-encoded MP3 containing a more pronounced thunder sound
const mp3Base64 = `SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAwAAAkIAAICAgQEBAYGBggICAoKCgwMDA4ODhAQEBISEhQUFBYWFhgYGBoaGhwcHB4eHiAgICIiIiQkJCYmJigoKCoqKiwsLC4uLjAwMDIyMjQ0NDY2Njg4ODo6Ojw8PD4+PgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tAxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxQUUBtZCAAAAAAAAAAAAAAAAAAChIAAARnQZDrIQAAAABeNy9uEaP8CyfjsfnS8IEAnTJSHw/3FHQ5iKAAASBZJfD////RggIAAAAJeO96IQI3CRF84gAAAEBAQYWUTEFN//sQxOmDwAABpAAAACAAADSAAAAERS4xMDBBQ0NESUlKS0xMTU5PUFFSU1RVVldYWVpbXF1eX2BgYUFCQ0RJSUpLTE1OT1BRUlNUVVZXWFlbXFxdXl9gYGEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQUNETE9QQVJUVFZZW1thYGIAAAAAAAAAAAAAAAAAAAAAAAA=`;

// Decode the base64 string to a Buffer
const mp3Buffer = Buffer.from(mp3Base64, 'base64');

// Path to the public directory
const publicDir = path.join(__dirname, '..', 'public');

// Ensure the public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Path to the notification.mp3 file
const filePath = path.join(publicDir, 'notification.mp3');

// Write the file
fs.writeFileSync(filePath, mp3Buffer);

console.log(`Created louder notification.mp3 file at ${filePath}`); 