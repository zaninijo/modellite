
export interface PageLayout {
    // Todas as unidades mm (milímetros)
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
    gridLayout: {
        col: {
            count: number;
            gap: number;
        }
        row: {
            count: number;
            gap: number;
        }
    }
    // Índices de células desabilitadas, preenchidas por itens vazios.
    disabledCells: number[]
}

export const A4: PageLayout = {
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
    gridLayout: {
        col: {
            count: 1,
            gap: 0
        },
        row: {
            count: 1,
            gap: 0
        }
    },
    disabledCells: []
}

export const defaultLayout = A4