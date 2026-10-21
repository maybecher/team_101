import { api } from '../api.js?v=202610211416';
import { renderPublicHeader, renderPublicFooter } from '../components.js?v=202610211416';
import {
  escapeHtml, statusBadgeHtml, GALERIA_CATEGORIA_LABELS, GALERIA_CATEGORIAS_ORDEM, pareceNomeFeminino, formatDate,
  AREAS, areaDaModalidade,
} from '../utils.js?v=202610211416';
import { iconeSvg } from '../icons.js?v=202610211416';
import { revelarAoRolar, prepararCardsDeAtleta, reduzMovimento } from '../animacoes.js?v=202610211416';

renderPublicHeader();
renderPublicFooter();
revelarAoRolar();

const BENEFICIOS = [
  ['graduationCap', 'Aprendizado além da sala de aula'],
  ['cog', 'Contato com tecnologias reais'],
  ['trendingUp', 'Desenvolvimento profissional'],
  ['handshake', 'Networking'],
  ['trophy', 'Experiência em competições estaduais, nacionais e mundiais'],
  ['flag', 'Representar a escola e o Brasil'],
  ['fileText', 'Currículo diferenciado'],
];

document.getElementById('beneficios-grid').innerHTML = BENEFICIOS.map(
  ([icone, texto]) => `
    <div style="background:var(--cinza-claro);border-radius:14px;padding:18px;">
      <div style="font-size:1.4rem" class="icone-dourado">${iconeSvg(icone)}</div>
      <div class="mt-8" style="font-weight:600;color:var(--texto-primario)">${escapeHtml(texto)}</div>
    </div>`
).join('');

const FAQ = [
  ['Preciso ser o melhor aluno da turma?', 'Não. O mais importante é interesse, dedicação e vontade de aprender. As habilidades técnicas são desenvolvidas ao longo dos treinamentos.'],
  ['Preciso ter experiência prévia?', 'Não é obrigatório. Cada modalidade tem um período de treinamento para desenvolver as competências necessárias antes das competições.'],
  ['Quanto tempo dura a preparação?', 'Varia por modalidade, mas geralmente envolve treinamentos semanais ao longo do ano letivo, com intensificação próximo às etapas classificatórias.'],
];

document.getElementById('faq-list').innerHTML = FAQ.map(
  ([pergunta, resposta], i) => `
    <div class="faq-item" data-index="${i}">
      <div class="faq-question">
        <span>${escapeHtml(pergunta)}</span>
        <span class="arrow">${iconeSvg('chevronDown')}</span>
      </div>
      <div class="faq-answer"><p class="text-sm">${escapeHtml(resposta)}</p></div>
    </div>`
).join('');

document.querySelectorAll('.faq-item').forEach((item) => {
  item.querySelector('.faq-question').addEventListener('click', () => item.classList.toggle('open'));
});

// ---------- Países sede (faixa em movimento) ----------

// A lista vem duplicada: quando a rolagem passa da metade, volta uma metade inteira e,
// como as duas metades são iguais, o loop fica contínuo. A cópia é escondida de leitores de tela.
const paisesSede = document.getElementById('paises-sede');
paisesSede.querySelectorAll('.chip').forEach((chip) => {
  const copia = chip.cloneNode(true);
  copia.setAttribute('aria-hidden', 'true');
  paisesSede.appendChild(copia);
});

// A faixa anda rolando a própria caixa (scrollLeft), e não com transform numa tira de
// 5.000+ px: no Safari do iPhone essa tira animada era desenhada só em pedaços e sumia.
const faixaPaises = paisesSede.parentElement;
if (!reduzMovimento) {
  const PX_POR_SEGUNDO = 40;
  let posicao = 0;
  let anterior = null;
  let comMouse = false;
  let comDedo = false;
  let naTela = true;

  const quadro = (agora) => {
    if (anterior !== null && !comMouse && !comDedo && naTela) {
      posicao += (PX_POR_SEGUNDO * Math.min(agora - anterior, 100)) / 1000;
      const metade = paisesSede.offsetWidth / 2;
      if (posicao >= metade) posicao -= metade;
      faixaPaises.scrollLeft = posicao;
    }
    anterior = agora;
    requestAnimationFrame(quadro);
  };
  requestAnimationFrame(quadro);

  // Pausa com o mouse em cima ou enquanto o dedo está encostado (o :hover do celular
  // fica "preso" depois de um toque, por isso o toque é tratado à parte).
  faixaPaises.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') comMouse = true; });
  faixaPaises.addEventListener('pointerleave', () => { comMouse = false; comDedo = false; });
  faixaPaises.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') comDedo = true; });
  ['pointerup', 'pointercancel'].forEach((evento) => {
    faixaPaises.addEventListener(evento, () => { comDedo = false; });
  });

  // Fora da tela não precisa andar (economiza bateria).
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entrada]) => { naTela = entrada.isIntersecting; }).observe(faixaPaises);
  }
}

