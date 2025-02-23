import ComponentGeometry from "../../entities/geometry/ComponentGeometry.mjs";
import VisualComponent from "../../entities/model/visual/VisualComponent.mjs";
import VisualRDLTModel from "../../entities/model/visual/VisualRDLTModel.mjs";
import ComponentStyles from "../../entities/styling/ComponentStyles.mjs";

export default class VisualModelManager {
    /** @type { ModelContext } */
    context;

    /** @type {VisualRDLTModel} */
    #visualModel;

    /**
     * @param {ModelContext} context 
     */
    constructor(context) {
        this.context = context;

        this.#visualModel = new VisualRDLTModel();
    }

    /**
     * 
     * @param {{ identifier: string, label: string }} props 
     * @param {ComponentGeometry} geometry 
     * @param {ComponentStyles} styles 
     * @returns {VisualComponent}
     */
    addComponent(type, props, geometry, styles) {
        const visualComponent = new VisualComponent({
            type,
            identifier: props.identifier,
            label: props.label,
            geometry: geometry || new ComponentGeometry(),
            styles: styles || new ComponentStyles()
        });

        this.#visualModel.addComponent(visualComponent);

        return visualComponent;
    }

    /**
     * @param {number} id
     * @returns {VisualComponent | null} 
     */
    getComponent(id) {
        return this.#visualModel.getComponent(id) || null;
    }

    /**
     * 
     * @param {number} id 
     * @param {number} x 
     * @param {number} y 
     */
    updateComponentPosition(id, x, y) {
        const component = this.#visualModel.getComponent(id);
        if(!component) return;

        component.geometry.position.x = x;
        component.geometry.position.y = y;

        return component.geometry;
    }

    /**
     * @param {VisualComponent} component 
     */
    removeComponent(component) {
        this.#visualModel.removeComponent(component);
    }
}