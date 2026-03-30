import { createTemplate } from "../utils";
import type { TagValuesBase, TagTemplate } from "../tags";

const TEMPLATE_NAME = "etiqueta base água"
const CLASS_NAME = "tag-v1";

export interface TagValuesV1 extends TagValuesBase {
	"name": string;
	"quantity": string;
	"size": string;
	"color": string;
	"man-date": string;
	"extras": {
		"apply-temp": string
		"ink-type": string
		"exp-span": string
	}
}

const tagDataLabel: { [K in keyof TagValuesV1]: string } = {
	"name": "Nome",
	"quantity": "Quantidade",
	"color": "Cor",
	"size": "Tamanho",
	"man-date": "Data de Fabricação",
	"extras": "Outras opções"
} as const;

const extraTagDataLabel: { [K in keyof TagValuesV1["extras"]]: string } = {
	"apply-temp": "Temperatura de aplicação",
	"ink-type": "Tipo da tinta",
	"exp-span": "Validade"
} as const;

const css = /*style*/`
  .${CLASS_NAME} {
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
    font-size: 5.8pt;
    color: rgba(0,0,0,1);
    padding: 2mm;
    min-height: 38mm;
    min-width: 99mm;
    height: 100%;
    width: 100%;
    flex-grow: 1;
    display: flex;
    box-sizing: border-box;
  }

  .${CLASS_NAME} .inner-tag {
    display: flex;
    flex-direction: row;
    border: .8pt black solid;
    border-radius: 1.5mm;
    box-sizing: border-box;
    width: 100%;
  }

  .${CLASS_NAME} .vertical-separator {
    border-left: black .8pt solid;
  }

  .${CLASS_NAME} .logo-area {
    padding: 1.25mm;
    display: flex;
    align-items: flex-start;
  }

  .${CLASS_NAME} .logo {
    width: 100%;
  }

  .${CLASS_NAME} .value-title {
    color: red;
    font-weight: 500;
    display: inline;
  }

  .${CLASS_NAME} .info-output {
    font-size: 11pt;
    margin-block: -.15em;
    font-weight: 500;
    overflow: hidden;
    flex-grow: 1;
  }

  .${CLASS_NAME} .medium {
    font-size: 6.5pt !important;
    font-weight: 400 !important;
	line-height: 1.3 !important;
  }

  .${CLASS_NAME} .inst-area {
    padding: 1mm;
    display: flex;
    flex-direction: column;
    gap: 1mm;
    justify-content: space-around;
  }

  .${CLASS_NAME} .inst-sect {
    display: flex;
    gap: 2.5mm;
  }

  .${CLASS_NAME} .inst-sect .value-title {
    min-width: 30%;
  }

  .${CLASS_NAME} .inst-list {
    list-style: none;
    padding: 0;
    margin: 0;
    width: fit-content;
  }

  .${CLASS_NAME} .inst-list li {
    letter-spacing: .02em;
    line-height: 1.3;
    font-size: 5.5pt;
  }

  .${CLASS_NAME} .inst-list li::marker {
    content: " - ";
  }

  .${CLASS_NAME} .inner-cell {
    padding: .5mm;
    display: flex;
    flex-direction: row;
    gap: 1mm;
    align-items: center;
  }

  .${CLASS_NAME} .data-area {
    display: flex;
    flex-direction: column;
    min-width: 50%;
  }
`

const html = /*html*/` <div class="${CLASS_NAME}">
  <div class="inner-tag">
    <div class="data-area">
      <div class="logo-area" style="border-bottom: .8pt solid black">
        <img class="logo" src="/logo.svg" id="logo">
      </div>
      <div class="inner-cell" style="border-bottom: .8pt solid black;">
        <span class="value-title">PRODUTO</span>
        <span class="info-output" id="name">Nome do Produto</span>
      </div>
      <div style="display: flex; gap: .2mm; border-bottom: .8pt solid black;">
        <div class="inner-cell" style="min-width: 30%;">
          <span class="value-title">QUANT.</span>
          <span class="info-output" id="quantity">000</span>
        </div>
        <div class="vertical-separator"></div>
        <div class="inner-cell" style="flex-grow: 1;">
          <span class="value-title">TAM.</span>  
          <span class="info-output" id="size">Valor</span>
        </div>
      </div>
      <div class="inner-cell" style="border-bottom: .8pt solid black;">
        <span class="value-title">COR</span>
        <span class="info-output" id="color">Nome da Cor</span>
      </div>
      <div style="display: flex; flex-grow: 1;">
        <div style="flex-grow: 1; min-width: 75%; display: flex; flex-direction: column;">
          <div class="inner-cell" style="border-bottom: .8pt black solid; flex-grow: 1">
            <span class="value-title">FABRICADO EM</span>
            <span class="info-output medium" style="text-align: center;" id="man-date">00/00/0000</span>
          </div>
          <div class="inner-cell" style="flex-grow: 1">
            <span class="value-title">VALIDADE</span>
            <span class="info-output medium" id="exp-span" style="text-align: center;">6 MESES</span>
          </div>
        </div>
        <div class="vertical-separator"></div>
        <div class="inner-cell" style="flex-direction: column; justify-content: flex-start; gap: 0">
          <span class="value-title">TINTA</span>
          <span class="info-output medium" id="ink-type" style="text-align: center;">BASE D'ÁGUA</span>
        </div>
      </div>
    </div>
    <div class="vertical-separator"></div>
    <div class="inst-area">
      <div class="inst-sect">
        <span class="value-title">APLICAÇÃO</span>
        <ul class="inst-list">
          <li>
            TEMPERATURA: <span id="apply-temp">150°C</span>
          </li>
          <li>
            PRESSÃO: FORTE - 80 / 100 PSI
          </li>
          <li>
            TEMPO: 12  A 15 SEGUNDOS
          </li>
          <li>
            RETIRA: FRIO
          </li>
          <li>
            TECIDO: CLARO / ESCURO
          </li>
        </ul>
      </div>

      <div class="inst-sect">
        <span class="value-title">INFORMAÇÕES</span>
        <ul class="inst-list">
          <li>
            ARMAZENAR O TRANSFER EM LOCAL SECO LIVRE DE UMIDADE. 
          </li>
          <li>
            PROBLEMAS OU DUVIDAS ENTRAR EM CONTATO COM NOSSA PARTE TÉCNICA.
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>`

const fragment = createTemplate(html);

const tagOutputsQueries = [...Object.keys(tagDataLabel), ...Object.keys(extraTagDataLabel)];

const defaultValues = tagOutputsQueries.reduce((map, selector) => {

	const tagEl = fragment.getElementById(selector);
	const value = tagEl?.textContent.trim() || "Indefinido";

	if (selector === "extras") {
		return map;
	}

	// Utiliza o dia atual para a data de fabricação, como valor padrão
	if (selector === "man-date") {
		const today = new Date();
		const day = String(today.getDate()).padStart(2, '0');
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const year = today.getFullYear();
		return {
			...map,
			[selector]: `${day}/${month}/${year}`
		}
	}

	// Verifica se é valor extra
	if (Object.hasOwn(extraTagDataLabel, selector)) {
		return {
			...map,
			["extras"]: {
				...(map["extras"] as {}),
				[selector]: value
			}
		}
	}

	return {
		...map,
		[selector]: value
	}
}, {} as TagValuesBase);

const template: TagTemplate = {
	templateName: TEMPLATE_NAME,
	templateElement: fragment,
	templateStyle: css,
	tagOutputs: tagOutputsQueries,
	defaultValues
}
export default template
