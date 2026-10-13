# Revisão do worker

12/10/2026 — Apenas pendências de alta gravidade (P1). Revisão do código e reproduções isoladas. Limitações documentadas no README excluídas. Scripts e logs em `~/.codex/nodecraft-artifacts/review-2026-10-12/`; nenhum teste executado contra Docker, banco ou storage de produção.

## W04 — Sincronização dos runtimes ainda sobrescreve arquivos externos por links simbólicos (P1, reaberto)

**Local:** `worker/src/services/File.js:307` (`createOneFile`); `worker/src/runtimes/Minecraft.js:94` (`sync`), `Terraria.js` e `Kerbal.js` (`syncSettings`).

Os caminhos de escrita da API foram protegidos, mas os runtimes continuam chamando `writeFile(path, ...)` diretamente por `createOneFile()`. Um plugin/processo executado dentro do container pode substituir `server.properties`, por exemplo, por um link absoluto para um arquivo do host. No próximo início/reinício, o worker segue esse link com suas próprias permissões e trunca/sobrescreve o destino, inclusive configurações de outras instâncias ou arquivos do serviço. O destino nem precisa existir dentro do container: o link será resolvido pelo processo do host. A exploração exige controle de arquivos pelo processo do jogo, como um plugin instalado pelo usuário, e um destino gravável pelo usuário do worker.

**Validação:** chamada ao `Minecraft.sync()` real com `server.properties` apontando para um arquivo descartável fora da instância. O arquivo externo foi substituído pelas propriedades geradas, incluindo a senha RCON de teste. Não depende de corrida nem de contornar o middleware HTTP. Corrigir também as gravações internas dos runtimes antes de considerar completo o isolamento por instância.
