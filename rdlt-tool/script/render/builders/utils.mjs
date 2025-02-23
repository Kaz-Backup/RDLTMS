
/**
 * @param {string} path 
 * @returns {Promise<string>}
 */
export async function getRawSVGAsset(path) {
    const response = await fetch(path);
    return await response.text();
}


/**
 * @param {string} tag 
 * @param {Object?} attributes 
 * @returns {SVGElement}
 */
export function makeSVGElement(tag, attributes = {}) {
    const ns = "http://www.w3.org/2000/svg";
    const element = document.createElementNS(ns, tag);
    for(const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }

    return element;
}

/**
 * @param {SVGElement[]} children 
 * @param {{ x, y, className }} props 
 * @returns {SVGGElement}
 */
export function makeGroupSVG(children, props = {}) {
    const { x = 0, y = 0, className } = props;

    const ns = "http://www.w3.org/2000/svg";
    const groupSVG = makeSVGElement("g", { transform: `translate(${x}, ${y})` });
    groupSVG.append(...children);

    if(className) groupSVG.classList.add(...className.split(" "));

    return groupSVG;
}