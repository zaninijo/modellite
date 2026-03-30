import { sheetLayout } from "./main";
import { emptyCellEl, Sheet, type SheetLayout } from "./sheet";
import { getTagCount, getTagList, tagInstances, tagSorting } from "./tags";

export const sheetInstances: Sheet[] = [];

const editorRootEl = document.getElementById("sheet-editor-root");

export function getTotalEnabledCells() {
	return sheetInstances.reduce((sum, sheet) => sum + sheet.totalEnabledCells, 0);
}

function getGlobalCellIndex(sheetIndex: number, cellIndex: number): number {
    const cellCount = sheetInstances.reduce((sum, sheet, index) => {
        if (index >= sheetIndex) return sum;
        return sum + sheet.totalCells;
    }, 0);

    return cellCount + cellIndex;
}

export function flushSheets() {
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


function createEditableSheet(sheetInstance: Sheet): HTMLElement {
    
    const editSheetEl = sheetInstance.element.cloneNode(true) as HTMLElement;
    editSheetEl.classList.add("editable-sheet");

    const sheetIndex = sheetInstances.indexOf(sheetInstance);

    if (sheetIndex === -1) {
        throw new Error("Sheet instance não encontrada na lista de instâncias.");
    }

    for (let cellIndex = 0; cellIndex < sheetInstance.totalCells; cellIndex++) {
        const cellEl = emptyCellEl.cloneNode(true) as HTMLElement;
        cellEl.classList.add("cell-preview");
        const isDisabled = sheetInstance.disabledCells[cellIndex];

        isDisabled && (cellEl.classList.add("disabled-cell"));
        
        cellEl.addEventListener("click", () => {
            const newDisabled = sheetInstance.disabledCells.slice();
            newDisabled[cellIndex] = !isDisabled;
            sheetInstance.disabledCells = newDisabled;
            
            console.log(`Sheet ${sheetIndex}, Cell ${cellIndex} is now ${sheetInstance.disabledCells[cellIndex] ? "disabled" : "enabled"}.`);
            
            updateSheetEditor();
        });

        editSheetEl.appendChild(cellEl);

        if (isDisabled) continue;

        const globalCellIndex = getGlobalCellIndex(sheetIndex, cellIndex,);

        const tagList = getTagList();
        const tagInst = tagInstances[tagList[globalCellIndex]];
        

        if (tagList[globalCellIndex]) {
            cellEl.classList.add("occupied-cell");
            cellEl.style.outlineColor = tagInst.color || "black";
        }
    }

    return editSheetEl
}

export function updateSheetEditor() {

    if (!editorRootEl) throw new Error("O elemento root do editor de sheets não foi encontrado.");
    
    editorRootEl.replaceChildren();
    flushSheets();

    const fillSheet = sheetLayout;
    
    const totalTags = getTagCount();
    const cellsPerSheet = fillSheet.grid.col.count * fillSheet.grid.row.count;

    // Capacidade das sheets editadas.
    const existingCapacity = getTotalEnabledCells();
    const remainingTags = Math.max(0, totalTags - existingCapacity);
    // Quantas páginas serão adicionadas, além das sheets editadas
    const totalAddPages = Math.ceil(remainingTags / cellsPerSheet);

    const sheets: {layout: SheetLayout, element: HTMLElement}[] = [];

    for (let i = 0; i < sheetInstances.length; i++) {
        const sheet = sheetInstances[i];
        const editSheetEl = createEditableSheet(sheet);
        sheets.push({layout: sheet.layout, element: editSheetEl});
    }

    for (let i = 0; i < totalAddPages; i++) {
        const newSheet = new Sheet(fillSheet);
        sheetInstances.push(newSheet);
        const editSheetEl = createEditableSheet(newSheet);
        sheets.push({layout: newSheet.layout, element: editSheetEl});
    }

    sheets.forEach(sheet => {
        editorRootEl.appendChild(sheet.element);

        const baseHeight = sheet.element.getBoundingClientRect().height;

        const editorStyle = window.getComputedStyle(editorRootEl!);
        const editorPad = parseFloat(editorStyle.paddingTop) + parseFloat(editorStyle.paddingBottom);
        const availableHeight = editorRootEl!.clientHeight - editorPad;

        const targetHeight = .98 * availableHeight;
        const elScale = targetHeight / baseHeight;

        Sheet.resizeLayout(sheet.element, sheet.layout, elScale, "px");
    });
}