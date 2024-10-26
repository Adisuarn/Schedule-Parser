import path from 'path'
import fs from 'fs/promises'
import vision from '@google-cloud/vision'
import { TableParser } from "./parser/TableParser";
import { Config } from "./parser/Config";
import { DefaultConfigs } from "./configs"

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '../ServiceToken.json')

async function ensureDirectoryExists(directory: string) {
  try {
    await fs.mkdir(directory, { recursive: true });
    console.log(`Directory ensured: ${directory}`);
  } catch (error) {
    console.error(`Error ensuring directory ${directory} exists:`, error);
  }
}

async function GenerateAnnotations() {
  try {
    const client = new vision.ImageAnnotatorClient();
    const files = await fs.readdir(path.join(__dirname, '../images'));
    const images = files.filter(file => file.endsWith('.jpg'));

    await ensureDirectoryExists(path.join(__dirname, '../resource'));

    await Promise.all(images.map(async image => {
      try {
        const [result] = await client.textDetection(path.join(__dirname, '../images', image));
        const jsonContent = JSON.stringify({ responses: [result] }, null, 2);
        const jsonFilePath = path.join(__dirname, '../resource', `${path.parse(image).name}.json`);
        await fs.writeFile(jsonFilePath, jsonContent);
        console.log(`Annotations for ${image} saved in ${jsonFilePath}`);
      } catch (error) {
        console.error(`Error processing image ${image}:`, error);
      }
    }));
  } catch (error) {
    console.error('Error generating annotations:', error);
  }
}

async function isDirectoryEmpty(directory: string): Promise<boolean> {
  try {
    const files = await fs.readdir(directory);
    return files.length === 0;
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return false;
  }
}

async function GenerateTable() {
  try {
    const resourceDir = path.join(__dirname, '../resource');
    const outputDir = path.join(__dirname, '../output');
    await ensureDirectoryExists(outputDir);

    const files = await fs.readdir(resourceDir);
    await Promise.all(files.map(async (efile: string) => {
      try {
        const file = await fs.readFile(path.join(resourceDir, efile));
        const parser = new TableParser(file, new Config(DefaultConfigs.Canvas, DefaultConfigs.Anchor));
        const parsedData = parser.parse();
        const outputFilePath = path.join(outputDir, efile);
        await fs.writeFile(outputFilePath, JSON.stringify(parsedData, null, 2));
        console.log(`Parsed table for ${efile} saved in ${outputFilePath}`);
      } catch (error) {
        console.error(`Error processing file ${efile}:`, error);
      }
    }));
  } catch (error) {
    console.error('Error generating tables:', error);
  }
}

async function main() {
  const resourceDir = path.join(__dirname, '../resource');

  try {
    const isEmpty = await isDirectoryEmpty(resourceDir);

    if (isEmpty) {
      console.log('Resource directory is empty. Generating annotations...');
      await GenerateAnnotations();
    } else {
      console.log('Resource directory is not empty. Skipping annotation generation...');
    }

    await GenerateTable();
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

main().catch(error => console.error('Error in main execution:', error));
