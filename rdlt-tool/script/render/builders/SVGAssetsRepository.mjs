import { getRawSVGAsset } from "./utils.mjs";

export default class SVGAssetsRepository {
    /**
     * @typedef {{ boundary: string, controller: string, entity: string }} ComponentsCache
     * @type {{ components: ComponentsCache }}
     */
    static cache;

    static TEMPLATES_DIR = "/assets/templates";

    static async initialize() {
        SVGAssetsRepository.cache = {
            components: {
                boundary: "",
                controller: "",
                entity: ""
            }
        };

        await SVGAssetsRepository.loadAllAssets();


    }

    static async loadAllAssets() {
        const COMPONENTS_DIR = `${SVGAssetsRepository.TEMPLATES_DIR}/components`;

        // Load all component template SVGs
        SVGAssetsRepository.cache.components.boundary = await getRawSVGAsset(`${COMPONENTS_DIR}/boundary.svg`);
        SVGAssetsRepository.cache.components.entity = await getRawSVGAsset(`${COMPONENTS_DIR}/entity.svg`);
        SVGAssetsRepository.cache.components.controller = await getRawSVGAsset(`${COMPONENTS_DIR}/controller.svg`);
    }

    /**
     * @typedef { "boundary" | "entity" | "controller" } ComponentType
     * @param { ComponentType } type 
     * @returns {SVGElement}
     */
    static loadComponentSVGElement(type) {
        const raw = SVGAssetsRepository.cache.components[type];
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(raw, "image/svg+xml");
        const svgElement = svgDoc.documentElement;
    
        return svgElement;
    }
}
