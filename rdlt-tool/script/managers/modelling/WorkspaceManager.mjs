import ModelContext from "../model/ModelContext.mjs";

export default class WorkspaceManager {
    /** @type { ModelContext } */
    context;

    /**
     * @typedef {Object} ModeButtons
     * @property {HTMLButtonElement} view 
     * @property {HTMLButtonElement} select 
     * 
     * @typedef {Object} ActionButtons
     * @property {HTMLButtonElement} undo
     * @property {HTMLButtonElement} select
     * @property {HTMLButtonElement} save
     * @property {HTMLButtonElement} add
     * @property {HTMLButtonElement} upload
     * @property {HTMLButtonElement} download
     * @property {HTMLButtonElement} settings
     * 
     * @typedef {{ modes: ModeButtons, actions: ActionButtons }} ViewButtons
     * 
     * @typedef {Object} ViewDrawing
     * @property {HTMLDivElement} container
     * @property {SVGElement} svg
     * 
     * @typedef {{ [panelID: string]: HTMLDivElement }} PanelsView
     */
     
    /**
     * @type {{ main: HTMLDivElement, buttons: ViewButtons, panels: PanelsView, drawing: ViewDrawing }}
     */
    #view = {
        main: null,
        buttons: {
            modes: {},
            actions: {}
        },
        panels: {},
        drawing: {}
    };

    /**
     * @param {ModelContext} context 
     */
    constructor(context) {
        this.context = context;
        this.#initializeView();
    }

    #initializeView() {
        this.#view.main = document.querySelector("body > main");
        // Initialize mode buttons
        [...document.querySelectorAll('.mode-buttons button')].forEach(
            button => this.#view.buttons.modes[button.getAttribute("data-mode")] = button);
        
        // Initialize action buttons
        [...document.querySelectorAll('.action-buttons button')].forEach(
            button => {
                const action = button.getAttribute("data-action");
                this.#view.buttons.actions[action] = button;
                button.addEventListener("click", () => this.#onActionClicked(action));
        });
        
        // Initialize drawing area
        this.#view.drawing = {
            container: document.querySelector('.drawing'),
            svg: document.querySelector('.drawing > svg'),
        };

        // Initialize panels
        [...document.querySelectorAll(".panel")].forEach(
            panel => {
                const panelID = panel.getAttribute("data-panel-id");
                this.#view.panels[panelID] = panel;
        });

    }

    /**
     * @returns {SVGElement}
     */
    getDrawingSVG() {
        return this.#view.drawing.svg;
    }

    /**
     * @param {string} panelID 
     * @returns {HTMLDivElement} 
     */
    getPanelRootElement(panelID) {
        return this.#view.panels[panelID];
    }

    /**
     * 
     * @param {"undo" | "redo" | "save" | "add" | "upload" | "download" | "settings"} action 
     */
    #onActionClicked(action) {
        switch(action) {
            case "save":
                this.context.managers.export.exportToRDLTFile();
            break;
            case "download":
                this.context.managers.export.exportToPNGImage();
            break;
        }
    }

    setModellingEvent(event, isActive) {
        const attr = `data-evt-${event}`;
        if(isActive) {
            this.#view.main.setAttribute(attr, "true");
        } else {
            this.#view.main.removeAttribute(attr);
        }
    }

    refreshSelection() {
        const selected = this.context.managers.modelling.modellingStates.selected;

    }
}