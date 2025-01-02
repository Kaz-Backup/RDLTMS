import ComponentGeometry from "../geometry/ComponentGeometry.mjs";
import ModelComponent from "../ModelComponent.mjs";

export default class VisualComponent extends ModelComponent {
    /** @type {string} */
    label;

    /** @type {string} */
    notes;

    /** @type {ComponentGeometry} */
    geometry;
}