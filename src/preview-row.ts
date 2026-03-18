import { _renderTag } from './main';
import type { TagInstance } from './tags';

export function createPreviewRow(instanceId: string, instance: TagInstance[string], removeCallback: () => void, duplicateCallback: () => void): HTMLElement {
    
    const row = document.createElement("div");
    row.className = "tag-preview-row";

    const preview = document.createElement("div");
    preview.className = "tag-preview";

    const previewContent = _renderTag(instance.tag, preview);

    // Collect extra field elements
    const extraFieldElements: HTMLElement[] = [];

    // Make the template outputs editable in the preview
    instance.tag.template.tagOutputs.forEach((selector) => {
        const outputEl = previewContent.querySelector(`#${CSS.escape(selector)}`) as HTMLElement | null;
        if (!outputEl) return;

        // Check if this is an extra field
        const isExtra = instance.tag.values.extras && typeof instance.tag.values.extras === "object" && selector in instance.tag.values.extras;

        if (isExtra) {
            outputEl.classList.add("extra-field");
            extraFieldElements.push(outputEl);
        }

        if (!isExtra) {
            // Main fields are always editable
            outputEl.contentEditable = "true";
            outputEl.classList.add("editable-span");
        } else {
            // Extra fields start non-editable
            outputEl.contentEditable = "false";
        }

        outputEl.addEventListener("input", (event) => {
            const newValue = (event.target as HTMLElement).textContent || "";
            const nextValues = { ...instance.tag.values } as Record<string, any>;

            if (Object.prototype.hasOwnProperty.call(nextValues, selector)) {
                nextValues[selector] = newValue;
            } else if (nextValues.extras && typeof nextValues.extras === "object") {
                nextValues.extras = { ...nextValues.extras, [selector]: newValue };
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

    

    const info = document.createElement("div");
    info.className = "tag-preview-info";
    info.textContent = `${instanceId}`;

    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.value = String(instance.tag.amount);
    amountInput.className = "tag-preview-amount";
    amountInput.min = "1";
    amountInput.addEventListener("input", (event) => {
        const newAmount = parseInt((event.target as HTMLInputElement).value, 10) || 1;
        instance.tag.updateData({
            values: instance.tag.values,
            amount: newAmount,
            template: instance.tag.template
        });
    });

    const editExtrasCheckbox = document.createElement("input");
    editExtrasCheckbox.type = "checkbox";
    editExtrasCheckbox.id = `edit-extras-${instanceId}`;
    editExtrasCheckbox.checked = instance.tag.extraEditable; // Start unchecked

    const editExtrasLabel = document.createElement("label");
    editExtrasLabel.htmlFor = `edit-extras-${instanceId}`;
    editExtrasLabel.textContent = "Editar extras";
    editExtrasLabel.className = "tag-preview-edit-extras-label";

    // Function to toggle extra fields editing
    const toggleExtraEditing = () => {
        instance.tag.extraEditable = editExtrasCheckbox.checked;
        extraFieldElements.forEach((el) => {
            if (editExtrasCheckbox.checked) {
                el.contentEditable = "true";
                el.classList.add("editable-span");
            } else {
                el.contentEditable = "false";
                el.classList.remove("editable-span");
            }
        });
    };

    editExtrasCheckbox.addEventListener("change", toggleExtraEditing);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remover";
    removeBtn.className = "tag-preview-remove";
    removeBtn.addEventListener("click", removeCallback);

    const duplicateBtn = document.createElement("button");
    duplicateBtn.type = "button";
    duplicateBtn.textContent = "Duplicar";
    duplicateBtn.className = "tag-preview-duplicate";
    duplicateBtn.addEventListener("click", duplicateCallback);

    row.appendChild(preview);
    row.appendChild(info);
    row.appendChild(amountInput);
    row.appendChild(editExtrasLabel);
    row.appendChild(editExtrasCheckbox);
    row.appendChild(removeBtn);
    row.appendChild(duplicateBtn);

    return row;
}