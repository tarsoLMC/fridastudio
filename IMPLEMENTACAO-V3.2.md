# Frida Studio — Apple Cinematic V3.2

**Objetivo:** dar uma direção Apple Cinematic à Frida Studio, preservando a identidade Beauty Editorial + Liquid Glass e toda a experiência de descoberta e agendamento já implementada.

**Branch alterada:** \`feat/frida-liquid-glass-20261120\`  
**Branch de produção:** \`main\` — não modificada nesta entrega.  
**Publicação:** código disponível apenas na branch de desenvolvimento; nenhuma implantação Hostinger realizada.

## Novos componentes

### Hero cinematográfico
- Entrada discreta da tipografia e da fotografia, sem áudio, vídeo pesado ou bibliotecas de animação.
- Mantido o H1, fotografia local, proposta de valor e CTA WhatsApp.
- Responsividade baseada nas regras existentes de V3.

### Manifesto editorial fotográfico
- Novo bloco entre destaques e catálogo, com imagem local de cuidados faciais, overlay de contraste e CTA para \`#guia\`.
- Copy: “Não se trata de mudar. Trata-se de realçar.”
- É uma imagem editorial ilustrativa; não comunica um resultado verificado de procedimento.

### História da Frida em três capítulos
- Mantida a seção \`#estudio\`, alias \`#sobre\` e depoimentos de \`#depoimentos\`.
- Três capítulos com história existente das fundadoras e proposta de cuidado:
  1. Origem de Bruna e Bianca em 2015 — fotografia local das fundadoras.
  2. Escuta e atendimento personalizado — retrato editorial ilustrativo.
  3. Atenção aos detalhes — fotografia ilustrativa de sobrancelhas.
- Desktop: imagem fixa *dentro da seção* (sticky), com transição em crossfade ao entrar nos capítulos, contador e indicador de progresso.
- Mobile: capítulos lineares, cada um com sua imagem, sem sticky e sem bloqueio de rolagem.
- Teclado: focar um capítulo atualiza a imagem no desktop.
- A narrativa não usa scroll hijacking e é legível mesmo sem JavaScript.

### Movimento responsável
- Interseções com \`IntersectionObserver\` em vez de listeners de scroll contínuos.
- \`prefers-reduced-motion: reduce\` elimina as transições e mostra textos imediatamente.
- Sem novos pacotes externos, shaders, vídeos em loop ou carregamentos de fontes adicionais.

## Arquivos
- \`index.html\` — hero, manifesto, história em capítulos e referências aos novos assets.
- \`assets/cinematic.css\` — direção de arte, grid, responsividade e movimentos discretos.
- \`assets/cinematic.js\` — mudança entre capítulos e reveal progressivo.
- \`IMPLEMENTACAO-V3.2.md\` — este registro.

## Verificações realizadas
- Sintaxe dos scripts preservados e do novo JS validada.
- Equilíbrio de chaves CSS e de tags estruturais HTML conferido.
- IDs únicos, hash links válidos, imagens locais e atributos \`alt\` presentes.
- 3 capítulos e 3 fotografias desktop com IDs distintos, além de imagens mobile.
- Testes simulados de estados: capítulos via teclado, mouse, interseção de rolagem, reveal, redução de movimento e navegadores sem \`IntersectionObserver\`.
- Conferidos breakpoints 900/760/600/360px no CSS e regras de tela pequena.
- Galeria, Guia Frida 2.0, agendamento, CTA WhatsApp, menu Liquid Glass e depoimentos permaneceram no HTML.

## Limitações e próximos controles de qualidade
- Testes foram **estruturais e funcionais simulados**, não uma inspeção pixel-a-pixel em Safari, Chrome, Firefox ou dispositivos reais.
- Antes de publicar, renderizar em 320, 375, 390, 768, 1024 e 1440px; conferir crossfade, sticky, dock, foco, imagens, CLS, LCP e interações do Guia/WhatsApp.
- Validar com a equipe da Frida os textos e o direito de uso de todas as fotos. Identificar as imagens ilustrativas; não apresentar registros como antes/depois reais sem consentimento.
- Não migrar o domínio principal sem revisar SEO e redirecionamentos das URLs existentes.
- Para reversão, não mesclar a branch de desenvolvimento. A \`main\` permanece intacta.
