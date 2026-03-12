export default /* html */ `
  <div class="inner-tag">
    <div class="data-area">
      <div class="logo-area" style="border-bottom: .8pt solid black">
        <img class="logo" src="/logo.svg" id="logo"></img>
      </div>
      <div class="inner-cell" style="border-bottom: .8pt solid black;">
        <span class="value-title">PRODUTO</span>
        <span class="info-output" id="name">Nome do Produto</span>
      </div>
      <div style="display: flex; gap: .2mm; border-bottom: .8pt solid black;">
        <div class="inner-cell" style="min-width: 30%;">
          <span class="value-title">QUANT.</span>
          <span class="info-output" id="amount">000</span>
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
            <span class="info-output medium" id="exp-date" style="text-align: center;">0 MESES</span>
          </div>
        </div>
        <div class="vertical-separator"></div>
        <div class="inner-cell" style="flex-direction: column; justify-content: flex-start;">
          <span class="value-title">TINTA</span>
          <span class="info-output medium" id="ink-type" style="text-align: center;">BASE <nowrap>D´ÁGUA</nowrap></span>
        </div>
      </div>
    </div>
    <div class="vertical-separator"></div>
    <div class="inst-area">
      <div class="inst-sect">
        <span class="value-title">APLICAÇÃO</span>
        <ul class="inst-list">
          <li>
            TEMPERATURA: 160°C
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
`