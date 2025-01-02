import ModelManager from "./ModelManager.mjs";
import VisualModelManager from "./VisualModelManager.mjs";
import DragAndDropManager from "../modelling/DNDManager.mjs";
import DrawingViewManager from "../modelling/DrawingViewManager.mjs";
import ModellingManager from "../modelling/ModellingManager.mjs";
import PalettePanelManager from "../panels/PalettePanelManager.mjs";
import PropertiesPanelManager from "../panels/PropertiesPanelManager.mjs";
import TransformManager from "../modelling/TransformManager.mjs";
import MouseEventsManager from "../modelling/events/MouseEventsManager.mjs";
import KeyEventsManager from "../modelling/events/KeyEventsManager.mjs";

export default class ModelContext {
    /**
     * @typedef {{ palette: PalettePanelManager, properties: PropertiesPanelManager }} PanelManagersGroup 
     * @type {{ 
     *  model: ModelManager,
     *  visualModel: VisualModelManager,
     *  modelling: ModellingManager, 
     *  drawing: DrawingViewManager,
     *  dragAndDrop: DragAndDropManager,
     *  mouseEvents: MouseEventsManager,
     *  keyEvents: KeyEventsManager,
     *  transform: TransformManager,
     *  panels: PanelManagersGroup
     * }}
    */
    managers;


    constructor() {
        this.#initialize();
    }

    #initialize() {
        this.#setupManagers();
    }

    #setupManagers() {
        this.managers = {
            model: new ModelManager(this),
            visualModel: new VisualModelManager(this),
            modelling: new ModellingManager(this), 
            drawing: new DrawingViewManager(this),
            dragAndDrop: new DragAndDropManager(this),
            mouseEvents: new MouseEventsManager(this),
            keyEvents: new KeyEventsManager(this),
            panels: {
                palette: new PalettePanelManager(this),
                properties: new PropertiesPanelManager(this)
            }
        };
    }
    
}