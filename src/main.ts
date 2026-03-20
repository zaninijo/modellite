import './style.css'
import type { TagConstructor, TagInstance as TagInstances } from './tags';
import { Tag } from './tags';
import v1TagTemplate from './tags/tagv1';
import { createPreviewRow } from './preview-tag';
import { A4263, Sheet, type SheetLayout } from './sheet';
import { waitForLazyElements } from './utils';

// todo depois fazer isso aqui, para salvar o estado da aplicação no localStorage
interface AppStateStorage {
	tagInstances: TagInstances;
	tagSorting: string[];
	sheetInstances: Sheet[];
}

const sheetLayout = A4263;
const tagTemplate = v1TagTemplate;

const sheetInstances: Sheet[] = [];

function getTotalEnabledCells() {
	return sheetInstances.reduce((sum, sheet) => sum + sheet.totalEnabledCells, 0);
}

function flushSheets() {
	sheetInstances.forEach(sheet => {
		if (!sheet.modified) {
			sheet.element.remove();
		} else {
			sheet.element.replaceChildren();
		}
	});

	for (let i = sheetInstances.length - 1; i >= 0; i--) {
		if (!sheetInstances[i].modified) {
			sheetInstances.splice(i, 1);
		}
	}
}

//
// Lógica de gerenciamento de instâncias de etiquetas
//

const printEl = document.body.appendChild(document.createElement("div"));
printEl.id = "print-area";
// demais configurações no CSS

const tagPreviewListEl = document.getElementById("tag-preview-list");

let tagCounter = 0;

function claimTagId(name: string) {
	const n = tagCounter.valueOf();
	tagCounter++;
	return `${name}-${n}`;

}

const tagInstances: TagInstances = {};
const tagSorting: string[] = [];

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
		? tagSorting.splice(posIndex, 0, instId)
		: tagSorting.push(instId)
	;
	
	distributeColors();
	renderTagPreview();
}


function distributeColors() {
	const colors: string[] = [];
	const amount = tagSorting.length;

	for (let i = 0; i < amount; i++) {
		const hue = Math.round((360 / amount) * i);
		const saturation = 80;
		const lightness = 50;

		colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
	}

	tagSorting.forEach((id, i) => {
		tagInstances[id].color = colors[i];
	});
}

function getTagCount() {
	return Object.values(tagInstances).reduce((sum, inst) => sum + inst.tag.amount, 0);
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
		tagSorting.indexOf(instanceId) + 1
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
	const index = tagSorting.indexOf(instanceId);
	tagSorting.splice(index, 1);

	renderTagPreview();
}

// Renderiza uma etiqueta em um container específico (padrão: printEl)
export function renderTag(tag: Tag, target: HTMLElement) {
	const { templateElement } = tag.template;
	const tagEl = templateElement.firstElementChild!.cloneNode(true) as HTMLElement;

	return target.appendChild(tagEl) ;
}

/**
 * Updates para UI e etc.
 */

function renderTagPreview() {
	if (!tagPreviewListEl) return;

	tagPreviewListEl.replaceChildren();

	tagSorting.forEach(instanceId => {
		const instance = tagInstances[instanceId];
		const row = createPreviewRow(
			instanceId,
			instance,
			() => removeTagInstance(instanceId),
			() => duplicateTagInstance(instanceId)
		);
		tagPreviewListEl.appendChild(row);
	});
}


// Lógica de impressão e renderização do resultado (folha de etiquetas)

function flushPrint() {
	printEl.replaceChildren();
}

/**
 * Imprime os adesivos em um layout de folha específico.
 * @param fillSheet Layout de folha utilizado para criar folhas caso seja necessário preencher mais etiquetas do que as folhas editadas permitem.
 * @param target Elemento alvo para renderizar o resultado da impressão.
 */
async function printResult(fillSheet: SheetLayout, target: HTMLElement = printEl) {

	// O gerenciamento de folhas incluído na função é temporário.
	// Vou implementar uma interface de gerenciamento de folhas para o usuário depois.

	flushPrint();
	flushSheets();

	const sheetTeste = new Sheet(A4263)
	sheetTeste.disabledCells[0] = false;
	sheetTeste.disabledCells[1] = false;
	sheetTeste.disabledCells[2] = false;
	sheetTeste.disabledCells[3] = false;
	sheetTeste.disabledCells[4] = false;
	sheetTeste.disabledCells[5] = false;
	sheetTeste.disabledCells[6] = false;
	sheetTeste.disabledCells[7] = false;
	sheetTeste.disabledCells[8] = false;
	sheetTeste.disabledCells[9] = false;
	sheetTeste.disabledCells[10] = false;
	sheetTeste.disabledCells[11] = false;
	sheetTeste.disabledCells[12] = false;
	sheetInstances.push(sheetTeste);

	const totalTags = getTagCount();
	const cellsPerSheet = fillSheet.grid.col.count * fillSheet.grid.row.count;

	// Capacidade das sheets editadas.
	const existingCapacity = getTotalEnabledCells();
	const remainingTags = Math.max(0, totalTags - existingCapacity);
	// Quantas páginas serão adicionadas, além das sheets editadas
	const totalAddPages = Math.ceil(remainingTags / cellsPerSheet);
	
	for (let i = 0; i < totalAddPages; i++) {
		const newSheet = new Sheet(fillSheet);
		sheetInstances.push(newSheet);
	}

	const tagsToRender: string[] = tagSorting.reduce((arr, id) => {
		const amount = tagInstances[id].tag.amount
	
		for (let i = 0; i < amount; i++) {
			arr.push(id)
		}
	
		return arr
	}, [] as string[])

	sheetInstances.forEach(sheet => {
		const enabledCells = sheet.totalEnabledCells
		const tagsToPrint = tagsToRender.splice(0, enabledCells);

		renderTagSheet(sheet, tagsToPrint, target);
	})

	// Esperar até a renderização ser concluída para evitar problemas de layout na impressão
	const lazyElements = target.querySelectorAll("img, .lazy-render");
	await waitForLazyElements(lazyElements);
	window.print();
}

const emptyCellEl = document.createElement("div");
emptyCellEl.classList.add("empty-cell");

function renderTagSheet(sheet: Sheet, tagIds: string[], target: HTMLElement = printEl) {

	const { element: sheetEl, disabledCells, totalEnabledCells, totalCells } = sheet;

	if (totalEnabledCells < tagIds.length) {
		throw new Error("Número de etiquetas excede o número de células habilitadas na folha.");
	}

	if (tagIds.length <= 0) {
		throw new Error("Número de etiquetas não pode ser igual ou menor que zero.")
	}
	
	target.appendChild(sheetEl);
	
	for (let i = 0; i < totalCells; i++) {
		if (disabledCells[i]) {
			sheetEl.appendChild(emptyCellEl.cloneNode(true));
			continue
		}

		const tagId = tagIds.shift()!

		const tagInst = tagInstances[tagId];
		renderTag(tagInst.tag, sheetEl);
		
		if (tagIds[0] === undefined) break;
	}
}


const addTagButton = document.getElementById("add-instance-btn");

addTagButton?.addEventListener("click", () => {
	addTagInstance({
		template: tagTemplate,
		amount: 1,
	});
});

const printButton = document.getElementById("print-btn");

printButton?.addEventListener("click", () => {
	printResult(sheetLayout);
});

addTagInstance({template: v1TagTemplate, amount: 1})
