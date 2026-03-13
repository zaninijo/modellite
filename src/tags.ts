
export interface TagTemplate {
    templateName: string;
    templateElement: DocumentFragment;
    tagOutputs: {[selector: string]: HTMLElement};
    defaultValues: TagValuesBase;
}

export interface TagValuesBase {
    [entry: string]: string|{[extraEntry: string]: string}
}

interface TagData {
    template: TagTemplate;
    values: TagValuesBase;

}

class Tag {
    private values;
    
    private template;
    constructor(data: TagData) {
        const {values, amount, page, template} = data;
        this.values = values || {};
        this.amount = amount;
        this.page = page;
        this.template = template;
    }

    public update(updatedData: TagData) {
        // Resetar os valores caso o template mude.
        if (this.template !== updatedData.template) {
            this.update(

            )
        }
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
