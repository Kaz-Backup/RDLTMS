import ArcGeometry from "../geometry/ArcGeometry.mjs";
import ModelArc from "../ModelArc.mjs";

export default class VisualArc extends ModelArc {

    /** @type {string} */
    notes;

    /** @type {ArcGeometry} */
    geometry;
}