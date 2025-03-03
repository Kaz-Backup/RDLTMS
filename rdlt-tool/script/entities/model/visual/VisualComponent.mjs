import ComponentGeometry from "../../geometry/ComponentGeometry.mjs";
import ComponentStyles from "../../styling/ComponentStyles.mjs";
import ModelComponent from "../ModelComponent.mjs";

export default class VisualComponent {
    static ID_COUNTER = 1;

    /** @type {number} */
    uid;

    /** @type {string} */
    identifier;

    /** 
     * @typedef {"boundary" | "entity" | "controller"} ComponentType
     * @type {ComponentType} */
    type;

    /** @type {boolean} */
    isRBSCenter;

    /** @type {string} */
    label;

    /** @type {string} */
    notes;

    /** @type {ComponentGeometry} */
    geometry;

    /** @type {ComponentStyles} */
    styles;

    /**
     * @param {{ uid?: number, identifier: string, label: string, type: ComponentType, isRBSCenter: boolean, geometry?: ComponentGeometry, styles?: ComponentStyles }} options 
     */
    constructor(options = {}) {
        const { uid, identifier, label, type, isRBSCenter, geometry, styles } = options || {};

        this.uid = uid || ModelComponent.ID_COUNTER++;
        this.identifier = identifier || "";
        this.label = label || "";
        this.type = type;
        this.isRBSCenter = isRBSCenter || false;
        this.geometry = geometry || new ComponentGeometry();
        this.styles = styles || new ComponentStyles();
    }

    copy() {
        const copied = new VisualComponent({
            uid: this.uid,
            identifier: this.identifier,
            type: this.type,
            isRBSCenter: this.isRBSCenter
        });

        copied.label = this.label;
        copied.notes = this.notes;
        copied.geometry = this.geometry.copy();
        copied.styles = this.styles.copy();

        return copied;
    }
}