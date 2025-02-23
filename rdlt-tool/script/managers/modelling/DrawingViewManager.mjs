import ComponentGeometry from "../../entities/geometry/ComponentGeometry.mjs";
import VisualComponent from "../../entities/model/visual/VisualComponent.mjs";
import ComponentStyles from "../../entities/styling/ComponentStyles.mjs";
import ComponentSVGBuilder from "../../render/builders/ComponentSVGBuilder.mjs";

export default class DrawingViewManager {
    /** @type { ModelContext } */
    context;

    /** @type {SVGElement} */
    #drawingSVG;

    /**
     * @type {{
     *    components: { [id: string | number]: ComponentSVGBuilder }
     * }}
     */
    #builders = {
        components: {}
    };

    /**
     * @param {ModelContext} context
     * @param {{ drawingSVG: SVGElement }} options 
     */
    constructor(context, options = {}) {
        this.context = context;
        this.#drawingSVG = options.drawingSVG;
    }

    /**
     * @param {number} id
     * @returns {ComponentSVGBuilder | null} 
     */
    #getComponentBuilder(id) {
        return this.#builders.components[id] || null;
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
     * @param {ComponentSVGBuilder} builder 
     * @param {VisualComponent} component 
     */
    #setComponentProps(builder, component) {
        const { styles, geometry } = component;
        
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
}