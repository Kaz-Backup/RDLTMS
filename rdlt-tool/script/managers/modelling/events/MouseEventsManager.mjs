import UserEventsManager from "./UserEventsManager.mjs";

export default class MouseEventsManager {

    /**
     * @type {UserEventsManager}
     */
    #parent;

    /**
     * @type {SVGElement}
     */
    #drawingSVG;

    /**
     * @param {UserEventsManager} parent 
     */
    constructor(parent) {
        this.#parent = parent;
    }

    /**
     * 
     * @param {SVGElement} svgElement 
     */
    registerDrawingSVG(svgElement) {
        this.#drawingSVG = svgElement;

        const events = [
            [ "mousemove", "mouse-move" ],
            [ "mousedown", "mouse-down" ],
            [ "mouseup", "mouse-up" ],
        ];

        events.forEach(([ elementEvent, mouseEvent ]) => svgElement.addEventListener(elementEvent, (event) => {
            const { x, y } = this.#getRelativeDrawingPosition(event.clientX, event.clientY);
            this.#parent.onDrawingViewMouseEvent(mouseEvent, x, y);
        }));
    }

    #getRelativeDrawingPosition(x, y) {
        const { x: ox, y: oy } = this.#drawingSVG.getBoundingClientRect();
        return { x: x - ox, y: y - oy };
    }

    /**
     * @param {number} id 
     * @param {SVGGElement} rootElement 
     */
    registerComponent(id, rootElement) {
        /** @type {SVGPathElement} */
        const componentCircleElement = rootElement.querySelector(".component-circle");
        
        const events = [
            [ "click", "click" ],
            [ "mousedown", "mouse-down" ],
            [ "mouseup", "mouse-up" ],
        ];

        events.forEach(([ elementEvent, mouseEvent ]) => componentCircleElement.addEventListener(elementEvent, (event) => {
            const { x: drawingX, y: drawingY } = this.#getRelativeDrawingPosition(event.clientX, event.clientY);
            this.#parent.onComponentMouseEvent(mouseEvent, id, { drawingX, drawingY });
            event.stopPropagation();
        }));
    }

    

}