// Versão estática (GitHub Pages): não há backend, então os dados vêm dos arquivos JSON
// em data/, exportados do banco do projeto original. Mantemos a mesma interface
// `api.get('/rota')` da versão com API para as páginas não precisarem mudar.
// Os caminhos são relativos para funcionar também em https://usuario.github.io/repo/.

// URL do formulário de inscrição (Google Forms), usada em todos os botões "Inscreva-se".
export const FORMS_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSePnyO62ifkeFsj8jw2VShrhnVBnhZtc26ecWJdWf0Zjh25Kg/viewform';

const cache = new Map();

function carregarJson(nome) {
  if (!cache.has(nome)) {
    // no-cache: o GitHub Pages deixa o navegador guardar os arquivos por 10 min, e um
    // JSON antigo pode apontar para imagens que já foram trocadas. Assim o navegador
    // sempre confere com o servidor (se nada mudou, a resposta é um 304 rápido).
    cache.set(nome, fetch(`data/${nome}.json`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error('Não foi possível carregar os dados.');
      return res.json();
    }));
  }
  return cache.get(nome);
}

async function get(path) {
  const [rota, query = ''] = path.split('?');
  const params = new URLSearchParams(query);

  if (rota === '/modalidades') {
    const modalidades = await carregarJson('modalidades');
    return params.get('abertaSomente') === 'true'
      ? modalidades.filter((m) => m.status === 'inscricoes_abertas')
      : modalidades;
  }

  const detalhe = rota.match(/^\/modalidades\/(\d+)$/);
  if (detalhe) {
    const modalidades = await carregarJson('modalidades-detalhe');
    const modalidade = modalidades[detalhe[1]];
    if (!modalidade) throw new Error('Modalidade não encontrada.');
    return modalidade;
  }

  if (['/competidores', '/noticias', '/galeria', '/linha-do-tempo'].includes(rota)) {
    return carregarJson(rota.slice(1));
  }

  throw new Error(`Rota não disponível na versão estática: ${path}`);
}

export const api = { get };
