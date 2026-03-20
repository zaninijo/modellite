
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

        this._element.style.width = `${layout.size.width}mm`;
        this._element.style.height = `${layout.size.height}mm`;
        this._element.style.maxWidth = `${layout.size.width}mm`;
        this._element.style.maxHeight = `${layout.size.height}mm`;
        this._element.style.paddingTop = `${layout.margin.top}mm`;
        this._element.style.paddingRight = `${layout.margin.right}mm`;
        this._element.style.paddingBottom = `${layout.margin.bottom}mm`;
        this._element.style.paddingLeft = `${layout.margin.left}mm`;
        this._element.style.display = "grid";
        this._element.style.gridAutoFlow = `${layout.grid.flowDirection}`;
        this._element.style.gridTemplateColumns = `repeat(${layout.grid.col.count}, 1fr)`;
        this._element.style.gridTemplateRows = `repeat(${layout.grid.row.count}, 1fr)`;
        this._element.style.columnGap = `${layout.grid.col.gap}mm`;
        this._element.style.rowGap = `${layout.grid.row.gap}mm`;
        this._element.style.boxSizing = "border-box";

        this._disabledCells = new Array(this.totalCells).fill(false);

        this.modified = false;
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

export const defaultLayout = A4263