# PLUTOFAGIA no GitHub e Foundry VTT 13

Sistema: **PLUTOFAGIA — O Livro do Sindicato**. Publicação automática ativada no repositório `rodrigoarka/plutofagia-foundry`.

## Links

- Repositório: https://github.com/rodrigoarka/plutofagia-foundry
- Release v0.9.2: https://github.com/rodrigoarka/plutofagia-foundry/releases/tag/v0.9.2
- Download: https://github.com/rodrigoarka/plutofagia-foundry/releases/download/v0.9.2/plutofagia.zip
- Manifesto de instalação: https://raw.githubusercontent.com/rodrigoarka/plutofagia-foundry/main/system.json
- Pipeline: https://github.com/rodrigoarka/plutofagia-foundry/actions/workflows/release.yml

## Instalação

1. No Foundry VTT 13, abra **Game Systems -> Install System**.
2. Cole a URL do manifesto acima.
3. Instale o sistema ou atualize a instalação existente.
4. Faça backup do mundo e reinicie o Foundry antes de testar a versão nova.
5. No mundo, entre como GM para criar/atualizar os quatro compêndios de mundo; a criação não deve apagar os registros existentes.

## O que ficou automatizado

O repositório agora contém o código completo, os testes e a automação `.github/workflows/release.yml`.

Para publicar a próxima versão:

1. Edite `system.json` para uma nova versão (por exemplo, `0.9.3`) e ajuste o campo `download` para `.../releases/download/v0.9.3/plutofagia.zip`.
2. Envie suas alterações de código para a branch `main` (commit/push). Pode fazê-lo por integração GitHub conectada ao ChatGPT.
3. O GitHub Actions verifica o manifesto, os itens, as cartas e o JavaScript, e executa `node --test tests/*.mjs`.
4. Se tudo passar, cria automaticamente o ZIP na raiz apropriada e publica a Release. Não é necessário anexar ZIP manualmente.
5. O Foundry recebe a versão nova pela mesma URL de manifesto.

**Importante:** a publicação automática só cria nova Release se o número da versão mudar. Ela não substitui uma Release antiga já publicada.

## Limitações de validação

A pipeline passou nos testes automatizados. Isso não substitui o teste real da interface e dos compêndios no Foundry 13.348. Para uso em campanha, recomenda-se uma cópia de teste do mundo.

## Compêndios v0.9.2

- Arsenal: 14 armas fictícias
- Técnicas dos Ofícios: 42 registros
- Cartas de condição: 60 cartas
- Equipamentos, proteções e consumíveis: 12 registros

Total: **128** registros. A ficha permite arrastar itens e atualizar a lista por manipulação de DOM, preservando a aba aberta.