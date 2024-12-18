import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export class ImageConvertor {
  private inputPath: string;
  private outputPath: string;
  private format: 'jpg' | 'png';
  private compress: boolean;

  constructor(inputPath: string, outputPath: string, format: 'jpg' | 'png', compress: boolean = false) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.format = format;
    this.compress = compress;
  }

  private isDirectory(path: string): boolean {
    return fs.lstatSync(path).isDirectory();
  }

  private async processFile(inputFile: string, outputFile: string): Promise<void> {
    try {
      let image = sharp(inputFile);

      if (this.format === 'jpg') {
        image = image.jpeg({ quality: this.compress ? 85 : 100 });
      } else if (this.format === 'png') {
        image = image.png({ quality: this.compress ? 85 : 100 });
      }

      await image.toFile(outputFile);
      console.log(`Image converted and saved to ${outputFile}`);
    } catch (error) {
      console.error(`Error converting image ${inputFile}:`, error);
    }
  }

  private async processDirectory(inputDir: string, outputDir: string): Promise<void> {
    const files = fs.readdirSync(inputDir);

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const relativePath = path.relative(this.inputPath, inputPath);
      const outputPath = path.join(this.outputPath, relativePath);

      if (this.isDirectory(inputPath)) {
        if (!fs.existsSync(outputPath)) {
          fs.mkdirSync(outputPath, { recursive: true });
        }
        await this.processDirectory(inputPath, outputPath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          const outputFile = outputPath.replace(/\.[^/.]+$/, `.${this.format}`);
          await this.processFile(inputPath, outputFile);
        }
      }
    }
  }

  async convert(): Promise<void> {
    try {
      if (!fs.existsSync(this.outputPath)) {
        fs.mkdirSync(this.outputPath, { recursive: true });
      }

      if (this.isDirectory(this.inputPath)) {
        await this.processDirectory(this.inputPath, this.outputPath);
      } else {
        await this.processFile(this.inputPath, this.outputPath);
      }
    } catch (error) {
      console.error('Error during conversion:', error);
    }
  }
}
