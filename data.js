/**
 * ============================================================================
 * ARQUIVO: data.js
 * PROJETO: PORTA CERTA SP
 * DATA: 01/03/2026
 * DESCRIÇÃO: Banco de Dados de Estações, Dicionário e Variáveis de Estado
 * ============================================================================
 */

const AppData = {
    currentLang: 'pt',
    isLargeFont: false,
    isLightMode: false,
    linhas: [1, 2, 3, 4, 5, 15, 7, 8, 9, 10, 11, 12, 13],
    
    // Matriz de transferência para quando a funcionalidade multi-linha for ativada
    transferencias: {
        1: { 2: 'Paraíso', 3: 'Sé', 4: 'Luz', 5: 'Santa Cruz', 10: 'Luz', 11: 'Luz' },
        2: { 1: 'Paraíso', 4: 'Consolação', 5: 'Chácara Klabin', 10: 'Tamanduateí', 15: 'Vila Prudente' },
        3: { 1: 'Sé', 4: 'República', 7: 'Barra Funda', 8: 'Barra Funda', 10: 'Brás', 11: 'Brás', 12: 'Brás' },
        4: { 1: 'Luz', 2: 'Paulista', 3: 'República', 9: 'Pinheiros', 10: 'Luz', 11: 'Luz' },
        5: { 1: 'Santa Cruz', 2: 'Chácara Klabin', 9: 'Santo Amaro' },
        7: { 3: 'Barra Funda', 8: 'Barra Funda', 10: 'Barra Funda' },
        8: { 3: 'Barra Funda', 7: 'Barra Funda', 9: 'Osasco', 10: 'Barra Funda' },
        9: { 4: 'Pinheiros', 5: 'Santo Amaro', 8: 'Osasco' },
        10: { 1: 'Luz', 2: 'Tamanduateí', 3: 'Brás', 4: 'Luz', 7: 'Barra Funda', 8: 'Barra Funda', 11: 'Brás', 12: 'Brás' },
        11: { 1: 'Luz', 3: 'Brás', 4: 'Luz', 10: 'Brás', 12: 'Brás' },
        12: { 3: 'Brás', 10: 'Brás', 11: 'Brás', 13: 'Engenheiro Goulart' },
        13: { 12: 'Engenheiro Goulart' },
        15: { 2: 'Vila Prudente' }
    },

    // Ordem oficial das linhas para cálculo de sentido (S1 vs S2)
    // S1 = Do fim do array para o início (Ex L1: Jabaquara para Tucuruvi)
    // S2 = Do início do array para o fim (Ex L1: Tucuruvi para Jabaquara)
    ordemL1: ["TUC", "PIG", "JPA", "SAN", "CDU", "TTE", "PPQ", "TRD", "LUZ", "BTO", "PSE", "LIB", "JQM", "VGO", "PSO", "ANR", "VMN", "SCZ", "ARV", "SAU", "JUD", "CON", "JAB"],
    ordemL3: ["ITQ", "ART", "PCA", "VPA", "VTD", "PEN", "CAR", "TAT", "BEL", "BRE", "BAS", "PDS", "PSE", "GBU", "REP", "CEC", "DEO", "BFU"],

    estacoes: {
        /* ==================== LINHA 1 AZUL ==================== */
        "TUC": { 
            linha: 1, mapeada: true, nome: "Tucuruvi", lat: -23.4804, lng: -46.6038,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "TUCS1E43,TUCS1F23,TUCS1F34,TUCS1F52", dbS2: "" 
        },
        "PIG": { 
            linha: 1, mapeada: true, nome: "Parada Inglesa", lat: -23.4877, lng: -46.6080,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "PIGS1E41,PIGS1F51", dbS2: "PIGS2E48,PIGS2F58" 
        },
        "JPA": { 
            linha: 1, mapeada: true, nome: "Jardim São Paulo-Ayrton Senna", lat: -23.4922, lng: -46.6166,
            embS1: 'e', desS1: 'e', embS2: 'e', desS2: 'e', 
            dbS1: "JPAS1E35,JPAS1F37,JPAS1F45,JPAS1R45-I,JPAS1R45-O", dbS2: "JPAS2E34,JPAS2F44,JPAS2F32,JPAS2R44-I,JPAS2R44-O" 
        },
        "SAN": { 
            linha: 1, mapeada: true, nome: "Santana", lat: -23.5026, lng: -46.6250,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "SANS1E34,SANS1F32,SANS1F44,SANS1R32-I,SANS1R44-I,SANS1R32-O,SANS1R44-O", dbS2: "SANS2E48,SANS2F37,SANS2F45,SANS2R37-I,SANS2R45-I,SANS2R37-O,SANS2R45-O" 
        },
        "CDU": { 
            linha: 1, mapeada: true, nome: "Carandiru", lat: -23.5096, lng: -46.6249,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "CDUS1E33,CDUS1F33,CDUS1R33-I,CDUS1R33-O", dbS2: "CDUS2E36,CDUS2F36,CDUS2R36-I,CDUS2R36-O" 
        },
        "TTE": { 
            linha: 1, mapeada: true, nome: "Portuguesa-Tietê", lat: -23.5165, lng: -46.6251,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "TTES1E43,TTES1F43,TTES1R43-I,TTES1R43-O", dbS2: "TTES2E46,TTES2F46,TTES2R46-I,TTES2R46-O" 
        },
        "PPQ": { 
            linha: 1, mapeada: true, nome: "Armênia", lat: -23.5254, lng: -46.6261,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "PPQS1E63,PPQS1F64,PPQS1F11", dbS2: "PPQS2E66,PPQS2F18,PPQS2F65" 
        },
        "TRD": { 
            linha: 1, mapeada: true, nome: "Tiradentes", lat: -23.5312, lng: -46.6315,
            embS1: 'e', desS1: 'e', embS2: 'e', desS2: 'e', 
            dbS1: "TRDS1E47,TRDS1F68,TRDS1F15,TRDS1R68-I,TRDS1R47-O,TRDS1R15-O", dbS2: "TRDS2E42,TRDS2F14,TRDS2F61,TRDS2R61-I,TRDS2R14-O,TRDS2R42-O" 
        },
        "LUZ": { 
            linha: 1, mapeada: true, nome: "Luz", lat: -23.5385, lng: -46.6360,
            embS1: 'd', desS1: 'e', embS2: 'e', desS2: 'd', 
            dbS1: "", dbS2: "LUZS2F46,LUZS2F25,LUZS2R57-O,LUZS2R25-O,LUZS2R28-O" 
        }, 
        "BTO": { 
            linha: 1, mapeada: true, nome: "São Bento", lat: -23.5434, lng: -46.6333,
            embS1: 'e', desS1: 'e', embS2: 'd', desS2: 'd', 
            dbS1: "BTOS1E38,BTOS1F45,BTOS1R68-I,BTOS1R38-I,BTOS1R55-O,BTOS1R38-O", dbS2: "BTOS2E36,BTOS2F37,BTOS2R37-I,BTOS2R37-O" 
        },
        "PSE": { 
            linha: 1, mapeada: true, nome: "Sé", lat: -23.5492, lng: -46.6334,
            embS1: 'd', desS1: 'e', embS2: 'd', desS2: 'e', 
            dbS1: "PSES1F16-T3,PSES1R27-T3", dbS2: "PSES2F13-T3,PSES2R22-T3" 
        },
        "LIB": { 
            linha: 1, mapeada: true, nome: "Japão-Liberdade", lat: -23.5555, lng: -46.6359,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "LIBS1E31,LIBS1F23,LIBS1R52-I,LIBS1R23-O,LIBS1R52-O", dbS2: "LIBS2E38,LIBS2F57,LIBS2R26-I,LIBS2R57-O,LIBS2R26-O" 
        },
        "JQM": { 
            linha: 1, mapeada: true, nome: "São Joaquim", lat: -23.5618, lng: -46.6388,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "JQMS1E31,JQMS1F51,JQMS1R51-I,JQMS1R21-O", dbS2: "JQMS2E38,JQMS2F45,JQMS2R28-O" 
        },
        "VGO": { 
            linha: 1, mapeada: true, nome: "Vergueiro", lat: -23.5689, lng: -46.6397,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "VGOS1E42,VGOS1F23,VGOS1F52,VGOS1R52-I,VGOS1R23-O", dbS2: "VGOS2E47,VGOS2F57,VGOS2F26,VGOS2R26-I,VGOS2R57-O" 
        },
        "PSO": { 
            linha: 1, mapeada: true, nome: "Paraíso", lat: -23.5759, lng: -46.6414,
            embS1: 'e', desS1: 'e', embS2: 'd', desS2: 'd', 
            dbS1: "PSOS1E35,PSOS1F47,PSOS1F55,PSOS1F67-T2,PSOS1F58,PSOS1F38,PSOS1R55-I,PSOS1R58-I,PSOS1R47-I,PSOS1R38-I,PSOS1R58-O,PSOS1R47-O,PSOS1R37-T2", dbS2: "" 
        },
        "ANR": { 
            linha: 1, mapeada: true, nome: "Ana Rosa", lat: -23.5813, lng: -46.6383,
            embS1: 'e', desS1: 'e', embS2: 'e', desS2: 'e', 
            dbS1: "ANRS1E48,ANRS1F45,ANRS1F15,ANRS1R26-I,ANRS1R45-O,ANRS1R36-O", dbS2: "ANRS2E41,ANRS2F14,ANRS2F44,ANRS2R23-I,ANRS2R33-O,ANRS2R44-O" 
        },
        "VMN": { 
            linha: 1, mapeada: true, nome: "Vila Mariana", lat: -23.5894, lng: -46.6346,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "VMNS1E33,VMNS1F23,VMNS1F52,VMNS1R52-I,VMNS1R23-O", dbS2: "VMNS2E36,VMNS2F26,VMNS2F57,VMNS2R26-I,VMNS2R57-O" 
        },
        "SCZ": { 
            linha: 1, mapeada: true, nome: "Santa Cruz", lat: -23.5989, lng: -46.6366,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "SCZS1E31,SCZS1E14-T5,SCZS1F44,SCZS1F22,SCZS1R44-I,SCZS1R41-I,SCZS1R11-I,SCZS1R41-O,SCZS1R22-O,SCZS1R12-O", dbS2: "SCZS2E38,SCZS2F45,SCZS2F28,SCZS2R28-I,SCZS2R45-O,SCZS2R17-T5" 
        },
        "ARV": { 
            linha: 1, mapeada: true, nome: "Praça da Árvore", lat: -23.6106, lng: -46.6378,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "ARVS1F52", dbS2: "" 
        },
        "SAU": { 
            linha: 1, mapeada: true, nome: "Saúde-Ultrafarma", lat: -23.6172, lng: -46.6343,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', 
            dbS1: "SAUS1E51,SAUS1F53", dbS2: "SAUS2E58,SAUS2F56,SAUS2R56-O" 
        },
        "JUD": { 
            linha: 1, nome: "São Judas", lat: -23.6253, lng: -46.6394,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', dbS1: "", dbS2: "" 
        },
        "CON": { 
            linha: 1, nome: "Conceição", lat: -23.6362, lng: -46.6411,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', dbS1: "", dbS2: "" 
        },
        "JAB": { 
            linha: 1, nome: "Jabaquara", lat: -23.6470, lng: -46.6395,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd', dbS1: "", dbS2: "" 
        },

        /* ==================== LINHA 3 VERMELHA ==================== */
        "ITQ":{
            linha:3, mapeada:true, nome:"Corinthians-Itaquera", lat:-23.5424, lng:-46.4735,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd',
            dbS1: "", dbS2: "ITQS2E11,ITQS2F44,ITQS2F31,ITQS2R44-I,ITQS2R54-I,ITQS2R31-O,ITQS2R21-I,ITQS2R21-O"
        },
        "ART":{
            linha:3, mapeada:true, nome:"Artur Alvim", lat:-23.5404, lng:-46.4845,
            embS1: 'e', desS1: 'e', embS2: 'e', desS2: 'e',
            dbS1: "ARTS1E64,ARTS1F24,ARTS1F33,ARTS1R24-O,ARTS1R33-I,ARTS1R43-O", dbS2: "ARTS2E65,ARTS2F25,ARTS2F36,ARTS2R25-O,ARTS2R36-I,ARTS2R47-O"
        },
        "PCA":{
            linha:3, mapeada:true, nome:"Patriarca-Vila Ré", lat:-23.5311, lng:-46.5015,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd',
            dbS1: "PCAS1E11,PCAS1F44,PCAS1R34-I,PCAS1R34-O,PCAS1R31-I,PCAS1R31-O", dbS2: "PCAS2E18,PCAS2F45,PCAS2R35-I,PCAS2R35-O,PCAS2R38-I,PCAS2R38-O"
        },
        "VPA":{linha:3, nome:"Guilhermina-Esperança", lat:-23.5293, lng:-46.5168},
        "VTD":{linha:3, nome:"Vila Matilde", lat:-23.5317, lng:-46.5309},
        "PEN":{linha:3, nome:"Penha-Lojas Besni", lat:-23.5332, lng:-46.5398},
        "CAR":{linha:3, nome:"Carrão-Assaí Atacadista", lat:-23.5350, lng:-46.5641},
        "TAT":{
            linha:3, mapeada:true, nome:"Tatuapé (Espanhola)", lat:-23.5398, lng:-46.5768,
            embS1: 'd', desS1: 'e', embS2: 'e', desS2: 'd',
            dbS1: "TATS1F35,TATS1F18,TATS1R55-I,TATS1R45-I,TATS1R15-I", dbS2: "TATS2F11,TATS2F44,TATS2R53-I,TATS2R33-I,TATS2R14-I"
        },
        "BEL":{linha:3, nome:"Belém", lat:-23.5431, lng:-46.5898},
        "BRE":{linha:3, nome:"Bresser-Mooca", lat:-23.5463, lng:-46.6067},
        "BAS":{
            linha:3, mapeada:true, nome:"Brás (Espanhola)", lat:-23.5471, lng:-46.6164,
            embS1: 'd', desS1: 'e', embS2: 'e', desS2: 'd',
            dbS1: "BASS1F44,BASS1R48-O,BASS1R28-I", dbS2: "BASS2F31,BASS2R21-O,BASS2R31-I,BASS2R41-I"
        },
        "PDS":{linha:3, nome:"Pedro II", lat:-23.5498, lng:-46.6258},
        "GBU":{linha:3, nome:"Anhangabaú", lat:-23.5478, lng:-46.6385},
        "REP":{
            linha:3, mapeada:true, nome:"República", lat:-23.5439, lng:-46.6425,
            embS1: 'd', desS1: 'e', embS2: 'e', desS2: 'd',
            dbS1: "REPS1E55,REPS1F62,REPS1R54-O,REPS1R41-O", dbS2: "REPS2E68,REPS2F42,REPS2R53-O,REPS2R44-O,REPS2R32-O"
        },
        "CEC":{
            linha:3, mapeada:true, nome:"Santa Cecília", lat:-23.5384, lng:-46.6492,
            embS1: 'd', desS1: 'd', embS2: 'd', desS2: 'd',
            dbS1: "CECS1E48,CECS1F58,CECS1F38", dbS2: ""
        },
        "DEO":{
            linha:3, mapeada:true, nome:"Marechal Deodoro", lat:-23.5328, lng:-46.6558,
            embS1: 'e', desS1: 'e', embS2: 'd', desS2: 'd',
            dbS1: "DEOS1E37,DEOS1F28,DEOS1F45,DEOS1R28-O,DEOS1R45-I", dbS2: ""
        },
        "BFU":{linha:3, nome:"Palmeiras-Barra Funda", lat:-23.5256, lng:-46.6640}
    },

    dicionario: {
        'pt': { modTitle: 'Aviso: Acessibilidade e Direitos', btnEntrarSplash: 'Entrar no Guia', btnVoltarApp: '⬅ Voltar para PORTA CERTA SP', lblPref: 'Sua preferência de saída no destino final:', optElevador: 'Elevador', optRolante: 'Escada Rolante', optFixa: 'Escada Fixa', titleOrigem: '📍 PONTO DE PARTIDA', titleDestino: '🏁 DESTINO FINAL', selLinhaOr: 'Escolha a Linha', selLinhaDest: 'Escolha a Linha', selEstOr: 'Primeiro, escolha a linha', selEstDest: 'Primeiro, escolha a linha', selEstAtivo: 'Agora, escolha a estação', listTitle: 'Estações Mapeadas', listDesc: 'A precisão de portas já funciona nestas estações:', mesmaEstacao: 'Você já está na estação de destino.', trecho: 'Trecho', emBreve: '(Em breve)', l1: 'L1-Azul', l2: 'L2-Verde', l3: 'L3-Vermelha', l4: 'L4-Amarela', l5: 'L5-Lilás', l7: 'L7-Rubi', l8: 'L8-Diamante', l9: 'L9-Esmeralda', l10: 'L10-Turquesa', l11: 'L11-Coral', l12: 'L12-Safira', l13: 'L13-Jade', l15: 'L15-Prata', embTrecho: 'Em {est} (Sentido {sentido}), posicione-se na:', transfTrecho: 'Desembarque em {est} e faça transferência para a {linha}.', saidaFinal: 'No destino (<b>{est}</b>), você sairá de frente para a {tipo}.', tipoElevador: 'porta do elevador', tipoRolante: 'escada rolante', tipoFixa: 'escada fixa', pendente: 'A estação selecionada ainda não foi mapeada.', txtPorta: 'Porta', txtVagao: 'Vagão', accTitle: 'Direito à Acessibilidade', accBtnFala: 'Registrar Cobrança no FALA.SP', accBtnClose: 'Entendi', txtInexistente: 'Equipamento inexistente nesta estação.', gpsBtn: '🎯 Perto de mim', gpsBusca: '⏳ Buscando...', gpsFeito: '🎯 Feito!', gpsErro: '❌ Sem estações', freqUsadas: 'Mais Usadas', freqTodas: 'Todas as Estações', avisoRota: 'Sobre esta rota', avisoRotaTexto: 'O foco deste trajeto é garantir sua acessibilidade nas estações. Pode não ser o caminho mais rápido.', btnCalc: 'Qual é a Porta Certa?', configTitle: 'Configurações', setTut: 'Como usar o Guia', setMap: 'Estações Mapeadas', setFont: 'Tamanho da Letra', modoClaro: 'Modo Claro', modoEscuro: 'Modo Escuro', setLang: 'Idioma / Language' }
    }
};
