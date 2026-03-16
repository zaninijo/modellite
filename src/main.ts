import './style.css'
import type { TagConstructor, TagInstance } from './tags';
import { Tag } from './tags';
import v1template from './tags/tagv1';
import { createPreviewRow } from './tags/preview-row';

// todo depois fazer isso aqui, para salvar o estado da aplicação no localStorage
interface AppStateStorage {
    tags: Tag[];

}

/**
 * Controle de instâncias de etiqueta
 */

// demais configurações no CSS
const printEl = document.body.appendChild(document.createElement("div"));
printEl.id = "print-layout";

const tagInstanceListEl = document.getElementById("tag-instance-list");

let tagCounter = 0;

function claimTagId(name: string) {
    const n = tagCounter.valueOf();
    tagCounter++;
    return `${name}-${n}`;
}

const tagInstances: TagInstance = {};

function addTagInstance(tagCons: TagConstructor): void {
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
    
    renderTagList();
}

function removeTagInstance(instanceId: string): void {
    const instance = tagInstances[instanceId];
    if (!instance) return;

    const styleId = instance.styleEl?.id;
    // Remove shared stylesheet only if no other instance uses it
    const stillUsed = Object.values(tagInstances).some(
        other => other !== instance && other.styleEl?.id === styleId
    );

    if (!stillUsed && instance.styleEl.parentElement) {
        instance.styleEl.remove();
    }

    delete tagInstances[instanceId];
    renderTagList();
}

/*
 *  Lógica de impressão e renderização do resultado (folha de etiquetas) 
 */
function flushPrint() {
    printEl.replaceChildren();
}

function printResult() {
    renderTagSheet();
    window.print();
}

// Renderiza uma etiqueta em um container específico (padrão: printEl)
function _renderTag(tag: Tag, target: HTMLElement = printEl) {
    const { templateElement } = tag.template;
    const tagEl = templateElement.cloneNode(true);

    target.appendChild(tagEl);
}

function renderTagSheet() {
    flushPrint();
    Object.values(tagInstances).forEach(instance => {
        const tag = instance.tag;

        for (let i = 0; i < tag.amount; i++) {
            _renderTag(tag);
        }
    });
}

/**
 * Updates para UI e etc.
 */

function renderTagList() {
    if (!tagInstanceListEl) return;

    tagInstanceListEl.replaceChildren();

    Object.entries(tagInstances).forEach(([instanceId, instance]) => {
        const row = createPreviewRow(instanceId, instance, () => removeTagInstance(instanceId));
        tagInstanceListEl.appendChild(row);
    });
}

const addtagbtn = document.getElementById("test-button");

addtagbtn?.addEventListener("click", () => {
    addTagInstance({
        template: v1template,
        amount: 3,
    });
    renderTagList();
});
