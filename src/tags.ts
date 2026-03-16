import { flattenObject } from "./utils";

export interface TagTemplate {
    templateName: string;
    templateElement: DocumentFragment;
    templateStyle: string;
    tagOutputs: {[selector: string]: HTMLElement};
    defaultValues: TagValuesBase;
}

export interface TagValuesBase {
    [entry: string]: string | {[extraEntry: string]: string}
}

interface TagData { 
    template: TagTemplate;
    values: TagValuesBase;
    amount: number;
}

export interface TagConstructor extends Partial<TagData> {
    template: TagTemplate;
}

export class Tag {
    public values: TagValuesBase;
    public amount;
    public template;

    constructor(data: TagConstructor) {
        const {values, amount, template} = data;
        this.values = values || template.defaultValues;
        this.amount = amount ?? 0;
        this.template = template;

        this.updateData({
            values: this.values,
            amount: this.amount,
            template: this.template
        });
    }
    
    public updateData(updatedData: TagData) {

        // TODO: ao invés disso, mergir os valores
        if (this.template !== updatedData.template) {
            this.updateData(
                {
                    values: updatedData.template.defaultValues,
                    amount: this.amount,
                    template: updatedData.template
                }
            )        
        }
        this.values = updatedData.values;
        this.amount = updatedData.amount;
        
        // adicionar dados ao template
        Object.entries(flattenObject(this.values)).forEach(([key, value]) => {
            const el = this.template.tagOutputs[key];
            el.textContent = value;
        });
    }
}

export interface TagInstance {
    [id: string]: {
        tag: Tag;
        styleEl: HTMLStyleElement;
    }
}

export function createTemplate(str: string) {
    const template = document.createElement("template");
    template.innerHTML = str.trim();

    if (!template.content.firstElementChild) {
        throw new Error("Erro ao criar etiqueta: Elemento de etiqueta não foi encontrado.");
    }
    return template.content;
} 
