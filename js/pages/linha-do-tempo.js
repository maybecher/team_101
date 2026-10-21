import { api } from '../api.js?v=202610211453';
import { renderPublicHeader, renderPublicFooter } from '../components.js?v=202610211453';
import {
  escapeHtml, MEDALHA_ICON, MEDALHA_BADGE_CLASS, medalhaBadgeHtml, splitCompetidores, bandeiraHtml,
} from '../utils.js?v=202610211453';
import { iconeSvg } from '../icons.js?v=202610211453';
import { revelarAoRolar, contarAoAparecer, animarLinhasDoTempo } from '../animacoes.js?v=202610211453';

renderPublicHeader();
renderPublicFooter();
revelarAoRolar();

// Estadual é sempre São Paulo — a FlagsAPI só tem bandeiras de país, então o estado
// continua com o arquivo local. Nacional é sempre Brasil, já coberto pelo mapa de países
// (ver bandeiraHtml/PAIS_PARA_CODIGO em utils.js). Américas e Mundial variam de sede a
// cada ciclo, então mostram a bandeira do país daquele evento específico (campo `pais`).
const ESTADUAL_FLAG_HTML = '<img class="etapa-flag" src="assets/bandeiras/sao-paulo.svg" alt="Bandeira de São Paulo" />';

function iconeEtapa(evento) {
  const conteudo = evento.tipoEtapa === 'Estadual' ? ESTADUAL_FLAG_HTML : bandeiraHtml(evento.pais || 'Brasil');
  return `<span class="etapa-icone">${conteudo}</span>`;
}

const TIPO_ETAPA_ORDEM = ['Estadual', 'Nacional', 'Américas', 'Mundial'];
const MEDALHA_ORDEM = ['Ouro', 'Prata', 'Bronze', 'Excelência'];

const statsEl = document.getElementById('linha-do-tempo-stats');
const listaEl = document.getElementById('linha-do-tempo-lista');
const buscaEl = document.getElementById('lt-busca');
const filtroEtapaEl = document.getElementById('lt-filtro-etapa');
const filtroMedalhaEl = document.getElementById('lt-filtro-medalha');
const limparEl = document.getElementById('lt-limpar-filtros');

let ciclos = [];
// Preenche as linhas conforme a rolagem; refeito a cada render (filtros mudam a lista).
let atualizarLinhas = () => {};

api.get('/linha-do-tempo').then((eventos) => {
  ciclos = agruparPorCiclo(eventos);
  montarFiltros(eventos);
  renderStats(eventos);
  contarAoAparecer(statsEl.querySelectorAll('.stat-value'));
  render();
  atualizarLinhas = animarLinhasDoTempo(listaEl);
}).catch(() => {
  statsEl.innerHTML = '';
  listaEl.innerHTML = '<div class="empty-state">Não foi possível carregar a linha do tempo agora.</div>';
});

/** "(2024-2026)" -> {inicio:2024, fim:2026}; "1995" -> {inicio:1995, fim:1995}. */
function parseRangeCiclo(ciclo) {
  const range = ciclo.match(/\((\d{4})-(\d{4})\)/);
  if (range) return { inicio: Number(range[1]), fim: Number(range[2]) };
  const anoUnico = ciclo.match(/^(\d{4})$/);
  if (anoUnico) return { inicio: Number(anoUnico[1]), fim: Number(anoUnico[1]) };
  return null;
}

function agruparPorCiclo(eventos) {
  const grupos = [];
  const porCiclo = new Map();
  eventos.forEach((evento) => {
    if (!porCiclo.has(evento.ciclo)) {
      const grupo = { ciclo: evento.ciclo, eventos: [] };
      porCiclo.set(evento.ciclo, grupo);
      grupos.push(grupo);
    }
    porCiclo.get(evento.ciclo).eventos.push(evento);
  });
  // Sempre Estadual → Nacional → Américas → Mundial dentro do ciclo — itens adicionados
  // depois pelo admin têm `ordem` mais alta e bagunçariam a sequência sem isso.
  grupos.forEach((grupo) => {
    grupo.eventos.sort((a, b) => {
      const diff = TIPO_ETAPA_ORDEM.indexOf(a.tipoEtapa) - TIPO_ETAPA_ORDEM.indexOf(b.tipoEtapa);
      return diff !== 0 ? diff : a.ordem - b.ordem;
    });
  });
  // Mais novo primeiro, pelo ANO real do ciclo — não por `ordem` (que reflete só a ordem
  // de criação dos registros: um ciclo com muitos resultados já cadastrados acaba com
  // `ordem` maior que um ciclo futuro recém-criado, bagunçando a ordem cronológica).
  grupos.sort((a, b) => {
    const ra = parseRangeCiclo(a.ciclo);
    const rb = parseRangeCiclo(b.ciclo);
    return (rb ? rb.fim : -Infinity) - (ra ? ra.fim : -Infinity);
  });
  return grupos;
}

