import * as vision from "@google-cloud/vision"
import { promises as fs } from "fs"
import path from "path"

/**
 * Class for annotating images using Google Cloud Vision API.
 *
 * This class initializes an ImageAnnotatorClient and provides methods to read image files from a specified
 * directory, process them for text detection, and save the annotations in JSON format to an output directory.
 */
class ImageAnnotator {
	private client: vision.ImageAnnotatorClient
	private imgfPath: string
	private outfPath: string

	/**
	 * Creates an instance of ImageAnnotator.
	 *
	 * @param imgfPath - The file path to the directory containing images to be annotated.
	 * @param outfPath - The file path to the directory where annotation results will be saved.
	 */
	constructor(imgfPath: string, outfPath: string) {
		this.client = new vision.ImageAnnotatorClient()
		this.imgfPath = imgfPath
		this.outfPath = outfPath
	}

	/**
	 * Retrieves annotations for all valid image files in the input directory.
	 *
	 * This method reads the files, checks for valid image formats, processes each image for text detection,
	 * and saves the results. Errors during processing are logged to the console.
	 *
	 * @returns {Promise<void>} A promise that resolves when all annotations have been processed.
	 */
	public async getAnnotations(): Promise<void> {
		try {
			const files = await this.readFiles()

			for (const file of files) {
				if (this.checkImage(file)) {
					await this.processFile(file)
				}
			}
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * Reads the files from the specified image directory.
	 *
	 * @returns {Promise<string[]>} A promise that resolves to an array of file names in the directory.
	 */
	private async readFiles(): Promise<string[]> {
		try {
			return await fs.readdir(this.imgfPath)
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	/**
	 * Processes a single image file for text detection.
	 *
	 * @param file - The name of the image file to process.
	 * @returns {Promise<void>} A promise that resolves when the file has been processed and the annotation saved.
	 */
	private async processFile(file: string): Promise<void> {
		try {
			const filePath = path.join(this.imgfPath, file)
			const [res] = await this.client.textDetection(filePath)

			await this.saveAnnotation(file, res)
			console.log(`Annotation saved for ${file}`)
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * Saves the annotation result to a JSON file.
	 *
	 * @param file - The name of the original image file.
	 * @param res - The annotation response from the Vision API.
	 * @returns {Promise<void>} A promise that resolves when the annotation has been saved.
	 */
	private async saveAnnotation(
		file: string,
		res: vision.protos.google.cloud.vision.v1.IAnnotateImageResponse
	) {
		try {
			const jsonFilePath = path.join(
				this.outfPath,
				`${path.basename(file, path.extname(file))}.json`
			)

			await fs.writeFile(jsonFilePath, JSON.stringify({ responses: [res] }, null, 2))
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	/**
	 * Checks if the file has a valid image extension.
	 *
	 * @param file - The name of the file to check.
	 * @returns {boolean} True if the file is a JPEG image, false otherwise.
	 */
	private checkImage(file: string): boolean {
		return path.extname(file).toLowerCase() === ".jpg"
	}
}
