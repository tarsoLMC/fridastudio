# Frida Studio V3 — integração do Work (20/11/2026)

## Objetivo
Aplicar ao projeto existente o direcionamento decidido para a Frida: beleza editorial, minimalismo sofisticado e Liquid Glass inspirado na navegação do iPhone, sem reproduzir um template de aplicativo.

## O que foi implementado
- Camada isolada em \`assets/v3.css\`: hierarquia tipográfica compacta, cores vinho/rosé/creme, espaçamento, botões com contorno e estados de interação.
- Cabeçalho translúcido com blur progressivo, aplicado somente quando suportado pelo navegador.
- Hero reorganizado para reduzir o H1, melhorar contraste e preservar fotografia de destaque.
- Faixa editorial com 4 procedimentos em destaque e navegação direta ao catálogo.
- Catálogo existente preservado: 5 categorias, 12 procedimentos, CTAs individuais; apresentação mais legível e botões consultivos.
- Guia Frida mantido, com explicação visual de 3 passos, sem criar formulário novo.
- Navegação inferior mobile de 4 opções: Início, Cuidados, Guia e Agendar. Ícones SVG próprios, sem emoji. O controle antigo de agendamento flutuante foi retirado da interface.
- Estado ativo do dock e estado do cabeçalho via \`assets/v3.js\`; acessibilidade e redução de movimento respeitadas.

## Componentes dos outros projetos que inspiraram a V3
- Filó Rendeira: fotografias com proporção controlada, hierarquia editorial, motion discreto.
- Maison Odonto: navegação por necessidade e explicação objetiva dos serviços.
- Habite-se Brasília: interação curta e intuitiva, especialmente para mobile.
- Habite-se DF: CTAs contextuais para transformar interesse em contato.
- Essenes: pergunta simples, orientação sem fricção.
- Grupo Saluvia: informação organizada em etapas.

## Validações automatizadas do código
- 1 H1 na home.
- 12 procedimentos preservados; 5 categorias.
- 4 destaques e 4 destinos no dock.
- Âncoras internas existentes.
- Todos os 19 links \`wa.me\` do código consultado mantêm o número oficial.
- Imagens da home usam \`assets/images/\` e estão descritas com alt.
- Sintaxe dos scripts verificada, CSS com chaves equilibradas e breakpoints para 600, 760 e 900px.
- Sem dependências adicionais ou necessidade de build.

## O que ainda precisa de validação no navegador
Os testes de estrutura e sintaxe não substituem inspeção visual em 320, 375, 390, 768, 1024 e 1440px. Conferir manualmente o dock, posição das fotos, legibilidade, teclado, foco, Guia Frida, tap targets, rolagem e contraste.

## Publicação e segurança
- Repositório: \`tarsoLMC/fridastudio\`.
- Branch de implementação: \`feat/frida-liquid-glass-20261120\`.
- Backup do estado anterior: \`backup/frida-antes-liquid-glass-20261120\`.
- Alvo autorizado: prévia Hostinger, \`https://resolute-palegreen-jackal-95.hostingersite.com/\`.
- **Não substituir** o domínio atual \`fridastudio.com.br\` sem validar a migração do WordPress, redirecionamentos 301 e SEO.
- A existência de imagens WebP locais foi verificada no repositório. Confirmar autorização/representatividade antes do lançamento principal.
- Substituir logotipo provisório após validação do arquivo oficial.
- Rever Open Graph e inventário de URLs quando migrar o domínio oficial.

## Reversão
O branch \`backup/frida-antes-liquid-glass-20261120\` preserva o conteúdo do repositório anterior à implementação. A reversão deverá ser feita por novo commit/revert, mantendo histórico auditável.
