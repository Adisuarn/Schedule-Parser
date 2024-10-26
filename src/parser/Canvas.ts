import {Size} from "../types/Elements";

export class Canvas  {
    public size: Size
    public error: number
    public dataCell: { primary: Size; secondary: Size; tertiary?: Size }
    public breakCell: { primary: Size; secondary: Size }
    private rowAlignment: string[]
    private columnAlignment: string[]
    public lineSpacing: number

    constructor(size: Size, error: number,lineSpacing: number, dataCell: {
        primary: Size,
        secondary: Size,
        tertiary?: Size
    }, breakCell: {
        primary: Size,
        secondary: Size
    }, rowAlignment: string[], columnAlignment: string[]) {
        this.size = size
        this.error = error
        this.dataCell = dataCell
        this.breakCell = breakCell
        this.rowAlignment = rowAlignment
        this.columnAlignment = columnAlignment
        this.lineSpacing = lineSpacing
    }


    public getMaxRows(): number {
        return this.columnAlignment.length
    }

    public getMaxColumns(): number {
        return this.rowAlignment.length
    }

    public getCellTypeInLine(index: number): string {
        return this.rowAlignment[index]
    }

    public getCellSizeInLine(index: number): Size | undefined {
        const indicator = this.rowAlignment[index]

        switch (indicator) {
            case "DS":
                return this.dataCell.secondary
            case "BP":
                return this.breakCell.primary
            case "BS":
                return this.breakCell.secondary
            default:
                return undefined
        }
    }

}
