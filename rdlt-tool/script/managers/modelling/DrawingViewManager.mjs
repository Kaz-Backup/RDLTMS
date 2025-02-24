import ArcGeometry from "../../entities/geometry/ArcGeometry.mjs";
import ComponentGeometry from "../../entities/geometry/ComponentGeometry.mjs";
import VisualArc from "../../entities/model/visual/VisualArc.mjs";
import VisualComponent from "../../entities/model/visual/VisualComponent.mjs";
import ArcStyles from "../../entities/styling/ArcStyles.mjs";
import ComponentStyles from "../../entities/styling/ComponentStyles.mjs";
import ArcSVGBuilder from "../../render/builders/ArcSVGBuilder.mjs";
import ComponentSVGBuilder from "../../render/builders/ComponentSVGBuilder.mjs";
import HighlightSVGBuilder from "../../render/builders/HighlightSVGBuilder.mjs";

export default class DrawingViewManager {
    /** @type { ModelContext } */
    context;

    /** @type {SVGElement} */
    #drawingSVG;

    /**
     * @type {{
     *    components: { [id: string | number]: ComponentSVGBuilder },
     *    arcs: { [id: string]: ArcSVGBuilder },
     *    highlight: HighlightSVGBuilder,
     *    dragging: { component: ComponentSVGBuilder },
     *    arcTracing: ArcSVGBuilder
     * }}
     */
    #builders = {
        components: {},
        arcs: {},
        highlight: null,
        dragging: {
            component: null
        },
        arcTracing: null
    };

    /**
     * @param {ModelContext} context
     * @param {{ drawingSVG: SVGElement }} options 
     */
    constructor(context, options = {}) {
        this.context = context;
        this.#drawingSVG = options.drawingSVG;

        // Initialize reusable builders
        this.#builders.arcTracing = new ArcSVGBuilder(true);
        this.#setArcStyles(this.#builders.arcTracing, new ArcStyles());
        this.#builders.arcTracing.element.classList.add("arc-tracing");
        this.#builders.arcTracing.element.style.display = "none";
        this.#drawingSVG.appendChild(this.#builders.arcTracing.element);
    }

    highlightOver(ix, iy, fx, fy) {
        if(!this.#builders.highlight) {
            // Setup highlight
            this.#builders.highlight = new HighlightSVGBuilder();
            this.#drawingSVG.appendChild(this.#builders.highlight.element);
        }

        this.#builders.highlight.highlightOver(ix, iy, fx, fy);
    }

    hideHighlight() {
        this.#builders.highlight?.hide();
    }

    /**
     * @param {number} id
     * @returns {ComponentSVGBuilder | null} 
     */
    #getComponentBuilder(id) {
        return this.#builders.components[id] || null;
    }

    /**
     * @param {number} id
     * @returns {ArcSVGBuilder | null} 
     */
    #getArcBuilder(id) {
        return this.#builders.arcs[id] || null;
    }

    /**
     * @param {VisualComponent} component 
     * @returns {SVGGElement}
     */
    addComponent(component) {
        const id = component.uid;
        const componentBuilder = new ComponentSVGBuilder(component.type);
        this.#setComponentProps(componentBuilder, component);
        this.#setComponentStyles(componentBuilder, component.styles);
        this.#setComponentGeometry(componentBuilder, component.geometry);
        
        this.#builders.components[id] = componentBuilder;
        this.#drawingSVG.appendChild(componentBuilder.element);

        return componentBuilder.element;
    }

    /**
     * 
     * @param {VisualArc} arc
     * @returns {SVGGElement} 
     */
    addArc(arc, vertex1Geometry, vertex2Geometry) {
        const id = arc.uid;
        const arcBuilder = new ArcSVGBuilder();

        this.#setArcProps(arcBuilder, arc);
        this.#setArcGeometry(arcBuilder, arc.geometry, arc.styles.connectorEnd.thickness, vertex1Geometry, vertex2Geometry);
        this.#setArcStyles(arcBuilder, arc.styles);

        this.#builders.arcs[id] = arcBuilder;
        this.#drawingSVG.appendChild(arcBuilder.element);

        return arcBuilder.element;
    }


    setIsComponentSelected(id, isSelected) {
        const componentBuilder = this.#getComponentBuilder(id);
        if(!componentBuilder) return;

        componentBuilder.setIsSelected(isSelected);
    }

    
    /**
     * @param {VisualComponent} component 
     */
    updateComponentProps(component) {
        const componentBuilder = this.#getComponentBuilder(component.uid);
        if(!componentBuilder) return;

        this.#setComponentProps(componentBuilder, component);
    }
    
    /**
     * @param {number} id
     * @param {ComponentStyles} styles
     */
    updateComponentStyles(id, styles) {
        const componentBuilder = this.#getComponentBuilder(id);
        if(!componentBuilder) return;

        this.#setComponentStyles(componentBuilder, styles);
    }

    /**
     * @param {number} id
     * @param {ComponentGeometry} geometry
     */
    updateComponentGeometry(id, geometry) {
        const componentBuilder = this.#getComponentBuilder(id);
        if(!componentBuilder) return;

        this.#setComponentGeometry(componentBuilder, geometry);
    }

    removeComponent(id) {
        const componentBuilder = this.#getComponentBuilder(id);
        if(!componentBuilder) return;

        componentBuilder.element.remove();
        delete this.#builders.components[id];
    }

    /**
     * @param {number} id
     * @param {ArcGeometry} geometry
     * @param {ComponentGeometry} vertex1Geometry
     * @param {ComponentGeometry} vertex2Geometry
     */
    updateArcGeometry(id, geometry, connectorEndThickness, vertex1Geometry, vertex2Geometry) {
        const arcBuilder = this.#getArcBuilder(id);
        if(!arcBuilder) return;

        this.#setArcGeometry(arcBuilder, geometry, connectorEndThickness, vertex1Geometry, vertex2Geometry);
    }


    /**
     * @param {ComponentSVGBuilder} builder 
     * @param {VisualComponent} component 
     */
    #setComponentProps(builder, component) {
        builder.setCenterLabelText(component.identifier);
    }

    /**
     * 
     * @param {ComponentSVGBuilder} builder 
     * @param {ComponentStyles} styles 
     */
    #setComponentStyles(builder, styles) {
        builder.setStrokeWidth(styles.outline.width);
    }

    /**
     * 
     * @param {ComponentSVGBuilder} builder 
     * @param {ComponentGeometry} geometry 
     */
    #setComponentGeometry(builder, geometry) {
        builder.setPosition(geometry.position.x, geometry.position.y);
    }


    /**
     * @param {ArcSVGBuilder} builder 
     * @param {VisualArc} arc 
     */
    #setArcProps(builder, arc) {
        builder.setLabelText(`${arc.C}:${arc.L}`);
    }
    
    /**
     * @param {ArcSVGBuilder} builder 
     * @param {ArcGeometry} geometry 
     * @param {ComponentGeometry} vertex1Geometry 
     * @param {ComponentGeometry} vertex2Geometry 
     */
    #setArcGeometry(builder, geometry, connectorEndThickness, vertex1Geometry, vertex2Geometry) {
        const startRadius = vertex1Geometry.size/2;
        const start = vertex1Geometry.position;
        
        const endRadius = vertex2Geometry.size/2;
        const end = vertex2Geometry.position;
        
        const points = [ start, ...geometry.waypoints, end ];
        builder.setWaypoints(points, startRadius, endRadius + 10);
        builder.updateConnectorEndPosition(connectorEndThickness, end, endRadius, points[points.length-2]);
        builder.updateLabelPosition(
            points, geometry.arcLabel.baseSegmentIndex,
            geometry.arcLabel.footFracDistance, geometry.arcLabel.perpDistance, 
            startRadius, endRadius);
    }

    /**
     * 
     * @param {ArcSVGBuilder} builder 
     * @param {ArcStyles} styles 
     */
    #setArcStyles(builder, styles) {
        builder.setStrokeWidth(styles.outline.width)
            .setConnectorEndThickness(styles.connectorEnd.thickness);
    }

    /**
     * @param {"boundary" | "entity" | "controller"} componentType
     * @param {{ x: number, y: number }} position
     * @returns {SVGGElement}
     */
    showDraggingComponent(componentType, position) {
        const componentBuilder = new ComponentSVGBuilder(componentType, true);
        
        const geometry = new ComponentGeometry({ position });
        const styles = new ComponentStyles();
        
        this.#setComponentGeometry(componentBuilder, geometry);
        this.#setComponentStyles(componentBuilder, styles);
        this.#builders.dragging.component = componentBuilder;
        this.#drawingSVG.appendChild(componentBuilder.element);

        return componentBuilder.element;
    }

    moveDraggingComponent(x, y) {
        const draggingComponentBuilder = this.#builders.dragging.component;
        if(!draggingComponentBuilder) return;

        draggingComponentBuilder.setPosition(x, y);
    }

    destroyDraggingComponent() {
        const draggingComponentBuilder = this.#builders.dragging.component;
        if(!draggingComponentBuilder) return;

        this.#drawingSVG.removeChild(draggingComponentBuilder.element);
        this.#builders.dragging.component = null;
    }

    /**
     * 
     * @param {ComponentGeometry} vertex1Geometry 
     * @param {{ x: number, y: number }} targetPoint 
     */
    traceArcToPoint(vertex1Geometry, targetPoint) {
        this.#builders.arcTracing.element.style.display = "initial";

        const arcTracingBuilder = this.#builders.arcTracing;
        this.#setArcGeometry(arcTracingBuilder, new ArcGeometry(), new ArcStyles().connectorEnd.thickness, 
            vertex1Geometry, new ComponentGeometry({
                position: targetPoint, size: 1
            }));
    }

    /**
     * @param {ComponentGeometry} vertex1Geometry 
     * @param {ComponentGeometry} vertex2Geometry 
     */
    traceArcToVertex(vertex1Geometry, vertex2Geometry) {
        this.#builders.arcTracing.element.style.display = "initial";

        const arcTracingBuilder = this.#builders.arcTracing;
        this.#setArcGeometry(arcTracingBuilder, new ArcGeometry(), new ArcStyles().connectorEnd.thickness, vertex1Geometry, vertex2Geometry);
    }

    endTracing() {
        this.#builders.arcTracing.element.style.display = "none";
    }
}