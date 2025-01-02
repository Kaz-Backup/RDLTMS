import RDLTModel from "../RDLTModel.mjs";
import ModelAnnotation from "./ModelAnnotation.mjs";
import VisualArc from "./VisualArc.mjs";
import VisualComponent from "./VisualComponent.mjs";

export default class VisualRDLTModel extends RDLTModel {
    /** @type {string} */
    name;

    /** @type {{ [ componentUID: number ]: VisualComponent }} */
    components;

    /** @type {VisualArc[]} */
    arcs;

    /** @type {ModelAnnotation[]} */
    annotations;
}