export default class ComponentGeometry {
    static DEFAULTS = {
        position: { x: 0, y: 0 },
        size: 70
    };

    /** @type {{ x: number, y: number }} */
    position;
    
    /** @type {number} */
    size;

    /**
     * 
     * @param {{ position: { x: number, y: number }, size: number }} options 
     */
    constructor(options = {}) {
        const { position, size } = options || {};

        this.position = position || ArcGeometry.DEFAULTS.position;
        this.size = size || ArcGeometry.DEFAULTS.size;
    }
}