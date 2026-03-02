/**
 * ==========================================
 * [BLOCO 4] JS: MOTOR DE FORMATAÇÃO (Formatter)
 * ==========================================
 */
const Formatter = {
    formatarPorta: function(raw, sentido) {
        // Se o valor for inválido, devolve do jeito que veio
        if (!raw || raw === "-" || raw === "Pendente" || raw === "Inexistente") return raw;
        
        let t = AppData.dicionario[AppData.currentLang];
        
        // Mantemos o parse apenas para descobrir o Vagão e a Porta física e desenhar o trem certo
        let parsed = Router.parseVagaoPorta(raw, sentido); 
        
        let res = [];
        
        // REGRA DE OURO: O número escrito no seu banco de dados prevalece ABSOLUTAMENTE
        let numeroCravadoNoBanco = null;
        let numMatch = raw.match(/\d{2}/);
        if (numMatch) {
            numeroCravadoNoBanco = numMatch[0]; // Pega o "63" puro da string "Porta 63" que você digitou
        }

        if (parsed) {
            // Se você digitou um número no DB (ex: 63), ele USA o 63. A matemática só roda se não tiver número.
            let numeroExibido = numeroCravadoNoBanco ? numeroCravadoNoBanco : (sentido === "BF" ? `${parsed.v}${9 - parsed.p}` : `${7 - parsed.v}${parsed.p}`);
            
            // Monta o texto Principal: "Porta 63"
            res.push(['zh', 'ja', 'ko'].includes(AppData.currentLang) ? `${numeroExibido}${t.txtPorta}` : `${t.txtPorta} ${numeroExibido}`);
            
            // Monta o subtexto: "(Vagão 1, Porta 2)"
            let tradVagao = `(${t.txtVagao} ${parsed.v}, ${t.txtPorta} ${parsed.p})`;
            if (AppData.currentLang === 'zh' || AppData.currentLang === 'ja' || AppData.currentLang === 'ko') {
                tradVagao = `(${parsed.v}${t.txtVagao} ${parsed.p}${t.txtPorta})`;
            }
            res.push(tradVagao);
        } else if (raw.includes("Porta")) {
            res.push(raw.replace("Porta", t.txtPorta));
        } else {
            res.push(raw);
        }
        
        return res.length > 0 ? res.join(" ") : raw;
    }
};

/**
 * ==========================================
 * [BLOCO 5] JS: MOTOR DE ROTEAMENTO (Router)
 * ==========================================
 */
