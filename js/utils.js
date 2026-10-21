export const MODALIDADE_STATUS_LABELS = {
  inscricoes_abertas: 'Inscrições abertas',
  inscricoes_encerradas: 'Inscrições encerradas',
  treinamentos: 'Treinamentos',
  competindo: 'Competindo',
};

export const MODALIDADE_STATUS_BADGE = {
  inscricoes_abertas: 'badge-abertas',
  inscricoes_encerradas: 'badge-encerradas',
  treinamentos: 'badge-treinamentos',
  competindo: 'badge-competindo',
};

export const INSCRICAO_STATUS_LABELS = {
  nova: 'Nova',
  em_analise: 'Em análise',
  selecionado_entrevista: 'Selecionado para entrevista',
  aprovado: 'Aprovado',
  nao_selecionado: 'Não selecionado',
};

export const INSCRICAO_STATUS_BADGE = {
  nova: 'badge-nova',
  em_analise: 'badge-em-analise',
  selecionado_entrevista: 'badge-selecionado',
  aprovado: 'badge-aprovado',
  nao_selecionado: 'badge-nao-selecionado',
};

export const GALERIA_CATEGORIA_LABELS = {
  treinamento: 'Treinamentos',
  evento: 'Eventos',
  competicao: 'Competições',
  geral: 'Geral',
};

export const GALERIA_CATEGORIAS_ORDEM = ['treinamento', 'evento', 'competicao', 'geral'];

export function statusBadgeHtml(status) {
  const label = MODALIDADE_STATUS_LABELS[status] || status;
  const cls = MODALIDADE_STATUS_BADGE[status] || '';
  return `<span class="badge ${cls}">${label}</span>`;
}

export function inscricaoStatusBadgeHtml(status) {
  const label = INSCRICAO_STATUS_LABELS[status] || status;
  const cls = INSCRICAO_STATUS_BADGE[status] || '';
  return `<span class="badge ${cls}">${label}</span>`;
}

import { iconeSvg } from './icons.js';

// Mesmo desenho (medal) pras três primeiras, diferenciadas por cor; Excelência usa um
// ícone diferente (award) já que é uma honraria à parte, não uma "quarta medalha".
export const MEDALHA_ICON = {
  Ouro: iconeSvg('medal', 'icone-dourado'),
  Prata: iconeSvg('medal', 'icone-branco'),
  Bronze: iconeSvg('medal', 'icone-azul'),
  Excelência: iconeSvg('award', 'icone-dourado'),
};

export const MEDALHA_BADGE_CLASS = {
  Ouro: 'badge-ouro',
  Prata: 'badge-prata',
  Bronze: 'badge-bronze',
  Excelência: 'badge-excelencia',
};

// Lista pra preencher o seletor de país no admin com as opções mais comuns — não é a
// fonte da verdade de quais bandeiras existem (ver bandeiraHtml/PAIS_PARA_CODIGO):
// qualquer país que exista no mapa abaixo funciona, mesmo sem estar nesta lista curta.
export const PAISES_CONHECIDOS = [
  'Brasil', 'Finlândia', 'Japão', 'Canadá', 'Reino Unido', 'Alemanha',
  'Emirados Árabes Unidos', 'Rússia', 'França', 'China', 'Chile',
];

/** Vira "republica-democratica-do-congo", "reino-unido" etc. — usado como chave do
 * mapa PAIS_PARA_CODIGO abaixo, pra não depender de acento/maiúscula na digitação. */
