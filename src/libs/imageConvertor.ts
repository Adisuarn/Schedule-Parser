import sharp from 'sharp';

/**
 * Class representing an image convertor.
 */
export class ImageConvertor {
  private inputPath: string;
  private outputPath: string;
  private format: 'jpg' | 'png';
  private compress: boolean;

  /**
   * Create an ImageConvertor.
   * @param inputPath - The path to the input image file.
   * @param outputPath - The path to save the converted image file.
   * @param format - The format to convert the image to ('jpg' or 'png').
   * @param compress - Whether to compress the image (default is false).
   */
  constructor(inputPath: string, outputPath: string, format: 'jpg' | 'png', compress: boolean = false) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.format = format;
    this.compress = compress;
  }

  /**
   * Convert the image to the specified format and save it to the output path.
   * @returns A promise that resolves when the image has been converted and saved.
   */
  async convert(): Promise<void> {
    try {
      let image = sharp(this.inputPath);

      if (this.format === 'jpg') {
        image = image.jpeg({ quality: this.compress ? 80 : 100 });
      } else if (this.format === 'png') {
        image = image.png({ quality: this.compress ? 80 : 100 });
      }

      await image.toFile(this.outputPath);
      console.log(`Image converted and saved to ${this.outputPath}`);
    } catch (error) {
      console.error('Error converting image:', error);
    }
  }
}
