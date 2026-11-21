# Frida Studio V3.1 — Galeria, Guia e agendamento

**Branch de trabalho:** `feat/frida-liquid-glass-20261120`  
**Produção:** não alterada nesta entrega. Sem publicação na Hostinger ou no domínio principal.

## Recursos implementados

### 1. Galeria editorial
- Seção `#galeria` acessível pelo menu superior e catálogo.
- Filtros por sobrancelhas, cílios, lábios, face e maquiagem.
- Fotos locais existentes, layout responsivo, ampliação em diálogo nativo e abertura direta da imagem quando JavaScript não estiver disponível.
- Todas as fotos atualmente exibidas na galeria são **identificadas como ilustrativas**, sem afirmar que são resultados reais.
- Comparador de antes/depois implementado e **inativo até a configuração de fotos reais verificadas e autorizadas** em `assets/results.js`. Consulte `RESULTADOS.md`.

### 2. Guia Frida 2.0
- As cinco áreas agora têm escolhas com miniaturas e descrições concisas.
- Progresso visível e acessível, incluindo texto e barra com `role=progressbar`.
- Para cílios e face, cujas opções atuais levam a uma única sugestão, pula a segunda pergunta redundante.
- Resultado com recomendação inicial, orientação de confirmação pela equipe, WhatsApp e botão **Preparar agendamento**.
- O botão transfere o procedimento sugerido para o agendamento sem armazenar informações pessoais.

### 3. Agendamento inteligente
- Seção `#agendamento` com escolha entre os 12 procedimentos e opção **Ainda estou escolhendo**.
- Preferência por manhã, tarde ou nenhum período e **data opcional**.
- Mensagem pré-visualizada e URL `wa.me` gerada com `encodeURIComponent`.
- Nenhuma disponibilidade é prometida; confirmação e valores dependem da equipe.
- Sem conta de usuário, backend, armazenamento de dados pessoais ou formulário extenso.

## Arquivos alterados/adicionados
- `index.html` — marcação semântica, novas seções, referências CSS/JS, navegação.
- `assets/app.js` — Guia Frida com progresso e redução de perguntas redundantes.
- `assets/experience.css` — layout gallery/guide/booking responsive e acessível.
- `assets/experience.js` — filtros, lightbox, comparador condicionado e WhatsApp.
- `assets/results.js` — lista de casos verificados (inicialmente vazia).
- `RESULTADOS.md` — fluxo de validação e autorização de imagens.

## Validações concluídas
- Todas as âncoras, IDs e arquivos referenciados foram verificados estaticamente.
- Sintaxe dos scripts e equilíbrio de blocos CSS verificados.
- As imagens locais existentes na página foram encontradas no GitHub.
- Testes funcionais com elementos DOM simulados passaram: filtros, dialog, fechar/ampliar, WhatsApp, data, transferência do Guia, bloqueio de comparativos não autorizados, slider autorizado.
- Guia Frida testado com categorias de uma e duas etapas e botão de reinício.
- Não há novos pacotes externos nem alteração da estrutura de produção.

## Limitações e pré-publicação
- **Não foram executados testes visuais em navegadores reais ou capturas Playwright do site completo.**
- **A branch não foi implantada na Hostinger.** Logo, a prévia hospedada não reflete necessariamente estas alterações.
- Conferir manualmente em **320, 375, 390, 768, 1024 e 1440 px** antes de mesclar e publicar.
- Conferir toque, navegação por teclado, foco do dialog, barra inferior, carregamento de imagens e links reais do WhatsApp no iPhone.
- Validar identidade e direitos de uso das fotografias com a equipe. Não habilitar antes/depois com fotos não verificadas.
- Não migrar o domínio principal até auditar URLs antigas, redirecionamentos 301 e dependências do WordPress.

## Rollback
A branch `main` permanece como base; o trabalho está isolado na branch de desenvolvimento. Para desativar esta rodada antes do merge, basta manter `main` e não publicar `feat/frida-liquid-glass-20261120`.
