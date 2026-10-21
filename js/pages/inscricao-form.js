import { api, FORMS_URL } from '../api.js?v=202610211347';
import { renderPublicHeader, renderPublicFooter } from '../components.js?v=202610211347';
import { getQueryParam } from '../utils.js?v=202610211347';

renderPublicHeader();
renderPublicFooter();

// A inscrição é feita pelo Google Forms, embutido na página (embedded=true remove o
// cabeçalho do Google e deixa o formulário caber no layout do site).
document.getElementById('forms-iframe').src = `${FORMS_URL}?embedded=true`;
document.getElementById('forms-link').href = FORMS_URL;

// Vindo de uma modalidade específica, o título indica qual foi escolhida — o aluno
// ainda informa a modalidade dentro do próprio formulário.
const modalidadeId = getQueryParam('modalidadeId');
if (modalidadeId) {
  api.get(`/modalidades/${modalidadeId}`).then((m) => {
    document.getElementById('form-titulo').textContent = `Inscreva-se — #${m.codigo} ${m.nome}`;
  }).catch(() => {});
}
