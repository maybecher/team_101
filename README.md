# Team 1.01 — Portal SPSkills SENAI Brás (versão estática)

Segunda versão do portal Team 1.01, feita só com **HTML, CSS e JavaScript**, sem backend nem banco de dados, para ser publicada no **GitHub Pages**.

Diferenças em relação à versão original:

- Não há painel administrativo nem cadastro de inscrições no site.
- As inscrições são feitas por um **Google Forms**, embutido na página `inscricao.html`.
- Os dados (modalidades, competidores, notícias, galeria e linha do tempo) ficam em arquivos JSON na pasta `data/`.
- O vídeo da página inicial é carregado do YouTube.

## Estrutura

```
team_101/
 ├─ index.html            # Página inicial
 ├─ modalidade.html       # Detalhe de uma modalidade (?id=)
 ├─ linha-do-tempo.html   # Histórico dos competidores
 ├─ inscricao.html        # Formulário de inscrição (Google Forms)
 ├─ css/styles.css
 ├─ js/
 │   ├─ api.js            # Lê os JSON de data/ e guarda o link do formulário (FORMS_URL)
 │   ├─ components.js     # Cabeçalho e rodapé
 │   ├─ animacoes.js      # Revelação ao rolar, jornada, linha do tempo e cards de atleta
 │   ├─ utils.js, icons.js
 │   └─ pages/            # Script de cada página
 ├─ data/                 # Conteúdo do site em JSON
 └─ assets/               # Imagens, ícones, bandeiras e vídeos da galeria
```

## Editando o conteúdo

- **Link do formulário:** altere `FORMS_URL` em `js/api.js`.
- **Modalidades, competidores, notícias, galeria, linha do tempo:** edite o arquivo correspondente em `data/`. Caminhos de imagem são relativos (ex.: `assets/modalidades/01.jpg`).
- **Nova modalidade:** além dos JSON, coloque o código dela numa das áreas em `AREAS` (`js/utils.js`), que define a cor do card.
- `data/modalidades-detalhe.json` traz cada modalidade com seus competidores e histórico, usado na página `modalidade.html`. Ao alterar uma modalidade em `modalidades.json`, atualize também esse arquivo.

## Rodando localmente

Como as páginas carregam os JSON com `fetch`, é preciso abrir o site por um servidor (abrir o arquivo direto no navegador não funciona). Por exemplo:

```bash
npx serve .
# ou
python -m http.server 8000
```

## Publicando no GitHub Pages

No repositório, vá em **Settings → Pages**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`. O site fica disponível em `https://maybecher.github.io/team_101/`.
