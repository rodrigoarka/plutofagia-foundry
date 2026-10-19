# PLUTOFAGIA — O Livro do Sindicato (Foundry VTT v13)


**Instalação por manifesto:** cole `https://raw.githubusercontent.com/rodrigoarka/plutofagia-foundry/main/system.json` no campo "Manifest URL" de "Install System". 

## Funcionalidades incluídas

- **Modelos Foundry V13:** subtipos `operario`, `npc`, `comunidade`, `arma`, `protecao`, `tecnica`, `consumivel`, `equipamento`. `TypeDataModel` de ambos Actor e Item, fichas `HandlebarsApplicationMixin(ActorSheetV2/ItemSheetV2)`.
- **Criação:** seis atributos, 12 pontos, mínimo 1, máximo 4 na criação, 5 por evolução, pips cumulativos, 3 perícias treinadas e bônus de 1D10.
- **Dados:** pilha até 6D10 e 1 rerrolagem quando há dados excedentes, exclusivamente de dado que não foi o maior. Resultado 10 no acerto não dá crítico. Dano `d10x` explode.
- **PV:** seis regiões, proteção por área, Resistência ajusta máximos, anatomias tangíveis livres, perna única/cauda/braço único somam PV, região ausente não é atingível.
- **Turno:** duas ações por personagem, teto de três com carta e máximo de um ataque, reação marcada por rodada, Guarda, Interceptação, combate por facção e movimento orientado pelo grid.
- **Mapa:** alcance e diagonal por quadrados, flanco/costas conforme rotação do token, cobertura de 25%, 50%, 75% com Defesa máxima 10 e cobertura total impedindo acerto direto, botão de área circular ficcional.
- **Inventário:** catálogo com 68 itens e técnicas abstratas de fantasia, itens podem ser arrastados ao ator, adquiridos pela interface ou editados, custo de XP para técnicas básicas/avançadas no diálogo de catálogo.
- **Ofícios:** seis habilidades iniciais, técnicas básicas (6 XP) e avançadas (9 XP), com requisitos de duas básicas para as avançadas. Ao selecionar Ofício, a ficha registra automaticamente sua habilidade inicial.
- **Comunidades:** Apoio, Pressão, Estrutura, AP, PR, projetos, atas e relógio de negociação (3 sucessos / 2 complicações) na ficha de bairro.
- **Condições:** Suprimido, Contido, Refém, Fora de Combate, efeitos visíveis de token pelo mecanismo nativo `toggleStatusEffect`.

## Decisões de design: o que NÃO é automatizado

O Foundry é a ferramenta, o narrador continua decidindo a ficção. Não há promessa de automação completa para cobertura geométrica, terreno difícil, linha de visão, oportunidades narrativas, qualidade de testemunhas, aprovação de projetos, compras com justificativa ficcional, efeitos únicos de técnicas, relógios sociais ou consequências do uso de reféns. A ficha contém botões/indicadores de apoio e o chat registra as rolagens, o GM aplica a consequência pertinente.

O **dano não é aplicado automaticamente no alvo**: o usuário com permissão escolhe o token e região após ver o resultado. Isso evita aplicar uma região errada ou ignora proteções e reações.

**A manobra “Tomar Refém” é uma abstração narrativa de regras de RPG, não um simulador realista.** O narrador decide limites, repercussão comunitária e cenas de negociação.

**Bônus temporários de manobras e técnicas:** o chat anuncia efeitos, jogadores e GM devem acompanhar sua duração. A opção "marcar área" cria um círculo de jogo, sem resolver suas consequências automaticamente.
