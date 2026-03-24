import './style.css'
import type { TagInstances } from './tags';
import { addTagInstance, duplicateTagInstance, getTagCount, removeTagInstance, tagInstances, tagSorting } from './tags';
import v1TagTemplate from './tags-models/tagv1';
import { updateTagEditor } from './tag-editor';
import { A4263, flushSheets, getTotalEnabledCells, renderTagSheet, Sheet, sheetInstances, type SheetLayout } from './sheet';
import { waitForLazyElements } from './utils';

// todo depois fazer isso aqui, para salvar o estado da aplicação no localStorage
interface AppStateStorage {
	tagInstances: TagInstances;
	tagSorting: string[];
	sheetInstances: Sheet[];
}

export const sheetLayout = A4263;
export const tagTemplate = v1TagTemplate;


const printEl = document.body.appendChild(document.createElement("div"));
printEl.id = "print-area";
// demais configurações no CSS

const tagPreviewListEl = document.getElementById("tag-preview-list");

/**
 * Updates para UI e etc.
 */


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

const addTagButton = document.getElementById("add-instance-btn");

addTagButton?.addEventListener("click", () => {
	addTagInstance({
		template: tagTemplate,
		amount: 1,
	});
    updateTagEditor();
});

const printButton = document.getElementById("print-btn");

printButton?.addEventListener("click", () => {
	printResult(sheetLayout);
});


addTagInstance({template: v1TagTemplate, amount: 1})
updateTagEditor();
