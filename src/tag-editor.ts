import { sheetLayout } from './main';
import { calculateCellSize } from './sheet';
import { distributeColors, duplicateTagInstance, removeTagInstance, renderTag, tagInstances, tagSorting } from './tags';
import { createTemplate } from './utils';
import deleteIcon from './icons/delete-icon.svg'
import { updateSheetEditor } from './sheet-manager';

const tagEditRootEl = document.getElementById("tag-editor-root")!;
export const editableTagList = document.getElementById("editable-tag-list")!;


const editorRowHtml = /*html*/`
    <div class="editable-tag-row">
        <div class="dragable-area"></div>
        <div class="editable-tag-container"></div>
        <div class="editor-controls-container">
            <div>
                <span id="tag-id" ></span>
                <div id="color-id"></div>
            </div>
            <div style="flex-grow: 1;"></div>
            <div>
                <label for="amount-input">Quantidade:</label>
                <input type="number" id="amount-input" min=1 max=99 maxlength=2>
            </div>
            <div>
                <label for="edit-extras">Editar Extras:</label>
                <input type="checkbox" id="edit-extras">
            </div>
            <div>
                <button id="clone-btn">Duplicar</button>
                <button id="remove-btn"></button>
            </div>
            
        </div>
    </div>
`;

const rowTemplate = createTemplate(editorRowHtml);

