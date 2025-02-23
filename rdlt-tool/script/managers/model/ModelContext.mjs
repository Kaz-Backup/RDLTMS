import ModelManager from "./ModelManager.mjs";
import VisualModelManager from "./VisualModelManager.mjs";
import DragAndDropManager from "../modelling/DNDManager.mjs";
import DrawingViewManager from "../modelling/DrawingViewManager.mjs";
import ModellingManager from "../modelling/ModellingManager.mjs";
import PalettePanelManager from "../panels/PalettePanelManager.mjs";
import PropertiesPanelManager from "../panels/PropertiesPanelManager.mjs";
import TransformManager from "../modelling/TransformManager.mjs";
import UserEventsManager from "../modelling/events/UserEventsManager.mjs";
import WorkspaceManager from "../modelling/WorkspaceManager.mjs";

export default class ModelContext {
    /**
     * @typedef {{ palette: PalettePanelManager, properties: PropertiesPanelManager }} PanelManagersGroup 
     * 
     * @type {{ 
     *  model: ModelManager,
     *  visualModel: VisualModelManager,
     *  modelling: ModellingManager, 
     *  drawing: DrawingViewManager,
     *  dragAndDrop: DragAndDropManager,
     *  userEvents: UserEventsManager,
     *  transform: TransformManager,
     *  panels: PanelManagersGroup,
     *  workspace: WorkspaceManager
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
        // Setup workspace manager and its views
        const workspaceManager = new WorkspaceManager(this);


        this.managers = {
            model: new ModelManager(this),
            visualModel: new VisualModelManager(this),
            modelling: new ModellingManager(this), 
            drawing: new DrawingViewManager(this, 
                { drawingSVG: workspaceManager.getDrawingSVG() }),
            dragAndDrop: new DragAndDropManager(this),
            userEvents: new UserEventsManager(this,
                { drawingSVG: workspaceManager.getDrawingSVG() }),
            transform: new TransformManager(this),
            workspace: workspaceManager,
            panels: {
                palette: new PalettePanelManager(this),
                properties: new PropertiesPanelManager(this)
            }
        };
    }
    
}