// ---------- Carrossel em loop ----------

/**
 * Faz o carrossel girar sem fim: os cards são repetidos antes e depois da lista
 * original e, quando a rolagem para numa das cópias, o carrossel salta (sem animação)
 * para o card igual na lista original. Para quem vê, depois do último vem o primeiro.
 * Só entra em ação se os cards não couberem todos na tela.
 */
function loopInfinito(track, seletor) {
  // Um único "vigia" de rolagem por carrossel; a cada novo render (ex.: busca nas
  // modalidades) ele passa a medir a volta dos cards atuais, guardada em track.volta.
  if (!track.dataset.loop) {
    track.dataset.loop = 'sim';
    let parado = null;
    track.addEventListener('scroll', () => {
      clearTimeout(parado);
      parado = setTimeout(() => {
        const v = track.volta ? track.volta() : 0;
        if (!v) return;
        if (track.scrollLeft >= 2 * v - 4) track.scrollTo({ left: track.scrollLeft - v, behavior: 'instant' });
        else if (track.scrollLeft < v - 4) track.scrollTo({ left: track.scrollLeft + v, behavior: 'instant' });
      }, 150);
    }, { passive: true });
  }

  track.volta = null;
  track.scrollTo({ left: 0, behavior: 'instant' });
  const originais = [...track.querySelectorAll(seletor)];
  if (originais.length < 2 || track.scrollWidth <= track.clientWidth + 4) return;

  const copiar = (card) => {
    const copia = card.cloneNode(true);
    copia.dataset.copia = 'sim';
    copia.setAttribute('aria-hidden', 'true');
    copia.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
    return copia;
  };
  const antes = originais.map(copiar);
  track.prepend(...antes);
  track.append(...originais.map(copiar));

  // Largura de uma volta inteira, medida na hora (muda com o tamanho da tela).
  track.volta = () => originais[0].offsetLeft - antes[0].offsetLeft;
  track.scrollTo({ left: track.volta(), behavior: 'instant' });
}

// ---------- Carrossel (compartilhado) ----------

function attachCarousel(trackId, prevId, nextId, cardSelector, autoMs) {
  const track = document.getElementById(trackId);

  // Anda até o início do card seguinte (ou anterior), pela posição real de cada card.
  // Um passo fixo (largura + espaçamento) desalinhava aos poucos quando o espaçamento
  // muda com o tamanho da tela, e os cards apareciam cortados dos dois lados.
  const step = (direction) => {
    const cards = [...track.querySelectorAll(cardSelector)];
    if (cards.length === 0) return;
    const posicoes = cards.map((c) => c.offsetLeft - cards[0].offsetLeft);
    const maxScroll = track.scrollWidth - track.clientWidth;
    const atual = track.scrollLeft;
    let target;

    // Ao chegar no fim/início, o próximo clique volta ao outro extremo — mas só
    // depois de realmente exibir o último item, em vez de pular direto pra ele.
    if (direction > 0) {
      const proxima = posicoes.find((p) => p > atual + 4);
      target = atual >= maxScroll - 4 || proxima === undefined ? 0 : Math.min(proxima, maxScroll);
    } else {
      const anterior = [...posicoes].reverse().find((p) => p < atual - 4);
      target = atual <= 4 ? maxScroll : (anterior ?? 0);
    }

    track.scrollTo({ left: target, behavior: 'smooth' });
  };

  // A passagem automática só roda com o carrossel na tela: sem isso ela começava ao abrir
  // a página e, quando a pessoa chegava, já estava no meio da lista. Ela também recomeça
  // a contagem sempre que a pessoa mexe no carrossel (senão podia disparar junto com um
  // clique e as duas rolagens se atropelavam).
  let timer = null;
  let naTela = false;
  const pararAuto = () => { clearInterval(timer); timer = null; };
  const reiniciarAuto = () => {
    pararAuto();
    if (autoMs && naTela) timer = setInterval(() => step(1), autoMs);
  };

  document.getElementById(prevId).addEventListener('click', () => { step(-1); reiniciarAuto(); });
  document.getElementById(nextId).addEventListener('click', () => { step(1); reiniciarAuto(); });
  track.addEventListener('pointerdown', reiniciarAuto);
  track.addEventListener('wheel', reiniciarAuto, { passive: true });

  if (!autoMs) return;
  if (!('IntersectionObserver' in window)) { naTela = true; reiniciarAuto(); return; }
  new IntersectionObserver(([entrada]) => {
    naTela = entrada.isIntersecting;
    reiniciarAuto();
  }, { threshold: 0.5 }).observe(track);
}

