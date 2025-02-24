import ModelContext from "../model/ModelContext.mjs";

export default class PalettePanelManager {
    /** @type { ModelContext } */
    context;

    /** @type {HTMLDivElement} */
    #rootElement;

    /**
     * @param {ModelContext} context 
     */
    constructor(context, rootElement) {
        this.context = context;
        this.#rootElement = rootElement;

        this.#initializeView();
    }

    #initializeView() {
        // Initialize draggable elements
        const draggableElements = [...document.querySelectorAll(".palette-draggable-element")];
        for(const draggableElement of draggableElements) {
            const elementID = draggableElement.getAttribute("data-element");

            draggableElement.addEventListener("mousedown", (event) => {
                if(elementID === "component") {
                    const componentType = draggableElement.getAttribute("data-component-type");
                    this.context.managers.dragAndDrop.handleComponentDND(componentType);
                }
            });
        }
    }


}