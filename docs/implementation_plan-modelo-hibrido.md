# Implementação do Modelo Híbrido (Oráculo + Freighter)

O objetivo é criar uma 4ª interface que combine o "melhor dos dois mundos":
1. **Poder de Automação do Oráculo:** O backend continua responsável por acessar o banco de dados da prefeitura com segurança, gerar os Hashes, consultar o Ledger e garantir as regras de negócio (bloqueando fraudes).
2. **Custódia Descentralizada (Web3):** Quando uma ancoragem for necessária, em vez do servidor assinar a transação silenciosamente, ele delega a assinatura para o Cidadão/Auditor através da extensão Freighter.

## Open Questions
Nenhuma dúvida impeditiva. O modelo proposto abaixo estende a API existente sem quebrar as abordagens puras já implementadas.

## Proposed Changes

### 1. Backend (`server.js`)
A rota `/api/auditar/stream` será atualizada para aceitar um parâmetro opcional `auditorPublicKey`.
- Se `auditorPublicKey` for fornecido, o Oráculo entende que está no modo Híbrido. Ele fará a verificação de integridade consultando o ledger daquela chave pública específica.
- Na hora de ancorar, o servidor apenas **montará a transação (XDR)** e a enviará de volta ao Frontend com o status `AguardandoAssinatura`, interrompendo o fluxo antes de assinar e submeter.

#### [MODIFY] [server.js](file:///home/ilana/workspace/nearx26/StellarIptuChain/server.js)
- Receber `auditorPublicKey` na querystring.
- Alterar `account = await server.loadAccount(sourcePublicKey)` para usar o `auditorPublicKey` (caso exista).
- No bloco de construção da transação, fazer um `if (auditorPublicKey)` para retornar o XDR em vez de chamar `tx.sign(sourceKeypair)`.

### 2. Frontend Híbrido (`auditoria_hibrida.html`)
Criaremos um novo arquivo de interface.
#### [NEW] `auditoria_hibrida.html`
- Combinará o visual "Terminal" do Oráculo com o botão "Conectar Wallet" do Freighter.
- Ao clicar em Auditar, o frontend passa o `auditorPublicKey` para a API.
- Se o evento final (`event: result`) retornar o status `AguardandoAssinatura`, o frontend acionará `window.freighterApi.signTransaction(xdr)`.
- Após a assinatura do cidadão, o frontend submeterá o XDR finalizado ao Horizon (`server.submitTransaction`) e exibirá o link do Explorer.

### 3. Página Inicial (`index.html`)
#### [MODIFY] [index.html](file:///home/ilana/workspace/nearx26/StellarIptuChain/index.html)
- Adicionar o 5º card ao grid apontando para "Híbrido: Oráculo + Freighter", completando o leque de demonstrações.

## Verification Plan
1. **Auditoria Híbrida (Registro Novo):** O usuário conecta a carteira, pede para auditar. O Oráculo detecta que é novo, delega o XDR, o pop-up do Freighter abre, o usuário assina, a transação é submetida e confirmada no Explorer.
2. **Auditoria Híbrida (Registro Apto):** O usuário audita novamente. O Oráculo detecta os Hashes idênticos e finaliza a auditoria no servidor (verde), sem pedir assinatura no Freighter (pois não há nada para ancorar).
