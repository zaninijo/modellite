import { sheetLayout } from './main';
import { calculateCellSize } from './sheet';
import { duplicateTagInstance, removeTagInstance, renderTag, tagInstances, tagSorting } from './tags';
import { createTemplate } from './utils';
import deleteIcon from './icons/delete-icon.svg'

const rootEl = document.getElementById("tag-editor-root")!;

const editorRowHtml = /*html*/`
    <div class="editable-tag-row">
        <div class="dragable-area"></div>
        <div class="editable-tag-container"></div>
        <div>
            <div>
                <span id="tag-id"></span>
                <div id="color-id"></div>
            </div>
            <div class="editor-controls-container">
                <div>
                    <label for="amount-input">Quantidade:</label>
                    <input type="number" id="amount-input" min=1>
                </div>
                <div>
                    <input type="checkbox" id="edit-extras">
                    <label for="edit-extras">Editar Extras</label>
                </div>
                <div>
                    <button id="clone-btn">Duplicar</button>
                    <button id="remove-btn"></button>
                </div>
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
    colorIdEl.style.backgroundColor = instance.color || "transparent";

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
        instance.tag.amount = parseInt(amountInput.value) || 0;
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

    return rowEl;
}

export function updateTagEditor() {    
    const editableTagList = document.getElementById("editable-tag-list")!;
    
    editableTagList.replaceChildren();
    
    tagSorting.forEach(instanceId => {
        const editorRow = createTagEditorRow(
            instanceId,
            () => {removeTagInstance(instanceId); updateTagEditor()},
            () => {duplicateTagInstance(instanceId); updateTagEditor()}
        );
        editableTagList.appendChild(editorRow);
    });
}