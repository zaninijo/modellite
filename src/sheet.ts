import { renderTag, tagInstances } from "./tags";

/**
 * Representa o layout de uma folha de impressão, incluindo suas dimensões, margens e configuração de grade.
 * Todas as unidades são em milímetros (mm).
 */
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

export function calculateCellSize(sheet: SheetLayout) {
    const colGap = sheet.grid.col.gap * sheet.grid.col.count;
    const rowGap = sheet.grid.row.gap * sheet.grid.row.count;
    const cellWidth = (sheet.size.width - sheet.margin.left - sheet.margin.right - rowGap) / sheet.grid.col.count ;
    const cellHeight = (sheet.size.height - sheet.margin.top - sheet.margin.bottom - colGap) / sheet.grid.row.count;
    return {
        width: cellWidth,
        height: cellHeight
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

/**
 * Classe que representa uma folha de etiquetas, gerenciando seu layout, estado de células (habilitadas/desabilitadas) e o elemento HTML correspondente.
 * Permite configurar quais células serão puladas na impressão, garantindo que a renderização da folha respeite os espaços faltantes na folha de adesivo.
 */
export class Sheet {
    private _layout: SheetLayout;
    private _element: HTMLElement
    private _disabledCells: boolean[];
    public modified: boolean;

    constructor(layout: SheetLayout) {
        this._layout = layout;
        this._element = document.createElement("div");
        this._element.classList.add("sheet");

        Sheet.resizeLayout(this._element, this._layout, 1, "mm");
        this._element.style.boxSizing = "border-box";

        this._disabledCells = new Array(this.totalCells).fill(false);

        this.modified = false;
    }

    static resizeLayout(element: HTMLElement, layout: SheetLayout, scale: number, unit: "mm" | "px") {
        const pxPerMm = 3.78;

        if (unit === "px") {
            const effectiveScale = scale * pxPerMm;
            element.style.width = `${layout.size.width * effectiveScale}px`;
            element.style.height = `${layout.size.height * effectiveScale}px`;
            element.style.maxWidth = `${layout.size.width * effectiveScale}px`;
            element.style.maxHeight = `${layout.size.height * effectiveScale}px`;

            element.style.paddingTop = `${layout.margin.top * effectiveScale}px`;
            element.style.paddingRight = `${layout.margin.right * effectiveScale}px`;
            element.style.paddingBottom = `${layout.margin.bottom * effectiveScale}px`;
            element.style.paddingLeft = `${layout.margin.left * effectiveScale}px`;

            element.style.columnGap = `${layout.grid.col.gap * effectiveScale}px`;
            element.style.rowGap = `${layout.grid.row.gap * effectiveScale}px`;
        } else {
            element.style.width = `${layout.size.width * scale}mm`;
            element.style.height = `${layout.size.height * scale}mm`;
            element.style.maxWidth = `${layout.size.width * scale}mm`;
            element.style.maxHeight = `${layout.size.height * scale}mm`;

            element.style.paddingTop = `${layout.margin.top * scale}mm`;
            element.style.paddingRight = `${layout.margin.right * scale}mm`;
            element.style.paddingBottom = `${layout.margin.bottom * scale}mm`;
            element.style.paddingLeft = `${layout.margin.left * scale}mm`;

            element.style.columnGap = `${layout.grid.col.gap}mm`;
            element.style.rowGap = `${layout.grid.row.gap}mm`;
        }

        element.style.display = "grid";
        element.style.gridAutoFlow = `${layout.grid.flowDirection}`;
        element.style.gridTemplateColumns = `repeat(${layout.grid.col.count}, 1fr)`;
        element.style.gridTemplateRows = `repeat(${layout.grid.row.count}, 1fr)`;
    }

    set disabledCells(cells: boolean[]) {
        if (cells.length !== this.totalCells) {
            throw new Error("Array de células habilitadas/desabilitadas deve ter o mesmo comprimento que o número total de células do layout.");
        }
        this._disabledCells = cells;
        this.modified = true;
    }

    get disabledCells() {
        return this._disabledCells;
    }

    get totalEnabledCells() {
        return this._disabledCells.filter(disabled => !disabled).length;
    }

    get totalDisabledCells() {
        return this._disabledCells.filter(disabled => disabled).length;
    }

    get totalCells() {
        return this._layout.grid.col.count * this._layout.grid.row.count;
    }

    get element() {
        return this._element;
    }

    get layout() {
        return this._layout;
    }
};

export const emptyCellEl = document.createElement("div");
emptyCellEl.classList.add("cell");

export function renderTagSheet(sheet: Sheet, tagIds: string[], target: HTMLElement) {

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

		const tagId = tagIds.shift()!;

		const tagInst = tagInstances[tagId];
		renderTag(tagInst.tag, sheetEl);
		
		if (tagIds[0] === undefined) break;
	}
}

export const defaultLayout = A4263