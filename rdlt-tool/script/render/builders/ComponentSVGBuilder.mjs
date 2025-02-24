import SVGAssetsRepository from "./SVGAssetsRepository.mjs";
import TextSVGBuilder from "./TextSVGBuilder.mjs";
import { makeGroupSVG, makeSVGElement } from "./utils.mjs";

export default class ComponentSVGBuilder {
    
    /** 
     * @typedef {"boundary" | "entity" | "controller"} ComponentType
     * @type {ComponentType} */
    #type;

    /** @type {number} */
    boundWidth;

    /** @type {number} */
    boundHeight;

    /** @type {number} */
    initialCircleSize;


    /** @type {TextSVGBuilder} */
    #centerLabel;

    /** @type {SVGGElement} */
    #element;

    /** @type {SVGElement} */
    #componentElement;

    
    /**
     * @param {ComponentType} type
     */
    constructor(type, draggingOnly = false) {
        this.#type = type;
        this.boundWidth = 100;
        this.boundHeight = 100;
        this.initialCircleSize = 70;

        this.#componentElement = SVGAssetsRepository.loadComponentSVGElement(this.#type);
        this.#componentElement.querySelectorAll("path")[0].classList.add("component-circle");

        const groupBounds = makeSVGElement("rect", {
            x: 0, y: 0, 
            width: this.boundWidth,
            height: this.boundHeight,
            fill: "transparent",
        });

        if(!draggingOnly) {
            this.#centerLabel = new TextSVGBuilder("", {
                align: "middle", vAlign: "central", 
                x: this.boundWidth/2,
                y: this.boundHeight/2,
                fontSize: 20
            });

            const hoverElement = SVGAssetsRepository.loadComponentHoverSVGElement();
            hoverElement.classList.add("component-hover");
            this.#componentElement.appendChild(hoverElement);

            const selectedElement = SVGAssetsRepository.loadComponentSelectedSVGElement();
            selectedElement.classList.add("component-selected");
            this.#componentElement.appendChild(selectedElement);

            const arcTracingHoverElement = SVGAssetsRepository.loadArcTracingHoverSVGElement();
            const arcTracingHoverCircleElement = arcTracingHoverElement.querySelector("circle");
            arcTracingHoverCircleElement.classList.add("arctracing-hover");
            this.#componentElement.appendChild(arcTracingHoverCircleElement);

            this.#element = makeGroupSVG([
                groupBounds,
                this.#componentElement,
                this.#centerLabel.element
            ], { className: "component" });
        } else {
            this.#element = makeGroupSVG([
                groupBounds,
                this.#componentElement,
            ], { className: "component dragging" });
        }

        



        


        

        
   
    }

    static Boundary() {
        return new ComponentSVGBuilder("boundary");
    }

    static Entity() {
        return new ComponentSVGBuilder("entity");
    }

    static Controller() {
        return new ComponentSVGBuilder("controller");
    }

    get element() { return this.#element; }

    setCenterLabelText(text) {
        this.#centerLabel.text = text;

        return this;
    }

    setPosition(x, y) {

        x -= this.boundWidth/2;
        y -= this.boundHeight/2;

        this.#element.setAttribute("transform", `translate(${x}, ${y})`);

        return this;
    }

    setStrokeWidth(strokeWidth) {
        for(const path of [ ...this.#componentElement.querySelectorAll("path") ]) {
            path.setAttribute("stroke-width", strokeWidth);
        }

        return this;
    }

    setIsSelected(isSelected) {
        if(isSelected) this.#element.setAttribute("data-selected", "");
        else this.#element.removeAttribute("data-selected");
    }
}