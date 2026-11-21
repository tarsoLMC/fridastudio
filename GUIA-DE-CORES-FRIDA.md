# Frida Studio — Guia de cor e composição | estudo de referência

**Status:** paleta aplicada à branch de desenvolvimento por meio de tokens compartilhados; **não publicada ainda na Hostinger**.  
**Base da auditoria:** branch \`feat/frida-liquid-glass-20261120\`, arquivos de estilos existentes.  
**Objetivo:** transformar a Frida em uma marca editorial sofisticada, clara e reconhecível, sem depender de dezenas de tons arbitrários.

## 1. Diagnóstico do repositório

A leitura dos oito arquivos \`assets/tokens.css\`, \`assets/styles.css\`, \`assets/v3.css\`, \`assets/experience.css\`, \`assets/cinematic.css\`, \`assets/art-direction.css\`, \`assets/service-explorer.css\` e \`assets/glass-orbits.css\` encontrou **397 ocorrências de HEX de seis dígitos, correspondentes a 317 cores HEX únicas**.

| Arquivo | Ocorrências | HEX distintas |
| --- | ---: | ---: |
| tokens.css | 17 | 14 |
| styles.css | 0 (usa tokens) | 0 |
| v3.css | 70 | 53 |
| experience.css | 62 | 53 |
| cinematic.css | 18 | 18 |
| art-direction.css | 166 | 142 |
| service-explorer.css | 45 | 44 |
| glass-orbits.css | 19 | 16 |

**Atenção:** estes números são *definições em código*, não comprovam que todas as cores são visíveis ao usuário ao mesmo tempo; a cascata CSS e estados responsivos alteram o resultado. O dado, porém, revela baixo reuso de tokens.

Problema de composição: muitos rosas, fundos creme, bordas, vinhos e realces muito parecidos competem, e alguns estilos mudam novamente as mesmas cores em camadas posteriores. O trabalho deve ser sobre **papéis semânticos e contraste**, não somente substituir HEX.

## 2. Fundamentos estudados

- **Matiz (Hue):** família de cor (vermelho, roxo etc.). Deve ser coerente entre elementos relacionados.
- **Luminosidade (Lightness/Value):** claro versus escuro. Define o primeiro nível de hierarquia e legibilidade.
- **Croma/saturação:** intensidade cromática. Áreas muito grandes devem competir menos; accent para ações prioritárias.
- **Temperatura:** neutros quentes ou frios. Misturas muito diferentes são percebidas como inconsistência; evitar creme quente junto a cinza azulado sem intenção.
- **Proporção:** o impacto de uma cor depende também da área que ocupa. 60–30–10 é *heurística de composição*, não norma WCAG nem garantia de conversão.
- **Harmonias:** monocromática e análoga favorecem unidade; complementar e triádica ampliam contraste e risco de dispersão. A Frida deve usar **neutros quentes + uma família vinho/berry** com rosa suave como tonalidade derivada. Eventual bronze é decorativo, nunca uma quarta cor de CTA.
- **Contexto:** uma mesma cor muda perceptualmente com a fotografia, o fundo vizinho e a iluminação. Revisar cada bloco em contexto, não apenas amostras isoladas.

## 3. Paleta proposta: Frida Porcelana & Ameixa

Paleta candidata, sujeita a aprovação visual da marca.

| Token | HEX | Função |
| --- | --- | --- |
| \`--color-paper\` | \`#F8F5F0\` | fundo dominante, papel quente |
| \`--color-surface\` | \`#FFFDFC\` | formulários e painéis de leitura |
| \`--color-stone\` | \`#EDE7E3\` | separação sutil de seção |
| \`--color-ink\` | \`#2F282C\` | títulos, texto principal |
| \`--color-muted\` | \`#5E5358\` | parágrafos secundários |
| \`--color-primary\` | \`#603748\` | botões primários, navegação ativa |
| \`--color-primary-hover\` | \`#492634\` | interação de botão primário |
| \`--color-rose-soft\` | \`#EEDDE0\` | fundos selecionados e Guia |
| \`--color-rose-ink\` | \`#743D53\` | texto sobre rosa suave |
| \`--color-border-soft\` | \`#D7C9C6\` | divisórias não essenciais |
| \`--color-border-control\` | \`#8F6775\` | contorno ativo/essencial de campo |
| \`--color-bronze-detail\` | \`#A88772\` | acabamento decorativo pontual, não texto pequeno |

**Proporção inicial**, não obrigatória: cerca de 70% papel e marfim, 20% neutros de separação/fotografia e 10% de vinho/rosa em estados e CTAs. O vinho pode ocupar uma única seção dramática, desde que a sequência mantenha amplas áreas neutras.

### Contrastes calculados com a fórmula WCAG 2.x (cores sólidas)
- Tinta \`#2F282C\` / papel \`#F8F5F0\`: **13,22:1**
- Texto secundário \`#5E5358\` / papel: **6,77:1**
- Tinta / marfim \`#FFFDFC\`: **14,18:1**
- Marfim / botão vinho \`#603748\`: **9,69:1**
- Marfim / vinho hover \`#492634\`: **12,86:1**
- Texto rosa escuro \`#743D53\` / rosa suave \`#EEDDE0\`: **6,33:1**
- Texto secundário / pedra \`#EDE7E3\`: **6,01:1**
- Bronze detalhe \`#A88772\` / papel: **3,03:1** → inadequado para texto normal AA.
- Borda suave \`#D7C9C6\` / marfim: **1,59:1** → não deve ser o único indicador visual de controle.
- Borda de controle \`#8F6775\` / marfim: **4,74:1** → apropriada para borda essencial, sem depender apenas da cor.

São valores para pares opacos. **Transparências, blur, gradientes e fotografias devem ser retestados no estado real.**

## 4. Regras semânticas de interface

1. **Texto normal:** usar \`ink\` em primeiro nível e \`muted\` em segundo nível. Nunca rosa claro sobre papel; rosa escuro só em pequenos destaques com contraste calculado.
2. **Botões principais:** sempre vinho + texto marfim. Não mudar a cor do CTA primário por seção nem usar verde de WhatsApp para todo botão.
3. **Botões secundários:** texto vinho em superfície marfim e borda de controle visível quando for necessária para reconhecer a interação.
4. **Superfícies:** alternar papel, marfim e pedra; rosa suave apenas em uma área narrativa ou em seleção, não em cada cartão.
5. **Catálogo:** categoria ativa usa **mais de um sinal** (borda, marcador e/ou texto “Selecionado”), nunca somente diferença entre dois rosas parecidos.
6. **Guia Frida:** superfície rosa suave exterior e cartões marfim sólidos para leitura e seleção.
7. **Agendamento:** uma seção vinho concentrada, formulário marfim legível, mesma cor de CTA principal dentro do formulário.
8. **Glass:** reservar para navegação, um selo editorial e pequenos componentes; jamais para parágrafos longos ou inputs. Composição em cima de fotografia exige overlay sólido suficiente e fallback sem backdrop-filter.
9. **Fotografia:** manter tons de pele naturais e a temperatura editorial consistente; usar degradê protetor apenas quando houver texto sobre imagem.
10. **Acessibilidade:** texto normal 4,5:1 AA, texto grande 3:1 AA, informação gráfica/controles necessários 3:1; foco visível; não codificar estados apenas por cor.

## 5. Aplicação por seção

| Bloco | Fundo | Texto/CTA | Orientação |
| --- | --- | --- | --- |
| Hero | papel | tinta + botão vinho | destaque para fotografia e uma ação |
| Destaques fotográficos | marfim | tinta | imagens dominam; não colorir todos os cards |
| Manifesto | fotografia com proteção vinho escuro | texto marfim | único contraste dramático de storytelling |
| Procedimentos | papel | tinta; ativo rosa sutil + contorno | interatividade clara, sem cinco cores por categoria |
| Painel de opções | marfim | tinta; botão vinho | preservar conteúdo aprovado; refinar hierarquia |
| Galeria | pedra | tinta | cores das fotografias são o foco |
| Guia | rosa suave | tinta + superfícies marfim | acolhimento com leitura de alta qualidade |
| Agendamento | vinho como cenário, marfim no formulário | tinta no formulário | uma seção de conversão visualmente distinta |
| História | marfim | tinta | editorial e fotografia sem cartões repetidos |
| FAQ | papel | tinta | separadores, nada de fundos de botão |
| Rodapé | tinta escura | marfim | fechamento coerente com o hero |

## 6. Plano seguro para implementar

1. Fazer inventário de tokens efetivos e declaração por seletor; identificar sobreposições entre as oito folhas CSS.
2. Criar arquivo único de tokens semânticos, incluindo pares \`on-primary\`, \`on-surface\`, \`focus\`, \`selected\`, \`border-control\`.
3. Migrar por área em branch de desenvolvimento. Não alterar textos, imagens ou fluxos de agendamento.
4. Capturar screenshots desktop/iPhone a cada etapa, com e sem efeitos de vidro.
5. Testar contraste calculado e simulador de daltonismo; navegar por teclado; comparar estado ativo/inativo e sob luz forte.
6. Validar com a marca as cores e fotografias, realizar teste real com clientes, e publicar primeiro na prévia, nunca diretamente na \`main\`.

## 7. Fontes primárias e pesquisa

- **Apple — Color:** https://developer.apple.com/design/human-interface-guidelines/color
- **Apple — Materials:** https://developer.apple.com/design/human-interface-guidelines/materials
- **Adobe — harmonias cromáticas:** https://www.adobe.com/uk/creativecloud/design/discover/color-palette.html
- **Adobe — erros comuns em teoria das cores:** https://www.adobe.com/br/express/learn/blog/common-color-theory-mistakes
- **Nielsen Norman Group — hierarquia:** https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
- **Nielsen Norman Group — uso de cores:** https://www.nngroup.com/articles/color-enhance-design/
- **Google — Material 3, papéis e tons:** https://developer.android.com/codelabs/m3-design-theming
- **W3C — WCAG 2.2 em português:** https://www.w3c.br/traducoes/wcag/wcag22-pt-BR/
- **MDN — OKLCH:** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch
- **Revisão científica sobre cor e emoção:** https://link.springer.com/article/10.3758/s13423-024-02615-z

### Observações importantes de evidência
- Harmonia estética ≠ contraste acessível. A WCAG mede luminosidade relativa, não “quanto as cores são opostas” no círculo cromático.
- A regra 60–30–10 é uma diretriz útil de composição, nunca uma regra universal.
- Associações de cor e emoção existem e variam; não há base para afirmar “uma cor específica aumenta a conversão” em qualquer negócio sem testar em seu contexto.

**Atualização:** o plano cromático foi incorporado à branch de desenvolvimento. A versão publicada da Hostinger não foi alterada; validar no Safari/iPhone e revisar visualmente antes de publicar.
