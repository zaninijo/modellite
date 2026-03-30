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
        Object.entries(flattenedValues).forEach(([key, value]) => {
            const tagOutput = this.template.templateElement.getElementById(key)!;
            const el = tagOutput;
            el.textContent = value;
        });
    }
}

export interface TagInstances {
    [id: string]: {
        tag: Tag;
        styleEl: HTMLStyleElement;
        color?: string
    }
}

let tagCounter = 0;

function claimTagId(name: string) {
    const n = tagCounter.valueOf();
    tagCounter++;
    return `${name}-${n}`;

}

export const tagInstances: TagInstances = {};
export const tagSorting: string[] = [];

export function getTagList() {
    return tagSorting.reduce((arr, id) => {
		const amount = tagInstances[id].tag.amount
	
		for (let i = 0; i < amount; i++) {
			arr.push(id)
		}
	
		return arr
	}, [] as string[])
}

export function addTagInstance(tagCons: TagConstructor, posIndex?: number): void {
    const { template } = tagCons;
    const { templateName } = template;

    let styleEl = document.getElementById(templateName) as HTMLStyleElement;

    const normalizedName = templateName.trim().normalize();

    if (styleEl === null) {
        styleEl = document.createElement("style");
        styleEl.textContent = template.templateStyle;
        document.body.prepend(styleEl);
        styleEl.id = normalizedName;
    }

    const instId = claimTagId(normalizedName);

    tagInstances[instId] = {
        tag: new Tag(tagCons),
        styleEl
    }

    posIndex !== undefined
        ? tagSorting.splice(posIndex, 0, instId)
        : tagSorting.push(instId)
    ;
}


export function distributeColors() {
    const colors: string[] = [];
    const amount = tagSorting.length;

    for (let i = 0; i < amount; i++) {
        const hue = Math.round((360 / amount) * i);
        const saturation = 95;
        const lightness = 70;

        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    tagSorting.forEach((id, i) => {
        tagInstances[id].color = colors[i];
    });
}

export function getTagCount() {
    return Object.values(tagInstances).reduce((sum, inst) => sum + inst.tag.amount, 0);
}

export function duplicateTagInstance(instanceId: string): void {
    const instance = tagInstances[instanceId];
    if (!instance) return;
    const { tag } = instance;

    addTagInstance(
        {
            template: tag.template,
            amount: tag.amount,
            values: tag.values,
            extraEditable: tag.extraEditable
        },
        tagSorting.indexOf(instanceId) + 1
    );
}


export function removeTagInstance(instanceId: string): void {
    const instance = tagInstances[instanceId];
    if (!instance) return;

    if (tagSorting.length === 1) {
        return;
    }

    const styleId = instance.styleEl?.id;
    // Remove shared stylesheet only if no other instance uses it
    const stillUsed = Object.values(tagInstances).some(
        other => other !== instance && other.styleEl?.id === styleId
    );

    if (!stillUsed && instance.styleEl.parentElement) {
        instance.styleEl.remove();
    }

    delete tagInstances[instanceId];
    const index = tagSorting.indexOf(instanceId);
    tagSorting.splice(index, 1);
}

// Renderiza uma etiqueta em um container específico (padrão: printEl)
export function renderTag(tag: Tag, target: HTMLElement) {
    const { templateElement } = tag.template;
    const tagEl = templateElement.firstElementChild!.cloneNode(true) as HTMLElement;

    return target.appendChild(tagEl) ;
}
