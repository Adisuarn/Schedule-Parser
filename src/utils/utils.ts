import fs from 'fs/promises';

export async function isDirectoryEmpty(directory: string): Promise<boolean> {
  try {
    const files = await fs.readdir(directory);
    return files.length === 0;
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return false;
  }
}
