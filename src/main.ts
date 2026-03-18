import './style.css'
import type { TagConstructor, TagInstance } from './tags';
import { Tag } from './tags';
import v1template from './tags/tagv1';
import { createPreviewRow } from './preview-row';
import { A4, Sheet, type SheetLayout } from './sheet';

// todo depois fazer isso aqui, para salvar o estado da aplicação no localStorage
interface AppStateStorage {
    tags: Tag[];

}

const sheetLayout = A4;
const tagTemplate = v1template;

const sheetInstances: Sheet[] = [];

function getTotalEnabledCells() {
    return sheetInstances.reduce((sum, sheet) => sum + sheet.totalEnabledCells, 0);
}

function flushSheets() {
    sheetInstances.forEach(sheet => {
        // Remove apenas as folhas que não foram modificadas
        !sheet.modified && sheetInstances.splice(sheetInstances.indexOf(sheet), 1); 
    })
}

//
// Lógica de gerenciamento de instâncias de etiquetas
//

const printEl = document.body.appendChild(document.createElement("div"));
printEl.id = "print-layout";
// demais configurações no CSS

const tagPreviewListEl = document.getElementById("tag-preview-list");

let tagCounter = 0;

function claimTagId(name: string) {
    const n = tagCounter.valueOf();
    tagCounter++;
    return `${name}-${n}`;
}

const tagInstances: TagInstance = {};
const tagSort: string[] = [];

function getTagCount() {
    return Object.values(tagInstances).reduce((sum, inst) => sum + inst.tag.amount, 0);
}

function addTagInstance(tagCons: TagConstructor, posIndex?: number): void {
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
        ? tagSort.splice(posIndex, 0, instId)
        : tagSort.push(instId);

    renderTagPreview();
}

function duplicateTagInstance(instanceId: string): void {
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
        tagSort.indexOf(instanceId) + 1
    );
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
    const index = tagSort.indexOf(instanceId);
    tagSort.splice(index, 1);

    renderTagPreview();
}

// Renderiza uma etiqueta em um container específico (padrão: printEl)
export function _renderTag(tag: Tag, target: HTMLElement) {
    const { templateElement } = tag.template;
    const tagEl = templateElement.firstElementChild!.cloneNode(true);

    console.log(`Renderizando etiqueta`);
    console.log(tag.template.templateElement)
    console.log(tag);
    return target.appendChild(tagEl) as HTMLElement;
}

/**
 * Updates para UI e etc.
 */

function renderTagPreview() {
    if (!tagPreviewListEl) return;

    tagPreviewListEl.replaceChildren();

    tagSort.forEach(instanceId => {
        const instance = tagInstances[instanceId];
        const row = createPreviewRow(
            instanceId,
            instance, 
            () => removeTagInstance(instanceId),
            () => duplicateTagInstance(instanceId)
        );
        tagPreviewListEl.appendChild(row);
    });
    console.log(tagInstances)
    console.log(tagSort)
}


// Lógica de impressão e renderização do resultado (folha de etiquetas) 

function flushPrint() {
    printEl.replaceChildren();
}

function printResult(sheetLayout: SheetLayout) {

    flushPrint();
    flushSheets();

    const totalTags = getTagCount();
    const cellsPerSheet = sheetLayout.grid.col.count * sheetLayout.grid.row.count;

    // Páginas estimadas, excluindo as folhas editadas.
    const estimatedPages = Math.ceil(totalTags / (cellsPerSheet - getTotalEnabledCells()));

    // Quantas páginas serão adicionadas, além das folhas editadas
    const totalAddPages = Math.max(0, estimatedPages);

    for (let i = 0; i < totalAddPages; i++) {
        const newSheet = new Sheet(sheetLayout);
        sheetInstances.push(newSheet);
    }

    let remainingTags = Array.from(tagSort.values());

    sheetInstances.forEach(sheet => {


        const tagIds = remainingTags.splice(0, sheet.totalEnabledCells);

        renderTagSheet(sheet, tagIds, sheet.disabledCells);
    })

    window.print();
}

const emptyCellEl = document.createElement("div");
emptyCellEl.classList.add("empty-cell");

function renderTagSheet(sheet: Sheet, tagIds: string[]) {

    const { element: sheetEl, disabledCells, totalCells } = sheet;

    if (totalCells < tagIds.length) {
        throw new Error("Número de etiquetas excede o número de células habilitadas na folha.");
        return;
    }   

    tagIds.forEach((id, index) => {

    });

    printEl.appendChild(sheetEl);
}


const addTagButton = document.getElementById("add-instance-btn");

addTagButton?.addEventListener("click", () => {
    addTagInstance({
        template: tagTemplate,
        amount: 1,
    });
});

