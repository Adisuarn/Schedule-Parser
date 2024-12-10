import path from 'path';
import fs from 'fs/promises';
import { TableParser } from "../parser/TableParser";
import { Config } from "../parser/Config";
import { DefaultConfigs } from "../configs"

/**
 * TableGenerator class is responsible for generating tables from resource files
 * and saving the parsed data into the output directory.
 */
export class TableGenerator {
  private resourceDir: string;
  private outputDir: string;

  /**
   * Creates an instance of TableGenerator.
   * @param resourceDir - The directory containing the resource files to be processed.
   * @param outputDir - The directory where the parsed tables will be saved.
   */
  constructor(resourceDir: string, outputDir: string, height?: number, width?: number) {
    this.resourceDir = resourceDir;
    this.outputDir = outputDir;
  }

  /**
   * Generates tables by reading files from the resource directory,
   * parsing them, and saving the parsed data into the output directory.
   */
  async generate() {
    try {
      await this.ensureDirectoryExists(this.outputDir);
      const files = await fs.readdir(this.resourceDir);
      if (files.length === 0) {
        console.log('No files found in the resource directory.');
        return;
      }
      console.log(`Found ${files.length} files. Processing...`);
      await Promise.all(files.map(file => this.processFile(file)));
      console.log('Table generation completed.');
    } catch (error) {
      console.error('Error generating tables:', error);
    }
  }

  /**
   * Ensures that the specified directory exists. If it does not exist, it will be created.
   * @param directory - The directory to check and create if necessary.
   */
  private async ensureDirectoryExists(directory: string) {
    try {
      await fs.mkdir(directory, { recursive: true });
      console.log(`Directory ensured: ${directory}`);
    } catch (error) {
      console.error(`Error ensuring directory exists: ${directory}`, error);
    }
  }

  /**
   * Processes a single file by reading its content, parsing it, and saving the parsed data.
   * @param filename - The name of the file to process.
   */
  private async processFile(filename: string, height?: number, width?: number) {
    try {
      const filePath = path.join(this.resourceDir, filename);
      const fileContent = await fs.readFile(filePath);
      const parser = new TableParser(fileContent, new Config((typeof height === 'number' && typeof width === 'number') ? DefaultConfigs.createCanvas(width, height) : DefaultConfigs.createCanvas(), DefaultConfigs.Anchor));
      const parsedData = parser.parse();
      const outputFilePath = path.join(this.outputDir, `${parsedData.meta.room}.json`);
      await fs.writeFile(outputFilePath, JSON.stringify(parsedData, null, 2));
      console.log(`Parsed table for ${filename} saved in ${outputFilePath}`);
    } catch (error) {
      console.error(`Error processing file ${filename}:`, error);
    }
  }
}
