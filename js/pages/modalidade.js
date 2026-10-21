import { api } from '../api.js';
import { renderPublicHeader, renderPublicFooter } from '../components.js';
import {
  escapeHtml, statusBadgeHtml, getQueryParam, medalhaBadgeHtml, splitCompetidores, AREAS, areaDaModalidade,
} from '../utils.js';
import { iconeSvg } from '../icons.js';

renderPublicHeader();
renderPublicFooter();

const id = getQueryParam('id');
const topo = document.getElementById('modalidade-topo');
const container = document.getElementById('modalidade-content');

async function carregarDescricaoExtra(codigo) {
  try {
    const res = await fetch('assets/descricao/descricao.json');
    const data = await res.json();
    return (data.modalidades || []).find((m) => m.codigo === codigo) || null;
  } catch (err) {
    return null;
  }
}

if (!id) {
  topo.innerHTML = '<div class="empty-state">Modalidade não informada.</div>';
} else {
  api.get(`/modalidades/${id}`).then(async (m) => {
    const extra = await carregarDescricaoExtra(m.codigo);
    render(m, extra);
  }).catch(() => {
    topo.innerHTML = '<div class="empty-state">Não foi possível carregar esta modalidade.</div>';
  });
}

function render(m, extra) {
  const cta = m.status === 'inscricoes_abertas'
    ? `<a class="btn btn-primary mt-24" href="inscricao.html?modalidadeId=${m.id}">Inscreva-se nesta modalidade</a>`
    : `<p class="text-sm mt-24" style="color:var(--texto-secundario)">As inscrições para esta modalidade não estão abertas no momento.</p>`;

  const descricao = extra?.descricao || m.descricao;

  // Topo na faixa colorida, com a cor da área da modalidade (ver AREAS em utils.js).
  const area = areaDaModalidade(m.codigo);
  if (area) document.getElementById('modalidade-faixa').dataset.area = area;

  topo.innerHTML = `
    <div class="flex gap-24 flex-wrap" style="align-items:flex-start">
      <div style="width:360px;max-width:100%;flex-shrink:0">
        ${m.imagemUrl
          ? `<img class="thumb" style="border-radius:20px" src="${escapeHtml(m.imagemUrl)}" alt="${escapeHtml(m.nome)}" />`
          : `<div class="thumb icone-branco" style="border-radius:20px">${iconeSvg('wrench')}</div>`}
      </div>
      <div style="flex:1;min-width:260px">
        <div class="text-sm" style="font-weight:700;color:var(--ac)">#${escapeHtml(m.codigo)}${area ? ` · ${escapeHtml(AREAS[area].nome)}` : ''}</div>
        <h1 class="mt-8" style="font-size:2rem">${escapeHtml(m.nome)}</h1>
        <div class="mt-16">${statusBadgeHtml(m.status)}</div>
        ${m.treinadorNome ? `<div class="mt-16 text-sm">${iconeSvg('user')} Treinador: ${escapeHtml(m.treinadorNome)}</div>` : ''}
        ${cta}
      </div>
    </div>
  `;

  container.innerHTML = `
    ${descricao ? `
      <div class="mt-32">
        <h2 style="font-size:1.4rem">Descrição</h2>
        <p class="mt-8">${escapeHtml(descricao)}</p>
        ${extra ? `
          <div class="flex gap-8 flex-wrap mt-16">
            ${extra.categoria ? `<span class="chip" style="cursor:default">${escapeHtml(extra.categoria)}</span>` : ''}
            ${extra.idade_maxima_mundial ? `<span class="chip" style="cursor:default">Idade máxima no mundial: ${extra.idade_maxima_mundial} anos</span>` : ''}
          </div>
          ${extra.fonte_url ? `<a href="${escapeHtml(extra.fonte_url)}" target="_blank" rel="noopener" class="text-sm mt-16" style="display:inline-block;color:var(--dourado-claro);font-weight:600">Saiba mais no WorldSkills ${iconeSvg('chevronRight')}</a>` : ''}
        ` : ''}
      </div>` : ''}

    ${m.competidores && m.competidores.length ? `
      <div class="mt-32">
        <h2 style="font-size:1.4rem">Histórico de competidores</h2>
        <div class="mt-16">
          ${m.competidores.map((c) => `
            <div class="list-row">
              ${c.fotoUrl
                ? `<img class="avatar" src="${escapeHtml(c.fotoUrl)}" alt="${escapeHtml(c.nome)}" />`
                : `<div class="avatar flex-center icone-branco">${iconeSvg('user')}</div>`}
              <div class="info">
                <h4>${escapeHtml(c.nome)}</h4>
                <div class="text-sm text-muted">${c.ano ? `Participação em ${c.ano}` : 'Ano não informado'}</div>
              </div>
              ${c.conquistas ? `<span class="badge" style="background:var(--dourado-suave);color:var(--dourado-claro);flex-shrink:0">${iconeSvg('medal')}${escapeHtml(c.conquistas)}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>` : ''}

    ${m.linhaDoTempo && m.linhaDoTempo.length ? `
      <div class="mt-32">
        <h2 style="font-size:1.4rem">Linha do tempo desta modalidade</h2>
        <p class="text-sm mt-8" style="color:var(--texto-secundario)">Todo o histórico de participações do SENAI Brás nesta modalidade, ciclo a ciclo. Sem fotos disponíveis para esses registros — ícone padrão.</p>
        <div class="mt-16">
          ${m.linhaDoTempo.flatMap((e) => {
            const nomes = splitCompetidores(e.competidor);
            const linhas = nomes.length ? nomes : [null];
            return linhas.map((nome) => `
              <div class="list-row">
                <div class="avatar flex-center icone-branco">${iconeSvg('user')}</div>
                <div class="info">
                  <h4>${nome ? escapeHtml(nome) : 'Sem classificação'}</h4>
                  <div class="text-sm text-muted">${escapeHtml(e.ciclo.replace(/[()]/g, ''))} · ${escapeHtml(e.etapa)}</div>
                </div>
                ${medalhaBadgeHtml(e.medalha) ? `<span style="flex-shrink:0">${medalhaBadgeHtml(e.medalha)}</span>` : ''}
              </div>
            `);
          }).join('')}
        </div>
      </div>` : ''}

    ${m.projetos && m.projetos.length ? `
      <div class="mt-32">
        <h2 style="font-size:1.4rem">Projetos</h2>
        <div class="grid grid-3 mt-16">
          ${m.projetos.map((p) => `
            <div class="card">
              ${p.imagemUrl ? `<img class="thumb" src="${escapeHtml(p.imagemUrl)}" alt="${escapeHtml(p.titulo)}" />` : `<div class="thumb icone-branco">${iconeSvg('folder')}</div>`}
              <div class="card-body">
                <strong>${escapeHtml(p.titulo)}</strong>
                ${p.descricao ? `<p class="text-sm mt-8">${escapeHtml(p.descricao)}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
  `;
}
