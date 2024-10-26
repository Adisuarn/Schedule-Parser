import {OrderedPair} from "../../types/Elements";

export class AlignedOrderedPairs {
    public TL: OrderedPair
    public TR: OrderedPair
    public BL: OrderedPair
    public BR: OrderedPair

    constructor(TL: OrderedPair, TR: OrderedPair, BR: OrderedPair, BL: OrderedPair)
    constructor(orderedPairs: OrderedPair[])
    constructor(...params: any[]) {
        let parameter = params
        if (params.length === 1) {
            parameter = params[0]
        }

        this.TL = parameter[0]
        this.TR = parameter[1]
        this.BR = parameter[2]
        this.BL = parameter[3]

    }

    public getMeanBorders(): number[] {
        const ML = (this.TL.x + this.BL.x) / 2
        const MR = (this.TR.x + this.BR.x) / 2
        const MB = (this.BR.y + this.BL.y) / 2
        const MT = (this.TR.y + this.TL.y) / 2

        return [MT, MB, ML, MR]
    }


}
