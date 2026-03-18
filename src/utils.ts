type AnyObject = Record<string, any>;

export function flattenObject(obj: AnyObject, result: AnyObject = {}): AnyObject {
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenObject(value, result);
    } else {
      const key = Object.keys(obj).find(k => obj[k] === value);
      if (key) result[key] = value;
    }
  }

  return result;
}

export function createTemplate(str: string) {
    const template = document.createElement("template");
    template.innerHTML = str.trim();

    if (!template.content.firstElementChild) {
        throw new Error("Erro ao criar etiqueta: Elemento de etiqueta não foi encontrado.");
    }
    return template.content;
} 