const Router = {
    encontrarCaminhoLinhas: function(lOrigem, lDestino) {
        if (lOrigem === lDestino) return [lOrigem];
        let fila = [[lOrigem]];
        let visitados = new Set();
        visitados.add(lOrigem);

        while (fila.length > 0) {
            let caminho = fila.shift();
            let atual = caminho[caminho.length - 1];
            for (let vizinho in AppData.transferencias[atual]) {
                vizinho = parseInt(vizinho);
                if (!visitados.has(vizinho)) {
                    visitados.add(vizinho);
                    let novoCaminho = [...caminho, vizinho];
                    if (vizinho === lDestino) return novoCaminho;
                    fila.push(novoCaminho);
                }
            }
        }
        return null;
    },
    
    // Atualizado para ler o array de ordem da linha correta
    calcularSentido: function(idOrigem, idDestino, lAtual) { 
        let ordemArray = lAtual == 1 ? AppData.ordemL1 : (lAtual == 3 ? AppData.ordemL3 : []);
        let idxOrigem = ordemArray.indexOf(idOrigem);
        let idxDestino = ordemArray.indexOf(idDestino);
        
        // Se achou no array, calcula S1/S2 pela ordem (S1 <, S2 >)
        if (idxOrigem !== -1 && idxDestino !== -1) {
            return idxOrigem < idxDestino ? "S2" : "S1"; 
        }
        // Fallback antigo numérico
        return parseInt(idOrigem) < parseInt(idDestino) ? "S2" : "S1"; 
    },
    
    // Atualizado para retornar um ARRAY de portas (suporta opções múltiplas)
    extrairPortasAlvo: function(nodeDestino, sentido, prefSaida) {
        let dbStr = sentido === "S1" ? nodeDestino.dbS1 : nodeDestino.dbS2;
        // Fallback caso a estação ainda use a estrutura antiga dbStr genérica
        if (!dbStr && nodeDestino.dbStr) dbStr = nodeDestino.dbStr;
        if (!dbStr) return [];

        let tipo = prefSaida === 'elevador' ? 'E' : (prefSaida === 'rolante' ? 'R' : 'F');
        let tokens = dbStr.split(',');
        
        // Prefixo flexível: Se o ID for numérico usa as 3 letras da dbStr, se for texto (ex: TUC) usa o próprio ID
        let prefixoEstacao = typeof nodeDestino.nome === 'string' && (AppData.ordemL1.includes(idDestinoParaLetras(nodeDestino)) || AppData.ordemL3.includes(idDestinoParaLetras(nodeDestino))) 
            ? idDestinoParaLetras(nodeDestino) 
            : dbStr.substring(0,3);

        let prefixoBusca = `${prefixoEstacao}${sentido}${tipo}`; 
        
        let matches = [];

        tokens.forEach(t => {
            if (t.startsWith(prefixoBusca)) {
                if (tipo === 'R') {
                    // Prioriza Desembarque (-O) ou Transferência (-T)
                    if (t.endsWith('-O') || t.includes('-T')) matches.push(t);
                    else if (!t.includes('-')) matches.push(t); // Se não tem sufixo I/O
                } else {
                    matches.push(t); // Fixa e Elevador entram direto
                }
            }
        });

        return matches;
    },

    parseVagaoPorta: function(raw, sentido) {
        if(!raw || raw === "-" || raw === "Pendente" || raw === "Inexistente") return null;
        let map = AppData.mapaPortas ? (AppData.mapaPortas[sentido] || {}) : {};
        let numMatch = raw.match(/\d{2}/);
        let vagaoMatch = raw.match(/Vagão \d, Porta \d/);
        let numPorta = "", vagaoStr = "";

        if (numMatch && !raw.includes("Vagão")) {
            numPorta = numMatch[0]; vagaoStr = map[numPorta] || "";
        } else if (vagaoMatch) {
            vagaoStr = vagaoMatch[0]; numPorta = Object.keys(map).find(k => map[k] === vagaoStr) || "";
        }

        let v = 0, p = 0;
        if (vagaoStr) {
            let vMatch = vagaoStr.match(/Vagão (\d), Porta (\d)/);
            if (vMatch) { v = parseInt(vMatch[1]); p = parseInt(vMatch[2]); }
        } else if (numPorta) {
            let d1 = parseInt(numPorta.charAt(0)); let d2 = parseInt(numPorta.charAt(1));
            // S1 (Tucuruvi/Itaquera) inverte a contagem lógica do vagão, S2 (Jabaquara/Barra Funda) é direto
            if (sentido === "S2") { v = d1; p = (d2 >= 5 && d2 <= 8) ? (9 - d2) : 0; } 
            else { v = 7 - d1; p = (d2 >= 1 && d2 <= 4) ? d2 : 0; }
        }

        // Lógica para Top-Down: Determinar Lado A ou B baseado no número absoluto da porta
        let side = null;
        if (numPorta) {
            let d2 = parseInt(numPorta.charAt(1));
            side = (d2 <= 4) ? 'A' : 'B'; // A = Topo na UI, B = Base na UI
        }
        
        return (v >= 1 && v <= 6 && p >= 1 && p <= 4) ? {v, p, side} : null;
    }
};

// Auxiliar para a nova base
function idDestinoParaLetras(node) {
    return Object.keys(AppData.estacoes).find(k => AppData.estacoes[k] === node);
}

/**
 * ==========================================
 * [BLOCO 6] JS: INTERFACE, TEMA E TELAS (UI)
 * ==========================================
 */