// ---------- Modalidades disponíveis na escola (carrossel automático) ----------

let todasModalidades = [];

function renderModalidades() {
  const busca = document.getElementById('modalidades-busca').value.trim().toLowerCase();
  const filtradas = todasModalidades.filter((m) => !busca
    || m.nome.toLowerCase().includes(busca) || m.codigo.includes(busca.replace('#', '')));

  const grid = document.getElementById('modalidades-track');
  if (filtradas.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="icon icone-branco">${iconeSvg('search')}</div>Nenhuma modalidade encontrada.</div>`;
    return;
  }

  grid.innerHTML = filtradas.map((m) => {
    const area = areaDaModalidade(m.codigo);
    return `
    <div class="card modalidade-card" ${area ? `data-area="${area}"` : ''}>
      <a href="modalidade.html?id=${m.id}" class="modalidade-card-thumb">
        ${m.imagemUrl
          ? `<img class="thumb" src="${escapeHtml(m.imagemUrl)}" alt="${escapeHtml(m.nome)}" loading="lazy" />`
          : `<div class="thumb icone-branco">${iconeSvg('wrench')}</div>`}
        ${area ? `<span class="area-chip">${escapeHtml(AREAS[area].nome)}</span>` : ''}
      </a>
      <div class="card-body">
        <div class="text-sm modalidade-codigo">#${escapeHtml(m.codigo)}</div>
        <h3 class="mt-8" style="font-size:1.05rem"><a href="modalidade.html?id=${m.id}">${escapeHtml(m.nome)}</a></h3>
        <div class="mt-8">${statusBadgeHtml(m.status)}</div>
        <div class="modalidade-card-acoes">
          <a class="btn btn-outline btn-sm" href="modalidade.html?id=${m.id}">Saiba mais</a>
          <a class="btn btn-primary btn-sm" href="inscricao.html?modalidadeId=${m.id}">Inscrever-se</a>
        </div>
      </div>
    </div>
  `;
  }).join('');
  loopInfinito(grid, '.modalidade-card');
}

api.get('/modalidades').then((modalidades) => {
  todasModalidades = modalidades;
  renderModalidades();
}).catch(() => {
  document.getElementById('modalidades-track').innerHTML = '<div class="empty-state">Não foi possível carregar as modalidades agora.</div>';
});

document.getElementById('modalidades-busca').addEventListener('input', renderModalidades);
attachCarousel('modalidades-track', 'modalidades-prev', 'modalidades-next', '.modalidade-card', 4500);

// ---------- Competidores (carrossel automático) ----------

const atletaArea = (c) => (c.modalidade && areaDaModalidade(c.modalidade.codigo)) || '';

// Foto dos cards de competidor: código da modalidade no canto e, nos destaques
// (figurinhas do Inspire-se), a medalha.
function atletaFotoHtml(c, destaque = false) {
  return `
      <div class="atleta-foto">
        ${c.fotoUrl
          ? `<img class="thumb thumb--retrato" src="${escapeHtml(c.fotoUrl)}" alt="${escapeHtml(c.nome)}" loading="lazy" />`
          : `<div class="thumb thumb--retrato icone-branco">${iconeSvg('user')}</div>`}
        ${c.modalidade ? `<span class="atleta-codigo">#${escapeHtml(c.modalidade.codigo)}</span>` : ''}
        ${destaque ? `<span class="atleta-medalha" aria-hidden="true">${iconeSvg('medal')}</span>` : ''}
      </div>`;
}

api.get('/competidores').then((competidores) => {
  const destaqueSection = document.getElementById('destaque-mundial');
  const destaqueEl = document.getElementById('competidores-destaque');
  const track = document.getElementById('competidores-track');
  const tituloEl = document.getElementById('competidores-titulo');

  // A home só deve mostrar a equipe do ciclo mais recente — sem isso, competidores
  // antigos cadastrados no admin (histórico por ciclo) ficariam misturados aqui como
  // se fossem o time atual. O "ano" de cada um é o ano em que ele começou (ver admin
  // de competidores), então o maior valor é sempre o ciclo mais novo.
  const anosCadastrados = competidores.map((c) => c.ano).filter((a) => a != null);
  const anoAtual = anosCadastrados.length ? Math.max(...anosCadastrados) : null;
  tituloEl.textContent = anoAtual ? `Conheça a Equipe ${anoAtual}` : 'Conheça a Equipe';

  const destacados = competidores.filter((c) => c.destaque);
  const resto = competidores.filter((c) => !c.destaque && (anoAtual === null || c.ano === anoAtual));

  destaqueSection.hidden = destacados.length === 0;
  destaqueEl.innerHTML = destacados.map((c) => {
    const titulo = c.conquistas ? c.conquistas.split('·')[0].trim() : (pareceNomeFeminino(c.nome) ? 'Campeã Nacional' : 'Campeão Nacional');
    return `
    <div class="card competidor-card competidor-card--destaque atleta-card" data-area="${atletaArea(c)}">
      ${atletaFotoHtml(c, true)}
      <div class="card-body">
        <span class="badge" style="background:var(--dourado-suave);color:var(--dourado-claro)">${iconeSvg('medal')}${escapeHtml(titulo)}</span>
        <h3 class="mt-8" style="font-size:1.1rem">${escapeHtml(c.nome)}</h3>
        ${c.modalidade ? `<div class="text-sm atleta-modalidade">${escapeHtml(c.modalidade.nome)}</div>` : ''}
      </div>
    </div>
  `;
  }).join('');
  prepararCardsDeAtleta(destaqueEl);

  if (resto.length === 0) {
    track.innerHTML = `<div class="empty-state"><div class="icon icone-dourado">${iconeSvg('trophy')}</div>Em breve, os primeiros nomes da equipe.</div>`;
    return;
  }
  track.innerHTML = resto.map((c) => `
    <div class="card competidor-card" data-area="${atletaArea(c)}">
      ${atletaFotoHtml(c)}
      <div class="card-body">
        <h3 style="font-size:1.05rem">${escapeHtml(c.nome)}</h3>
        <div class="text-sm mt-8">${[c.curso, c.ano].filter(Boolean).map(escapeHtml).join(' · ')}</div>
        ${c.modalidade ? `<div class="text-sm atleta-modalidade">${escapeHtml(c.modalidade.nome)}</div>` : ''}
        ${c.conquistas ? `<div class="text-sm mt-8"><span class="icone-dourado">${iconeSvg('medal')}</span> ${escapeHtml(c.conquistas)}</div>` : ''}
        ${c.depoimento ? `<div class="text-sm mt-8" style="font-style:italic">"${escapeHtml(c.depoimento)}"</div>` : ''}
      </div>
    </div>
  `).join('');
  loopInfinito(track, '.competidor-card');
}).catch(() => {
  document.getElementById('competidores-track').innerHTML = '<div class="empty-state">Não foi possível carregar os competidores.</div>';
});
attachCarousel('competidores-track', 'competidores-prev', 'competidores-next', '.competidor-card', 4500);
attachCarousel('competidores-destaque', 'destaque-prev', 'destaque-next', '.competidor-card', 5000);

// ---------- Galeria ----------

let todaGaleria = [];
let categoriaAtiva = '';
let videoAtual = null;

function galeriaLegenda(item) {
  return item.modalidade?.nome || item.titulo || '';
}

// Ordena por modalidade em ordem alfabética — itens sem modalidade (título ou "Geral")
// caem no fim, já que localeCompare já lida bem com string vazia por último.
function ordenarPorModalidade(lista) {
  return [...lista].sort((a, b) => galeriaLegenda(a).localeCompare(galeriaLegenda(b), 'pt-BR', { sensitivity: 'base' }));
}

function galeriaItemHtml(item) {
  const legenda = galeriaLegenda(item);
  const midia = item.tipo === 'foto'
    ? `<img class="thumb lightbox-trigger" data-url="${escapeHtml(item.url)}" src="${escapeHtml(item.url)}" alt="${escapeHtml(item.titulo || '')}" style="cursor:pointer" />`
    : `<div class="thumb thumb--video">
         <video src="${escapeHtml(item.url)}" muted preload="metadata"></video>
         <span class="play-icon">${iconeSvg('play')}</span>
       </div>`;
  return `
    <div class="card">
      ${midia}
      ${legenda ? `<div class="card-body" style="padding:12px 16px"><div class="text-sm" style="font-weight:600;color:var(--texto-primario)">${escapeHtml(legenda)}</div></div>` : ''}
    </div>
  `;
}

function renderGaleria() {
  const grid = document.getElementById('galeria-grid');
  const itens = categoriaAtiva ? todaGaleria.filter((i) => i.categoria === categoriaAtiva) : todaGaleria;
  if (itens.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="icon icone-branco">${iconeSvg('image')}</div>Nenhum item na galeria ainda.</div>`;
    return;
  }

  // Com "Todos" selecionado, separamos em uma seção por categoria; com um filtro
  // específico ativo, mostramos só o carrossel daquela categoria, sem repetir o título.
  const grupos = categoriaAtiva
    ? [[categoriaAtiva, ordenarPorModalidade(itens)]]
    : GALERIA_CATEGORIAS_ORDEM
        .map((categoria) => [categoria, ordenarPorModalidade(itens.filter((i) => i.categoria === categoria))])
        .filter(([, lista]) => lista.length > 0);

  // Cada grupo é um carrossel próprio, com as setas ao lado do título do grupo.
  grid.innerHTML = grupos.map(([categoria, lista]) => `
    <div class="grupo">
      <div class="galeria-grupo-header">
        ${!categoriaAtiva ? `<h3 class="grupo-titulo">${escapeHtml(GALERIA_CATEGORIA_LABELS[categoria] || categoria)}</h3>` : ''}
        <div class="flex gap-8">
          <button type="button" class="icon-btn" id="galeria-${categoria}-prev" aria-label="Anteriores">${iconeSvg('chevronLeft')}</button>
          <button type="button" class="icon-btn" id="galeria-${categoria}-next" aria-label="Próximos">${iconeSvg('chevronRight')}</button>
        </div>
      </div>
      <div class="galeria-track" id="galeria-${categoria}-track">${lista.map(galeriaItemHtml).join('')}</div>
    </div>
  `).join('');

  grupos.forEach(([categoria]) => {
    attachCarousel(`galeria-${categoria}-track`, `galeria-${categoria}-prev`, `galeria-${categoria}-next`, '.card');
  });

  grid.querySelectorAll('.lightbox-trigger').forEach((el) => {
    el.addEventListener('click', () => abrirLightbox(el.dataset.url));
  });

  grid.querySelectorAll('.thumb--video').forEach((wrap) => {
    const video = wrap.querySelector('video');
    const playIcon = wrap.querySelector('.play-icon');

    // Sem um poster de verdade, forçamos a decodificação de um frame perto do início
    // assim que os metadados carregam — sem isso o vídeo fica com tela preta/vazia
    // até o usuário dar play.
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = video.duration > 0.2 ? 0.1 : video.duration / 2;
    }, { once: true });

    // O ícone reaparece sempre que o vídeo está pausado (seja por clique em outro
    // vídeo, seja pelo controle nativo), então sempre há um jeito fácil de retomar.
    playIcon.addEventListener('click', () => {
      if (videoAtual && videoAtual !== video) videoAtual.pause();
      video.muted = false;
      video.controls = true;
      video.play();
    });

    // Garante que apenas um vídeo toque por vez, mesmo se retomado pelos controles nativos.
    video.addEventListener('play', () => {
      if (videoAtual && videoAtual !== video) videoAtual.pause();
      videoAtual = video;
      playIcon.style.display = 'none';
    });

    video.addEventListener('pause', () => {
      playIcon.style.display = '';
    });
  });
}

