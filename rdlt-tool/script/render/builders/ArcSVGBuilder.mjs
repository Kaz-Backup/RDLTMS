import { makeGroupSVG, makeSVGElement, radiansToDegrees } from "./utils.mjs";

export default class ArcSVGBuilder {

    #element;
    #pathElement;
    #connectorEndElement;

    constructor() {
        this.#pathElement = makeSVGElement("path", {
            d: "",
            stroke: "black",
            fill: "none"
        });

        this.#pathElement.classList.add("arc-path");

        this.#connectorEndElement = makeSVGElement("polygon", {
            points: "",
            fill: "black",
            stroke: "none"
        });

        this.#element = makeGroupSVG([
            this.#pathElement,
            this.#connectorEndElement
        ]);
    }

    get element() { return this.#element; }


    /**
     * @param {{ x: number, y: number }[]} points - all points, including center of incidental vertices
     * @param {number} startRadius 
     * @param {number} endRadius 
     */
    setWaypoints(points, startRadius = 0, endRadius = 0) {
        const poc1 = this.#getPointOfContact(
            points[0], startRadius, points[1]);

        const poc2 = this.#getPointOfContact(
            points[points.length-1], endRadius, points[points.length-2]);

        // Draw line from poc1 to poc2 along points excluding vertex centers
        const drawPoints = [ ...points.slice(1, -1), poc2 ];
        
        let d = `M ${poc1.x} ${poc1.y}`;
        for(const { x, y } of drawPoints) {
            d += ` L ${x} ${y}`;
        }

        this.#pathElement.setAttribute("d", d);
    }

    /**
     * 
     * @param {{ x: number, y: number }} initial 
     * @param {{ x: number, y: number }} terminal 
     */
    #getNormalAngle(initial, terminal) {
        const { x: cx, y: cy } = initial;
        const { x: fx, y: fy } = terminal;

        const refAngle = Math.atan((fy-cy)/(fx-cx));
        return fx - cx < 0 ? refAngle + Math.PI : refAngle;
    }

    /**
     * @param {{ x: number, y: number }} center 
     * @param {number} radius 
     * @param {{ x: number, y: number }} nextPoint
     * @returns {number}
     */
    #getPointOfContact(center, radius, nextPoint) {
        const normalAngle = this.#getNormalAngle(center, nextPoint);
        const pocX = center.x + radius * Math.cos(normalAngle);
        const pocY = center.y + radius * Math.sin(normalAngle);

        return { x: pocX, y: pocY };
    }

    setStrokeWidth(strokeWidth) {
        this.#pathElement.setAttribute("stroke-width", strokeWidth);
        
        return this;
    }

    /**
     * 
     * @param {number} thickness 
     * @param {{ x: number, y: number }} targetCenter 
     * @param {number} targetRadius 
     * @param {number} normalAngle 
     */
    updateConnectorEndPosition(thickness, targetCenter, targetRadius, previousPoint) {
        const poc = this.#getPointOfContact(targetCenter, targetRadius + thickness/2, previousPoint);
        const normalAngle = this.#getNormalAngle(previousPoint, targetCenter);

        const rotationDeg = radiansToDegrees(normalAngle) + 90;
        this.#connectorEndElement.setAttribute("transform", `translate(${poc.x-thickness/2}, ${poc.y-thickness/2}) rotate(${rotationDeg} ${thickness/2} ${thickness/2})`);
    }

    setConnectorEndThickness(thickness) {
        this.#connectorEndElement.setAttribute("points", `${thickness/2},0 0,${thickness} ${thickness},${thickness}`);

        return this;
    }

}