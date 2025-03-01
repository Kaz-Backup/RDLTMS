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
     *      isDragging: boolean,
     *      isArcTracing: boolean
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
            isDragging: false,
            isArcTracing: false
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
     * @param {"click" | "mouse-down" | "mouse-up" | "mouse-enter" | "mouse-leave"} event 
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
                                this.#refreshSelected();
                            }
                        }

                        this.#startMovement(props.drawingX, props.drawingY);
                        break;
                    
                    case "mouse-up":
                        if(modellingEvents.isMoving) {
                            this.#endMovement();
                        }

                    break;
                    case "mouse-enter":
                        if(modellingEvents.isArcTracing) {
                            this.context.managers.arcTracing.enterTargetComponent(id);
                        }
                    break;
                    case "mouse-leave":
                        if(modellingEvents.isArcTracing) {
                            this.context.managers.arcTracing.leaveTargetComponent(id);
                        }
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

                        if(modellingEvents.isDragging) {
                            this.context.managers.dragAndDrop.moveTo(x, y);
                        }

                        if(modellingEvents.isArcTracing) {
                            this.context.managers.arcTracing.moveTo(x, y);
                        }

                        break;
                    case "mouse-up":
                        if(modellingEvents.isMoving) {
                            this.#endMovement();
                        }

                        if(modellingEvents.isHighlighting) {
                            this.#stopHighlighting(x, y);
                        }

                        if(modellingEvents.isDragging) {
                            this.#stopDragging(x, y);
                        }

                        if(modellingEvents.isArcTracing) {
                            this.#endArcTracing();
                        }
                }
            break;
        }
    }


    /**
     * @param {"mouse-down"} event 
     * @param {number} componentUID
     * @param {{ drawingX: number, drawingY: number }} props
     */
    onArcTracingHoverUserEvent(event, componentUID, props) {
        switch(event) {
            case "mouse-down":
                this.#startArcTracing(componentUID);
            break;
        }
    }

    /**
     * @param {"click" | "mouse-down" | "mouse-up" | "mouse-enter" | "mouse-leave"} event 
     * @param {number} id
     * @param {{ drawingX: number, drawingY: number }} props
     */
    onArcUserEvent(event, id, props) {
        const mode = this.modellingStates.mode;
        const selected = this.modellingStates.selected;
        const modellingEvents = this.modellingStates.events;

        console.log(`Arc ${id} user event: ${event}`);

        switch(mode) {
            case "select":
                switch(event) {
                    case "mouse-down":
                        if(modellingEvents.isMultiSelecting) {

                        } else {
                            if(!selected.arcs.includes(id)) {
                                this.#clearSelection();
                                this.#addArcToSelection(id);
                                this.#refreshSelected();
                            }
                        }

                        break;
                    
                }
            break;
        }
    }

    #startMovement(drawingX, drawingY) {
        this.modellingStates.events.isMoving = true;
        this.context.managers.workspace.setModellingEvent("ismoving", true);
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
        this.context.managers.workspace.setModellingEvent("ismoving", false);
        this.context.managers.transform.endMovement();
    }

    #startHighlighting(x, y) {
        this.modellingStates.events.isHighlighting = true;
        this.context.managers.workspace.setModellingEvent("ishighlighting", true);
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
        this.context.managers.workspace.setModellingEvent("ishighlighting", false);
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
            const { x, y } = component.geometry.position;
            const csx = x - component.geometry.size / 2;
            const csy = y - component.geometry.size / 2;
            const cex = csx + component.geometry.size;
            const cey = csy + component.geometry.size;

            if(csx >= startX && cex <= endX &&
                csy >= startY && cey <= endY) this.#addComponentToSelection(component.uid);
            
        }

        const arcs = this.context.managers.visualModel.getAllArcs();
        for(const arc of arcs) {
            const { 
                start: { x: asx, y: asy }, 
                end: { x: aex, y: aey } } = this.context.managers.drawing.getArcBounds(arc.uid);

                if(asx >= startX && aex <= endX &&
                    asy >= startY && aey <= endY) this.#addArcToSelection(arc.uid);
        }

        this.#refreshSelected();
    }

    #clearSelection() {
        const drawingViewManager = this.context.managers.drawing;

        // Deselect all components
        this.modellingStates.selected.components.forEach(id => drawingViewManager.setIsComponentSelected(id, false));
        this.modellingStates.selected.components = [];
        
        // Deselect all arcs
        this.modellingStates.selected.arcs.forEach(id => drawingViewManager.setIsArcSelected(id, false));
        this.modellingStates.selected.arcs = [];

        this.modellingStates.selected.annotations = [];
    }

    #addComponentToSelection(id) {
        this.context.managers.drawing.setIsComponentSelected(id, true);
        this.modellingStates.selected.components.push(id);
    }
    
    #addArcToSelection(id) {
        this.context.managers.drawing.setIsArcSelected(id, true);
        this.modellingStates.selected.arcs.push(id);
    }

    #refreshSelected() {
        this.context.managers.panels.properties.refreshSelected();
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

    startDragAndDrop(componentType) {
        this.modellingStates.events.isDragging = true;
        this.context.managers.workspace.setModellingEvent("isdragging", true);
        this.#showDraggingComponent(componentType, { x: -100, y: -100 });
    }

    /**
     * @param {"boundary" | "entity" | "controller"} componentType 
     * @param {{ x: number, y: number }} position 
     */
    #showDraggingComponent(componentType, position) {
        this.context.managers.drawing.showDraggingComponent(componentType, position);
    }

    endDragAndDrop() {
        this.modellingStates.events.isDragging = false;
        this.context.managers.workspace.setModellingEvent("isdragging", false);
        this.context.managers.drawing.destroyDraggingComponent();
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    moveDraggingComponent(x, y) {
        this.context.managers.drawing.moveDraggingComponent(x, y);
    }



    /**
     * @param {number} x 
     * @param {number} y 
     */
    #stopDragging(x, y) {
        this.modellingStates.events.isDragging = false;
        this.context.managers.workspace.setModellingEvent("isdragging", false);
        this.context.managers.dragAndDrop.drop(x, y);
    }

    #startArcTracing(componentUID) {
        this.#clearSelection();
        this.modellingStates.events.isArcTracing = true;
        this.context.managers.workspace.setModellingEvent("isarctracing", true);
        this.context.managers.arcTracing.startTracing(componentUID);
    }

    /**
     * @param {number} fromVertexUID 
     * @param {{ x: number, y: number }} toPoint 
     */
    traceArcToPoint(fromVertexUID, toPoint) {
        const startVertex = this.#getComponentById(fromVertexUID);
        this.context.managers.drawing.traceArcToPoint(startVertex.geometry, toPoint);
    }

    /**
     * @param {number} fromVertexUID 
     * @param {number} toVertexUID 
     */
    traceArcToVertex(fromVertexUID, toVertexUID) {
        const startVertex = this.#getComponentById(fromVertexUID);
        const endVertex = this.#getComponentById(toVertexUID);
        this.context.managers.drawing.traceArcToVertex(startVertex.geometry, endVertex.geometry);
    }

    #endArcTracing() {
        this.modellingStates.events.isArcTracing = false;
        this.context.managers.workspace.setModellingEvent("isarctracing", false);
        this.context.managers.arcTracing.endTracing();
        this.context.managers.drawing.endTracing();
    }


}