export function slugPais(nome) {
  return nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Nome do país (em português, slugificado) -> código ISO 3166-1 alpha-2, pra consumir a
// FlagsAPI (https://flagsapi.com/{codigo}/flat/{tamanho}.png). Cobre os países soberanos
// mais comuns; um país digitado que não esteja aqui cai no ícone genérico (ver bandeiraHtml).
export const PAIS_PARA_CODIGO = {
  afeganistao: 'AF', 'africa-do-sul': 'ZA', albania: 'AL', alemanha: 'DE', andorra: 'AD', angola: 'AO',
  'arabia-saudita': 'SA', argelia: 'DZ', argentina: 'AR', armenia: 'AM', australia: 'AU', austria: 'AT',
  azerbaijao: 'AZ', bahamas: 'BS', bahrein: 'BH', bangladesh: 'BD', barbados: 'BB', belarus: 'BY',
  belgica: 'BE', belize: 'BZ', benin: 'BJ', bolivia: 'BO', 'bosnia-e-herzegovina': 'BA', botsuana: 'BW',
  brasil: 'BR', brunei: 'BN', bulgaria: 'BG', 'burkina-faso': 'BF', burundi: 'BI', butao: 'BT',
  'cabo-verde': 'CV', camaroes: 'CM', camboja: 'KH', canada: 'CA', catar: 'QA', qatar: 'QA',
  cazaquistao: 'KZ', chade: 'TD', chile: 'CL', china: 'CN', chipre: 'CY', colombia: 'CO', comores: 'KM',
  congo: 'CG', 'coreia-do-norte': 'KP', 'coreia-do-sul': 'KR', 'costa-do-marfim': 'CI', 'costa-rica': 'CR',
  croacia: 'HR', cuba: 'CU', dinamarca: 'DK', djibuti: 'DJ', dominica: 'DM', egito: 'EG',
  'el-salvador': 'SV', 'emirados-arabes-unidos': 'AE', equador: 'EC', eritreia: 'ER', eslovaquia: 'SK',
  eslovenia: 'SI', espanha: 'ES', 'estados-unidos': 'US', estonia: 'EE', essuatini: 'SZ', etiopia: 'ET',
  fiji: 'FJ', filipinas: 'PH', finlandia: 'FI', franca: 'FR', gabao: 'GA', gambia: 'GM', gana: 'GH',
  georgia: 'GE', granada: 'GD', grecia: 'GR', guatemala: 'GT', guine: 'GN', 'guine-bissau': 'GW',
  'guine-equatorial': 'GQ', guiana: 'GY', haiti: 'HT', honduras: 'HN', hungria: 'HU', iemen: 'YE',
  india: 'IN', indonesia: 'ID', ira: 'IR', iraque: 'IQ', irlanda: 'IE', islandia: 'IS', israel: 'IL',
  italia: 'IT', jamaica: 'JM', japao: 'JP', jordania: 'JO', kuwait: 'KW', laos: 'LA', lesoto: 'LS',
  letonia: 'LV', libano: 'LB', liberia: 'LR', libia: 'LY', liechtenstein: 'LI', lituania: 'LT',
  luxemburgo: 'LU', 'macedonia-do-norte': 'MK', madagascar: 'MG', malasia: 'MY', malawi: 'MW',
  maldivas: 'MV', mali: 'ML', malta: 'MT', marrocos: 'MA', mauricio: 'MU', mauritania: 'MR',
  mexico: 'MX', mianmar: 'MM', micronesia: 'FM', mocambique: 'MZ', moldavia: 'MD', monaco: 'MC',
  mongolia: 'MN', montenegro: 'ME', namibia: 'NA', nepal: 'NP', nicaragua: 'NI', niger: 'NE',
  nigeria: 'NG', noruega: 'NO', 'nova-zelandia': 'NZ', oma: 'OM', 'paises-baixos': 'NL', holanda: 'NL',
  paquistao: 'PK', palau: 'PW', panama: 'PA', 'papua-nova-guine': 'PG', paraguai: 'PY', peru: 'PE',
  polonia: 'PL', portugal: 'PT', quenia: 'KE', quirguistao: 'KG', 'reino-unido': 'GB',
  'republica-centro-africana': 'CF', 'republica-democratica-do-congo': 'CD', 'republica-dominicana': 'DO',
  'republica-tcheca': 'CZ', romenia: 'RO', ruanda: 'RW', russia: 'RU', samoa: 'WS', 'santa-lucia': 'LC',
  'sao-marino': 'SM', 'sao-tome-e-principe': 'ST', senegal: 'SN', 'serra-leoa': 'SL', servia: 'RS',
  seicheles: 'SC', singapura: 'SG', siria: 'SY', somalia: 'SO', 'sri-lanka': 'LK', sudao: 'SD',
  'sudao-do-sul': 'SS', suecia: 'SE', suica: 'CH', suriname: 'SR', tailandia: 'TH', taiwan: 'TW',
  tajiquistao: 'TJ', tanzania: 'TZ', 'timor-leste': 'TL', togo: 'TG', tonga: 'TO',
  'trinidad-e-tobago': 'TT', tunisia: 'TN', turcomenistao: 'TM', turquia: 'TR', tuvalu: 'TV',
  ucrania: 'UA', uganda: 'UG', uruguai: 'UY', usbequistao: 'UZ', vanuatu: 'VU', vaticano: 'VA',
  venezuela: 'VE', vietna: 'VN', zambia: 'ZM', zimbabue: 'ZW',
};

// Bandeira de verdade via FlagsAPI (https://flagsapi.com) em vez de emoji Unicode — o
// Windows costuma renderizar emoji de bandeira como as duas letras do país (ex: "BR")
// em vez do desenho da bandeira. Um país fora do mapa (ou sem código ISO, como estados/
// cidades) cai no ícone genérico em vez de arriscar uma imagem quebrada.
export function bandeiraHtml(pais) {
  if (!pais) return iconeSvg('flag', 'icone-branco');
  const codigo = PAIS_PARA_CODIGO[slugPais(pais)];
  if (!codigo) return iconeSvg('flag', 'icone-branco');
  const src = `https://flagsapi.com/${codigo}/flat/64.png`;
  const fallback = iconeSvg('flag', 'icone-branco bandeira-fallback');
  return `<span class="bandeira-wrap"><img class="etapa-flag" src="${src}" alt="Bandeira: ${pais.replace(/"/g, '')}" onerror="var f=this.nextElementSibling; this.remove(); if(f) f.classList.remove('bandeira-fallback')" />${fallback}</span>`;
}

/** Ícone representativo por modalidade — só decorativo, cai num ícone genérico
 * pra qualquer nome que não esteja no mapa (inclusive digitado livremente no admin). */
const MODALIDADE_ICONE_NOME = {
  Ferramentaria: 'wrench',
  'Mecânica Geral': 'cog',
  'Mecânica Industrial': 'cog',
  'Mecânica de Precisão': 'cog',
  'Mecânica de Manutenção': 'cog',
  'Mecânica de Usinagem': 'cog',
  Polimecânica: 'cog',
  'Tornearia Mecânica': 'disc',
  Fresagem: 'disc',
  'Fresagem CNC': 'disc',
  Telecomunicações: 'radioTower',
  Panificação: 'wheat',
  Confeitaria: 'cakeSlice',
  'Robótica Industrial': 'bot',
  'Integração de Sistemas Robóticos': 'bot',
  Mecatrônica: 'bot',
  'Segurança no Trabalho': 'hardHat',
  'Instalações Elétricas': 'zap',
  'Elétrica Industrial': 'zap',
  Eletrônica: 'cpu',
  'Eletrônica Industrial': 'cpu',
  'Engenharia de Moldes': 'hammer',
  'Construção de Moldes': 'hammer',
  'Tecnologia da Informação': 'laptop',
  'Tecnologias Web': 'laptop',
  'Manufatura Integrada': 'factory',
  'Desenho Mecânico em CAD': 'ruler',
  CAD: 'ruler',
  'Controle Industrial': 'slidersHorizontal',
  'Arte Digital 3D para Games': 'gamepad2',
  'Tecnologia de Design Industrial': 'palette',
  'Modelagem de Protótipos': 'puzzle',
  'Redes de Cabeamento Estruturado': 'network',
  'Sistemas de Transporte de Informação': 'network',
  'Desenvolvimento de Aplicativos Mobile': 'smartphone',
  'Produção Industrial de Móveis': 'armchair',
  'Tecnologia Lab. Química': 'flaskConical',
  'Tecnologia em Laboratório Química': 'flaskConical',
};

export function modalidadeEmoji(modalidade) {
  const nome = (modalidade && MODALIDADE_ICONE_NOME[modalidade]) || 'wrench';
  return iconeSvg(nome, 'icone-dourado');
}

/** Divide "Fulano/ Beltrano" (duplas/trios de competição) em nomes individuais. */
export function splitCompetidores(competidor) {
  if (!competidor) return [];
  return competidor.split('/').map((n) => n.trim()).filter(Boolean);
}

export function medalhaBadgeHtml(medalha) {
  if (!medalha) return '';
  const icone = MEDALHA_ICON[medalha] || iconeSvg('star', 'icone-dourado');
  const cls = MEDALHA_BADGE_CLASS[medalha] || '';
  return `<span class="badge ${cls}">${icone}${escapeHtml(medalha)}</span>`;
}

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatDate(isoString, withTime = false) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  const opts = withTime
    ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('pt-BR', opts);
}

