
export class Form {
    /** @type {HTMLDivElement} */
    #rootElement;

    /** @type {string[]} */
    #fieldNames = null;

    /** @type {{ [fieldName: string]: HTMLInputElement | HTMLSelectElement }} */
    #fieldElements = null;

    /** @type {(fieldName, value) => any}  */
    #listener;

    constructor(rootElement) {
        this.#rootElement = rootElement;
        this.#listener = null;
    }

    /**
     * @param {string[]} fieldNames 
     * @returns {Form}
     */
    setFieldNames(fieldNames) {
        this.#fieldNames = fieldNames;
        this.#loadFields();

        return this;
    }

    #loadFields() {
        if(this.#fieldElements !== null) throw new Error("Field names can only be loaded once.");
        this.#fieldElements = {};

        for(const fieldName of this.#fieldNames) {
            /** @type {HTMLInputElement | HTMLSelectElement} */
            const fieldElement = this.#rootElement.querySelector(`[name='${fieldName}']`);
            if(!fieldElement) continue;

            this.#fieldElements[fieldName] = fieldElement;
            if(fieldElement.tagName === "INPUT") {
                fieldElement.addEventListener("input", () => this.#onFieldChange(fieldName, fieldElement));
            } else if(fieldElement.tagName === "SELECT") {
                fieldElement.addEventListener("change", () => this.#onFieldChange(fieldName, fieldElement));
            }
        }
    }

    #onFieldChange(fieldName, fieldElement) {
        let value = fieldElement.value;
        if(fieldElement.tagName === "INPUT" && fieldElement.type === "checkbox") {
            value = fieldElement.checked;
        }

        if(this.#listener) this.#listener(fieldName, value);
    }

    /**
     * 
     * @param {[ fieldName: string ]: any} values 
     */
    setValues(values) {
        for(const fieldName in values) {
            const fieldElement = this.#fieldElements[fieldName];
            if(!fieldElement) continue;

            const value = values[fieldName];

            if(fieldElement.tagName === "INPUT" && fieldElement.type === "checkbox") {
                fieldElement.checked = value;
            } else {
                fieldElement.value = value;
            }
        }

        return this;
    }

    /**
     * @param {(fieldName, value) => any} listener 
     * @returns {Form}
     */
    setOnChangeListener(listener) {
        this.#listener = listener;

        return this;
    }
}