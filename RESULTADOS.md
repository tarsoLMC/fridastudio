# Galeria Frida — autenticidade, consentimento e comparador

## O que está ativo agora
A seção **Galeria Frida** contém imagens locais de referência para sobrancelhas, cílios, lábios, face e maquiagem. Por enquanto, **não há evidência suficiente de que sejam registros de resultados reais feitos pela Frida**. Elas estão sinalizadas como ilustrativas, com filtros acessíveis e ampliação em diálogo nativo.

O comparador interativo de **antes/depois** está implementado no código e **somente é montado se houver pares explicitamente verificados e autorizados**. Ele fica oculto com a configuração atual, para impedir a exibição de resultados fictícios.

## Como incluir resultados reais
1. Receba da equipe da Frida um par de imagens autênticas da **mesma cliente**, da **mesma área** e do **mesmo procedimento**. Confirme condições comparáveis de fotografia.
2. Obtenha e registre fora do GitHub o consentimento explícito da cliente para publicação de ambas as fotos, sem divulgar nome ou dados pessoais desnecessários. Garanta autorização específica para uso no site.
3. Não aplique retoques que alterem resultado, textura, cor, volume ou simetria. Otimize apenas tamanho/qualidade de compressão.
4. Adicione as fotos aprovadas como WebP, AVIF, JPG ou PNG ao diretório **assets/images/results/**, usando nomes neutros e não identificadores.
5. Adicione os registros à lista de **assets/results.js**. Exemplo de formato (substitua apenas por arquivos que realmente existam):

\`\`\`js
window.FRIDA_VERIFIED_COMPARISONS = [
  {
    verified: true,
    consent: true,
    title: "Design de sobrancelhas",
    before: "assets/images/results/caso01-antes.webp",
    after: "assets/images/results/caso01-depois.webp",
    note: "Fotografias autorizadas. Resultados podem variar conforme cada pessoa."
  }
];
\`\`\`

**Não defina verified ou consent como true até a documentação de autorização e procedência estar validada.**

A interface adiciona automaticamente o slider acessível de 0 a 100% somente para pares válidos. O slider não promete resultados, nem presume que tratamentos diferentes sejam comparáveis.

## Testes de aceitação
- Sem pares aprovados: não deve existir um bloco visível de antes/depois.
- Com um par aprovado e caminhos válidos: comparador aparece e permite arrastar o slider com mouse, toque e teclado.
- Foto quebrada, autorização ausente ou arquivo fora de assets/images/results: não publicar caso.
- Confirmar na prévia da Hostinger que imagens locais, filtros, lightbox e WhatsApp funcionam no celular.
- Conferir qualidade visual em 320, 375, 390, 768, 1024 e 1440px e preferência por redução de movimento.

## Publicação
A branch de implementação é \`feat/frida-liquid-glass-20261120\`. Não substitua o domínio principal sem validação visual e sem planejamento de SEO/URLs legadas.
