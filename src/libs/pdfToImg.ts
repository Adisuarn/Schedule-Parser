import fs from 'fs';
import path from 'path';
import { fromPath } from 'pdf2pic';
import { PDFDocument } from 'pdf-lib'; // Install with `npm install pdf-lib`

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
        //density: 100, // Image resolution (dots per inch)
        saveFilename: fileName,
        savePath: outputDir,
        format: 'jpeg',
        preserveAspectRatio: true
      };

      // Initialize the converter with options
      const converter = fromPath(pdfPath, options);

      // Get total pages using `pdf-lib`
      const totalPages = await this.getTotalPages(pdfPath);

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const result = await converter(pageNum); // Convert each page
        console.log(`Page ${pageNum} saved at: ${result.path}`);
      }

      console.log(`Conversion of ${fileName} completed.`);
    } catch (error) {
      console.error(`Error converting PDF to images for ${pdfPath}:`, error);
    }
  }
}