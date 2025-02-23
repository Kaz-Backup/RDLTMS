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
     */
     
    /**
     * @type {{ buttons: ViewButtons, drawing: ViewDrawing }}
     */
    #view = {
        buttons: {
            modes: {},
            actions: {}
        },
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
        // Initialize mode buttons
        [...document.querySelectorAll('.mode-buttons button')].forEach(
            button => this.#view.buttons.modes[button.getAttribute("data-mode")] = button);
        
        // Initialize action buttons
        [...document.querySelectorAll('.action-buttons button')].forEach(
            button => this.#view.buttons.actions[button.getAttribute("data-action")] = button);
        
        // Initialize drawing area
        this.#view.drawing = {
            container: document.querySelector('.drawing'),
            svg: document.querySelector('.drawing > svg'),
        };

        console.log(this.#view);
    }

    getDrawingSVG() {
        return this.#view.drawing.svg;
    }
}