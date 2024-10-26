import {Anchor} from "./types/Elements";
import {Canvas} from "./parser/Canvas";

export class DefaultConfigs {
    public static Canvas = new Canvas({width: 3507, height: 2481},
        10, 40,
        {
            primary: {width: 287, height: 154},
            secondary: {width: 287, height: 258},
            tertiary: {width: 232, height: 258}
        },
        {
            primary: {width: 130, height: 1290},
            secondary: {width: 160, height: 1032}
        }, ["DS", "DS", "BP", "DS", "DS", "BS", "DS", "DS", "BP", "DS", "DS"],
        ["DS", "DS", "DS", "DS", "DS",])
    public static Anchor: Anchor = {identifier: "ภาคเรียน", offset: {x: 38, y: 250}}
}
