import MouseEventsManager from "./MouseEventsManager.mjs";
import KeyEventsManager from "./KeyEventsManager.mjs";
import ModelContext from "../../model/ModelContext.mjs";

export default class UserEventsManager {
    /** @type { ModelContext } */
    context;

    /** @type {SVGElement} */
    #drawingSVG;

    /** @type {MouseEventsManager} */
    #mouseEventsManager;

    /** @type {KeyEventsManager} */
    #keyEventsManager;

    /**
     * @param {ModelContext} context
     * @param {{ drawingSVG: SVGElement }} options 
     */
    constructor(context, options = {}) {
        this.context = context;
        this.#drawingSVG = options.drawingSVG;

        this.#mouseEventsManager = new MouseEventsManager(this);
        this.#keyEventsManager = new KeyEventsManager(this);

        this.#mouseEventsManager.registerDrawingSVG(this.#drawingSVG);
    }

    /**
     * @param {number} id 
     * @param {SVGGElement} rootElement 
     */
    registerComponent(id, rootElement) {
        this.#mouseEventsManager.registerComponent(id, rootElement);
    }

    registerArc(id, rootElement) {
        // TODO
    }
    
    /**
     * 
     * @param {"mouse-move" | "mouse-up" | "mouse-down"} event 
     * @param {number} x 
     * @param {number} y 
     */
    onDrawingViewMouseEvent(event, x, y) {
        this.context.managers.modelling.onDrawingViewUserEvent(event, { x, y });
    }
    

    /**
     * 
     * @param {"click" | "mouse-down" | "mouse-up"} event 
     * @param {number} id 
     * @param {{ drawingX: number, drawingY: number }} props
     */
    onComponentMouseEvent(event, id, props) {
        this.context.managers.modelling.onComponentUserEvent(event, id, props);
    }
}