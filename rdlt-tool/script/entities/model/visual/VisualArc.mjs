import ArcGeometry from "../../geometry/ArcGeometry.mjs";
import ArcStyles from "../../styling/ArcStyles.mjs";
import ModelArc from "../ModelArc.mjs";

export default class VisualArc {
    static ID_COUNTER = 1;

    /** @type {number} */
    uid;

    /** @type {string} */
    C;

    /** @type {number} */
    L;

    /** @type {number} */
    fromVertexUID;
    
    /** @type {number} */
    toVertexUID;

    /** @type {string} */
    notes;

    /** @type {ArcGeometry} */
    geometry;

    /** @type {ArcStyles} */
    styles;


    /**
     * @param {{ C: string, L: number, fromVertexUID: number, toVertexUID: number }} options 
     */
    constructor(options = {}) {
        const { C, L, fromVertexUID, toVertexUID, geometry, styles } = options || {};
    
        this.uid = ModelArc.ID_COUNTER++;
        this.C = C || "";
        this.L = L || 1;
        this.fromVertexUID = fromVertexUID;
        this.toVertexUID = toVertexUID;

        this.geometry = geometry || new ArcGeometry();
        this.styles = styles || new ArcStyles();
    }
}