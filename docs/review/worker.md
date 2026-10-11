# Revisão do worker

06/10/2026 — Pendências confirmadas por leitura de fluxo e reproduções isoladas com dependências simuladas; sem Docker, banco ou storage reais.

## W04 — Limite da proteção simples contra links simbólicos

Implementado em 06/10/2026: o middleware usa `verifyNoSymlinks()` para rejeitar links em cada componente de `path` e `destiny`, inclusive links quebrados, links internos e pastas anteriores à raiz da instância. W20 também foi corrigido: exclusão e movimentação da raiz são bloqueadas, mantendo sua leitura permitida.

**Limite conhecido:** a verificação com `lstat()` acontece antes da operação. Um processo malicioso com escrita na pasta ainda pode substituir um componente por link nesse intervalo. A solução simples aprovada não fornece isolamento contra essa corrida.

Validação: sete cenários automatizados com arquivos temporários reais, sem Docker ou storage, cobrindo links, caminhos inválidos, proteção da raiz e operações comuns.

## W21 — Hytale não recebe imagem nem volumes ao criar o container (novo)

**Local:** `worker/src/services/Container.js:141,208`.

`defineHytale()` é assíncrona, mas `create()` a chama sem `await`. Assim, `info` é uma Promise e `Image`, volumes e portas ficam indefinidos na chamada ao Docker, impedindo a criação normal do servidor. Confirmado com o método real e Docker simulado.

Há ainda a pendência W02: `worker/src/runtimes/Hytale.js` pede `hytale/config.json`, inexistente em `worker/src/templates`. Mesmo corrigida a criação do container, a configuração do painel não será gerada corretamente.
