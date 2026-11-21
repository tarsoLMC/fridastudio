# Frida Studio V2 — Arquitetura desktop/mobile

## Fonte imutável
**Estável 1** = branch `stable/v1`, commit `0555cdd878d30730befe92ce718808ec6dda1704`. Até aprovação de futuras alterações móveis, a UI do celular permanece exatamente igual.

## Regra de produto
- **320–1024 px:** congelado visualmente. Não editar componentes, tipografia, cartões, cores, navegação, imagens, Guia Frida ou interação. O projeto **não solicita** assets novos de desktop nessas larguras.
- **1025–1099 px:** continua com o comportamento existente da Estável 1, sem animações adicionais.
- **A partir de 1100 px + mouse com hover + movimento normal:** ativa efeitos leves de desktop. Sem dependência de framework.
- **A partir de 1360 px:** adiciona o pequeno índice editorial dos capítulos da página, com links nativos.
- **prefers-reduced-motion: reduce / Save-Data:** mantém o layout original, não solicita os novos assets.
- **Alternar desktop → telefone durante o uso:** remove os efeitos, listeners, observadores e o índice.

## Artefatos de desktop
- `assets/desktop-experience.css`: único CSS de desktop, com regras de media query explícitas.
- `assets/desktop-experience.js`: apenas progressivamente carregado quando o dispositivo permite.
- `index.html`: único ajuste na Home é um pequeno bootstrap `type=module`; nenhum markup de interface mobile alterado.
- **Sem substituição de folhas de estilo antigas**, sem mudanças no SEO, formulários, WhatsApp, Guia Frida, galerias, menus ou imagens.

## Melhorias de desktop
1. **Abertura editorial**: título, introdução e CTA entram em sequência discreta, usando transform e opacity.
2. **Detalhes revelados ao rolar**: títulos, fotografias e galeria ganham movimento único ao entrar na viewport; não desaparecem caso o JS falhe.
3. **Profundidade fotográfica no hero**: movimento máximo de 8 px horizontais e 6 px verticais, apenas quando o mouse está sobre a imagem, controlado por `requestAnimationFrame`.
4. **Hover de fotografia**: cartões do catálogo, destaques e galeria têm elevação e escala discreta; a linguagem editorial e o conteúdo permanecem inalterados.
5. **Índice de capítulos**: trilho estreito no desktop amplo, com progresso de leitura e localização ativa, links reais para seções, suporte a teclado e `aria-current`. Oculto quando há diálogo modal.
6. **História de Bruna e Bianca**: o scrollytelling já existente permanece, com leve feedback adicional em hover.

## Por que essa arquitetura?
- O CSS não é importado na Home como estilo global: é injetado somente após uma media query válida.
- O JS desktop é um import dinâmico; celulares **não fazem a requisição** dos arquivos de desktop.
- Filtros `hover:fine`, movimento reduzido e `Save-Data` impedem animações desnecessárias.
- As animações são predominantemente `transform` e `opacity`, evitando alterações de layout a cada quadro.
- Uma cópia de segurança da Estável 1 permanece no GitHub e existe um **teste de fonte que compara o HTML original byte a byte**, depois de retirar o único bootstrap desktop.

## Gates antes de mesclar
1. `tests/mobile-baseline-guard.mjs` compara a branch atual com `stable/v1` e impede qualquer alteração nos antigos arquivos CSS/JS/imagens.
2. `tests/desktop-experience.mjs` verifica 320, 390, 600, 768 e 1024 px sem qualquer requisição de desktop; 1100, 1280, 1440 e 1600 px com desktop ativo; data saver e reduced motion; e desmontagem ao reduzir viewport.
3. A suíte existente de navegador Chromium e o WebKit para o Guia Frida permanecem obrigatórios.
4. Integrar à `main` só depois do QA. Verificar separadamente a implantação no hPanel da Hostinger.

## Referências
- Google Chrome, *Motion: Best Practices*: https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/motion
- Chrome, *Scrollytelling*: https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/scrollytelling
- MDN, *CSS performance*: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS
- MDN, *prefers-reduced-motion*: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

**Sem cookies novos, rastreamento, autoplay, notificações ou solicitação de dados pessoais.**
