import ArcGeometry from "../../entities/geometry/ArcGeometry.mjs";
import ComponentGeometry from "../../entities/geometry/ComponentGeometry.mjs";
import VisualArc from "../../entities/model/visual/VisualArc.mjs";
import VisualComponent from "../../entities/model/visual/VisualComponent.mjs";
import OutlineStyle from "../../entities/styling/OutlineStyle.mjs";
import TextStyle from "../../entities/styling/TextStyle.mjs";
import ModelContext from "../model/ModelContext.mjs";

export default class ExportManager {
    /** @type { ModelContext } */
    context;

    /**
     * @param {ModelContext} context 
     */
    constructor(context) {
        this.context = context;
    }

    exportToRDLTFile() {
        const visualModelManager = this.context.managers.visualModel;
        const components = visualModelManager.getAllComponents();
        const arcs = visualModelManager.getAllArcs();

        /**
         * @typedef {number} FontID
         * @typedef {number} OutlineID
         * @type {{ 
         *      fonts: { [serializedFont: string]: FontID },
         *      outlines: { [serializedOutline: string]: OutlineID }
         * }}
         */
        const styleClassesIDs = {
            fonts: {},
            outlines: {}
        };

        /**
         * @typedef {number} VertexUID
         * @typedef {number} ArcUID
         * @type {{
         *      vertices: { [serializedStyle: string]: VertexUID[]  }
         *      arcs: { [serializedStyle: string]: ArcUID[]  }
         * }}
         */
        const cumulativeCommonStyles = {
            vertices: {},
            arcs: {}
        };

        const styleClassesIDCounters = {
            fonts: 1,
            outlines: 1
        };

        const serialized = {
            vertices: [],
            arcs: [],
            geometry: {
                vertices: [],
                arcs: []
            },
            styleClasses: {
                fonts: [],
                outlines: []
            },
            styles: {
                vertices: [],
                arcs: []
            }
        };

        /**
         * @param {TextStyle} textStyle 
         * @returns {number}
         */
        const getStyleClassFontID = (textStyle) => {
            const serializedFont = this.#serializeFontStyleClass(textStyle);
            if(!(serializedFont in serialized.styleClasses.fonts)) {
                const fontID = styleClassesIDCounters.fonts++;
                serialized.styleClasses.fonts[serializedFont] = fontID;
                serialized.styleClasses.fonts.push(`${fontID} ${serializedFont}`);
            }

            return serialized.styleClasses.fonts[serializedFont];
        };

        /**
         * @param {TextStyle} textStyle 
         * @returns {number}
         */
        const getStyleClassOutlineID = (outlineStyle) => {
            const serializedOutline = this.#serializeOutlineStyleClass(outlineStyle);
            if(!(serializedOutline in serialized.styleClasses.outlines)) {
                const outlineID = styleClassesIDCounters.outlines++;
                serialized.styleClasses.outlines[serializedOutline] = outlineID;
                serialized.styleClasses.outlines.push(`${outlineID} ${serializedOutline}`);
            }

            return serialized.styleClasses.outlines[serializedOutline];
        };

        // Serialize vertices, their geometry, and styles
        for(const component of components) {
            serialized.vertices.push(this.#serializeComponent(component));
            serialized.geometry.vertices.push(this.#serializeComponentGeometry(component.uid, component.geometry));

            // Serialize styles
            const centerLabelFontID = getStyleClassFontID(component.styles.innerLabel);
            const labelFontID = getStyleClassFontID(component.styles.outerLabel);
            const outlineID = getStyleClassOutlineID(component.styles.outline);
            
            const serializedStyle = this.#serializeVertexStyle(centerLabelFontID, labelFontID, outlineID);
            if(!(serializedStyle in cumulativeCommonStyles.vertices)) {
                cumulativeCommonStyles.vertices[serializedStyle] = [component.uid];
            } else {
                cumulativeCommonStyles.vertices[serializedStyle].push(component.uid);
            }
        }

        // Serialize arcs, their geometry, and styles
        for(const arc of arcs) {
            serialized.arcs.push(this.#serializeArc(arc));
            serialized.geometry.arcs.push(this.#serializeArcGeometry(arc.uid, arc.geometry));

            // Serialize styles
            const labelFontID = getStyleClassFontID(arc.styles.label);
            const outlineID = getStyleClassOutlineID(arc.styles.outline);

            const serializedStyle = this.#serializeArcStyle(labelFontID, outlineID);
            if(!(serializedStyle in cumulativeCommonStyles.arcs)) {
                cumulativeCommonStyles.arcs[serializedStyle] = [arc.uid];
            } else {
                cumulativeCommonStyles.arcs[serializedStyle].push(arc.uid);
            }
        }

        // Serialize vertex styles (combined)
        for(const serializedVerticesStyle in cumulativeCommonStyles.vertices) {
            const vertexUIDs = cumulativeCommonStyles.vertices[serializedVerticesStyle];
            serialized.styles.vertices.push(`${serializedVerticesStyle} V=${vertexUIDs.join(" ")}`);
        }

        // Serialize vertex styles (combined)
        for(const serializedArcsStyle in cumulativeCommonStyles.arcs) {
            const arcUIDs = cumulativeCommonStyles.arcs[serializedArcsStyle];
            serialized.styles.arcs.push(`${serializedArcsStyle} A=${arcUIDs.join(" ")}`);
        }


        // Combine all serialized to raw
        const raw = [
            "VERTICES", ...serialized.vertices, "",
            "ARCS", ...serialized.arcs, "",
            "GEOMETRY: VERTICES", ...serialized.geometry.vertices, "",
            "GEOMETRY: ARCS", ...serialized.geometry.arcs, "",
            "STYLECLASSES: FONTS", ...serialized.styleClasses.fonts, "",
            "STYLECLASSES: OUTLINES", ...serialized.styleClasses.outlines, "",
            "STYLES: VERTICES", ...serialized.styles.vertices, "",
            "STYLES: ARCS", ...serialized.styles.arcs,
        ].join("\n");


        const filename = `${visualModelManager.getModelName()}.txt`;
        this.#startDownload(filename, raw);
    }

    /**
     * @param {TextStyle} textStyle
     * @returns {string} - format: `<family> <size> <color> <weight?>`
     */ 
    #serializeFontStyleClass(textStyle) {
        const { fontFamily, size, color, weight } = textStyle;
        return `${fontFamily} ${size} ${color} ${weight !== "normal" ? weight : ""}`.trim();
    }

    /**
     * @param {OutlineStyle} outlineStyle
     * @returns {string} - format: `<width> <color> <style?>`
     */ 
    #serializeOutlineStyleClass(outlineStyle) {
        const { width, color } = outlineStyle;

        return `${width} ${color}`;
    }

    /**
     * @param {VisualComponent} component 
     * @returns {string} - format: `<vuid> <id> <type> <M(v)>`
     */
    #serializeComponent(component) {
        const { uid, identifier, type, isRBSCenter } = component;
        return `${uid} ${this.#serializeString(identifier)} ${type[0]} ${isRBSCenter ? 1 : 0}`;
    }

    /**
     * @param {VisualArc} arc 
     * @returns {string} - format: `<auid> <from_vuid>-<to_vuid> <C> <L>`
     */
    #serializeArc(arc) {
        const { uid, fromVertexUID, toVertexUID, C, L } = arc;
        return `${uid} ${fromVertexUID}-${toVertexUID} ${this.#serializeString(C)} ${L}`;
    }