const UI = {
    init: function() {
        const selLO = document.getElementById('linha-origem'); const selLD = document.getElementById('linha-destino');
        const t = AppData.dicionario[AppData.currentLang];
        selLO.options.length = 0; selLD.options.length = 0;
        selLO.add(new Option(t.selLinhaOr, "0", true, true)); selLO.options[0].disabled = true;
        selLD.add(new Option(t.selLinhaDest, "0", true, true)); selLD.options[0].disabled = true;
        AppData.linhas.forEach(l => { selLO.add(new Option(t['l'+l], l)); selLD.add(new Option(t['l'+l], l)); });
        this.atualizarEstacoes('origem', true); this.atualizarEstacoes('destino', true);
        this.popularListaMapeadas();
        
        if(localStorage.getItem('pc_theme') === 'light') {
            AppData.isLightMode = true;
            document.body.classList.add('light-mode');
        }
        this.updateThemeUI();

        if(sessionStorage.getItem('portaCertaModal') === 'lido') {
            this.showView('view-main');
        } else {
            this.showView('view-splash');
        }
    },

    showView: function(viewId) {
        document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        window.scrollTo(0, 0);
    },

    finishIntro: function() {
        sessionStorage.setItem('portaCertaModal', 'lido');
        this.showView('view-main');
    },

    toggleTheme: function() {
        AppData.isLightMode = !AppData.isLightMode;
        document.body.classList.toggle('light-mode', AppData.isLightMode);
        localStorage.setItem('pc_theme', AppData.isLightMode ? 'light' : 'dark');
        this.updateThemeUI();
    },

    updateThemeUI: function() {
        const btnIcon = document.getElementById('theme-icon');
        const btnText = document.getElementById('theme-text');
        const t = AppData.dicionario[AppData.currentLang];
        if(AppData.isLightMode) {
            btnIcon.innerText = '🌙';
            btnText.innerText = t.modoEscuro || 'Modo Escuro';
        } else {
            btnIcon.innerText = '☀️';
            btnText.innerText = t.modoClaro || 'Modo Claro';
        }
    },

    atualizarEstacoes: function(tipo, forceReset = false) {
        const selLinha = document.getElementById(`linha-${tipo}`); 
        const selEstacao = document.getElementById(`estacao-${tipo}`);
        const t = AppData.dicionario[AppData.currentLang];
        selLinha.style.borderColor = (selLinha.value != "0") ? `var(--l${selLinha.value})` : '';
        selEstacao.innerHTML = ''; 
        
        if (selLinha.value === "0" || forceReset) { 
            selEstacao.add(new Option(t[tipo === 'origem' ? 'selEstOr' : 'selEstDest'], "0", true, true)); 
            selEstacao.disabled = true; 
            return; 
        }
        
        selEstacao.disabled = false; 
        selEstacao.add(new Option(t.selEstAtivo, "0", true, true)); 
        selEstacao.options[0].disabled = true;
        
        // Puxa as estações e ordena caso a linha tenha uma ordem predefinida no AppData
        let estacoesLinha = Object.keys(AppData.estacoes).filter(id => AppData.estacoes[id].linha == selLinha.value);
        if (selLinha.value == 1 && AppData.ordemL1) estacoesLinha.sort((a, b) => AppData.ordemL1.indexOf(a) - AppData.ordemL1.indexOf(b));
        if (selLinha.value == 3 && AppData.ordemL3) estacoesLinha.sort((a, b) => AppData.ordemL3.indexOf(a) - AppData.ordemL3.indexOf(b));

        if (tipo === 'origem') {
            let freqs = {};
            try { freqs = JSON.parse(localStorage.getItem('pc_freq_origem')) || {}; } catch(e) {}

            let estacoesFreq = estacoesLinha.filter(id => freqs[id] > 0).sort((a, b) => freqs[b] - freqs[a]).slice(0, 3);
            
            if (estacoesFreq.length > 0) {
                let groupFreq = document.createElement('optgroup');
                groupFreq.label = t.freqUsadas || "Mais Usadas";
                estacoesFreq.forEach(id => {
                    let node = AppData.estacoes[id];
                    let isOrigemBloqueada = !node.mapeada;
                    let opt = new Option(node.nome + (isOrigemBloqueada ? ` ${t.emBreve}` : ""), id);
                    if (isOrigemBloqueada) opt.disabled = true;
                    groupFreq.appendChild(opt);
                });
                selEstacao.appendChild(groupFreq);
                
                let groupAll = document.createElement('optgroup');
                groupAll.label = t.freqTodas || "Todas as Estações";
                estacoesLinha.forEach(id => {
                    let node = AppData.estacoes[id];
                    let isOrigemBloqueada = !node.mapeada;
                    let opt = new Option(node.nome + (isOrigemBloqueada ? ` ${t.emBreve}` : ""), id);
                    if (isOrigemBloqueada) opt.disabled = true;
                    groupAll.appendChild(opt);
                });
                selEstacao.appendChild(groupAll);
            } else {
                estacoesLinha.forEach(id => {
                    let node = AppData.estacoes[id];
                    let isOrigemBloqueada = !node.mapeada;
                    let opt = new Option(node.nome + (isOrigemBloqueada ? ` ${t.emBreve}` : ""), id);
                    if (isOrigemBloqueada) opt.disabled = true;
                    selEstacao.add(opt);
                });
            }
        } else {
            estacoesLinha.forEach(id => {
                let node = AppData.estacoes[id];
                selEstacao.add(new Option(node.nome, id));
            });
        }
        document.getElementById('resultado-box').style.display = 'none';
    },

    changeLanguage: function(langCode) {
        let isResultVisible = document.getElementById('resultado-box').style.display === 'block';
        AppData.currentLang = langCode; const t = AppData.dicionario[langCode];
        if(!t) return;
        document.body.setAttribute('dir', langCode === 'ar' ? 'rtl' : 'ltr');
        document.querySelectorAll('.lang-flag').forEach(el => el.classList.remove('active'));
        let flagEl = document.getElementById('flag-' + langCode);
        if(flagEl) flagEl.classList.add('active');

        document.getElementById('mod-title').innerText = t.modTitle; document.getElementById('btn-modal').innerText = t.btnCalc; 
        document.getElementById('btn-calcular').innerText = t.btnCalc; document.getElementById('lbl-pref').innerText = t.lblPref;
        document.getElementById('opt-elevador').innerText = t.optElevador; document.getElementById('opt-rolante').innerText = t.optRolante;
        document.getElementById('opt-fixa').innerText = t.optFixa; document.getElementById('title-origem').innerText = t.titleOrigem;
        document.getElementById('title-destino').innerText = t.titleDestino; document.getElementById('list-title').innerText = t.listTitle;
        document.getElementById('list-desc').innerText = t.listDesc; 
        
        document.getElementById('btn-voltar-settings').innerText = t.btnVoltarApp;
        document.getElementById('btn-voltar-map').innerText = t.btnVoltarApp; 
        document.getElementById('btn-voltar-tut').innerText = t.btnVoltarApp;
        document.getElementById('btn-entrar-splash').innerText = t.btnEntrarSplash;
        
        document.getElementById('settings-title').innerText = t.configTitle;
        document.getElementById('lbl-set-tut').innerText = t.setTut;
        document.getElementById('lbl-set-map').innerText = t.setMap;
        document.getElementById('lbl-set-font').innerText = t.setFont;
        document.getElementById('lbl-set-lang').innerText = t.setLang;
        this.updateThemeUI(); 
        
        document.getElementById('mod-acc-title').innerText = t.accTitle; 
        document.getElementById('mod-acc-btn-fala').innerText = t.accBtnFala; document.getElementById('mod-acc-btn-close').innerText = t.accBtnClose;
        document.getElementById('btn-gps').innerText = t.gpsBtn;

        const valLO = document.getElementById('linha-origem').value; const valEO = document.getElementById('estacao-origem').value;
        const valLD = document.getElementById('linha-destino').value; const valED = document.getElementById('estacao-destino').value;
        this.init();
        document.getElementById('linha-origem').value = valLO; if(valLO != "0") this.atualizarEstacoes('origem'); document.getElementById('estacao-origem').value = valEO;
        document.getElementById('linha-destino').value = valLD; if(valLD != "0") this.atualizarEstacoes('destino'); document.getElementById('estacao-destino').value = valED;
        if(isResultVisible) this.iniciarCalculo();
    },

    toggleFontSize: function() { AppData.isLargeFont = !AppData.isLargeFont; document.body.classList.toggle('large-font', AppData.isLargeFont); },
    liberarModal: function() { document.getElementById('btn-modal').disabled = !document.getElementById('check-ciencia').checked; },
    abrirModalAcessibilidade: function() { document.getElementById('acessibilidade-modal').style.display = 'flex'; },
    fecharModalAcessibilidade: function() { document.getElementById('acessibilidade-modal').style.display = 'none'; },

    popularListaMapeadas: function() {
        const ul = document.getElementById('ul-mapeadas'); 
        if(!ul) return;
        ul.innerHTML = "";
        for (let id in AppData.estacoes) {
            if (AppData.estacoes[id].mapeada) {
                let li = document.createElement('li'); li.innerText = AppData.estacoes[id].nome; ul.appendChild(li);
            }
        }
    },

    gerarTremHtml: function(linhaId, parsed, sentidoCalculado) {
        let corVar = `var(--l${linhaId})`;
        let vTarget = parsed ? parsed.v : 0;
        let pTarget = parsed ? parsed.p : 0;
        let sTarget = parsed ? parsed.side : null;

        let html = `<div class="t-topdown-container">`;
        
        html += `<div class="t-direction" style="color: ${corVar}">`;
        if (sentidoCalculado === "S1") {
            html += `◀ SENTIDO DA VIAGEM`;
        } else {
            html += `SENTIDO DA VIAGEM ▶`;
        }
        html += `</div>`;

        html += `<div class="t-track-topdown">`;
        html += `<div class="t-wrapper-topdown">`;
        
        for(let v=1; v<=6; v++) {
            let isCab = (sentidoCalculado === "S1" && v === 1) || (sentidoCalculado === "S2" && v === 6);
            
            html += `<div class="t-car-topdown" style="border-color: ${corVar};">`;
            
            // LADO A (Topo da tela)
            html += `<div class="car-row top">`;
            for(let p=1; p<=4; p++) {
                let isTarget = (v === vTarget && p === pTarget && (sTarget === 'A' || sTarget === null));
                html += `<div class="t-door-topdown top ${isTarget ? 'target' : ''}"></div>`;
            }
            html += `</div>`;

            // RÓTULO CENTRAL
            html += `<div class="car-center-label">C${v}</div>`;

            // LADO B (Base da tela)
            html += `<div class="car-row bottom">`;
            for(let p=1; p<=4; p++) {
                let isTarget = (v === vTarget && p === pTarget && (sTarget === 'B' || sTarget === null));
                html += `<div class="t-door-topdown bottom ${isTarget ? 'target' : ''}"></div>`;
            }
            html += `</div>`;

            // INDICADOR DA CABINE (Frente do trem)
            if (isCab) {
                let cabClass = sentidoCalculado === "S1" ? "cab-left" : "cab-right";
                html += `<div class="t-cab ${cabClass}" style="background-color: ${corVar}"></div>`;
            }

            html += `</div>`; 
        }
        html += `</div></div></div>`;
        return html;
    },

    iniciarCalculo: function() {
        const estOr = document.getElementById('estacao-origem').value; const estDest = document.getElementById('estacao-destino').value;
        const pref = document.getElementById('preferencia').value; const box = document.getElementById('resultado-box');
        const t = AppData.dicionario[AppData.currentLang] || AppData.dicionario['pt'];

        if (estOr == "0" || estDest == "0") { 
            box.innerHTML = `<div class="alert-warning" style="text-align:center; color:#FFC107; border-color:rgba(255, 193, 7, 0.3); border: 1px solid;">⚠️ Por favor, escolha a estação de <b>Origem</b> e de <b>Destino</b> para calcular a rota.</div>`; 
            box.style.display = 'block'; 
            return; 
        }
        
        try {
            let freqs = JSON.parse(localStorage.getItem('pc_freq_origem')) || {};
            freqs[estOr] = (freqs[estOr] || 0) + 1;
            localStorage.setItem('pc_freq_origem', JSON.stringify(freqs));
        } catch(e) {}

        if (estOr === estDest) { box.innerHTML = `<div class="info-text" style="text-align:center;">${t.mesmaEstacao}</div>`; box.style.display = 'block'; return; }

        const origem = AppData.estacoes[estOr]; const destino = AppData.estacoes[estDest];
        const caminho = Router.encontrarCaminhoLinhas(origem.linha, destino.linha);
        const tipoPrefTexto = pref === 'elevador' ? t.tipoElevador : (pref === 'rolante' ? t.tipoRolante : t.tipoFixa);
        
        let htmlFinal = "";
        let ativouFaltaAcessibilidade = false;

        if (caminho && caminho.length > 1) {
            htmlFinal += `<div class="alert-warning alert-info">ℹ️ <b>${t.avisoRota || 'Atenção:'}</b><br>${t.avisoRotaTexto || 'Esta rota foca em acessibilidade e nas portas corretas. Pode não ser o trajeto mais rápido.'}</div>`;
        }
        
        for (let i = 0; i < (caminho ? caminho.length : 1); i++) {
            let lAtual = caminho ? caminho[i] : origem.linha; 
            let isFirst = (i === 0); 
            let isLast = (caminho ? (i === caminho.length - 1) : true);
            
            let estNomeEmbarque = isFirst ? origem.nome : AppData.transferencias[caminho[i-1]][lAtual];
            let estNomeDesembarque = isLast ? destino.nome : AppData.transferencias[lAtual][caminho[i+1]];
            let corVar = `var(--l${lAtual})`;
            
            htmlFinal += `<div class="route-step" style="border-color: ${corVar}; --step-color: ${corVar};">`;
            htmlFinal += `<div class="step-title" style="color: ${corVar};">📍 ${t.trecho} ${i+1}: ${t['l'+lAtual] || `Linha ${lAtual}`}</div>`;

            let sentidoCalculado = Router.calcularSentido(estOr, estDest, lAtual);
            
            // Extrai a ARRAY de portas válidas
            let portasBrutas = Router.extrairPortasAlvo(destino, sentidoCalculado, pref);
            
            if (portasBrutas.length === 0) ativouFaltaAcessibilidade = true;

            htmlFinal += `<div class="info-text">${t.embTrecho ? t.embTrecho.replace('{est}', `<b>${estNomeEmbarque}</b>`) : `Em <b>${estNomeEmbarque}</b>, posicione-se na:`}</div>`;
            
            if (portasBrutas.length === 0) {
                htmlFinal += `<div class="alert-warning" style="color:#FF3B30; border-color:#FF3B30;">🚫 ${t.txtInexistente ? t.txtInexistente.replace('{sentido}', sentidoCalculado) : 'Equipamento Inexistente'}</div>`;
            } else {
                let resultadosFormatados = [];
                let objParsedPrincipal = null;

                // Processa cada porta encontrada usando seu Formatter de Regra de Ouro
                portasBrutas.forEach((portaStr, index) => {
                    let formated = Formatter.formatarPorta(portaStr, sentidoCalculado);
                    resultadosFormatados.push(formated.split('(')[0].trim()); // Pega só a parte "Porta X"
                    
                    if (index === 0) {
                        objParsedPrincipal = Router.parseVagaoPorta(portaStr, sentidoCalculado);
                    }
                });

                // Junta as portas "Porta 41 ou 22"
                htmlFinal += `<div class="result-door" style="color:${corVar};">${resultadosFormatados.join(' ou ')}</div>`;
                
                // Põe o subtexto do primeiro vagão como referência
                if (objParsedPrincipal) {
                    htmlFinal += `<div class="info-text" style="font-size:0.9rem;">(Vagão ${objParsedPrincipal.v})</div>`;
                    htmlFinal += UI.gerarTremHtml(lAtual, objParsedPrincipal, sentidoCalculado);
                }
            }

            if (!isLast) {
                let proxLinhaNome = t['l'+caminho[i+1]] || `Linha ${caminho[i+1]}`;
                htmlFinal += `<div class="info-text" style="margin-top:15px; border-top: 1px dashed #333; padding-top: 10px;">${t.transfTrecho ? t.transfTrecho.replace('{est}', `<b>${estNomeDesembarque}</b>`).replace('{linha}', `<b>${proxLinhaNome}</b>`) : 'Faça transferência.'}</div>`;
            } else {
                htmlFinal += `<div class="info-text" style="margin-top:15px; border-top: 1px dashed #333; padding-top: 10px;">${t.saidaFinal ? t.saidaFinal.replace('{est}', `<b>${estNomeDesembarque}</b>`).replace('{tipo}', `<b>${tipoPrefTexto}</b>`) : 'Saída.'}</div>`;
            }
            
            htmlFinal += `</div>`;
        }

        box.innerHTML = htmlFinal;
        box.style.display = 'block';

        if (ativouFaltaAcessibilidade) {
            setTimeout(() => { UI.abrirModalAcessibilidade(); }, 300);
        } else {
            setTimeout(() => {
                document.querySelectorAll('.t-wrapper-topdown').forEach(wrapper => {
                    let target = wrapper.querySelector('.t-door-topdown.target');
                    if(target) {
                        let container = wrapper.parentElement;
                        let cWidth = container.offsetWidth;
                        let tOffset = target.getBoundingClientRect().left - wrapper.getBoundingClientRect().left;
                        let tWidth = target.offsetWidth;
                        let translateX = (cWidth / 2) - tOffset - (tWidth / 2);
                        wrapper.style.transform = `translateX(${translateX}px)`;
                    }
                });
            }, 50);
        }
    }
};