function montarFiltros(eventos) {
  const tiposPresentes = TIPO_ETAPA_ORDEM.filter((t) => eventos.some((e) => e.tipoEtapa === t));
  filtroEtapaEl.innerHTML = '<option value="">Todas as etapas</option>'
    + tiposPresentes.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');

  const medalhasPresentes = Object.keys(MEDALHA_ICON).filter((m) => eventos.some((e) => e.medalha === m));
  filtroMedalhaEl.innerHTML = '<option value="">Todas as medalhas</option>'
    + medalhasPresentes.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');

  [buscaEl, filtroEtapaEl, filtroMedalhaEl].forEach((el) => el.addEventListener('input', render));
  limparEl.addEventListener('click', () => {
    buscaEl.value = '';
    filtroEtapaEl.value = '';
    filtroMedalhaEl.value = '';
    render();
  });
}

function renderStats(eventos) {
  const contagem = { Ouro: 0, Prata: 0, Bronze: 0, Excelência: 0 };
  eventos.forEach((e) => { if (contagem[e.medalha] !== undefined) contagem[e.medalha] += 1; });

  statsEl.innerHTML = Object.keys(contagem).map((medalha) => `
    <div class="stat-card">
      <div class="stat-icon">${MEDALHA_ICON[medalha]}</div>
      <div class="stat-value">${contagem[medalha]}</div>
      <div class="stat-label">${escapeHtml(medalha)}</div>
    </div>
  `).join('');
}

/** Prévia no cabeçalho do ciclo, antes de expandir — só a bandeira do país sede
 * do Mundial daquele ciclo (o evento que define onde o ciclo "aconteceu"). */
function cicloBandeirasHtml(eventosDoCiclo) {
  const mundial = eventosDoCiclo.find((e) => e.tipoEtapa === 'Mundial');
  return mundial ? bandeiraHtml(mundial.pais) : '';
}

// Título do ciclo = a etapa Mundial daquele ciclo (ex: "Mundial - WorldSkills Xanghai
// 2026" vira "Ciclo WorldSkills Xanghai - 2026"); os anos entre parênteses (grupo.ciclo)
// viram subtítulo em vez de título, já que sozinhos não dizem qual foi a competição.
function tituloCiclo(eventosDoCiclo) {
  const mundial = eventosDoCiclo.find((e) => e.tipoEtapa === 'Mundial');
  if (!mundial) return 'Ciclo';
  const nome = mundial.etapa.replace(/^Mundial\s*-\s*/, '');
  return `Ciclo ${nome.replace(/\s+(\d{4})$/, ' - $1')}`;
}

function resumoMedalhasHtml(eventos) {
  const contagem = {};
  eventos.forEach((e) => { if (e.medalha) contagem[e.medalha] = (contagem[e.medalha] || 0) + 1; });
  return MEDALHA_ORDEM
    .filter((medalha) => contagem[medalha])
    .map((medalha) => `<span class="badge ${MEDALHA_BADGE_CLASS[medalha] || ''}">${MEDALHA_ICON[medalha] || ''}${contagem[medalha]}</span>`)
    .join('');
}

// Cada linha de `eventos` hoje é um resultado (etapa + medalha + modalidade + competidor),
// então uma mesma competição (ex: "São Paulo Skills 2024") aparece uma vez por competidor.
// Agrupamos aqui pra virar um único card por competição, com a lista de resultados dentro.
function agruparPorEtapa(eventos) {
  const grupos = [];
  const porChave = new Map();
  eventos.forEach((evento) => {
    const chave = `${evento.tipoEtapa}||${evento.etapa}`;
    if (!porChave.has(chave)) {
      const grupo = { chave, etapa: evento.etapa, tipoEtapa: evento.tipoEtapa, itens: [] };
      porChave.set(chave, grupo);
      grupos.push(grupo);
    }
    porChave.get(chave).itens.push(evento);
  });
  return grupos;
}

