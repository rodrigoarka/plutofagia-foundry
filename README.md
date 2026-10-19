# PLUTOFAGIA — O Livro do Sindicato (Foundry VTT v13)

**Alvo técnico:** Foundry Virtual Tabletop versão **13, build 348**. Sistema nativo: não é um módulo para outro sistema.

> **Estado da entrega:** estrutura, manifesto, módulos JS, catálogo e regras centrais passaram por verificação estática e testes simulados em Node.js. **Não foi possível executar o pacote numa instalação licenciada do Foundry 13.348 aqui.** Antes de usar numa campanha, faça o teste de aceitação abaixo; não considere a compatibilidade em execução comprovada sem esse teste.

## Instalação manual

1. Crie `{Foundry UserData}/Data/systems/plutofagia/` e descompacte o ZIP de release **dentro** dessa pasta.
2. A estrutura obrigatória deve ficar exatamente em `Data/systems/plutofagia/system.json` (com `module/`, `templates/`, `styles/` e `assets/` ao lado).
3. Reinicie o Foundry VTT 13.348 e crie um mundo selecionando **PLUTOFAGIA — O Livro do Sindicato**.
4. Entre nesse mundo como **GM**. Na primeira abertura, o sistema importa um catálogo de itens do jogo na lista mundial de Itens; o conteúdo fica acessível offline, sem dependências externas.
5. Crie atores `Operário`, `NPC` e `Comunidade`. Arraste o token de um Operário ou NPC para a cena.
6. Crie uma cena com **grid quadrado** (o padrão do sistema: **1 quadrado por unidade**, diagonais equivalentes) e utilize os recursos de movimentação e linha de visão nativos do Foundry.
7. Marque o inimigo como alvo com o recurso nativo do Foundry (Target), selecione seu próprio token e utilize o botão **Atacar** na ficha. O dano aparece no chat; GM ou proprietário escolhe o token e aplica à região selecionada.
8. No Rastreador de Combate, coloque os tokens no encontro. Na ficha, o GM pode clicar **Iniciativa por facções** para intercalar Sindicato e corporação.

**Instalação por manifesto (após publicar a Release `v0.9.0` com o asset `plutofagia.zip`):** cole `https://raw.githubusercontent.com/rodrigoarka/plutofagia-foundry/main/system.json` no campo "Manifest URL" de "Install System". A primeira Release deve conter o ZIP. O arquivo ZIP de release tem `system.json` na raiz; para instalação manual, extraia-o em `Data/systems/plutofagia/`.

## Funcionalidades incluídas

- **Modelos Foundry V13:** subtipos `operario`, `npc`, `comunidade`, `arma`, `protecao`, `tecnica`, `consumivel`, `equipamento`. `TypeDataModel` de ambos Actor e Item; fichas `HandlebarsApplicationMixin(ActorSheetV2/ItemSheetV2)`.
- **Criação:** seis atributos, 12 pontos, mínimo 1, máximo 4 na criação; 5 por evolução; pips cumulativos; 3 perícias treinadas e bônus de 1D10.
- **Dados:** pilha até 6D10 e 1 rerrolagem quando há dados excedentes, exclusivamente de dado que não foi o maior. Resultado 10 no acerto não dá crítico. Dano `d10x` explode.
- **PV:** seis regiões, proteção por área, Resistência ajusta máximos, anatomias tangíveis livres, perna única/cauda/braço único somam PV, região ausente não é atingível.
- **Turno:** duas ações por personagem, teto de três com carta e máximo de um ataque; reação marcada por rodada; Guarda, Interceptação, combate por facção e movimento orientado pelo grid.
- **Mapa:** alcance e diagonal por quadrados, flanco/costas conforme rotação do token, cobertura de 25%, 50%, 75% com Defesa máxima 10 e cobertura total impedindo acerto direto; botão de área circular ficcional.
- **Inventário:** catálogo com 68 itens e técnicas abstratas de fantasia; itens podem ser arrastados ao ator, adquiridos pela interface ou editados; custo de XP para técnicas básicas/avançadas no diálogo de catálogo.
- **Ofícios:** seis habilidades iniciais, técnicas básicas (6 XP) e avançadas (9 XP), com requisitos de duas básicas para as avançadas. Ao selecionar Ofício, a ficha registra automaticamente sua habilidade inicial.
- **Comunidades:** Apoio, Pressão, Estrutura, AP, PR, projetos, atas e relógio de negociação (3 sucessos / 2 complicações) na ficha de bairro.
- **Condições:** Suprimido, Contido, Refém, Fora de Combate, efeitos visíveis de token pelo mecanismo nativo `toggleStatusEffect`.

## Decisões de design: o que NÃO é automatizado

O Foundry é a ferramenta; o narrador continua decidindo a ficção. Não há promessa de automação completa para cobertura geométrica, terreno difícil, linha de visão, oportunidades narrativas, qualidade de testemunhas, aprovação de projetos, compras com justificativa ficcional, efeitos únicos de técnicas, relógios sociais ou consequências do uso de reféns. A ficha contém botões/indicadores de apoio e o chat registra as rolagens; o GM aplica a consequência pertinente.

O **dano não é aplicado automaticamente no alvo**: o usuário com permissão escolhe o token e região após ver o resultado. Isso evita aplicar uma região errada ou ignora proteções e reações.

**A manobra “Tomar Refém” é uma abstração narrativa de regras de RPG, não um simulador realista.** O narrador decide limites, repercussão comunitária e cenas de negociação.

**Bônus temporários de manobras e técnicas:** o chat anuncia efeitos; jogadores e GM devem acompanhar sua duração. A opção "marcar área" cria um círculo de jogo, sem resolver suas consequências automaticamente.

## Verificação de aceitação no Foundry 13.348

1. Abrir mundo sem erro de inicialização no console (F12).
2. Criar Operário e abrir ficha sem erro de template; marcar atributo 3 e constatar que 1–3 ficam pretos.
3. Criar seis atributos em 2 pontos cada (=12), treinar três perícias, selecionar Ofício e conferir técnica inicial no inventário.
4. Trocar anatomia para cauda com Resistência 2: verificar 32 PV numa região de locomoção e traço na ausente.
5. Importar ou arrastar um item fictício do catálogo ao ator, abrir sua ficha, alterar dano e verificar persistência.
6. Selecionar um token, marcar um alvo dentro do alcance, rolar teste e observar o resultado no chat; dano deve explodir apenas no dado de dano.
7. Aplicar dano regional com personagem autorizado; verificar proteção e barra do tronco.
8. Criar combate, adicionar atores de ambas facções, clicar iniciativa alternada como GM; observar turnos intercalados.
9. Mover token em cena com grid quadrado e verificar medida diagonal; rodar token 90° e observar as opções de flanco/costas.
10. Criar ficha de comunidade e editar Apoio, Pressão e Estrutura.

Se ocorrer erro na inicialização, verifique `system.json`, os arquivos `.mjs`, permissões para criar itens no mundo e o Console do navegador. Faça backup do mundo antes de atualizar este sistema.

## Referências oficiais consultadas

- https://foundryvtt.com/article/system-development/
- https://foundryvtt.com/article/system-data-models/
- https://foundryvtt.com/api/v13/classes/foundry.applications.sheets.ActorSheetV2.html
- https://foundryvtt.com/api/v13/classes/foundry.applications.apps.DocumentSheetConfig.html
- https://foundryvtt.com/api/v13/classes/foundry.documents.Actor.html
- https://foundryvtt.com/releases/13.348

Este pacote não contém o aplicativo Foundry VTT e pressupõe uma instalação existente.
