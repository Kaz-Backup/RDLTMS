import SVGAssetsRepository from "./SVGAssetsRepository.mjs";
import TextSVGBuilder from "./TextSVGBuilder.mjs";
import { makeGroupSVG, makeSVGElement } from "./utils.mjs";

export default class ComponentSVGBuilder {
    
    /** 
     * @typedef {"boundary" | "entity" | "controller"} ComponentType
     * @type {ComponentType} */
    #type;

    /** @type {{ x: number, y: number }} */
    #position;

    /** @type {number} */
    #boundWidth;

    /** @type {number} */
    #boundHeight;

    /** @type {TextSVGBuilder} */
    #centerLabel;

    /** @type {SVGGElement} */
    #element;

    /** @type {SVGElement} */
    #componentElement;

    /** @type {{ width: number, color: string }} */
    #stroke;
    
    /**
     * @param {ComponentType} type
     */
    constructor(type) {
        this.#type = type;
        this.#position = { x: 0, y: 0 };
        this.#boundWidth = 100;
        this.#boundHeight = 100;
        this.#stroke = { color: "black", width: 2 };

        this.#centerLabel = new TextSVGBuilder("", {
            align: "middle", vAlign: "central", 
            x: this.#boundWidth/2,
            y: this.#boundHeight/2,
            fontSize: 20
        });


        this.#componentElement = SVGAssetsRepository.loadComponentSVGElement(this.#type);
        this.#componentElement.querySelectorAll("path")[0].classList.add("component-circle");

        const groupBounds = makeSVGElement("rect", {
            x: 0, y: 0, 
            width: this.#boundWidth,
            height: this.#boundHeight,
            fill: "transparent",
        });


        const hoverElement = SVGAssetsRepository.loadComponentHoverSVGElement();
        hoverElement.classList.add("component-hover")
        this.#componentElement.appendChild(hoverElement);

        const selectedElement = SVGAssetsRepository.loadComponentSelectedSVGElement();
        selectedElement.classList.add("component-selected");
        this.#componentElement.appendChild(selectedElement);

        this.#element = makeGroupSVG([
            groupBounds,
            this.#componentElement,
            this.#centerLabel.element
        ], { className: "component" });

        
        this.setStrokeWidth(this.#stroke.width);
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
    get position() { return { ...this.#position }; }

    setCenterLabelText(text) {
        this.#centerLabel.text = text;

        return this;
    }

    setPosition(x, y) {
        this.#position = { 
            x: x || 0, 
            y: y || 0 
        };

        this.#element.setAttribute("transform", `translate(${this.#position.x}, ${this.#position.y})`);

        return this;
    }

    setStrokeWidth(strokeWidth) {
        this.#stroke.width = strokeWidth || 3;
        for(const path of [ ...this.#componentElement.querySelectorAll("path") ]) {
            path.setAttribute("stroke-width", this.#stroke.width);
        }

        return this;
    }

    setIsSelected(isSelected) {
        if(isSelected) this.#element.setAttribute("data-selected", "");
        else this.#element.removeAttribute("data-selected");
    }
}