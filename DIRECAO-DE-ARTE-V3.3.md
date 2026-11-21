# Frida Studio · Direção de Arte V3.3

## Intenção
A Frida não deve se parecer com um template de startup ou uma grade genérica de cartões. O site é um editorial de beleza, com **escuta, identidade e detalhes** como centro da narrativa. Referência de fluidez: apresentações da Apple. Referência de linguagem: editorial de beleza contemporâneo, não interface de tecnologia.

## Sistema cromático
| Papel | Cor | Uso |
| --- | --- | --- |
| Ameixa tinta | `#30232B` | Texto principal, editorial |
| Ameixa profundo | `#57283C` | Botões principais e marca |
| Berry | `#78384F` | Destaques e estados |
| Rosa mineral | `#F0E2E2` | Ambiente do Guia |
| Papel quente | `#FAF6F1` | Hero e catálogo |
| Marfim | `#FFFDFC` | Conteúdo e formulários |
| Branco-quente | `#FFF9F7` | Texto sobre fundo escuro |
| Bronze discreto | `#97735E` | Reserva cromática para detalhes pontuais |
| Ameixa escuro | `#34232D` | Área de agendamento |

Não utilizar verde para todos os CTAs, transparência sobre formulários ou novos tons por bloco apenas para variar. A combinação de branco/papel/ameixa deve dar direção, não ruído.

## Tipografia
- **Instrument Serif** nos títulos expressivos, com ênfase em itálico quando fizer sentido semanticamente.
- **Manrope** para navegação, descrições, campos, botões e microtexto.
- H1 desktop entre aproximadamente 43 e 56 px, no celular aproximadamente 35–41 px. Sem títulos monumentais.
- Títulos de seção desktop em torno de 33–44 px, com limites específicos por componente; mobile geralmente 30–36 px.
- Corpo entre 14–16 px e entrelinha confortável; descrições de procedimentos podem ficar ligeiramente menores.
- Legendas editoriais em 10–12 px, maiúsculas e espaçamento moderado; nunca usar texto minúsculo para instruções críticas.
- Reservar apenas dois níveis de texto destacados por bloco. Não transformar tudo em H2.

## Hierarquia dos blocos
1. **Hero**: papel quente, título de marca, retrato e CTA. A assinatura usa “OLHAR & ESCUTA”, sem fazer afirmações não confirmadas sobre o ano de fundação.
2. **Rituais Frida**: fotografias leves com legendas editoriais *fora* dos cartões. Evitar sombra em todos os componentes.
3. **Manifesto**: fotografia de alto contraste sobre ameixa; uma frase orientadora e um CTA.
4. **Procedimentos**: índice claro por categoria, listas horizontais e botões discretos com borda; ação “Tirar dúvida”.
5. **Caderno visual**: galeria de referências, com informação transparente sobre imagens ilustrativas. Antes/depois apenas com consentimento.
6. **Guia Frida**: rosa mineral e superfície de leitura sólida, escolhas com imagens.
7. **Agendamento**: fundo ameixa escuro para enfatizar conversão; formulário **marfim sólido**, nunca glass com legibilidade comprometida.
8. **A história**: contraste branco, capítulos originais de Bruna e Bianca, sem inventar história ou resultados.
9. **Perguntas**: divisórias editoriais, não mais cartões.
10. **Visita**: fechamento em tinta escura, mensagem prática sobre endereço, CTA e mapa.

## Regras de experiência
- Glass limitado ao cabeçalho, navegação inferior e uma ou duas peças fotográficas, não blocos de texto longos.
- Responsividade 320–1440 px; nenhum componente deve causar rolagem horizontal.
- Contraste mínimo visado 4.5:1 para textos normais. As seis principais combinações cromáticas novas têm razão calculada acima de 7:1.
- Respeitar `prefers-reduced-motion`; manter conteúdo legível sem animação.
- Não usar emojis como ícones: SVG e ícones vetoriais existentes.
- Sem métricas inventadas, imagens de resultado sem autorização ou afirmações clínicas não documentadas.
- WhatsApp confirma disponibilidade, não simula reserva.

## Implementação
Alterações de conteúdo e estrutura: `index.html`.  
Camada de estilo específica: `assets/art-direction.css`, carregada após as camadas V3.2.  
Código de comportamento e integrações existentes permanece preservado.

## Controle de qualidade
- Testes estáticos para IDs únicos, links internos, JS válido, classes das interações e CSS balanceado.
- Auditoria matemática das principais relações de contraste.
- Fluxo de Chromium (GitHub Actions) em 7 larguras de tela e jornadas críticas.
- Avaliar as capturas visuais manualmente antes de publicar na Hostinger.
- A branch `main` não deve ser alterada até a revisão da PR.
