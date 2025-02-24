export default class ArcGeometry {
    static DEFAULTS = {
        pathType: "straight",
        isAutoDraw: false,
        arcLabel: { baseSegmentIndex: 0, footFracDistance: 0.5, perpDistance: 0 }
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
     * @type {{ baseSegmentIndex: 0, footFracDistance: number, perpDistance: number }}
     */
    arcLabel;

    /**
     * 
     * @param {{ 
     *  pathType: PathType, 
     *  isAutoDraw: boolean, 
     *  waypoints: { x: number, y: number } 
     *  arcLabel: { footFracDistance: number, perpDistance: number }
     * }} options 
     */
    constructor(options = {}) {
        const { pathType, isAutoDraw, waypoints, arcLabel } = options || {};

        this.pathType = pathType || ArcGeometry.DEFAULTS.pathType;
        this.isAutoDraw = isAutoDraw || ArcGeometry.DEFAULTS.isAutoDraw;
        this.waypoints = waypoints || [];
        this.arcLabel = arcLabel || { ...ArcGeometry.DEFAULTS.arcLabel };

    }
}