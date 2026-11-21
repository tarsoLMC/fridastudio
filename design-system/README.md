# Frida Atelier — Design System 1.1

> **Status: tokens e papéis cromáticos implementados na Home da branch de desenvolvimento.** O laboratório de componentes continua isolado. O domínio da Hostinger e a branch `main` permanecem intactos; publicação depende de QA e revisão visual.

## Entrega aplicada na branch — 21/11/2026

- A Home passou a carregar as **12 cores primitivas centralizadas** em `assets/tokens.css` com aliases semânticos e temporários para as classes antigas.
- Os seis CSS de experiências visuais migraram suas cores HEX avulsas para `var(--fd-*)`: `v3.css`, `experience.css`, `cinematic.css`, `art-direction.css`, `service-explorer.css` e `glass-orbits.css`.
- Os `--bg-*`, `--text-*`, `--accent-*` e `--frida-*` deixaram de ser redefinidos em folhas posteriores. V3 guarda apenas tokens de layout; o arquivo Atelier detém os papéis cromáticos.
- Os botões, categorias e painéis agora compartilham cores semânticas; o estado ativo do catálogo usa rosa mineral com borda ameixa e não depende apenas do matiz.
- Navegação translúcida usa tokens compartilhados, com fundo marfim e fallback.
- A vitrine das seções alterna papel, marfim, pedra, rosa mineral e ameixa em momentos intencionais.
- Os valores `rgba()` de transparência sobre fotografia, glass e sombras ainda existem: **não equivalem a novas cores sólidas de marca** e serão refinados na etapa óptica após validação visual.
- O inventário inicial de 317 HEX únicos foi reduzido a **12 HEX primitivos no arquivo de tokens** e **zero HEX nos sete estilos de componentes** (incluindo base). O HTML mantém apenas a cor `theme-color`, igual ao papel quente.
- O Design System está aplicado no CSS do site **somente na branch de desenvolvimento**. As folhas antigas ainda contêm declarações estruturais redundantes; sua consolidação final exige regressão visual comparativa antes de removê-las.

## Por que este sistema existe

O estudo em `GUIA-DE-CORES-FRIDA.md` encontrou 317 valores HEX distintos em 8 folhas CSS carregadas pela Home. Isso **não é uma contagem de cores efetivamente visíveis**, mas revela valores de baixo reuso e sobreposições. Exemplos confirmados:
- `.button-primary`: `styles.css`, `v3.css`, `art-direction.css`;
- `.catalog-tab`: mesmos três arquivos;
- `.catalog-panel`: mesmos três arquivos;
- `.booking-card`: `experience.css` e `art-direction.css`.

Alterar apenas `tokens.css` seria insuficiente, pois os arquivos seguintes possuem cores literais que prevalecem na cascata. **Não adicionar "mais uma folha de correção" à produção.** Consolidar a propriedade na origem e remover o override antigo.

## Arquitetura do sistema

```
Frida Atelier
├── 1. Primitives       palette, typefaces, spacing steps
├── 2. Semantic tokens  surface, text, action, selection, border, focus
├── 3. Components       button, chip, field, service panel, dialog, dock
├── 4. Section patterns hero, highlights, catalog, guide, booking, story
└── 5. Motion & glass   orbit, crossfade, reveal, optical material
```

Arquivos compartilhados e laboratório:

| Arquivo | Papel |
| --- | --- |
| `assets/tokens.css` | fonte única de cores, tipografia, espaços, raios, elevação e duração, carregada pela Home |
| `design-system/tokens.css` | importa `assets/tokens.css` para o laboratório sem duplicar a paleta |
| `design-system/components.css` | implementações isoladas com classes `.fd-*` para validar os componentes |
| `design-system/index.html` | laboratório de composição com imagem local e estados reais; `noindex` |
| `design-system/preview.js` | interação demonstrativa sem envio de dados |
| `design-system/README.md` | decisões, contrato e critérios de migração |

Os arquivos de protótipo **não alteram o site**, pois não estão vinculados à Home. A implementação é CSS/HTML/JS sem pacotes de UI externos.

## Paleta: Porcelana & Ameixa

As cores primitivas abaixo são candidatas, não um logotipo revisado ou identidade institucional homologada:

