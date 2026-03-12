import './style.css'
import tagRaw from "./tag.html?raw";

interface TagEntriesV1 {
    "name": string;
    "quantity": string;
    "size": string;
    "color": string;
    "man-date": Date;
    "extras": {
        "apply-temp": string
        "ink-type": string
        "exp-span": string
    }
}
const tagDataLabel: {[K in keyof TagEntriesV1]: string} = {
    "name": "Nome",
    "quantity": "Quantidade",
    "color": "Cor",
    "size": "Tamanho",
    "man-date": "Data de Fabricação",
    "extras": "Outras opções"
}

const extraTagDataLabels: {[K in keyof TagEntriesV1["extras"]]: string} = {
    "apply-temp": "Temperatura de aplicação",
    "ink-type": "Tipo da tinta",
    "exp-span": "Validade"
}

const pageEl = document.body.appendChild(document.createElement("div"));
pageEl.id = "page";

function stringToFrag(str: string) {
    const template = document.createElement("template");
    template.innerHTML = str.trim();
    return template.content;
} 

function insertTag(template: DocumentFragment, tagData: TagEntriesV1): HTMLElement {
    if (!template.firstElementChild) {
        throw new Error("O template de etiqueta não é válido.");
    }
    const tagNode = template.firstElementChild.cloneNode(true);
    const tagEl = pageEl.appendChild(tagNode) as HTMLDivElement;


    
    return tagEl

}

const tagFrag = stringToFrag(tagRaw);
