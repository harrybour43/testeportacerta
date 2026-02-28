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
    calcularSentido: function(idOrigem, idDestino) { return parseInt(idOrigem) < parseInt(idDestino) ? "BF" : "IT"; },
    extrairPortaAlvo: function(nodeDestino, sentido, prefSaida) {
        let alvo = prefSaida === "elevador" ? nodeDestino.elevadorBF : (prefSaida === "rolante" ? nodeDestino.rolanteBF : nodeDestino.fixaBF);
        if (sentido === "IT") alvo = prefSaida === "elevador" ? nodeDestino.elevadorIT : (prefSaida === "rolante" ? nodeDestino.rolanteIT : nodeDestino.fixaIT);
        return alvo;
    },
    parseVagaoPorta: function(raw, sentido) {
        if(!raw || raw === "-" || raw === "Pendente" || raw === "Inexistente") return null;
        let map = AppData.mapaPortas[sentido] || {};
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
            if (sentido === "BF") { v = d1; p = (d2 >= 5 && d2 <= 8) ? (9 - d2) : 0; } 
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
        
        // Verifica Modo Claro/Escuro salvo
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
        
        if (tipo === 'origem') {
            let freqs = {};
            try { freqs = JSON.parse(localStorage.getItem('pc_freq_origem')) || {}; } catch(e) {}

            let estacoesLinha = Object.keys(AppData.estacoes).filter(id => AppData.estacoes[id].linha == selLinha.value);
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
            for (let id in AppData.estacoes) {
                let node = AppData.estacoes[id];
                if (node.linha == selLinha.value) {
                    selEstacao.add(new Option(node.nome, id));
                }
            }
        }
        document.getElementById('resultado-box').style.display = 'none';
    },

    changeLanguage: function(langCode) {
        let isResultVisible = document.getElementById('resultado-box').style.display === 'block';
        AppData.currentLang = langCode; const t = AppData.dicionario[langCode];
        document.body.setAttribute('dir', langCode === 'ar' ? 'rtl' : 'ltr');
        document.querySelectorAll('.lang-flag').forEach(el => el.classList.remove('active'));
        document.getElementById('flag-' + langCode).classList.add('active');

        document.getElementById('mod-title').innerText = t.modTitle; document.getElementById('btn-modal').innerText = t.btnCalc; 
        document.getElementById('btn-calcular').innerText = t.btnCalc; document.getElementById('lbl-pref').innerText = t.lblPref;
        document.getElementById('opt-elevador').innerText = t.optElevador; document.getElementById('opt-rolante').innerText = t.optRolante;
        document.getElementById('opt-fixa').innerText = t.optFixa; document.getElementById('title-origem').innerText = t.titleOrigem;
        document.getElementById('title-destino').innerText = t.titleDestino; document.getElementById('list-title').innerText = t.listTitle;
        document.getElementById('list-desc').innerText = t.listDesc; 
        
        // Botões de Voltar
        document.getElementById('btn-voltar-settings').innerText = t.btnVoltarApp;
        document.getElementById('btn-voltar-map').innerText = t.btnVoltarApp; 
        document.getElementById('btn-voltar-tut').innerText = t.btnVoltarApp;
        document.getElementById('btn-entrar-splash').innerText = t.btnEntrarSplash;
        
        // Textos da Engrenagem (Configurações)
        document.getElementById('settings-title').innerText = t.configTitle;
        document.getElementById('lbl-set-tut').innerText = t.setTut;
        document.getElementById('lbl-set-map').innerText = t.setMap;
        document.getElementById('lbl-set-font').innerText = t.setFont;
        document.getElementById('lbl-set-lang').innerText = t.setLang;
        this.updateThemeUI(); // Atualiza texto de Claro/Escuro
        
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
        const ul = document.getElementById('ul-mapeadas'); ul.innerHTML = "";
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
        if (sentidoCalculado === "BF") {
            html += `◀ SENTIDO DA VIAGEM`;
        } else {
            html += `SENTIDO DA VIAGEM ▶`;
        }
        html += `</div>`;

        html += `<div class="t-track-topdown">`;
        html += `<div class="t-wrapper-topdown">`;
        
        for(let v=1; v<=6; v++) {
            let isCab = (sentidoCalculado === "BF" && v === 1) || (sentidoCalculado === "IT" && v === 6);
            
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
                let cabClass = sentidoCalculado === "BF" ? "cab-left" : "cab-right";
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
        const t = AppData.dicionario[AppData.currentLang];

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

        if (caminho.length > 1) {
            htmlFinal += `<div class="alert-warning alert-info">ℹ️ <b>${t.avisoRota || 'Atenção:'}</b><br>${t.avisoRotaTexto || 'Esta rota foca em acessibilidade e nas portas corretas. Pode não ser o trajeto mais rápido.'}</div>`;
        }
        
        for (let i = 0; i < caminho.length; i++) {
            let lAtual = caminho[i]; 
            let isFirst = (i === 0); 
            let isLast = (i === caminho.length - 1);
            
            let estNomeEmbarque = isFirst ? origem.nome : AppData.transferencias[caminho[i-1]][lAtual];
            let estNomeDesembarque = isLast ? destino.nome : AppData.transferencias[lAtual][caminho[i+1]];
            let corVar = `var(--l${lAtual})`;
            
            htmlFinal += `<div class="route-step" style="border-color: ${corVar}; --step-color: ${corVar};">`;
            htmlFinal += `<div class="step-title" style="color: ${corVar};">📍 ${t.trecho} ${i+1}: ${t['l'+lAtual]}</div>`;

            let portaRaw = null; let sentidoCalculado = "BF";

            let idEmb = Object.keys(AppData.estacoes).find(k => AppData.estacoes[k].nome === estNomeEmbarque && AppData.estacoes[k].linha == lAtual);
            let idDes = Object.keys(AppData.estacoes).find(k => AppData.estacoes[k].nome === estNomeDesembarque && AppData.estacoes[k].linha == lAtual);
            
            if (idEmb && idDes) {
                sentidoCalculado = Router.calcularSentido(idEmb, idDes);
                let nodeDes = AppData.estacoes[idDes];
                
                if (nodeDes && nodeDes.mapeada) {
                    if (parseInt(idDes) === 313 && !isLast && caminho[i+1] === 1) {
                        let isL1Last = (i + 1 === caminho.length - 1);
                        let nomeDesembarqueL1 = isL1Last ? destino.nome : AppData.transferencias[1][caminho[i+2]];
                        let idDesL1 = Object.keys(AppData.estacoes).find(k => AppData.estacoes[k].nome === nomeDesembarqueL1 && AppData.estacoes[k].linha == 1);
                        let isTucuruviBound = parseInt(idDesL1) < 111;
                        portaRaw = isTucuruviBound ? (sentidoCalculado === "BF" ? "Porta 57" : "Porta 52") : (sentidoCalculado === "BF" ? "Porta 15" : "Porta 13");
                    } else {
                        portaRaw = Router.extrairPortaAlvo(nodeDes, sentidoCalculado, pref);
                    }
                }
            }

            if (portaRaw === "Inexistente") ativouFaltaAcessibilidade = true;

            htmlFinal += `<div class="info-text">${t.embTrecho.replace('{est}', `<b>${estNomeEmbarque}</b>`)}</div>`;
            
            if (portaRaw === "Inexistente") {
                htmlFinal += `<div class="alert-warning" style="color:#FF3B30; border-color:#FF3B30;">🚫 ${t.txtInexistente}</div>`;
            } else if (portaRaw && portaRaw !== "-" && portaRaw !== "Pendente") {
                htmlFinal += `<div class="result-door" style="color:${corVar};">${Formatter.formatarPorta(portaRaw, sentidoCalculado)}</div>`;
                let parsed = Router.parseVagaoPorta(portaRaw, sentidoCalculado);
                if (parsed) htmlFinal += UI.gerarTremHtml(lAtual, parsed, sentidoCalculado);
            } else {
                htmlFinal += `<div class="alert-warning alert-pendente" style="margin-top:8px;">⏳ ${t.pendente}</div>`;
            }

            if (!isLast) {
                let proxLinhaNome = t['l'+caminho[i+1]] || `Linha ${caminho[i+1]}`;
                htmlFinal += `<div class="info-text" style="margin-top:15px; border-top: 1px dashed #333; padding-top: 10px;">${t.transfTrecho.replace('{est}', `<b>${estNomeDesembarque}</b>`).replace('{linha}', `<b>${proxLinhaNome}</b>`)}</div>`;
            } else {
                htmlFinal += `<div class="info-text" style="margin-top:15px; border-top: 1px dashed #333; padding-top: 10px;">${t.saidaFinal.replace('{est}', `<b>${estNomeDesembarque}</b>`).replace('{tipo}', `<b>${tipoPrefTexto}</b>`)}</div>`;
            }
            
            htmlFinal += `</div>`;
        }

        box.innerHTML = htmlFinal;
        box.style.display = 'block';

        if (ativouFaltaAcessibilidade) {
            setTimeout(() => { UI.abrirModalAcessibilidade(); }, 300);
        }

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
};

/**
 * ==========================================
 * [BLOCO 7] JS: MOTOR DE GEOLOCALIZAÇÃO
 * ==========================================
 */
const GeoLocation = {
    findNearest: function() {
        const btn = document.getElementById('btn-gps');
        const t = AppData.dicionario[AppData.currentLang];
        
        if (!navigator.geolocation) {
            btn.innerText = t.gpsErro;
            setTimeout(() => { btn.innerText = t.gpsBtn; }, 2000);
            return;
        }

        btn.innerText = t.gpsBusca;
        
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
                    btn.innerText = t.gpsFeito;
                    setTimeout(() => { btn.innerText = t.gpsBtn; }, 2000);
                } else {
                    btn.innerText = t.gpsErro;
                    setTimeout(() => { btn.innerText = t.gpsBtn; }, 2000);
                }
            },
            (error) => {
                btn.innerText = t.gpsErro;
                setTimeout(() => { btn.innerText = t.gpsBtn; }, 2000);
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
