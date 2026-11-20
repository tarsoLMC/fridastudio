# Frida Studio — Sistema visual premium (V2)

## Objetivo
Transformar o site em uma experiência editorial de beleza natural, com leitura rápida, navegação móvel intuitiva e caminho direto para agendamento. A identidade é da própria Frida: técnicas, acolhimento e respeito aos traços individuais.

## Direção de arte
- **Editorial boutique:** fotografia expressiva, respiro, títulos grandes em serif itálica e conteúdo útil.
- **Paleta:** creme #FBF8F3, areia #F4EEE7, grafite quente #302723, cacau #382C28, terracota suave #8A5B4A, linha #E3D7CB.
- **Tipografia:** Playfair Display nos títulos, DM Sans para texto, Manrope em microinformações funcionais.
- **Bordas:** discretas e contrastantes onde agregam hierarquia; sem bordas nos ícones do dock mobile, que usa fundo glass.
- **Ícones:** SVG vetorial com stroke consistente, sem emojis decorativos.

## Layout e componentes
1. **Hero editorial**: grid de duas colunas no desktop, stack no mobile; galeria com 3 fotos existentes no site da Frida, legendas, dots, controles e pausa explícita.
2. **Destaques de tratamentos**: carrossel horizontal de 5 cartões fotográficos, com scroll snap, controles, progresso e CTA individual para o WhatsApp.
3. **Filosofia / fotografias**: bloco editorial assimétrico para comunicar naturalidade sem excesso de texto.
4. **Catálogo**: os 12 serviços originais, filtráveis e com botão específico para agendar/consultar.
5. **Protocolo Frida e guia**: narrativa do procedimento e microinteração para descoberta, sem formulário longo.
6. **História, depoimentos, FAQ e localização**: reforço de confiança e conversão sem criar métricas de satisfação ou avaliações fictícias.
7. **Navegação mobile**: dock inferior estilo glass, com início, cuidados, sobre e agendar; menu superior para páginas e seções auxiliares.

## Microinterações
- Hero: transição fotográfica suave, controle de pausa, swipe e navegação manual. Mudança automática apenas quando a seção está visível, a página em primeiro plano e não há preferência por redução de movimento.
- Destaques: rolagem horizontal com snap, setas, indicação de progresso e estado disabled.
- CTAs prioritários: linha de borda acetinada e reflexo sutil ao hover. Não aplicar brilho em todos os botões.
- Serviços: zoom interno da fotografia, mantendo o cartão estável, sem movimentar elementos vizinhos.
- Cabeçalho: sombra sutil após rolagem.
- Acessibilidade: foco visível, labels nas setas, contraste, opção de pausar e CSS em `prefers-reduced-motion`.

## Arquitetura
- `index.html`: markup semântico, imagens, metas, comportamento básico referenciado.
- `assets/styles.css`: layout-base da primeira versão.
- `assets/premium.css`: refinamento visual incremental com breakpoints e motion.
- `assets/app.js`: filtros, guia e navegação.
- `assets/premium.js`: carrosséis, controles e cabeçalho.

Sem frameworks ou bibliotecas adicionais, preservando hospedagem estática.

## Próximas validações antes da publicação
- [ ] Inspeção visual real nas larguras 375, 768, 1024 e 1440 px.
- [ ] Confirmação de legibilidade sobre cada imagem do hero.
- [ ] Conferência dos botões nos navegadores mobile, menu e teclado.
- [ ] Testar carregamento de todas as fotos; migrar URLs remotas para assets locais.
- [ ] Substituir wordmark provisório pelo logotipo oficial com arquivo aprovado.
- [ ] Verificar navegação após atualização automática na Hostinger.
- [ ] Conferir conteúdo técnico dos procedimentos e efetuar mapeamento das URLs antigas para preservar SEO.

**Importante:** versão entregue e versionada no GitHub; testes de renderização em navegador e publicação no domínio principal não foram realizados nesta etapa.
