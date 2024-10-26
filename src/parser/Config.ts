import {Anchor} from "../types/Elements";
import {Canvas} from "./Canvas";

export class Config {
    public canvas: Canvas
    public anchor: Anchor

    constructor(canvas: Canvas, anchor: Anchor) {
        this.canvas = canvas
        this.anchor = anchor
    }
}
