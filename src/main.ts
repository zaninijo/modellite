import './style.css'
import tagRaw from "./tag.html?raw";
import type { TagValuesBase } from './tags';



const pageEl = document.body.appendChild(document.createElement("div"));
pageEl.id = "page";



function insertTag(template: DocumentFragment, tagData: TagValuesBase): HTMLElement {
    if (!template.firstElementChild) {
        throw new Error("O template de etiqueta não é válido.");
    }
    const tagNode = template.firstElementChild.cloneNode(true);
    const tagEl = pageEl.appendChild(tagNode) as HTMLDivElement;


    
    return tagEl

}

const tagFrag = stringToFrag(tagRaw);
