// Cabeçalho e rodapé públicos, injetados via JS em <div id="site-header"> / <div id="site-footer">
// presentes em todas as páginas públicas, para não duplicar o mesmo HTML em cada arquivo.

const NAV_LINKS = [
  { href: 'index.html#sobre', label: 'Sobre' },
  { href: 'index.html#beneficios', label: 'Benefícios' },
  { href: 'index.html#modalidades', label: 'Modalidades' },
  { href: 'index.html#competidores', label: 'Competidores' },
  { href: 'index.html#noticias', label: 'Notícias' },
  { href: 'index.html#galeria', label: 'Galeria' },
  { href: 'index.html#faq', label: 'FAQ' },
];

export function renderPublicHeader() {
  const el = document.getElementById('site-header');
  if (!el) return;
  el.innerHTML = `
    <header class="site-header">
      <div class="container">
        <a class="logo" href="index.html">
          <img src="assets/design/simbolo.png" alt="" class="logo-mark" />
          Team 1.01
        </a>
        <nav class="site-nav links">
          ${NAV_LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join('')}
        </nav>
        <a class="btn btn-primary btn-sm" href="inscricao.html">Inscreva-se</a>
        <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Abrir menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
      <nav class="mobile-menu" id="mobile-menu">
        ${NAV_LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join('')}
        <a href="inscricao.html" class="btn btn-gold btn-block mt-8">Inscreva-se</a>
      </nav>
    </header>
  `;

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

export function renderPublicFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="site-footer-brand">
          <img src="assets/design/brasao.png" alt="Brasão SENAI Roberto Simonsen" class="footer-brasao" />
          <span>&copy; Team 1.01 &middot; SENAI Brás &middot; SPSkills</span>
        </div>
      </div>
    </footer>
  `;
}
