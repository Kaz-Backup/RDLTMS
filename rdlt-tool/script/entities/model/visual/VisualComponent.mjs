import ComponentGeometry from "../../geometry/ComponentGeometry.mjs";
import ComponentStyles from "../../styling/ComponentStyles.mjs";
import ModelComponent from "../ModelComponent.mjs";

export default class VisualComponent extends ModelComponent {
    /** @type {string} */
    label;

    /** @type {string} */
    notes;

    /** @type {ComponentGeometry} */
    geometry;

    /** @type {ComponentStyles} */
    styles;

    /**
     * @param {{ uid?: number, identifier: string, type: ComponentType, isRBSCenter: boolean, geometry?: ComponentGeometry, styles?: ComponentStyles }} options 
     */
    constructor(options = {}) {
        const { uid, identifier, type, isRBSCenter, geometry, styles } = options || {};
        super({ uid, identifier, type, isRBSCenter });

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