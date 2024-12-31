const svg = document.querySelector("svg");

async function init() {
    // const compBoundarySVG = await getSVGAsset("./assets/comp-boundary.svg");
    // const compEntitySVG = await getSVGAsset("./assets/comp-entity.svg");
    // const compControllerSVG = await getSVGAsset("./assets/comp-controller.svg");
    
    // const groupBounds = makeSVGElement("rect", { x: 0, y: 0, height: 100, width: 100, fill: "transparent" });
    // const compText = makeTextSVG("x1", { x: 50, y: 50, fontSize: 30, fontFamily: "Arial", align: "middle", vAlign: "central" });
    // const compGroup = makeGroupSVG([
    //     groupBounds, 
    //     // compBoundarySVG, 
    //     compEntitySVG,
    //     compText
    // ], { x: 100, y: 200 });

    // svg.appendChild(compGroup);

    RawSVG.components.boundary = await getRawSVGAsset("./assets/comp-boundary.svg");
    RawSVG.components.entity = await getRawSVGAsset("./assets/comp-entity.svg");
    RawSVG.components.controller = await getRawSVGAsset("./assets/comp-controller.svg");

    svg.append(
        ComponentSVGBuilder.Boundary()
        .setCenterLabelText("x1")
        .setPosition(10, 30)
        .element,

        ComponentSVGBuilder.Entity()
        .setCenterLabelText("x2")
        .setPosition(10, 140)
        .setStrokeWidth(3)
        .element,

        ComponentSVGBuilder.Controller()
        .setCenterLabelText("x3")
        .setPosition(10, 250)
        .element,
    );
}

async function getRawSVGAsset(path) {
    const response = await fetch(path);
    return await response.text();
}


/**
 * 
 * @param {string} tag 
 * @param {Object?} attributes 
 */
function makeSVGElement(tag, attributes = {}) {
    const ns = "http://www.w3.org/2000/svg";
    const element = document.createElementNS(ns, tag);
    setElementAttributes(element, attributes);

    return element;
}

/**
 * 
 * @param {string} text 
 * @typedef { "start" | "middle" | "end" } TextAlign
 * @typedef { "auto" | "middle" | "hanging" | "alphabetic" | "ideographic" | "mathematical" | "central" | "text-before-edge" | "text-after-edge" } TextVerticalAlign
 * @param {{ fontSize: number | string, fontFamily: string, color: string, align: TextAlign, vAlign: TextVerticalAlign, x, y }} props 
 */
function makeTextSVG(text, props = {}) {
    const { fontSize, fontFamily, color, align, vAlign, x = 0, y = 0 } = props;

    const textSVG = makeSVGElement("text", {
        "x": x || 0,
        "y": y || 0,
        "fill": color || "black",
        "font-size": fontSize || "",
        "font-family": fontFamily || "",
        "text-anchor": align || "start",
        "dominant-baseline": vAlign || "text-before-edge"
    });
    
    textSVG.textContent = text;

    return textSVG;
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

/**
 * 
 * @param {HTMLOrSVGElement} element 
 * @param {Object} attributes 
 */
function setElementAttributes(element, attributes) {
    for(const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
}

init();
