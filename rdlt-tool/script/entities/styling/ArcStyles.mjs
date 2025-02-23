import OutlineStyle from "./OutlineStyle.mjs";
import TextStyle from "./TextStyle.mjs";

export default class ArcStyles {
    /** @type {OutlineStyle} */
    outline;

    /** @type {TextStyle} */
    label;

    /**
     * @typedef {"none" | "arrow-open" | "arrow-closed-filled" | "arrow-closed"} ConnectorType
     * @typedef {{ type: ConnectorType, thickness: number }} ConnectorStyle
    */

    /** @type {ConnectorStyle} */
    connectorStart;

    /** @type {ConnectorStyle} */
    connectorEnd;
}