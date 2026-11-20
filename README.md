# Frida Studio — Novo site institucional

Projeto para a nova experiência digital da **Frida Studio**, no Brasília Shopping, Asa Norte — Brasília/DF.

**Estado atual:** primeira versão do site construída e versionada na branch `main`. **Ainda não foi publicada no domínio principal.**

## O que já foi implementado

- Home premium editorial com identidade suave, hierarquia visual e layout mobile-first.
- Catálogo de **12 procedimentos** com 6 filtros por tipo de cuidado.
- Guia interativo que ajuda a identificar um tratamento inicial e leva ao WhatsApp.
- Foto e história das fundadoras Bruna e Bianca, depoimentos, FAQ e endereço.
- Menu de navegação desktop + dock mobile de vidro, com ícones vetoriais sem emojis.
- CTAs específicos por procedimento e sem formulários extensos.
- SEO estrutural: título, meta description, Open Graph, JSON-LD `BeautySalon`, `sitemap.xml` e `robots.txt`.
- HTML, CSS e JavaScript puros: hospedagem estática simples na Hostinger, sem build.

## Como publicar uma prévia na Hostinger

1. Conecte o repositório **`tarsoLMC/fridastudio`** pela branch **`main`**.
2. Publique em ambiente de testes ou subdomínio, **sem substituir** o site de produção.
3. Teste filtros, menu, links de WhatsApp, responsividade e imagens.
4. Valide a identidade da marca e faça os ajustes finos antes do lançamento.

### Atenção: migração de imagens e SEO

As fotografias atualmente aparecem via URLs públicas do WordPress original (`fridastudio.com.br/wp-content/uploads/`): **elas não estão armazenadas no repositório**. Elas funcionam enquanto o WordPress antigo hospedar esses arquivos. **Antes de alterar o domínio**, é obrigatório copiar as imagens autorizadas para este projeto, atualizar as URLs no `index.html`, incluir uma imagem Open Graph local e confirmar permissões de uso. Veja `ASSETS.md`.

A marca visual no cabeçalho é um **wordmark tipográfico provisório**, e o favicon SVG é um **monograma provisório**. O **logotipo oficial** não foi recuperado em arquivo próprio; deve ser incluído após identificação/validação.

O WordPress atual tem URLs adicionais indexáveis, como `/extensao-de-cilios-df/`. Não troque a estrutura atual por uma home única sem mapear os endereços antigos e implementar redirecionamentos 301 (ou preservar páginas úteis). O sitemap atual representa apenas a nova home, não todo o inventário legado.

## Arquivos

- `index.html` — homepage semântica, conteúdo, metatags e serviços;
- `assets/styles.css` — design system e responsividade;
- `assets/app.js` — interações funcionais;
- `assets/favicon.svg` — monograma tipográfico temporário;
- `ASSETS.md` — inventário das 12 imagens e suas URLs originais;
- `sitemap.xml` e `robots.txt` — arquivos básicos de indexação.

## Informações comerciais reaproveitadas

- WhatsApp: **+55 61 99502-7800**;
- Endereço: Brasília Shopping, SCN Quadra 05, Bloco A, Torre Norte, Sala 1030, Asa Norte, Brasília/DF;
- Instagram: **@fridastudiobsb** (encontrado em fontes públicas associadas à empresa);
- As fundadoras **Bruna e Bianca** começaram juntas no design de sobrancelhas em 2015.

## Guia de revisão antes de produção

- [ ] Substituir fotos remotas por imagens próprias locais otimizadas;
- [ ] Validar logotipo oficial e adequação da identidade visual;
- [ ] Revisar representatividade e direito de uso das fotos genéricas;
- [ ] Confirmar todos os textos técnicos com a equipe da Frida;
- [ ] Conferir WhatsApp e endereço;
- [ ] Auditar SEO/URLs antigas e publicar redirecionamentos 301;
- [ ] Aprovar versão desktop/mobile e publicar com backup e plano de rollback.
