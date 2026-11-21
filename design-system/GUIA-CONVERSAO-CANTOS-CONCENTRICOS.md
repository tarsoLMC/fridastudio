# Frida Atelier · Conversão direta e cantos concêntricos

## Objetivo
Reduzir a fricção na conclusão do Guia Frida. Depois de escolher áreas e intenções, o visitante deve ir diretamente ao WhatsApp com um resumo completo. **Nenhum formulário adicional é obrigatório.**

## Fundamento Apple
A Apple orienta alinhar os raios de elementos aninhados, mantendo cantos concêntricos: **raio do elemento interno + padding = raio externo**. No site, aplicamos 28px de raio externo, 12px de afastamento e 16px de raio interno à caixa do CTA de contato.

- Apple HIG / Adopting Liquid Glass: https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass
- Apple WWDC23 / Design for spatial user interfaces: https://developer.apple.com/videos/play/wwdc2023/10076/
- Apple SwiftUI / Concentric: https://developer.apple.com/documentation/swiftui/edge/corner/style/concentric
- Chrome developers / CSS corner-shape: https://developer.chrome.com/blog/implementing-corner-shape
- MDN / corner-shape: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/corner-shape

**Importante:** APIs nativas SwiftUI não são uma skill ou CSS diretamente executável num site. Em navegadores compatíveis, usamos `corner-shape: squircle` com `@supports`. No Safari/iPhone que não oferecer suporte, permanece o `border-radius` consistente, sem máscaras, bibliotecas ou efeitos quebrados.

## Conversão e cores
- No resultado há um CTA principal **“Agendar no WhatsApp”**, localizado **antes** da lista de cuidados.
- O verde de contato não substitui a paleta editorial Frida. Ele pertence aos tokens semânticos `--fd-action-whatsapp-*` e só aparece onde a ação é claramente WhatsApp.
- Verde normal: `#087547` (texto marfim `#FFFDFC`; contraste aproximado **5,76:1**).
- Verde hover: `#075E44` (texto marfim; contraste aproximado **7,80:1**).
- Botão de altura mínima 56px, foco visível, SVG vetorial, alinhamento central e largura total no celular.
- O antigo “Preparar agendamento” foi removido **somente do resultado do Guia**. O agendamento independente permanece no site e continua funcional para quem quiser usá-lo.
- O texto deixa claro que o WhatsApp **não confirma automaticamente** data ou horário; a equipe valida disponibilidade, duração, indicação e valores.

## Funcionalidade
- Etapa 1 permanece intacta: seleção de uma ou mais áreas, com resumo de quantidade e identidade visual aprovada.
- Etapa 2 agora permite **múltiplas preferências dentro da mesma área**, com checkboxes. Nenhuma técnica é pré-selecionada silenciosamente.
- Se nenhuma preferência for marcada em uma área, a mensagem informa que a cliente precisa de orientação, sem atribuir um serviço não escolhido.
- A mensagem WhatsApp inclui: áreas, preferências, nomes dos procedimentos correspondentes e uma pergunta sobre combinação, preço e horários.
- Ao voltar à etapa 1 e retornar, a etapa 2 preserva as preferências ainda relevantes.
- O botão Refazer limpa todas as escolhas. Não há armazenamento, rastreamento adicional nem dados sensíveis.

## Composição visual
- Contêiner de resultado com cantos contínuos/concentrados apenas nesse estado; preserva visual aprovado da etapa 1.
- Cartões da segunda etapa agrupados por área, com superfície discreta e controles de múltipla seleção verdadeiros.
- Campo de resultado: título editorial compacto, CTA verde de prioridade máxima, lista informativa e Refazer como ação discreta.
- Respeita `prefers-reduced-motion`, foco por teclado, área de toque e fallback sem `corner-shape`.

## Validação
- Testes de seleções simples, múltiplas em várias áreas e múltiplas na mesma área.
- Mensagens `wa.me` decodificadas para confirmar todos os nomes e preferências.
- Caso sem escolha da técnica resulta em solicitação de orientação.
- CTA acima da lista, cor verde e contraste AA, ausência do passo de agendamento intermediário.
- Regressão do Guia, galeria, catálogo, navegação e responsividade 320–1440px.
- Revisão manual no Safari/iPhone antes de publicar.
