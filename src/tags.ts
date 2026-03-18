import { flattenObject } from "./utils";

export interface TagTemplate {
    templateName: string;
    templateElement: DocumentFragment;
    templateStyle: string;
    tagOutputs: string[];
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
    extraEditable?: boolean;
}

export class Tag {
    public values: TagValuesBase;
    public amount;
    public template;
    public extraEditable: boolean;

    constructor(data: TagConstructor) {
        const {values, amount, template} = data;
        this.values = values || template.defaultValues;
        this.amount = amount ?? 0;
        this.extraEditable = data.extraEditable ?? false;
        // Clona o template para garantir que cada instância tenha seu próprio DOM
        this.template = {
            ...template,
            templateElement: template.templateElement.cloneNode(true) as DocumentFragment
        };

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
            );
            return;
        }
        this.values = updatedData.values;
        this.amount = updatedData.amount;
        
        if (!this.template.templateElement.firstElementChild) {
            throw new Error(`Erro ao atualizar etiqueta: O template "${this.template.templateName}" não possui um elemento raiz.`);
        }

        // adicionar dados ao template
        
        const flattenedValues = flattenObject(this.values);
        console.log(flattenedValues)
        Object.entries(flattenedValues).forEach(([key, value]) => {
            const tagOutput = this.template.templateElement.getElementById(key)!;
            console.log(key)
            const el = tagOutput;
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
