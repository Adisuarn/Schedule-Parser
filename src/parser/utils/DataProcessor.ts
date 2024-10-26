import {AlignedOrderedPairs} from "./AlignedOrderedPairs";
import {OrderedPair} from "../../types/Elements";
import {RawData} from "../../types/RawData";

export class DataProcessor {
    public static groupByLineSpacing(data: RawData<any>[], verticalLineSpacing: number) {
        let grouped = []
        let sMatches = [...data]

        while (sMatches.length > 0) {
            const sample = sMatches[0]
            const {TL, TR, BR, BL} = new AlignedOrderedPairs(sample.boundingPoly.vertices)

            const sCenterY = ((TL.y+BL.y)/2) + ((TR.y + BR.y)/2)/2

            const sameLine = sMatches.filter((e: any) => {
                const {TL, TR, BR, BL} = new AlignedOrderedPairs(e.boundingPoly.vertices)

                const fCenterY = ((TL.y+BL.y)/2) + ((TR.y + BR.y)/2)/2

                return Math.abs(sCenterY - fCenterY) < verticalLineSpacing;

            })

            grouped.push(sameLine.sort((a, b) => {
                const aLocation: OrderedPair[] = a.boundingPoly.vertices
                const bLocation: OrderedPair[] = b.boundingPoly.vertices

                return aLocation[0].x - bLocation[0].x
            }).map((e) => (e.description)).join(""))

            sMatches = sMatches.filter((e) => (!sameLine.includes(e)))

        }

        return grouped
    }
}
