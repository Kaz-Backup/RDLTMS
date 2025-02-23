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

    /** @type {{ x: number, y: number }[]} */
    waypoints;

    /**
     * 
     * @param {{ 
     *  pathType: PathType, 
     *  isAutoDraw: boolean, 
     *  waypoints: { x: number, y: number } 
     * }} options 
     */
    constructor(options = {}) {
        const { pathType, isAutoDraw, waypoints } = options || {};

        this.pathType = pathType || ArcGeometry.DEFAULTS.pathType;
        this.isAutoDraw = isAutoDraw || ArcGeometry.DEFAULTS.isAutoDraw;
        this.waypoints = waypoints || [];
    }
}