    /**
     * @param {ComponentGeometry} geometry 
     * @returns {string} - format: `<vuid> <size> <x>,<y>`
     */
    #serializeComponentGeometry(uid, geometry) {
        const { size, position } = geometry;
        return `${uid} ${size} ${position.x},${position.y}`;
    }

    /**
     * @param {ArcGeometry} geometry 
     * @returns {string} - format: `<auid> <autoDraw> <labelSegmentIdx>/<labelFootFracDist>/<labelPerpDist> <x1>,<y1>  <x2>,<y2>  ...`
     */
    #serializeArcGeometry(uid, geometry) {
        const { isAutoDraw, arcLabel: { baseSegmentIndex, footFracDistance, perpDistance }, waypoints } = geometry;
        const serializedWaypoints = waypoints.map(({ x, y }) => `${x},${y}`).join(" ");

        return `${uid} ${isAutoDraw ? 1 : 0} ${baseSegmentIndex}/${footFracDistance}/${perpDistance} ${serializedWaypoints}`;
    }

    /**
     * @param {number} centerLabelFontID 
     * @param {number} labelFontID 
     * @param {number} outlineID 
     * @returns {string} - format: `C=f<fid> L=f<fid> O=o1`
     */
    #serializeVertexStyle(centerLabelFontID, labelFontID, outlineID) {
        return `C=f${centerLabelFontID} L=f${labelFontID} O=o${outlineID}`;
    }

    /**
     * @param {number} labelFontID 
     * @param {number} outlineID 
     * @returns {string} - format: `L=f<fid> O=o1`
     */
    #serializeArcStyle(labelFontID, outlineID) {
        return `L=f${labelFontID} O=o${outlineID}`;
    }

    /**
     * @param {string} str 
     * @returns {string}
     */
    #serializeString(str) {
        str = str.trim();
        if(str === "") return `""`;

        // If string contains special characters, enclose in quotation marks
        if(/[^a-zA-Z0-9_]/.test(str)) {
            return `"${str.replace(/"/g, '\\"')}"`;
        }

        return str;
    }

    #startDownload(filename, content) {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const tmpParent = document.querySelector("#tmp");
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        tmpParent.appendChild(anchor);
        anchor.click();
        
        tmpParent.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

}