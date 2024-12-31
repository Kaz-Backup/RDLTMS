/**
 * 
 * @param {string} tag 
 * @param {Object?} attributes 
 */
function makeSVGElement(tag, attributes = {}) {
    const ns = "http://www.w3.org/2000/svg";
    const element = document.createElementNS(ns, tag);
    for(const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }

    return element;
}

/**
 * 
 * @param {SVGElement[]} children 
 * @param {{ x, y }} props 
 */
function makeGroupSVG(children, props = {}) {
    const { x = 0, y = 0 } = props;

    const ns = "http://www.w3.org/2000/svg";
    const groupSVG = makeSVGElement("g", { transform: `translate(${x}, ${y})` });
    groupSVG.append(...children);

    return groupSVG;
}


const RawSVG = {
    components: {
        boundary: "",
        entity: "",
        controller: ""
    }
};

function loadSVGAsset(raw) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(raw, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    return svgElement;
}

class ComponentSVGBuilder {
    
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


        this.#componentElement = loadSVGAsset(RawSVG.components[this.#type]);

        const groupBounds = makeSVGElement("rect", { 
            x: 0, y: 0, 
            width: this.#boundWidth,
            height: this.#boundHeight,
            fill: "transparent" 
        });


        this.#element = makeGroupSVG([
            groupBounds,
            this.#componentElement,
            this.#centerLabel.element
        ]);

        
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
}

class TextSVGBuilder {
    /** @type {string} */
    #text;
    
    /** @type {number | string} */
    #fontSize;
    
    /** @type {string} */
    #fontFamily;
    
    /** @type {string} */
    #color;

    /** @type {{ x: number, y: number }} */
    #position;

    /** 
     * @typedef { "start" | "middle" | "end" } TextAlign
     * @type {TextAlign} 
    */
    #align;

    /** 
     * @typedef { "auto" | "middle" | "hanging" | "alphabetic" | "ideographic" | "mathematical" | "central" | "text-before-edge" | "text-after-edge" } TextVerticalAlign
     * @type {TextVerticalAlign} 
    */
    #vAlign;

    /** 
     * @type {SVGTextElement} 
    */
    #element;

    /**
     * 
     * @param {string} text 
     * @param {{ fontSize: number | string, fontFamily: string, align: TextAlign, vAlign: TextVerticalAlign, x: number, y: number }} props 
     */
    constructor(text, props = {}) {
        const { fontSize, fontFamily, color, align, vAlign, x = 0, y = 0 } = props;

        this.#element = makeSVGElement("text");
        this.text = text;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;
        this.position = { x, y };
        this.align = align;
        this.vAlign = vAlign;
    }

    get text() { return this.#text; }
    get fontSize() { return this.#fontSize; }
    get fontFamily() { return this.#fontFamily; }
    get color() { return this.#color; }
    get position() { return { ...this.#position }; }
    get align() { return this.#align; }
    get vAlign() { return this.#vAlign; }
    get element() { return this.#element; }

    set text(text) {
        this.#text = text || "";
        this.#element.textContent = this.#text;
    }
    
    set fontSize(fontSize) {
        this.#fontSize = fontSize || 17;
        this.#element.setAttribute("font-size", this.#fontSize);
    }
    
    set fontFamily(fontFamily) {
        this.#fontFamily = fontFamily || "Arial";
        this.#element.setAttribute("font-family", this.#fontFamily);
    }

    set color(color) {
        this.#color = color || "black";
        this.#element.setAttribute("color", this.#color);
    }
    
    set position(position) {
        if(!position) position = { x: 0, y: 0 };
        
        this.#position = {
            x: position.x || 0,
            y: position.y || 0
        };
        
        this.#element.setAttribute("x", this.#position.x);
        this.#element.setAttribute("y", this.#position.y);
    }

    set align(align) {
        this.#align = align || "start";
        this.#element.setAttribute("text-anchor", this.#align);
    }

    set vAlign(vAlign) {
        this.#vAlign = vAlign || "start";
        this.#element.setAttribute("dominant-baseline", this.#vAlign);
    }

    copy() {
        return new TextSVGBuilder(
            this.#text, {
                fontSize: this.#fontSize, 
                fontFamily: this.#fontFamily, 
                color: this.#color, 
                align: this.#align, 
                vAlign: this.#vAlign, 
                x: this.#position.x, 
                y: this.#position.y
            }
        );
    }
}