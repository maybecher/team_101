// Animações compartilhadas entre as páginas públicas: revelação ao rolar, números que
// contam, linhas que se preenchem com a rolagem, os anéis da seção Sobre e os cards de atleta.
// Tudo respeita "reduzir movimento" do sistema: nesse caso o conteúdo aparece pronto.

export const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Revelação ao rolar ----------

// Seletores padrão: elementos que entram sozinhos (.revelar) e grupos cujos filhos
// entram em sequência (.revelar-grupo). Grupos preenchidos depois (via fetch) também
// animam, porque a animação roda quando o filho é inserido num grupo já visível.
const REVELAR = '.section .section-heading, .marquee, .alcance-cta';
const REVELAR_GRUPO = '#beneficios-grid, .modalidades-grid, .competidores-track, .noticias-track, #galeria-grid, #faq-list, .timeline, .stat-grid';

export function revelarAoRolar(raiz = document) {
  const alvos = [
    ...[...raiz.querySelectorAll(REVELAR)].map((el) => { el.classList.add('revelar'); return el; }),
    ...[...raiz.querySelectorAll(REVELAR_GRUPO)].map((el) => { el.classList.add('revelar-grupo'); return el; }),
  ];

  if (reduzMovimento || !('IntersectionObserver' in window)) {
    alvos.forEach((el) => el.classList.add('visivel'));
    return;
  }

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('visivel');
      observer.unobserve(entrada.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  alvos.forEach((el) => observer.observe(el));
}

// ---------- Números que contam ----------

/** Conta de 0 até o número escrito em cada elemento quando ele aparece na tela. */
export function contarAoAparecer(elementos) {
  const lista = [...elementos];
  if (reduzMovimento || !('IntersectionObserver' in window)) return;

  const contar = (el) => {
    const alvo = Number(el.dataset.valor);
    if (!alvo) { el.textContent = el.dataset.valor; return; }
    const duracao = 1400;
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - (1 - t) ** 3;
      el.textContent = Math.round(alvo * suave);
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      contar(entrada.target);
      observer.unobserve(entrada.target);
    });
  }, { threshold: 0.6 });

  lista.forEach((el) => {
    el.dataset.valor = el.textContent;
    el.textContent = '0';
    observer.observe(el);
  });
}

// ---------- Atualização ligada à rolagem ----------

/** Chama `atualizar` a cada quadro em que a página rolou ou mudou de tamanho. */
export function aoRolar(atualizar) {
  let agendado = false;
  const agendar = () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => { agendado = false; atualizar(); });
  };
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  agendar();
}

// ---------- Alcance (você no centro → São Paulo → Brasil → Mundo) ----------

/**
 * Cada etapa acende quando o texto dela passa de 65% da altura da tela, e acende junto
 * o anel correspondente. Os anéis vão se somando: quem chegou no Mundial passou pelos outros.
 */
export function animarAlcance(alcance) {
  if (!alcance) return;
  const etapas = [...alcance.querySelectorAll('.alcance-etapa')];
  const aneis = new Map([...alcance.querySelectorAll('.alcance-anel')].map((a) => [a.dataset.nivel, a]));

  const atualizar = () => {
    const linha = window.innerHeight * 0.65;
    etapas.forEach((etapa) => {
      const ativa = reduzMovimento || etapa.getBoundingClientRect().top < linha;
      etapa.classList.toggle('ativa', ativa);
      aneis.get(etapa.dataset.nivel)?.classList.toggle('ativo', ativa);
    });
  };

  aoRolar(atualizar);
}

// ---------- Linhas da linha do tempo ----------

/** Cada trecho de linha se preenche quando a "agulha" (60% da tela) passa por ele. */
export function animarLinhasDoTempo(raiz) {
  const atualizar = () => {
    const agulha = window.innerHeight * 0.6;
    raiz.querySelectorAll('.timeline-node').forEach((no) => {
      const linha = no.querySelector('.timeline-line');
      const ponto = no.querySelector('.timeline-dot');
      const r = linha.getBoundingClientRect();
      const progresso = reduzMovimento ? 1 : Math.min(Math.max((agulha - r.top) / (r.height || 1), 0), 1);
      linha.style.setProperty('--progresso', progresso);
      ponto.classList.toggle('ativo', reduzMovimento || ponto.getBoundingClientRect().top <= agulha);
    });
  };
  aoRolar(atualizar);
  return atualizar;
}

// ---------- Cards de atleta ----------

/**
 * Inclinação 3D seguindo o mouse (só com mouse de verdade) e um brilho dourado que
 * passa pelo card na primeira vez que ele aparece — no celular, ao deslizar o carrossel.
 */
export function prepararCardsDeAtleta(container) {
  const cards = [...container.querySelectorAll('.atleta-card')];
  if (cards.length === 0) return;

  if (!reduzMovimento && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('brilhar');
        observer.unobserve(entrada.target);
      });
    }, { threshold: 0.6 });
    cards.forEach((card) => observer.observe(card));
  }

  if (reduzMovimento || container.dataset.inclinacao) return;
  container.dataset.inclinacao = 'sim';

  let atual = null;
  const soltar = () => {
    if (!atual) return;
    atual.classList.remove('inclinado');
    atual.style.removeProperty('--rx');
    atual.style.removeProperty('--ry');
    atual = null;
  };

  container.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const card = e.target.closest('.atleta-card');
    if (card !== atual) soltar();
    if (!card) return;
    atual = card;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.classList.add('inclinado');
    card.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
    card.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
  });
  container.addEventListener('pointerleave', soltar);
}
