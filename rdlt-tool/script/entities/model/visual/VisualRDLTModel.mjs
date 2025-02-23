import RDLTModel from "../RDLTModel.mjs";
import ModelAnnotation from "./ModelAnnotation.mjs";
import VisualArc from "./VisualArc.mjs";
import VisualComponent from "./VisualComponent.mjs";

export default class VisualRDLTModel {
    /** @type {string} */
    #name;

    /** @type {{ [ componentUID: number ]: VisualComponent }} */
    #components;

    /** @type {VisualArc[]} */
    #arcs;

    /**
     * @typedef {number} ArcUID 
     * @type {{ [ fromVertexUID: number ]: { [ toVertexUID: number ]: Set<ArcUID> } }} */
    #arcConnections = {};

    /** @type {ModelAnnotation[]} */
    #annotations;

    /**
     * 
     * @param {{ components?: VisualComponent[], arcs?: VisualArc[] }} options 
     */
    constructor(options = {}) {
        const { components, arcs } = options || {};
        
        this.#components = components || {};
        this.#arcs = arcs || [];

        if(components) for(const component of components) this.addComponent(component);
        if(arcs) for(const arc of arcs) this.addArc(arc);
    }

    /**
     * @param {number} componentUID 
     * @returns {VisualComponent | null}
     */
    getComponent(componentUID) {
        return this.#components[componentUID] || null;
    }

    /**
     * @returns {VisualComponent[]}
     */
    getAllComponents() {
        return Object.values(this.#components);
    }

    /**
     * @param {number} componentUID 
     * @returns {VisualArc[]}
     */
    getArcsIncidentToComponent(componentUID) {
        const incidentArcs = [];
        for(const arc of this.#arcs) {
            if(arc.fromVertexUID === componentUID || arc.toVertexUID === componentUID) {
                incidentArcs.push(arc);
            }
        }

        return incidentArcs;
    }

    /**
     * @param {number} arcUID
     * @returns {VisualArc | null}
     */
    getArc(arcUID) {
        return this.#arcs.find(arc => arc.uid == arcUID) || null;
    }

    /**
     * @param {VisualComponent} component 
     */
    addComponent(component) {
        this.#components[component.uid] = component;
        this.#arcConnections[component.uid] = {};

        return component;
    }

    /**
     * @param {VisualArc} arc 
     */
    addArc(arc) {
        this.#arcs.push(arc);

        if(!this.#arcConnections[arc.fromVertexUID]) 
            this.#arcConnections[arc.fromVertexUID] = {};

        if(!this.#arcConnections[arc.fromVertexUID][arc.toVertexUID]) 
            this.#arcConnections[arc.fromVertexUID][arc.toVertexUID] = new Set([ arc.uid ]);
        else this.#arcConnections[arc.fromVertexUID][arc.toVertexUID].add(arc.uid);

        return arc;
    }

    /**
     * @param {number} componentUID 
     * @returns {VisualComponent | null}
     */
    removeComponent(componentUID) {
        const component = this.getComponent(componentUID);
        if(!component) return null;

        delete this.#components[componentUID];
        delete this.#arcConnections[componentUID];

        this.#arcs = this.#arcs.filter(arc => {
            if(arc.fromVertexUID === componentUID) return false;
            if(arc.toVertexUID === componentUID) {
                delete this.#arcConnections[arc.fromVertexUID]?.[componentUID];

                return false;
            }

            return true;
        });

        return component;
    }

    /**
     * @param {number} arcUID 
     * @returns {VisualArc | null}
     */
    removeArc(arcUID) {
        const arc = this.getArc(arcUID);
        if(!arc) return null;

        this.#arcs = this.#arcs.filter(arc => arc.uid !== arcUID);
        this.#arcConnections[arc.fromVertexUID]?.[arc.toVertexUID]?.delete(arcUID);

        return arc;
    }
}