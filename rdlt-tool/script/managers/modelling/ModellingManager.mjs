import ArcGeometry from "../../entities/geometry/ArcGeometry.mjs";
import ComponentGeometry from "../../entities/geometry/ComponentGeometry.mjs";
import VisualArc from "../../entities/model/visual/VisualArc.mjs";
import VisualComponent from "../../entities/model/visual/VisualComponent.mjs";
import ArcStyles from "../../entities/styling/ArcStyles.mjs";
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
     *      isHighlighting: boolean,
     *      isMultiSelecting: boolean,
     *  },
     *  highlightStart: { x: number, y: number } | null,
     *  view: {
     *      zoomFactor: number,
     *      zoomedOffset: { x: number, y: number }
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
            isHighlighting: false,
            isMultiSelecting: false,
        },
        highlightStart: null,
        view: {
            zoomFactor: 1,
            zoomedOffset: { x: 0, y: 0 }
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
        const selected = this.modellingStates.selected;
        const modellingEvents = this.modellingStates.events;

        switch(mode) {
            case "select":
                switch(event) {
                    case "mouse-down":
                        if(modellingEvents.isMultiSelecting) {

                        } else {
                            if(!selected.components.includes(id)) {
                                this.#clearSelection();
                                this.#addComponentToSelection(id);
                            }
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
                        this.#startHighlighting(x, y);

                        break;
                    
                    case "mouse-move":
                        if(modellingEvents.isMoving) {
                            this.context.managers.transform.moveTo(x, y);
                        }

                        if(modellingEvents.isHighlighting) {
                            this.#highlightTo(x, y);
                        }

                        break;
                    case "mouse-up":
                        if(modellingEvents.isMoving) {
                            this.#endMovement();
                        }

                        if(modellingEvents.isHighlighting) {
                            this.#stopHighlighting(x, y);
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

    #startHighlighting(x, y) {
        this.modellingStates.events.isHighlighting = true;
        this.modellingStates.highlightStart = { x, y };
    }

    #highlightTo(x, y) {
        const x1 = this.modellingStates.highlightStart.x;
        const x2 = x;

        const y1 = this.modellingStates.highlightStart.y;
        const y2 = y;
        
        this.context.managers.drawing.highlightOver(
            Math.min(x1, x2), Math.min(y1, y2),
            Math.max(x1, x2), Math.max(y1, y2)
        );
    }

    convertDrawingToAbsolutePosition(x, y) {
        const { zoomFactor, zoomedOffset: { x: ox, y: oy } } = this.modellingStates.view;

        return { 
            x: (x + ox)/zoomFactor,
            y: (y + oy)/zoomFactor,
        };
    }

    
    #stopHighlighting(x, y) {
        const { x: sx, y: sy } = this.modellingStates.highlightStart;

        this.modellingStates.events.isHighlighting = false;
        this.modellingStates.highlightStart = null;
        this.context.managers.drawing.hideHighlight();

        const { x: startX, y: startY } = this.convertDrawingToAbsolutePosition(
            Math.min(sx, x), Math.min(sy, y)
        );

        const { x: endX, y: endY } = this.convertDrawingToAbsolutePosition(
            Math.max(sx, x), Math.max(sy, y)
        );

        this.#clearSelection();

        // Select all elements that are within (completely inside) highlighted area
        const components = this.context.managers.visualModel.getAllComponents();
        for(const component of components) {
            const { x: csx, y: csy } = component.geometry.position;
            const cex = csx + component.geometry.size;
            const cey = csy + component.geometry.size;

            if(csx >= startX && cex <= endX &&
                csy >= startY && cey <= endY) this.#addComponentToSelection(component.uid);
            
        }
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
     * @returns {VisualComponent}
     */
    addComponent(type, props = {}, geometry, styles) {
        const visualComponent = this.context.managers.visualModel.addComponent(type, props, geometry, styles);
        const componentElement = this.context.managers.drawing.addComponent(visualComponent);
        this.context.managers.userEvents.registerComponent(visualComponent.uid, componentElement);

        return visualComponent;
    }

    updateComponentPosition(id, x, y) {
        const geometry = this.context.managers.visualModel.updateComponentPosition(id, x, y);
        this.context.managers.drawing.updateComponentGeometry(id, geometry);

        // Update geometry of incident arcs
        const incidentArcs = this.context.managers.visualModel.getArcsIncidentToComponent(id);
        for(const arc of incidentArcs) {
            const vertex1Geometry = this.#getComponentById(arc.fromVertexUID).geometry;
            const vertex2Geometry = this.#getComponentById(arc.toVertexUID).geometry;
            this.context.managers.drawing.updateArcGeometry(arc.uid, arc.geometry, arc.styles.connectorEnd.thickness, vertex1Geometry, vertex2Geometry);
        }
    }

    /**
     * @param {} component1
     * @param {{ C, L }} props 
     * @param {ArcGeometry} geometry 
     * @param {ArcStyles} styles 
     * @returns {VisualArc}
     */
    addArc(fromVertexUID, toVertexUID, props, geometry, styles) {
        const component1 = this.#getComponentById(fromVertexUID);
        const component2 = this.#getComponentById(toVertexUID);
        if(!component1 || !component2) return;

        const visualArc = this.context.managers.visualModel.addArc(fromVertexUID, toVertexUID, props, geometry, styles);
        const arcElement = this.context.managers.drawing.addArc(visualArc, component1.geometry, component2.geometry);
        this.context.managers.userEvents.registerArc(visualArc.uid, arcElement);

        return visualArc;
    }
}