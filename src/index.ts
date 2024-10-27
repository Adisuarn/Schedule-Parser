import { ImageAnnotator } from "./libs/ocr";
import { TableGenerator } from "./libs/tableGenerator";
import { isDirectoryEmpty } from "./utils/utils";
import path from 'path';
import fs from 'fs';
import readline from 'readline';

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

async function main() {
  const imgfPath = path.join(__dirname, '../images');
  const resourceDir = path.join(__dirname, '../resource');
  const outputDir = path.join(__dirname, '../output');
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
  } else if (userResponse.toLowerCase() === 'n'){
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
    console.error('Error in main execution:', error);
  }
}

main().catch(error => console.error('Error in main execution:', error));
