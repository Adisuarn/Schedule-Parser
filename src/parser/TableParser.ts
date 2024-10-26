import {RawData} from "../types/RawData";
import {Config} from "./Config";
import {refine} from "./utils/refiner";
import {AlignedOrderedPairs} from "./utils/AlignedOrderedPairs";
import {DataProcessor} from "./utils/DataProcessor";

export class TableParser {
    public subjectContent: RawData<any>
    public config: Config

    constructor(file: Buffer,config: Config, initialLocator = (d: RawData<any>) => (d["responses"][0])) {
        try {
            const rawData = JSON.parse(file.toString())
            this.subjectContent = initialLocator(rawData)
            this.config = config
        } catch (e) {
            throw e
        }
    }

    public parse() {
        return {
            meta: this.parseMeta(),
            body: this.parseBody()
        }
    }

    protected parseMeta() {
        const data = this.subjectContent.fullTextAnnotation.text
        const branch = data.split("แผนการเรียน")[1].split("\n")[0].trim()

        let room = "err"

        if (data.split("ห้อง")[1]) {
            room = data.split("ห้อง")[1].split("\n")[0].trim()
        }else{
            if (data.split("หอง")[1]) {
                room = data.split("หอง")[1].split("\n")[0].trim()
            }else{
                //room = data.split("ทอง")[1].split("\n")[0].trim()
            }
        }

        const mdata = this.subjectContent.textAnnotations

        mdata.shift()

        const anchor: RawData<any> = mdata.find((v: {description: string}) => (v.description.includes("ปรึกษา")))

        const {TL, TR, BR, BL} = new AlignedOrderedPairs(anchor.boundingPoly.vertices)

        const middlePoint = (TL.y + BL.y) /2

        let ref: any = null
        let teacher1:any[] = []
        let teacher2:any[] = []

        // Find matching bits from data set
        const matches = mdata.filter((v: any) => {
            const corners = new AlignedOrderedPairs(v.boundingPoly.vertices)

            const needleMiddlePoint = (corners.TL.y + corners.BL.y) /2

            if (Math.abs(middlePoint - needleMiddlePoint) < 30 && corners.BL.x - 10 > BL.x){
                if (ref == null) {
                    ref = corners
                }

                if (Math.abs(ref.BL.x - corners.BL.x) > 850) {
                    teacher1.push(v)
                }else{
                    teacher2.push(v)
                }
                return true
            }

            return false
        })


        teacher1 = teacher1.sort((a: any,b: any) => {
            const ra:number = a.boundingPoly.vertices[0].x
            const rb:number = b.boundingPoly.vertices[0].x

            return ra - rb
        })

        teacher2 = teacher2.sort((a: any,b: any) => {
            const ra:number = a.boundingPoly.vertices[0].x
            const rb:number = b.boundingPoly.vertices[0].x

            return ra - rb
        })

        const t11: any[] = []
        const t12: any[] = []
        let split = false
        let prev: number | null = null

        teacher1.forEach((i) => {
            const ra:number = i.boundingPoly.vertices[0].x
            const e: number = i.boundingPoly.vertices[1].x

            if (prev) {
                if (Math.abs(prev - ra) > 16) {
                    split = true
                }

                if (split) {
                    t12.push(i)
                }else{
                    t11.push(i)
                }
            }else{
                t11.push(i)
            }

            prev= e

        })

        const t21: any[] = []
        const t22: any[] = []
        let split2 = false
        let prev2: number | null = null

        teacher2.forEach((i) => {
            const ra:number = i.boundingPoly.vertices[0].x
            const e: number = i.boundingPoly.vertices[1].x

            if (prev2) {
                if (Math.abs(prev2 - ra) > 15) {
                    split2 = true
                }

                if (split2) {
                    t22.push(i)
                }else{
                    t21.push(i)
                }
            }else{
                t21.push(i)
            }

            prev2= e

        })


        const t11t = t11.map((e) => (e.description)).join("")
        const t12t = t12.map((e) => (e.description)).join("")
        const t21t = t21.map((e) => (e.description)).join("")
        const t22t = t22.map((e) => (e.description)).join("")

        const comt1 = `${t11t} ${t12t}`
        const comt2 = `${t21t} ${t22t}`



        return {branch: branch, teacher: [comt2, comt1], room: room}

    }

    protected parseBody() {
        const data = this.subjectContent.textAnnotations

        // Shift first item
        data.shift()

        // Find anchor
        const anchor: RawData<any> = data.find((v: {description: string}) => (v.description.includes(this.config.anchor.identifier)))

        const anchorBL = anchor.boundingPoly.vertices[3]

        const firstCellTL = {x: anchorBL.x - this.config.anchor.offset.x, y: anchorBL.y + this.config.anchor.offset.y}

        let filledData: RawData<any> = {}
        let topBorder = firstCellTL.y

        for (let r = 0; r < this.config.canvas.getMaxRows(); r++) {
            let row: RawData<any> = {}

            const bottomBorder = topBorder + this.config.canvas.dataCell.secondary.height
            let leftBorder = firstCellTL.x
            let dataCellCount = 0

            for (let c = 0; c < this.config.canvas.getMaxColumns(); c++) {
                const rightBorder = leftBorder + (this.config.canvas.getCellSizeInLine(c)?.width || 0)

                // Find matching bits from data set
                const matches = data.filter((v: any) => {
                    const corners = new AlignedOrderedPairs(v.boundingPoly.vertices)
                    const [MT, MB, ML, MR] = corners.getMeanBorders()

                    // Retrieve error correction width
                    const error = this.config.canvas.error

                    if ((ML > (leftBorder - error)) && (MR < (rightBorder + error))){
                        if ((MT > (topBorder - error)) && (MB < (bottomBorder + error))) {
                            return true
                        }
                    }

                    return false
                })

                // Group raw data by line spacing
                const grouped = DataProcessor.groupByLineSpacing(matches, this.config.canvas.lineSpacing)

                // If data cell is presented
                if (this.config.canvas.getCellTypeInLine(c) === "DS") {
                    dataCellCount++
                    row[dataCellCount] = grouped
                }

                // Move left border 1 step to the right side
                leftBorder = rightBorder
            }
            filledData[r+1] = row
            topBorder = bottomBorder
        }

        return refine(filledData)

    }
}