function abrirLightbox(url) {
  const root = document.getElementById('lightbox-root');
  root.innerHTML = `
    <div class="lightbox">
      <span class="lightbox-close">&times;</span>
      <img src="${escapeHtml(url)}" alt="" />
    </div>
  `;
  const close = () => { root.innerHTML = ''; };
  root.querySelector('.lightbox').addEventListener('click', (e) => { if (e.target.closest('img')) return; close(); });
}

api.get('/galeria').then((itens) => {
  todaGaleria = itens;
  renderGaleria();
}).catch(() => {
  document.getElementById('galeria-grid').innerHTML = '<div class="empty-state">Não foi possível carregar a galeria.</div>';
});

document.querySelectorAll('#galeria-filtros .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#galeria-filtros .chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    categoriaAtiva = chip.dataset.categoria;
    renderGaleria();
  });
});

// ---------- Notícias (carrossel) ----------

let todasNoticias = [];

api.get('/noticias').then((noticias) => {
  todasNoticias = noticias;
  const track = document.getElementById('noticias-track');
  if (noticias.length === 0) {
    track.innerHTML = `<div class="empty-state"><div class="icon icone-branco">${iconeSvg('newspaper')}</div>Nenhuma notícia publicada ainda.</div>`;
    return;
  }
  track.innerHTML = noticias.map((n) => `
    <div class="card noticia-card" data-id="${n.id}" style="cursor:pointer">
      ${n.imagemUrl ? `<img class="thumb" src="${escapeHtml(n.imagemUrl)}" alt="${escapeHtml(n.titulo)}" />` : `<div class="thumb icone-branco">${iconeSvg('newspaper')}</div>`}
      <div class="card-body">
        <div class="text-sm" style="color:var(--texto-secundario)">${formatDate(n.createdAt)}</div>
        <h3 class="mt-8" style="font-size:1.05rem">${escapeHtml(n.titulo)}</h3>
        ${n.resumo ? `<p class="text-sm mt-8" style="color:var(--texto-secundario)">${escapeHtml(n.resumo)}</p>` : ''}
      </div>
    </div>
  `).join('');

  track.querySelectorAll('.noticia-card').forEach((el) => {
    el.addEventListener('click', () => abrirNoticiaModal(Number(el.dataset.id)));
  });
}).catch(() => {
  document.getElementById('noticias-track').innerHTML = '<div class="empty-state">Não foi possível carregar as notícias agora.</div>';
});
attachCarousel('noticias-track', 'noticias-prev', 'noticias-next', '.noticia-card');

