export default class ArcGeometry {
    static DEFAULTS = {
        pathType: "straight",
        isAutoDraw: false
    };

    /** 
     * @typedef { "straight" | "elbowed" } PathType 
     * @type {PathType}
    */ 
    pathType;

    /** @type {boolean} */
    isAutoDraw;

    /**
     * 
     * @param {{ pathType: PathType, isAutoDraw: boolean }} options 
     */
    constructor(options = {}) {
        const { pathType, isAutoDraw } = options || {};

        this.pathType = pathType || ArcGeometry.DEFAULTS.pathType;
        this.isAutoDraw = isAutoDraw || ArcGeometry.DEFAULTS.isAutoDraw;
    }
}