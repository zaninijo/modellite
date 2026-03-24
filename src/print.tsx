import React from 'react';
import { Tag } from './types';
import type { SheetLayout } from './types';
import TagComponent from './Tag';

export class Sheet {
    private _layout: SheetLayout;
    private _disabledCells: boolean[];
    public modified: boolean;

    constructor(layout: SheetLayout) {
        this._layout = layout;
        this._disabledCells = new Array(this.totalCells).fill(false);
        this.modified = false;
    }

    set disabledCells(cells: boolean[]) {
        if (cells.length !== this.totalCells) {
            throw new Error("Array of enabled/disabled cells must have the same length as the total number of cells in the layout.");
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

    get totalCells() {
        return this._layout.grid.col.count * this._layout.grid.row.count;
    }

    get layout() {
        return this._layout;
    }
}

export const renderTagSheet = (sheet: Sheet, tags: Tag[]) => {
    const { layout, disabledCells, totalCells } = sheet;

    const sheetStyle: React.CSSProperties = {
        width: `${layout.size.width}mm`,
        height: `${layout.size.height}mm`,
        paddingTop: `${layout.margin.top}mm`,
        paddingRight: `${layout.margin.right}mm`,
        paddingBottom: `${layout.margin.bottom}mm`,
        paddingLeft: `${layout.margin.left}mm`,
        display: 'grid',
        gridAutoFlow: layout.grid.flowDirection,
        gridTemplateColumns: `repeat(${layout.grid.col.count}, 1fr)`,
        gridTemplateRows: `repeat(${layout.grid.row.count}, 1fr)`,
        columnGap: `${layout.grid.col.gap}mm`,
        rowGap: `${layout.grid.row.gap}mm`,
        boxSizing: 'border-box',
    };

    const cells = [];
    let tagIndex = 0;

    for (let i = 0; i < totalCells; i++) {
        if (disabledCells[i]) {
            cells.push(<div className="empty-cell" key={`empty-${i}`}></div>);
            continue;
        }

        if (tagIndex < tags.length) {
            const tag = tags[tagIndex];
            cells.push(<TagComponent tag={tag} key={tag.id} />);
            tagIndex++;
        }
    }

    return <div className="sheet" style={sheetStyle}>{cells}</div>;
};