const GeoLocation = {
    findNearest: function() {
        const btn = document.getElementById('btn-gps');
        const t = AppData.dicionario[AppData.currentLang] || AppData.dicionario['pt'];
        
        if (!navigator.geolocation) {
            btn.innerText = t.gpsErro || 'Erro';
            setTimeout(() => { btn.innerText = t.gpsBtn || 'GPS'; }, 2000);
            return;
        }

        btn.innerText = t.gpsBusca || 'Buscando...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let userLat = position.coords.latitude;
                let userLng = position.coords.longitude;
                
                let closest = null;
                let minDist = Infinity;
                let RAIO_MAXIMO_KM = 8; 

                for (let id in AppData.estacoes) {
                    let st = AppData.estacoes[id];
                    if (st.lat && st.lng && st.mapeada) {
                        let dist = GeoLocation.haversine(userLat, userLng, st.lat, st.lng);
                        if (dist < minDist) {
                            minDist = dist;
                            closest = { id: id, linha: st.linha };
                        }
                    }
                }

                if (closest && minDist <= RAIO_MAXIMO_KM) {
                    document.getElementById('linha-origem').value = closest.linha;
                    UI.atualizarEstacoes('origem');
                    document.getElementById('estacao-origem').value = closest.id;
                    btn.innerText = t.gpsFeito || 'Feito!';
                    setTimeout(() => { btn.innerText = t.gpsBtn || 'GPS'; }, 2000);
                } else {
                    btn.innerText = t.gpsErro || 'Erro';
                    setTimeout(() => { btn.innerText = t.gpsBtn || 'GPS'; }, 2000);
                }
            },
            (error) => {
                btn.innerText = t.gpsErro || 'Erro';
                setTimeout(() => { btn.innerText = t.gpsBtn || 'GPS'; }, 2000);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    },

    haversine: function(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
};

window.onload = function() {
    UI.init();
};
