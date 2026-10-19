# PLUTOFAGIA — O Livro do Sindicato

Sistema de RPG de fantasia urbana e organização comunitária para **Foundry VTT 13 (build 348)**.

> **Estado:** implementação prévia validada por testes estáticos. Ainda exige teste em uma instalação real do Foundry 13.348.

## Instalação pelo Foundry

Depois da primeira [Release v0.9.0](https://github.com/rodrigoarka/plutofagia-foundry/releases), abra **Game Systems → Install System** no Foundry e cole:

```text
https://raw.githubusercontent.com/rodrigoarka/plutofagia-foundry/main/system.json
```

O `system.json` aponta para a versão `v0.9.0`, asset `plutofagia.zip`.

## Publicar a primeira versão

**Importante: o manifesto sozinho não instala o sistema**: a Release precisa conter o ZIP `plutofagia.zip` com `system.json` na **raiz do arquivo ZIP**.

1. Baixe `Plutofagia_Foundry_13_348_Release_GitHub.zip` da conversa com ChatGPT.
2. Crie uma Release com tag `v0.9.0` (a partir de `main`) e anexe o ZIP **renomeado como `plutofagia.zip`**. O campo `download` do manifesto usa esse nome exato.
3. Confirme que o link do ZIP da Release funciona; instale pelo manifesto.
4. Para desenvolver o código no GitHub, extraia os arquivos do ZIP e envie os diretórios `module/`, `templates/`, `styles/`, `assets/`, `lang/`, `tests/` e `LICENSE.txt` para a raiz do repositório. O `system.json` já publicado deve manter as URLs.

## Publicações seguintes

O workflow [Publicar sistema Foundry](.github/workflows/release.yml) cria automaticamente um ZIP e anexa o manifesto à Release ao receber uma tag `vX.Y.Z`. Isso **somente funciona após o código completo estar presente na raiz do repositório**. Antes de criar nova tag, atualize `version` e `download` no manifesto para a mesma versão. O workflow valida a consistência.

## Recursos do jogo

Ficha de Operário, NPC e Comunidade; atributos e perícias, PV regionais; espécies tangíveis livres, anatomias unificadas; rolagens D10, dano explosivo, grid quadrado; inventário; seis Ofícios e 42 técnicas; 68 registros; relógio de negociações. Cobertura, situações narrativas e certos efeitos de técnicas continuam sob arbitragem do narrador.

Sem dependências externas obrigatórias.

## Limitações

O Foundry 13.348 **não foi executado durante a criação**. Faça teste em mundo novo e backup antes de usar em campanha. O sistema mantém vários controles narrativos manuais conforme o livro.
