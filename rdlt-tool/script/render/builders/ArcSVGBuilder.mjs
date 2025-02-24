import TextSVGBuilder from "./TextSVGBuilder.mjs";
import { getDistance, makeGroupSVG, makeSVGElement, radiansToDegrees } from "./utils.mjs";

export default class ArcSVGBuilder {

    #element;
    #pathElement;
    #labelElement;
    #labelMaskElement;
    #connectorEndElement;

    constructor(isTracing = false) {
        
        const arcColor = !isTracing ? "black" : "#aaaaaa";

        this.#pathElement = makeSVGElement("path", {
            d: "",
            stroke: arcColor,
            fill: "none"
        });

        this.#pathElement.classList.add("arc-path");

        this.#connectorEndElement = makeSVGElement("polygon", {
            points: "",
            fill: arcColor,
            stroke: "none"
        });

        const arcElement = makeGroupSVG([
            this.#pathElement,
            this.#connectorEndElement
        ]);


        if(!isTracing) {
            this.#labelElement = new TextSVGBuilder("", {
                align: "middle", vAlign: "central", 
                x: 0,
                y: 0,
                fontSize: 16
            });
    
            const arcCutoutID = `arc-${Date.now()}-${Math.floor(Math.random()*10000)}-cutout`
            this.#labelMaskElement = makeSVGElement("rect", {
                x: 0, y: 0, width: 100, height: 100, 
                rx: 20, ry: 20
            });
    
            const labelMaskBoundsElement = makeSVGElement("defs", {}, [
                makeSVGElement("mask", { id: arcCutoutID }, [
                    makeSVGElement("rect", {
                        width: "100%", height: "100%", fill: "white"
                    }),
                    this.#labelMaskElement,
                ])
            ]);

            
            arcElement.setAttribute("mask", `url(#${arcCutoutID})`);

            this.#element = makeGroupSVG([
                labelMaskBoundsElement,
                arcElement,
                this.#labelElement.element,
            ]);

        } else {
            this.#element = makeGroupSVG([
                arcElement,
            ]);
        }
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

    setLabelText(text) {
        this.#labelElement.text = text;

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

    updateLabelPosition(points, baseSegmentIndex, footFracDistance, perpDistance, startRadius, endRadius) {
        if(!this.#labelElement) return;

        // Change endpoints to points of contact
        points[0] = this.#getPointOfContact(points[0], startRadius, points[1]);
        points[points.length-1] = this.#getPointOfContact(
            points[points.length-1], endRadius, points[points.length-2]);

        const baseSegmentStart = points[baseSegmentIndex];
        const baseSegmentEnd = points[baseSegmentIndex+1];

        const footX = baseSegmentStart.x + footFracDistance*(baseSegmentEnd.x - baseSegmentStart.x);
        const footY = baseSegmentStart.y + footFracDistance*(baseSegmentEnd.y - baseSegmentStart.y);

        const segmentSlope = (baseSegmentStart.y - baseSegmentEnd.y) / (baseSegmentStart.x - baseSegmentEnd.x);
        const perpAngle = Math.atan(-1/segmentSlope) + (baseSegmentStart.y < baseSegmentEnd.y ? Math.PI : 0);
        const labelX = footX + Math.cos(perpAngle)*perpDistance;
        const labelY = footY + Math.sin(perpAngle)*perpDistance;

        this.#labelElement.position = { x: labelX, y: labelY };

        requestAnimationFrame(() => {
            const { width, height } = this.#labelElement.element.getBBox();
            const clipoutWidth = width + 10;
            const clipoutHeight = height + 6;
            const clipoutX = labelX - clipoutWidth/2;
            const clipoutY = labelY - clipoutHeight/2;
            this.#labelMaskElement.setAttribute("transform", `translate(${clipoutX}, ${clipoutY})`);
            this.#labelMaskElement.setAttribute("height", clipoutHeight);
            this.#labelMaskElement.setAttribute("width", clipoutWidth);
        });
    }

}