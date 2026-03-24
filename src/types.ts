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

export interface TagConstructor extends Partial<TagData> {
    template: TagTemplate;
    extraEditable?: boolean;
}

export class Tag {
    public values: TagValues_V1;
    public amount;
    public template;
    public extraEditable: boolean;
    public id: string;

    constructor(data: TagConstructor, id: string) {
        const {values, amount, template} = data;
        this.values = (values || template.defaultValues) as TagValues_V1;
        this.amount = amount ?? 0;
        this.extraEditable = data.extraEditable ?? false;
        this.template = {
            ...template,
            templateElement: template.templateElement.cloneNode(true) as DocumentFragment
        };
        this.id = id;
    }
}

export interface TagValues_V1 extends TagValuesBase {
    "name": string;
    "quantity": string;
    "size": string;
    "color": string;
    "man-date": string;
    "extras": {
      "apply-temp": string
      "ink-type": string
      "exp-span": string
    }
  }

export interface TagData { 
    template: TagTemplate;
    values: TagValuesBase;
    amount: number;
}

export interface SheetLayout {
    size: {
        width: number;
        height: number;
    };
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }
    grid: {
        col: {
            count: number;
            gap: number;
        }
        row: {
            count: number;
            gap: number;
        }
        flowDirection: "column"|"row";
    }
}

export const A4263: SheetLayout = {
    size: {
        width: 210,
        height: 297
    },
    margin: {
        top: 15.15,
        right: 5,
        bottom: 15.15,
        left: 5
    },
    grid: {
        col: {
            count: 2,
            gap: 2
        },
        row: {
            count: 7,
            gap: 0
        },
        flowDirection: "column"
    },
}