| Nome | HEX | Uso |
| --- | --- | --- |
| Papel | `#F8F5F0` | fundo predominante |
| Marfim | `#FFFDFC` | superfície de leitura, formulário |
| Pedra | `#EDE7E3` | segunda superfície |
| Tinta | `#2F282C` | títulos e texto principal |
| Texto secundário | `#5E5358` | apoio |
| Ameixa | `#603748` | único CTA principal |
| Ameixa hover | `#492634` | interação |
| Rosa mineral | `#EEDDE0` | seleção e acolhimento no Guia |
| Texto sobre rosa | `#743D53` | contraste em seleção |
| Linha discreta | `#D7C9C6` | divisórias decorativas |
| Borda funcional | `#8F6775` | contorno de controles |
| Bronze decorativo | `#A88772` | detalhes não textuais |

### Matriz de contraste para pares opacos

| Par | Razão estimada | Critério |
| --- | ---: | --- |
| Tinta / papel | 13,22:1 | AA texto normal |
| Secundário / papel | 6,77:1 | AA texto normal |
| Marfim / ameixa | 9,69:1 | AA texto normal |
| Texto sobre rosa / rosa mineral | 6,33:1 | AA texto normal |
| Bronze / papel | 3,03:1 | **não usar para corpo de texto** |
| Linha discreta / marfim | 1,59:1 | **somente decorativa**, nunca controle essencial |

Meta WCAG 2.2 AA: texto normal >=4.5:1, texto grande >=3:1, informação visual necessária de UI >=3:1. As relações listadas consideram cores sólidas. Imagens, glass e gradientes exigem teste sobre os pixels finais.

## Linguagem tipográfica e ritmo

- **Instrument Serif:** títulos de marca, capítulos da história e cabeçalhos de serviços; variação itálica apenas em palavras-chave. Não simular todo título com fonte gigantesca.
- **Manrope:** conteúdo, explicações, inputs, CTAs e navegação; corpo regular de 16px e apoio de 14–15px.
- Título hero `clamp(2.25rem, 4.6vw, 3.4rem)`; seção `clamp(1.85rem, 3.1vw, 2.65rem)`; componente `clamp(1.42rem, 2.4vw, 1.85rem)`.
- Espaços em uma escala 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px; não usar valores aleatórios em cartões relacionados.
- Alvos interativos com altura mínima 44px; borda principal de 1px; raio em 12 / 18 / 24px ou pílula.
- Movimento curto 150ms, médio 260ms, longo 420ms; respeito a `prefers-reduced-motion` e economia de dados.

## Componentes e estados obrigatórios

| Componente | Estados mínimos | Regra visual |
| --- | --- | --- |
| Botão primário | normal, hover, focus, disabled, loading | ameixa sólida + marfim; nunca CTA de cada cor |
| Botão secundário | normal, hover, focus | fundo marfim, borda funcional, texto ameixa |
| Abas de categoria | normal, ativo, foco | ativo tem marcador, borda e texto; não só mudança de rosa |
| Procedimento | normal, selecionado | cartões opacos, descrição clara e opção de visualizar detalhes |
| Ficha `<dialog>` | aberta, fechada, foco, mobile | surface sólida, imagem editorial e CTA; não vidro em parágrafos |
| Guia Frida | em seleção, resultado, volta | rosa mineral de pano de fundo, controles marfim |
| Agendamento | vazio, escolhido, sem data, com data | seção ameixa e formulário opaco; não inventar disponibilidade |
| Dock | ativo, inativo, foco, safe area | um dos poucos locais onde glass é apropriado |
| Selo orbital | parado, visível, fora da tela | movimento apenas quando visível e permitido |

## Regras para aplicar às seções

| Seção | Plano de fundo | Destaque |
| --- | --- | --- |
| Hero | papel quente | imagem, headline e um botão primário |
| Rituais | marfim | fotos sem molduras de cartão desnecessárias |
| Manifesto | foto com overlay adequado | um contraste dramático, texto em marfim |
| Catálogo | papel | abas e painel em marfim, selecionado em rosa mineral |
| Galeria | pedra | imagens protagonizam sem enfeites cromáticos |
| Guia | rosa mineral | opções e formulário em marfim |
| Agendamento | ameixa | formulário marfim + widget glass pequeno |
| História | marfim | fotos e tipografia, orbita discreta quando cabível |
| FAQ | papel | divisórias e títulos, sem cards repetidos |
| Rodapé | tinta escura | texto claro e CTA acessível |

