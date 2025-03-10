import ArcGeometry from "../../entities/geometry/ArcGeometry.mjs";
import ComponentGeometry from "../../entities/geometry/ComponentGeometry.mjs";
import VisualArc from "../../entities/model/visual/VisualArc.mjs";
import VisualComponent from "../../entities/model/visual/VisualComponent.mjs";
import VisualRDLTModel from "../../entities/model/visual/VisualRDLTModel.mjs";
import ArcStyles from "../../entities/styling/ArcStyles.mjs";
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
    
    getModelName() {
        return this.#visualModel.getName();
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
     * @returns {VisualComponent[]}
     */
    getAllComponents() {
        return this.#visualModel.getAllComponents();
    }
    

    /**
     * @param {number} id
     * @returns {VisualComponent | null} 
     */
    getComponent(id) {
        return this.#visualModel.getComponent(id) || null;
    }

    /**
     * @param {number} id 
     * @param {{ type?, identifier?, label?, isRBSCenter }} props 
     * @returns {VisualComponent}
     */
    updateComponentProps(id, props) {
        const component = this.getComponent(id);

        if('type' in props) component.type = props.type;
        if('label' in props) component.label = props.label;
        if('identifier' in props) component.identifier = props.identifier;
        if('isRBSCenter' in props) component.isRBSCenter = props.isRBSCenter;

        return component;
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

    /**
     * @param {{ C, L }} props 
     * @param {ArcGeometry} geometry 
     * @param {ArcStyles} styles 
     * @returns {VisualArc}
     */
    addArc(fromVertexUID, toVertexUID, props, geometry, styles) {
        const { C, L } = props || {};
        const visualArc = new VisualArc({
            fromVertexUID,
            toVertexUID,
            C, L,
            geometry, styles
        });

        this.#visualModel.addArc(visualArc);
        return visualArc;
    }

    /**
     * @param {number} id
     * @returns {VisualArc | null} 
     */
    getArc(id) {
        return this.#visualModel.getArc(id) || null;
    }

    /**
     * @returns {VisualArc[]}
     */
    getAllArcs() {
        return this.#visualModel.getAllArcs();
    }

    getArcsIncidentToComponent(componentUID) {
        return this.#visualModel.getArcsIncidentToComponent(componentUID);
    }

    /**
     * @param {number} id 
     * @param {{ C, L }} props 
     * @returns {VisualArc}
     */
    updateArcProps(id, props) {
        const component = this.getArc(id);

        if('C' in props) component.C = props.C;
        if('L' in props) component.L = props.L;

        return component;
    }
}