function render() {
  const busca = buscaEl.value.trim().toLowerCase();
  const tipoEtapa = filtroEtapaEl.value;
  const medalha = filtroMedalhaEl.value;
  const temFiltro = Boolean(busca || tipoEtapa || medalha);

  const gruposVisiveis = ciclos.map((grupo) => {
    const eventosFiltrados = grupo.eventos.filter((e) => {
      if (tipoEtapa && e.tipoEtapa !== tipoEtapa) return false;
      if (medalha && e.medalha !== medalha) return false;
      if (busca) {
        const alvo = `${e.competidor || ''} ${e.modalidade || ''}`.toLowerCase();
        if (!alvo.includes(busca)) return false;
      }
      return true;
    });
    return { ...grupo, eventosFiltrados };
  }).filter((grupo) => !temFiltro || grupo.eventosFiltrados.length > 0);

  if (gruposVisiveis.length === 0) {
    listaEl.innerHTML = `<div class="empty-state"><div class="icon icone-branco">${iconeSvg('search')}</div>Nenhum resultado para esses filtros.</div>`;
    return;
  }

  listaEl.innerHTML = `
    <div class="timeline">
      ${gruposVisiveis.map((grupo) => {
        const eventosExibidos = temFiltro ? grupo.eventosFiltrados : grupo.eventos;
        return `
        <div class="timeline-node">
          <div class="timeline-dot-col">
            <div class="timeline-dot"></div>
            <div class="timeline-line"></div>
          </div>
          <details class="card timeline-card" ${temFiltro ? 'open' : ''}>
            <summary>
              <span class="ciclo-titulos">
                <span class="ciclo-label">${escapeHtml(tituloCiclo(grupo.eventos))}</span>
                <span class="ciclo-subtitulo">${escapeHtml(grupo.ciclo.replace(/[()]/g, ''))}</span>
              </span>
              <span class="ciclo-bandeiras">${cicloBandeirasHtml(grupo.eventos)}</span>
              <span class="ciclo-arrow">${iconeSvg('chevronDown')}</span>
              <span class="ciclo-resumo">${resumoMedalhasHtml(grupo.eventos)}</span>
            </summary>
            <div class="timeline-etapas">
              ${agruparPorEtapa(eventosExibidos).map((competicao) => {
                const representante = competicao.itens[0];
                // Eventos futuros (ainda não disputados) ou sem detalhe de competidor não
                // entram na contagem nem viram linha de resultado — só os que já têm nome.
                const totalCompetidores = competicao.itens
                  .reduce((soma, e) => soma + splitCompetidores(e.competidor).length, 0);

                const ordemMedalha = (e) => (e.medalha ? MEDALHA_ORDEM.indexOf(e.medalha) : MEDALHA_ORDEM.length);
                const itensOrdenados = [...competicao.itens].sort(
                  (a, b) => ordemMedalha(a) - ordemMedalha(b),
                );
                const resultadosHtml = itensOrdenados.flatMap((e) => {
                  const nomes = splitCompetidores(e.competidor);
                  return nomes.map((nome) => `
                    <div class="etapa-resultado-item">
                      <div class="etapa-resultado-texto">
                        ${medalhaBadgeHtml(e.medalha)}
                        ${nome ? `<strong>${escapeHtml(nome)}</strong>` : ''}
                        ${e.modalidade ? `<span>${escapeHtml(e.modalidade)}</span>` : ''}
                      </div>
                    </div>
                  `);
                }).join('');

                return `
                <div class="timeline-etapa">
                  <div class="etapa-competicao-header">
                    <div class="etapa-nome">${iconeEtapa(representante)}${escapeHtml(competicao.etapa)}</div>
                    ${totalCompetidores > 0 ? `
                    <div class="etapa-competicao-resumo">
                      <span class="etapa-competidores-count">${totalCompetidores} competidor${totalCompetidores === 1 ? '' : 'es'}</span>
                      ${resumoMedalhasHtml(competicao.itens)}
                    </div>
                    ` : ''}
                  </div>
                  ${resultadosHtml ? `<div class="etapa-resultados">${resultadosHtml}</div>` : ''}
                </div>
              `;
              }).join('')}
            </div>
          </details>
        </div>
      `;
      }).join('')}
    </div>
  `;
  atualizarLinhas();
}
