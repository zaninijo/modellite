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

export async function waitForLazyElements(lazyElements: NodeListOf<Element>): Promise<void> {

  const promises = Array.from(lazyElements).map((el) => {
    if (el.tagName === "IMG") {
      const img = el as HTMLImageElement;
      if (img.complete) return Promise.resolve();

      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }

    return new Promise<void>((resolve) => {
      function check() {
        const rect = el.getBoundingClientRect();

        // considera "renderizado" quando tem tamanho visível
        if (rect.width > 0 && rect.height > 0) {
          return resolve();
        }

        requestAnimationFrame(check);
      }

      check();
    });
  });

  await Promise.all(promises);

  // garante que o browser pintou tudo
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}



