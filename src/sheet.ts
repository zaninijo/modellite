
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
    }
}

export const A4: SheetLayout = {
    size: {
        width: 210,
        height: 297
    },
    margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    grid: {
        col: {
            count: 2,
            gap: 3
        },
        row: {
            count: 7,
            gap: 0
        }
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

        this._disabledCells = [];
        this._disabledCells.fill(false, 0, this.totalCells);

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

export const defaultLayout = A4