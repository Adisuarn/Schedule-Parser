import {Anchor} from "./types/Elements";
import {Canvas} from "./parser/Canvas";

export class DefaultConfigs {
    public static defaultWidth = 3507;
    public static defaultHeight = 2481;

    public static Canvas = DefaultConfigs.createCanvas(DefaultConfigs.defaultWidth, DefaultConfigs.defaultHeight);
    public static Anchor: Anchor = { identifier: "ภาคเรียน", offset: { x: 38, y: 250 } };

    /**
     * Creates a Canvas instance with the specified width and height.
     * If width and height are not provided, default values will be used.
     * @param width - The width of the canvas.
     * @param height - The height of the canvas.
     * @returns A Canvas instance.
     */
    public static createCanvas(width: number = DefaultConfigs.defaultWidth, height: number = DefaultConfigs.defaultHeight): Canvas {
        return new Canvas(
            { width, height },
            10, 40,
            {
                primary: { width: 287, height: 154 },
                secondary: { width: 287, height: 258 },
                tertiary: { width: 232, height: 258 }
            },
            {
                primary: { width: 130, height: 1290 },
                secondary: { width: 160, height: 1032 }
            },
            ["DS", "DS", "BP", "DS", "DS", "BS", "DS", "DS", "BP", "DS", "DS"],
            ["DS", "DS", "DS", "DS", "DS"]
        );
    }
}