// Nomes femininos comuns no Brasil que não terminam em "a" — sem essa lista a
// heurística abaixo (terminar em "a") erraria esses casos bem comuns.
const PRIMEIRO_NOME_FEMININO_EXCECOES = new Set([
  'beatriz', 'raquel', 'ingrid', 'isis', 'iris', 'yasmin', 'noemi', 'ester',
  'jaqueline', 'madeleine', 'elizabeth', 'isabel', 'miriam', 'rebeca', 'ruth',
]);

/** Estimativa simples de gênero gramatical a partir do primeiro nome — nomes
 * brasileiros têm muita variação, então isso não é (e não pode ser) perfeito, mas
 * cobre a grande maioria dos casos comuns. Usado só pra decidir "campeão"/"campeã". */
export function pareceNomeFeminino(nomeCompleto) {
  const primeiroNome = (nomeCompleto || '').trim().split(/\s+/)[0]
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (!primeiroNome) return false;
  if (PRIMEIRO_NOME_FEMININO_EXCECOES.has(primeiroNome)) return true;
  return primeiroNome.endsWith('a');
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:300;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = { info: '#2563eb', success: '#16a34a', error: '#dc2626' };
  toast.textContent = message;
  toast.style.cssText = `background:${colors[type] || colors.info};color:#fff;padding:12px 18px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.2);font-size:0.9rem;max-width:320px;`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Áreas das modalidades (mesmos grupos do jogo SkillMatch). Cada área tem uma cor
// própria no CSS (ver [data-area] em styles.css). Ao incluir uma modalidade, coloque
// o código dela aqui.
export const AREAS = {
  tecnologia: { nome: 'Tecnologia', codigos: ['08', '17', '50'] },
  design: { nome: 'Design e projeto', codigos: ['05', '59'] },
  automacao: { nome: 'Automação e energia', codigos: ['04', '18', '19', '48'] },
  mecanica: { nome: 'Mecânica', codigos: ['01'] },
  madeira: { nome: 'Madeira', codigos: ['24', '25'] },
  laboratorio: { nome: 'Laboratório', codigos: ['52'] },
};

export function areaDaModalidade(codigo) {
  return Object.keys(AREAS).find((area) => AREAS[area].codigos.includes(codigo)) || null;
}
