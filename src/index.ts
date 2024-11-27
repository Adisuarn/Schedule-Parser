import { ImageAnnotator } from "./libs/ocr";
import { TableGenerator } from "./libs/tableGenerator";
import { ImageConvertor } from "./libs/imageConvertor";
import { PdfToImgConverter } from "./libs/pdfToImg";
import { isDirectoryEmpty } from "./utils/utils";
import path from 'path';
import readline from 'readline';
import fs from 'fs';

async function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => rl.question(query, (answer) => {
    rl.close();
    resolve(answer);
  }));
}

async function generateTable() {
  const resourceDir = path.join(__dirname, '../resource');
  const outputDir = path.join(__dirname, '../output');
  const imgfPath = path.join(__dirname, '../images');
  const credentialsPath = path.join(__dirname, '../credentials.json');

  if (!fs.existsSync(resourceDir)) {
    fs.mkdirSync(resourceDir, { recursive: true });
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const ImageAnnotatorClient = new ImageAnnotator(imgfPath, resourceDir, credentialsPath);

  let TableGeneratorClient: TableGenerator;

  const userResponse = await askQuestion('Do you want to input width (default: 3507px) and height (default: 2481px) for the TableGenerator? (y/n): ');

  if (userResponse.toLowerCase() === 'y') {
    const widthInput = await askQuestion('Please enter the width: ');
    const heightInput = await askQuestion('Please enter the height: ');

    const width = parseInt(widthInput, 10);
    const height = parseInt(heightInput, 10);

    if (isNaN(width) || isNaN(height)) {
      console.error('Invalid input. Width and height must be numbers.');
      process.exit(1);
    }
    TableGeneratorClient = new TableGenerator(resourceDir, outputDir, width, height);
  } else if (userResponse.toLowerCase() === 'n') {
    TableGeneratorClient = new TableGenerator(resourceDir, outputDir);
  } else {
    console.error('Invalid input. Please enter either "y" or "n".');
    process.exit(1);
  }

  try {
    const isEmpty = await isDirectoryEmpty(resourceDir);

    if (isEmpty) {
      console.log('Resource directory is empty. Generating annotations...');
      await ImageAnnotatorClient.getAnnotations();
    } else {
      console.log('Resource directory is not empty. Skipping annotation generation...');
    }

    await TableGeneratorClient.generate();
  } catch (error) {
    console.error('Error in table generation:', error);
  }
}

async function convertImage() {
  const convertedImageDir = path.join(__dirname, '../convertedImages');

  const convertImageResponse = await askQuestion('Do you want to convert an image? (y/n): ');

  if (convertImageResponse.toLowerCase() === 'y') {
    const inputPath = convertedImageDir;
    const format = await askQuestion('Please enter the format (jpg/png): ') as 'jpg' | 'png';
    const compressResponse = await askQuestion('Do you want to compress the image? (y/n): ');
    const compress = compressResponse.toLowerCase() === 'y';

    const outputPath = inputPath.replace(/\.[^/.]+$/, `.${format}`);

    const imageConvertor = new ImageConvertor(inputPath, outputPath, format, compress);
    await imageConvertor.convert();
  } else {
    console.log('Image conversion skipped.');
  }
}

async function convertPdfToImage() { 
  const inputDir = path.join(__dirname, '../pdfs');
  const outputDir = path.join(__dirname, '../images');

}

async function main() {
  const choice = await askQuestion('1: Generating table, 2: Converting image: ');
  if (choice === '1') {
    await convertPdfToImage();
    await generateTable();
  } else if (choice === '2') {
    await convertImage();
  } else {
    console.error('Invalid choice. Please enter either "1" or "2".');
    process.exit(1);
  }
}

main().catch(error => console.error('Error in main execution:', error));
