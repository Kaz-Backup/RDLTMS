import ModelContext from "../model/ModelContext.mjs";

export default class TransformManager {
    /** @type { ModelContext } */
    context;

    /**
     * @type {{
    *  events: { 
    *      isMoving: boolean, 
    *  },
    *  moveStart: { x: number, y: number } | null, 
    *  moveInitialPositions: {
    *      components: { [id: number]: { x: number, y } },
    *      arcs: { [id: number]: { x: number, y } },
    *      annotations: { [id: number]: { x: number, y } },
    *  }
    * }}
    */
    states = {
        events: {
            isMoving: false
        },
        moveStart: null,
        moveInitialPositions: {
            components: {},
            arcs: {},
            annotations: {}
        }
    };

    /**
     * @param {ModelContext} context 
     */
    constructor(context) {
        this.context = context;
    }

    /**
     * @param {{ x: number, y: number } | null} moveStart
     * @param {{
     *      components: { [id: number]: { x: number, y } },
     *      arcs: { [id: number]: { x: number, y } },
     *      annotations: { [id: number]: { x: number, y } },
     *  }} moveInitialPositions
    */
    startMovement(moveStart, moveInitialPositions) {
        this.states.events.isMoving = true;
        this.states.moveStart = moveStart;
        this.states.moveInitialPositions = moveInitialPositions;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    moveTo(x, y) {
        const { x: startX, y: startY } = this.states.moveStart;
        const offsetX = x - startX;
        const offsetY = y - startY;

        const modellingManager = this.context.managers.modelling;
        const { zoomFactor } = modellingManager.modellingStates.view;

        const absOffsetX = offsetX/zoomFactor;
        const absOffsetY = offsetY/zoomFactor;

        const initialPositions = this.states.moveInitialPositions;
        for(let id in initialPositions.components) {
            id = Number(id);
            const { x: ix, y: iy } = initialPositions.components[id];
            const nx = ix + absOffsetX;
            const ny = iy + absOffsetY;

            modellingManager.updateComponentPosition(id, nx, ny);
        }
    }

    endMovement() {
        this.states.events.isMoving = false;
        this.states.moveStart = null;
        this.states.moveInitialPositions = {
            components: {}, arcs: {}, annotations: {}
        };
    }
}