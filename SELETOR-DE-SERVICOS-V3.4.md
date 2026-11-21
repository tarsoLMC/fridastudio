# Frida Studio V3.4 — Escolha de serviços sem fricção

## Objetivo
Uma cliente não precisa saber antecipadamente o que significa "Brow Lamination", "Nano Fios" ou "Hydra Gloss" para descobrir o serviço indicado para a dúvida dela. A V3.4 mantém a navegação visual por áreas, mas oferece **atalhos objetivos** e uma **ficha explicativa** que prepara a seleção para o agendamento.

## Como a cliente utiliza
1. Na seção \`#procedimentos\`, vê 8 intenções em linguagem comum — e as 5 categorias tradicionais continuam logo abaixo.
2. Toca em uma intenção: a categoria correspondente fica ativa, e uma ficha visual abre com nome, explicação e observações.
3. Pode **escolher o cuidado** (pré-preenche o formulário de agendamento) ou **perguntar diretamente no WhatsApp**.
4. Uma faixa discreta confirma a seleção e permite **trocar o cuidado**.
5. No formulário, escolhe período e data opcional. **Não há reserva automática nem promessa de disponibilidade**.

## Cobertura
12 serviços integrados aos textos já existentes no catálogo:
- Sobrancelhas: Design de sobrancelhas, Protocolo Frida, Brow Lamination, Blonde Brows, Nano Fios
- Cílios: Lash Lifting
- Lábios: Hydra Gloss, Nano Lips
- Face: Epilação facial
- Maquiagem: Maquiagem Social, Maquiagem Express, Maquiagem Artística

## Design e arquitetura
- Novos arquivos: \`assets/service-explorer.js\` e \`assets/service-explorer.css\`.
- Novos elementos na \`index.html\`: atalhos por objetivo, confirmação de escolha e ficha nativa \`<dialog>\`.
- Desktop: ficha editorial em duas colunas, com fotografia ilustrativa à esquerda, explicação e ações à direita.
- Mobile: bottom sheet nativo, com altura limitada a 94dvh, cabeçalho visual curto e rolagem interna.
- Paleta de ameixa/vinho/papel quente da V3.3, tipografia Instrument Serif e Manrope, sem emojis e sem sombras excessivas.
- Sem dependências externas novas, conta, armazenamento ou coleta de dados pessoais.
- O JS só habilita os atalhos se os 12 procedimentos do catálogo estiverem disponíveis; na ausência de JS ou \`showModal\`, os links de contato existentes continuam funcionando.
- Usamos fotos locais ilustrativas. Não criamos resultados de clientes nem alegamos que as imagens são de antes/depois.

## Integração
- O código original \`assets/app.js\` continua controlando as abas do catálogo.
- \`assets/experience.js\` continua controlando a mensagem dinâmica do WhatsApp.
- O seletor V3.4 se comunica com o formulário usando o evento DOM \`change\` após definir o procedimento.
- Os CTAs diretos do catálogo permanecem inalterados como alternativa.

## Validação
- Confirmar 12 botões de detalhe, 8 atalhos por intenção e 5 categorias.
- Abrir e fechar o painel por toque, botão e teclado Escape.
- Escolher serviço e validar o \`<select>\` e a URL do WhatsApp.
- Trocar cuidado e verificar que não há seleção fantasma.
- Testar no Chrome de 320 a 1440px e no Safari iOS antes de publicar.
- Conferir que as recomendações são explicações informativas, não indicação técnica definitiva.
- Manter \`main\` e o domínio da Hostinger intactos até aprovação da branch.

## Próximas possíveis evoluções
Se a equipe fornecer dados reais de duração, valores e recomendações de preparo, incorporar esses campos no mesmo padrão, sem inventar informações. Uma ferramenta de comparação de dois procedimentos pode ser avaliada depois, somente se houver demanda.