## Plano de migração para o site — 5 portas de qualidade

### Fase 0 — baseline, sem tocar produção
- Salvar capturas verificadas do código atual em 320/390/768/1440px e estado de teclado/redução de movimento.
- Registrar inventário de seletores duplicados, cores literais e resultados da suíte Chromium.
- Congelar estrutura, conteúdo, formulários e destinos de WhatsApp.

### Fase 1 — tokens e tipografia
- Substituir `assets/tokens.css` pelo sistema semântico **com aliases temporários para os nomes antigos**.
- Migrar `styles.css` in place, retirando literais e usando tokens semânticos; não adicionar uma folha corretiva.
- Confirmar contraste em títulos, corpo, botões, links e campos. Não considerar alteração de token isolada como migração concluída.

### Fase 2 — componentes interativos (maior risco)
- Unificar em um único dono das regras os estilos de `.button-primary`, `.catalog-tab`, `.catalog-panel`, `.treatments`, `.guide-choice`, `.booking-card`.
- Preservar os IDs, classes e `data-*` utilizados pelos scripts existentes, ou adaptar scripts e testes juntos.
- Para cada componente: validar normal/hover/foco/ativo/desabilitado e telefone 320px.

### Fase 3 — padrões de página
- Migrar hero, destaques, manifesto, catálogo, galeria, Guia, agendamento, história e rodapé para a matriz de superfícies.
- Evitar rosa em todas as seções. A fotografia deve trazer a maior parte da riqueza visual.
- Revisar `section` por `section` as capturas antes de remover CSS antigo.

### Fase 4 — glass/motion
- Reusar tokens para blur, bordo do vidro, sombra e duração; manter apenas dock, selo editorial e widget de confirmação.
- Verificar legibilidade sobre fotografia, fallback sem `backdrop-filter`, respeito a `saveData` e redução de movimento.
- Nunca animar o filtro de vidro ou forçar scroll do usuário para produzir uma transição.

### Fase 5 — consolidação & publicação
- Remover os overrides dos arquivos `v3.css`, `experience.css`, `cinematic.css`, `art-direction.css`, `service-explorer.css`, `glass-orbits.css` **depois** de migrar seus componentes, mantendo scripts JS funcionais.
- Meta arquitetural: `tokens.css`, `base.css`, `components.css`, `sections.css`, `effects.css` (ou um bundle de produção). Evitar incremento indefinido de folhas CSS.
- Criar verificação automatizada: cores literais fora de `tokens.css` só são permitidas com justificativa para imagem/overlay; estados de UI devem utilizar tokens.
- Testar Chrom(e/ium), Safari iOS real, zoom 200%, navegação com teclado, datas, modais, WhatsApp e CLS/LCP.
- Só publicar no **domínio temporário da Hostinger** após revisão visual. `main` segue intacta até aprovação explícita.

## Condições para aprovar cada componente

1. Sua cor tem função declarada por token e existe um único seletor proprietário.
2. Texto normal >=4.5:1, texto grande e componentes relevantes >=3:1.
3. Estado ativo não depende exclusivamente de cor.
4. Alvos de toque confortáveis; sem overflow horizontal de 320 a 1440px.
5. Navegação, Guia, 12 procedimentos, fotos, seleção e WhatsApp continuam válidos.
6. Capturas mobile/desktop e modo de movimento reduzido revisados.

## Fontes de referência

- Apple Human Interface Guidelines / Color: https://developer.apple.com/design/human-interface-guidelines/color
- Apple Human Interface Guidelines / Materials: https://developer.apple.com/design/human-interface-guidelines/materials
- Material 3 / Theming: https://developer.android.com/codelabs/jetpack-compose-theming
- USWDS / Design Tokens: https://designsystem.digital.gov/design-tokens/
- WCAG / Contrast Minimum: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
- WCAG / Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast
- MDN / OKLCH: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch

### Decisão explícita
Os **tokens compartilhados estão em uso na Home**. O laboratório `design-system/index.html` e seus componentes **não** devem ser ligados diretamente à Home como nona folha CSS. As próximas fases devem retirar duplicações estruturais remanescentes, revisar overlays RGBA e validar Safari/iPhone antes de publicar.
