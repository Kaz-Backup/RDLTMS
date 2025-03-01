import ModelContext from "../model/ModelContext.mjs";

export default class PropertiesPanelManager {
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
    }

    refreshSelected() {
        const modellingManager = this.context.managers.modelling;
        const selected = modellingManager.modellingStates.selected;

        const noComp = selected.components.length === 0;
        const oneComp = selected.components.length === 1;
        const manyComps = selected.components.length > 1;

        const noArc = selected.arcs.length === 0;
        const oneArc = selected.arcs.length === 1;
        const manyArcs = selected.arcs.length > 1;

        this.#setNoneSelected(noComp && noArc);
        this.#setIsOneComponentSelected(oneComp);
        this.#setIsOneArcSelected(oneArc);

    }

    #setIsOneComponentSelected(isSelected) {
        if(isSelected) {
            this.#rootElement.setAttribute("data-view-component", "");
        } else {
            this.#rootElement.removeAttribute("data-view-component");
        }
    }

    #setIsOneArcSelected(isSelected) {
        if(isSelected) {
            this.#rootElement.setAttribute("data-view-arc", "");
        } else {
            this.#rootElement.removeAttribute("data-view-arc");
        }
    }

    #setNoneSelected(isSelected) {
        if(isSelected) {
            this.#rootElement.setAttribute("data-view-none", "");
        } else {
            this.#rootElement.removeAttribute("data-view-none");
        }
    }
}