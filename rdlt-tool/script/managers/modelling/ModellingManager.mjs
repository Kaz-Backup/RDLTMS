import ComponentGeometry from "../../entities/geometry/ComponentGeometry.mjs";
import VisualComponent from "../../entities/model/visual/VisualComponent.mjs";
import ComponentStyles from "../../entities/styling/ComponentStyles.mjs";
import ModelContext from "../model/ModelContext.mjs";

export default class ModellingManager {
    /** @type { ModelContext } */
    context;

    /**
     * @param {ModelContext} context 
     */
    constructor(context) {
        this.context = context;
    }

    /**
     * @type {{
     *  mode: "view" | "select",
     *  selected: { components: number[], arcs: number[], annotations: number[] },
     *  events: { 
     *      isMoving: boolean, 
     *      isMultiSelecting: boolean,
     *  },
     *  view: {
     *      zoomFactor: number,
     *      zoomedOffset: number
     *  }
     * }}
     */
    modellingStates = {
        mode: "select",
        selected: {
            components: [], 
            arcs: [], 
            annotations: [] 
        },
        events: { 
            isMoving: false,
            isMultiSelecting: false,
        },
        view: {
            zoomFactor: 1,
            zoomedOffset: 0
        }
    };

    /**
     * @param {number} id 
     * @returns {VisualComponent | null} 
     */
    #getComponentById(id) {
        return this.context.managers.visualModel.getComponent(id);
    }

    /**
     * @param {"click" | "mouse-down" | "mouse-up"} event 
     * @param {number} id
     * @param {{ drawingX: number, drawingY: number }} props
     */
    onComponentUserEvent(event, id, props) {
        const component = this.#getComponentById(id);
        if(!component) return;

        const mode = this.modellingStates.mode;
        const selected = this.mode
        const modellingEvents = this.modellingStates.events;

        switch(mode) {
            case "select":
                switch(event) {
                    case "mouse-down":
                        if(modellingEvents.isMultiSelecting) {

                        } else {
                            this.#clearSelection();
                            this.#addComponentToSelection(id);
                        }

                        this.#startMovement(props.drawingX, props.drawingY);
                        break;
                    
                    case "mouse-up":
                        this.#endMovement();
                        break;
                }
            break;
        }
    }

    /**
     * @param {"mouse-move" | "mouse-down" | "mouse-up" } event 
     * @param {{ x?: number, y?: number }} props 
     */
    onDrawingViewUserEvent(event, props) {
        const { x, y } = props;

        const mode = this.modellingStates.mode;
        const modellingEvents = this.modellingStates.events;

        switch(mode) {
            case "select":
                switch(event) {
                    case "mouse-down":
                        this.#clearSelection();
                        break;
                    
                    case "mouse-move":
                        if(modellingEvents.isMoving) {
                            this.context.managers.transform.moveTo(x, y);
                        }

                        break;
                    case "mouse-up":
                        if(modellingEvents.isMoving) {
                            this.#endMovement();
                        }
                }
            break;
        }
    }

    #startMovement(drawingX, drawingY) {
        this.modellingStates.events.isMoving = true;
        const moveStart = { x: drawingX, y: drawingY };
        const moveInitialPositions = { components: {}, arcs: {}, annotations: {} };

        this.modellingStates.selected.components.forEach((componentId) => 
            moveInitialPositions.components[componentId] = 
                { ...(this.#getComponentById(componentId)?.geometry?.position || { x: 0, y: 0 }) }
            );
        
        this.context.managers.transform.startMovement(moveStart, moveInitialPositions);
    }

    #endMovement() {
        this.modellingStates.events.isMoving = false;
        this.context.managers.transform.endMovement();
    }

    #clearSelection() {
        const drawingViewManager = this.context.managers.drawing;

        this.modellingStates.selected.components.forEach(id => drawingViewManager.setIsComponentSelected(id, false));
        this.modellingStates.selected.components = [];

        this.modellingStates.selected.arcs = [];
        this.modellingStates.selected.annotations = [];
    }

    #addComponentToSelection(id) {
        this.context.managers.drawing.setIsComponentSelected(id, true);
        this.modellingStates.selected.components.push(id);
    }

    /**
     * @param {"boundary" | "entity" | "controller"} type
     * @param {{ identifier: string, label: string }} props 
     * @param {ComponentGeometry} geometry 
     * @param {ComponentStyles} styles 
     */
    addComponent(type, props = {}, geometry, styles) {
        const visualComponent = this.context.managers.visualModel.addComponent(type, props, geometry, styles);
        const componentElement = this.context.managers.drawing.addComponent(visualComponent);
        this.context.managers.userEvents.registerComponent(visualComponent.uid, componentElement);
    }

    updateComponentPosition(id, x, y) {
        const geometry = this.context.managers.visualModel.updateComponentPosition(id, x, y);
        this.context.managers.drawing.updateComponentGeometry(id, geometry);
    }
}