# Instruções de manutenção — PLUTOFAGIA Foundry

## Arquivos de responsabilidade

- `styles/plutofagia.css`: CSS estrutural mantido pelo desenvolvedor.
- **`styles/personalizacao.css`: CSS controlado pelo usuário. Nunca substituir, reformatar em massa, apagar ou resetar esse arquivo sem autorização explícita.**
- `assets/muro-velho.svg`: textura do usuário, também preservar em atualizações futuras.

## Regras para atualizações

1. Antes de alterar a interface, buscar a versão atual do GitHub, inclusive o CSS de personalização.
2. Preferir criar/modificar seletores no CSS estrutural, mantendo os overrides do usuário carregados depois.
3. Não incluir `personalizacao.css` nem `muro-velho.svg` na lista de arquivos a serem recriados por scripts de upgrade ou scaffolding.
4. Ao publicar uma atualização, conferir que `system.json.styles` termina em `styles/personalizacao.css`.
5. Verificar antes do commit que o diff não altera esses dois arquivos, exceto se o usuário solicitar explicitamente.
6. Se o próprio usuário editar o CSS no GitHub, **não restaurar a versão anterior por engano**. O repositório é a fonte da verdade.
7. Para disponibilizar no Foundry alterações novas do CSS, incrementar a versão no manifesto e publicar uma nova Release; versões já publicadas não são substituídas automaticamente.

## Conceitos estáveis do sistema

- D10 do chat: apenas visual, círculo preto.
- Face 10: símbolo Ⓐ vermelho.
- Explosão somente no dano, nunca em ataque.
- Narrador: terminologia canônica (nunca "Maestro").
