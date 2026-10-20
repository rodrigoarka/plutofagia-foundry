# PLUTOFAGIA — O Livro do Sindicato

Sistema de RPG para Foundry VTT 13, build 348. **Versão 0.9.2**.

## Instalação por URL

No Foundry, escolha **Game Systems → Install System** e cole:

```
https://raw.githubusercontent.com/rodrigoarka/plutofagia-foundry/main/system.json
```

O manifesto aponta para `https://github.com/rodrigoarka/plutofagia-foundry/releases/download/v0.9.2/plutofagia.zip`. A Release precisa estar publicada antes da atualização do manifesto `main`.

## Novidades da 0.9.2

- Quatro **compêndios nativos do mundo**, preparados automaticamente na primeira abertura por um GM: Arsenal, Técnicas, Cartas de Condição e Equipamentos/Proteções.
- 68 itens do catálogo existente + **60 cartas transcritas do documento de cartas de Plutofagia** = 128 registros.
- Suporte a arrastar um registro do compêndio para a ficha: o Item é incorporado ao Actor; Técnicas observam requisitos do Ofício, custo de XP e progressão.
- Adicionar, excluir e arrastar itens **atualiza somente as listas de itens via DOM**, preservando aba ativa e campos digitados. O restante da ficha continua seguindo o fluxo do Foundry.
- Botões na aba Bagagem abrem os compêndios e um seletor fornece alternativa ao arrastar.
- Novo tipo `carta` na ficha, com ativação, duração e texto de efeito; exibição no chat sem aplicação automática de modificadores complexos.

## Importante sobre os compêndios

Os quatro compêndios são **mundiais** (`world.plutofagia-*`), e não bancos LevelDB distribuídos dentro do ZIP. A criação e a inserção inicial exigem a primeira abertura do mundo por um GM. Eles persistem naquele mundo, podem ser consultados na aba Compêndios e **não são apagados** quando o sistema é atualizado. Em outro mundo, serão criados novamente. O catálogo global anterior não é removido.

Se você modificar um item no compêndio, o instalador não o sobrescreve automaticamente. A cópia arrastada para a ficha é independente do catálogo.

## Escopo e testes

Jogos com tokens e grid quadrado, ataques e danos digitais, atributos, PV regionais, espécies livres tangíveis, regras e Ofícios de Plutofagia. Algumas escolhas de alvo, cobertura, cartas e manobras permanecem sob decisão do Narrador.

Checagem estática: `node --test tests/*.mjs`. **Não substitui teste no Foundry 13.348 real.** Antes de atualizar, faça backup do mundo, principalmente se já existem personagens em campanha.

## Publicação pelo GitHub

A Release deve anexar um ZIP chamado `plutofagia.zip` com `system.json` na raiz. O workflow do repositório poderá importar o conteúdo desse ZIP para o código-fonte após a publicação da Release.
