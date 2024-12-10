import fs from 'fs';
import path from 'path';
import { fromPath } from 'pdf2pic';
import { PDFDocument } from 'pdf-lib'; 

export class PdfToImgConverter {
  /**
   * Gets the total number of pages in a PDF.
   * @param pdfPath Path to the PDF file.
   */
  private async getTotalPages(pdfPath: string): Promise<number> {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    return pdfDoc.getPageCount();
  }

  /**
   * Converts a single PDF to images.
   * @param pdfPath Path of the PDF file.
   * @param outputDir Directory to save the resulting images.
   */
  public async convertPdfToImg(pdfPath: string, outputDir: string): Promise<void> {
    try {
      const fileName = path.basename(pdfPath, '.pdf');
      const options = {
        quality: 100,
        density: 100,
        saveFilename: fileName,
        savePath: outputDir,
        format: 'jpg',
        width: 3507,
        height: 2481,
      };

      const converter = fromPath(pdfPath, options);

      const result = await converter(1); // Convert the first page only
      console.log(`Page 1 saved as: ${result.path}`);

      console.log(`Conversion of ${fileName} completed.`);
    } catch (error) {
      console.error(`Error converting PDF to images for ${pdfPath}:`, error);
    }
  }
}
