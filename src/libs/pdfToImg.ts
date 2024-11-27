import fs from 'fs';
import path, { format } from 'path';
import { fromPath } from "pdf2pic";

export class PdfToImgConverter {
  private convertApi: any;

  private async convertPdfToImg(pdfPath: string, outputDir: string): Promise<void> {
    try {
      const params = this.convertApi.createParams();
      params.add('File', pdfPath);

      const result = await this.convertApi.convert('pdf', 'jpg', params);

      const imageUrl = result.files[0].Url;

      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      const fileName = path.basename(pdfPath, '.pdf') + '.jpg';
      const outputFilePath = path.join(outputDir, fileName);

      const options = {
        density: 100,
        saveFilename: fileName,
        savePath: outputFilePath,
        format: 'jpg',
        preserveAspectRatio: true
      }


      fs.writeFileSync(outputFilePath, buffer);
      console.log(`Converted ${pdfPath} to ${outputFilePath}`);
    } catch (error) {
      console.error('Error converting PDF to image:', error);
    }
  }

  public async convertAllPdfsInDirectory(inputDir: string, outputDir: string): Promise<void> {
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      const files = fs.readdirSync(inputDir);

      const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

      for (let i = 0; i < pdfFiles.length; i++) {
        // TODO
      }

      console.log('All PDFs have been converted.');
    } catch (error) {
      console.error('Error processing the directory:', error);
    }
  }
}