export function createTagEditorRow(
    instanceId: string,
    removeCallback: () => void,
    duplicateCallback: () => void
): HTMLElement {
    const instance = tagInstances[instanceId];
    const { tagOutputs } = instance.tag.template
    
    if (rowTemplate.firstElementChild === null) {
        throw new Error("O template de edição de etiqueta não tem um elemento raiz.");
    }

    const rowEl = rowTemplate.firstElementChild.cloneNode(true)! as HTMLElement;

    const tagIdEl = rowEl.querySelector("#tag-id") as HTMLSpanElement;
    tagIdEl.textContent = instanceId;

    const colorIdEl = rowEl.querySelector("#color-id") as HTMLElement;
    colorIdEl.style.backgroundColor = "transparent";
    
    // transição de cores pra ficar swag
    setTimeout(() => {
        colorIdEl.style.backgroundColor = instance.color || "transparent";
        previewArea.style.borderColor = instance.color || "transparent";
    }, 10);


    const previewArea = rowEl.querySelector(".editable-tag-container") as HTMLElement;
    const previewContent = renderTag(instance.tag, previewArea);

    const extraFieldElements: HTMLElement[] = [];

    tagOutputs.forEach((selector) => {
        const outputEl = previewContent.querySelector(`#${CSS.escape(selector)}`) as HTMLElement | null;
        if (!outputEl) return;

        const isExtra = instance.tag.values.extras && 
                        typeof instance.tag.values.extras === "object" && 
                        selector in instance.tag.values.extras;

        if (isExtra) {
            outputEl.classList.add("extra-field");
            extraFieldElements.push(outputEl);
            outputEl.contentEditable = String(instance.tag.extraEditable);
            if (instance.tag.extraEditable) outputEl.classList.add("editable-span");
        } else {
            outputEl.contentEditable = "true";
            outputEl.classList.add("editable-span");
        }

        outputEl.addEventListener("input", (event) => {
            const newValue = (event.target as HTMLElement).textContent || "";
            const nextValues = JSON.parse(JSON.stringify(instance.tag.values));

            if (isExtra) {
                nextValues.extras[selector] = newValue;
            } else {
                nextValues[selector] = newValue;
            }

            instance.tag.updateData({
                values: nextValues,
                amount: instance.tag.amount,
                template: instance.tag.template
            });
        });
    });

    const amountInput = rowEl.querySelector("#amount-input") as HTMLInputElement;
    amountInput.value = String(instance.tag.amount);
    amountInput.addEventListener("input", () => {
        const amount = Math.max(1, Math.min(99, parseInt(amountInput.value) || 0));
        instance.tag.amount = amount;
        amountInput.value = amount.toString();
        updateSheetEditor();
    });

    const editExtrasCheckbox = rowEl.querySelector("#edit-extras") as HTMLInputElement;
    editExtrasCheckbox.checked = instance.tag.extraEditable;

    const cloneButton = rowEl.querySelector("#clone-btn") as HTMLButtonElement;
    cloneButton.addEventListener("click", duplicateCallback);

    const deleteButton = rowEl.querySelector("#remove-btn") as HTMLButtonElement;
    deleteButton.addEventListener("click", removeCallback);

    const _deleteIcon = document.createElement("img");
    _deleteIcon.src = deleteIcon;
    deleteButton.appendChild(_deleteIcon);

    const dragArea = rowEl.querySelector(".dragable-area") as HTMLElement;
    dragArea.addEventListener("pointerdown", (downEvent) => {
        downEvent.preventDefault();
        dragArea.setPointerCapture(downEvent.pointerId);
        
                const startIndex = tagSorting.indexOf(instanceId);
        let newIndex = startIndex;
        
        const initialScrollTop = editableTagList.scrollTop;
        const initialPointerY = downEvent.clientY;
        let currentPointerY = initialPointerY;

        // Medir elementos uma única vez no início evita reflows (layout thrashing) no evento de movimento
        const siblings = Array.from(editableTagList.children) as HTMLElement[];
        const siblingsData = siblings.map(el => {
            const rect = el.getBoundingClientRect();
            return {
                el,
                height: rect.height,
                // Centraliza as medidas no espaço absoluto "dentro" do conteúdo do scroll
                center: rect.top + rect.height / 2 + editableTagList.scrollTop
            };
        });
        
        const draggedHeight = siblingsData[startIndex].height;
        const initialCenter = siblingsData[startIndex].center;

        // Estilos para destacar e elevar o item arrastado
        rowEl.style.filter = "brightness(1.05) drop-shadow(0 4px 6px rgba(0,0,0,0.1))";
        rowEl.style.position = "relative";
        rowEl.style.zIndex = "100";
        // Previne transição no próprio elemento pra ele seguir o mouse instantaneamente
        rowEl.style.transition = "none"; 

        const updateDrag = () => {
            const currentScrollTop = editableTagList.scrollTop;
            
            // Distância física do mouse + o quanto a lista "rolou" a partir do clique
            const distanceTraveled = (currentPointerY - initialPointerY) + (currentScrollTop - initialScrollTop);
            
            rowEl.style.transform = `translateY(${distanceTraveled}px)`;

            // O centro absoluto atual do elemento sendo arrastado dentro do container
            const dragCenter = initialCenter + distanceTraveled;
            let calculatedIndex = newIndex;

            // Busca iterativa apenas nos elementos próximos (range optimization)
            // Checa se o centro do elemento arrastado passou do centro do vizinho de cima
            while (calculatedIndex > 0 && dragCenter < siblingsData[calculatedIndex - 1].center) {
                calculatedIndex--;
            }
            // Checa se passou do centro do vizinho de baixo
            while (calculatedIndex < siblingsData.length - 1 && dragCenter > siblingsData[calculatedIndex + 1].center) {
                calculatedIndex++;
            }

            // Se o índice de inserção (o espaço vazio) mudou, aplicamos os transforms nos irmãos
            if (calculatedIndex !== newIndex) {
                newIndex = calculatedIndex;

                siblingsData.forEach((sibling, i) => {
                    if (i === startIndex) return;

                    let translateY = 0;
                    // Se o item estava abaixo da origem e agora está acima do novo índice (foi empurrado pra cima)
                    if (i > startIndex && i <= newIndex) {
                        translateY = -draggedHeight;
                    } 
                    // Se o item estava acima da origem e agora está abaixo do novo índice (foi empurrado pra baixo)
                    else if (i < startIndex && i >= newIndex) {
                        translateY = draggedHeight;
                    }

                    sibling.el.style.transform = `translateY(${translateY}px)`;
                    sibling.el.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)';
                });
            }
        };

        const onPointerMove = (moveEvent: PointerEvent) => {
            currentPointerY = moveEvent.clientY;
            updateDrag();
        };

        // Se o usuário apenas girar a roda do mouse/scroll sem mover o mouse em si
        const onScroll = () => {
            updateDrag();
        };

        const onPointerUp = (upEvent: PointerEvent) => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", onPointerUp);
            editableTagList.removeEventListener("scroll", onScroll);
            dragArea.releasePointerCapture(downEvent.pointerId);

            // Atualiza o estado da lista no app e re-renderiza se algo mudou de lugar
            if (newIndex !== startIndex) {
                const movedId = tagSorting.splice(startIndex, 1)[0];
                tagSorting.splice(newIndex, 0, movedId);
            }

            updateTagEditor();
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
        editableTagList.addEventListener("scroll", onScroll);
    });

    return rowEl;
}


export function updateTagEditor() {        
    editableTagList.replaceChildren();
    
    tagSorting.forEach(instanceId => {
        const editorRow = createTagEditorRow(
            instanceId,
            () => {removeTagInstance(instanceId); updateTagEditor()},   
            () => {
                duplicateTagInstance(instanceId);
                updateTagEditor();
                scrollToIndex(tagSorting.indexOf(instanceId));
            }
        );
        editableTagList.appendChild(editorRow);
    });
    distributeColors();
    updateSheetEditor();
}

export function scrollToIndex(tagIndex: number) {
    editableTagList.children[tagIndex].scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}