import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Tag, A4263 } from './types';
import { Sheet, renderTagSheet } from './print';

interface PrintButtonProps {
    tags: Tag[];
}

const PrintButton: React.FC<PrintButtonProps> = ({ tags }) => {
    const [isPrinting, setIsPrinting] = useState(false);
    const printRootRef = useRef<HTMLDivElement | null>(null);

    if (!printRootRef.current) {
        printRootRef.current = document.createElement('div');
        printRootRef.current.id = 'print-root';
        document.body.appendChild(printRootRef.current);
    }

    const handlePrint = () => {
        setIsPrinting(true);
    };

    useEffect(() => {
        if (isPrinting) {
            const printContent = getPrintContent();
            const printRoot = printRootRef.current;

            if (printRoot) {
                const root = createRoot(printRoot);
                flushSync(() => {
                    root.render(printContent);
                });
                window.print();
                setIsPrinting(false);
                root.unmount();
            }
        }
    }, [isPrinting]);

    const getPrintContent = () => {
        const tagsToRender: Tag[] = tags.reduce((acc, tag) => {
            for (let i = 0; i < tag.amount; i++) {
                acc.push(tag);
            }
            return acc;
        }, [] as Tag[]);

        const cellsPerSheet = A4263.grid.col.count * A4263.grid.row.count;
        const sheets = [];
        let remainingTags = [...tagsToRender];

        while (remainingTags.length > 0) {
            const sheetTags = remainingTags.splice(0, cellsPerSheet);
            const sheet = new Sheet(A4263);
            sheets.push(renderTagSheet(sheet, sheetTags));
        }

        return <div>{sheets}</div>;
    };

    return (
        <>
            <button onClick={handlePrint} disabled={isPrinting}>
                {isPrinting ? 'Printing...' : 'Print'}
            </button>
        </>
    );
};

export default PrintButton;