function abrirNoticiaModal(id) {
  const n = todasNoticias.find((item) => item.id === id);
  if (!n) return;
  const root = document.getElementById('noticia-modal-root');
  root.innerHTML = `
    <div class="overlay">
      <div class="modal">
        ${n.imagemUrl ? `<img src="${escapeHtml(n.imagemUrl)}" alt="${escapeHtml(n.titulo)}" style="width:100%;border-radius:var(--raio);margin-bottom:20px" />` : ''}
        <div class="text-sm" style="color:var(--texto-secundario)">${formatDate(n.createdAt)}</div>
        <h2 class="mt-8" style="font-size:1.4rem">${escapeHtml(n.titulo)}</h2>
        <p class="mt-16" style="white-space:pre-line">${escapeHtml(n.conteudo)}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" id="noticia-modal-close">Fechar</button>
        </div>
      </div>
    </div>
  `;
  const close = () => { root.innerHTML = ''; };
  root.querySelector('.overlay').addEventListener('click', (e) => { if (e.target.classList.contains('overlay')) close(); });
  root.querySelector('#noticia-modal-close').addEventListener('click', close);
  document.addEventListener('keydown', function onKeydown(e) {
    if (!root.querySelector('.overlay')) {
      document.removeEventListener('keydown', onKeydown);
      return;
    }
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', onKeydown);
      close();
    }
  });
}
