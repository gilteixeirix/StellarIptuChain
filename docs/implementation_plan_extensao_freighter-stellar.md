# Integração Real com a Extensão Freighter (Stellar)

A verificação do código atual da interface `v1.html` indicou que a extensão de carteira da Stellar (Freighter) **não está sendo utilizada de verdade**. Atualmente, a função `connectWallet()` possui um Mock (simulação) que injeta um endereço público fixo ("GBG2..."), e a função `anchorHash()` apenas gera um Hash (UUID) falso simulando uma transação, sem de fato ir para a blockchain.

Para que a V1 seja uma demonstração fiel da abordagem descentralizada, precisamos integrar a biblioteca oficial da carteira e fazer com que o cidadão assine criptograficamente a operação.

> [!WARNING]
> A integração real exigirá que a máquina usada na apresentação tenha a extensão [Freighter](https://www.freighter.app/) instalada no navegador e configurada para a Testnet.

## Open Questions

Nenhuma dúvida impeditiva no momento. Apenas valide se o escopo abaixo atende a expectativa de demonstração da carteira real.

## Proposed Changes

### 1. `v1.html`
A página será refatorada para importar o SDK do Freighter e implementar o ciclo de vida real de uma transação Stellar pelo cliente.

#### [MODIFY] [v1.html](file:///home/ilana/workspace/nearx26/StellarIptuChain/v1.html)
- **Importação:** Adicionar via CDN a biblioteca `@stellar/freighter-api`.
- **Conexão (`connectWallet`):** Implementar a chamada real `await window.freighterApi.requestAccess()` e `window.freighterApi.getPublicKey()` para resgatar a chave pública da carteira do usuário.
- **Ancoragem Real (`anchorHash`):** 
  1. Carregar os dados da conta usando `server.loadAccount(publicKey)`.
  2. Construir a transação `ManageData` usando `StellarSdk.TransactionBuilder`.
  3. Solicitar a assinatura do usuário através da extensão: `await window.freighterApi.signTransaction(...)`.
  4. Submeter a transação assinada (XDR) à rede Testnet utilizando o Horizon (`server.submitTransaction`).

## Verification Plan

### Automated Tests
- O fluxo será testado manualmente no browser garantindo as respostas assíncronas do Horizon.

### Manual Verification
1. Abrir `http://localhost:3000/v1.html`.
2. Clicar em "Conectar Wallet" e verificar se a extensão do Freighter abre o pop-up pedindo permissão de acesso.
3. Preencher os dados e clicar em "Gerar SHA-256 + Ancorar". Verificar se a extensão abre pedindo assinatura criptográfica da transação.
4. Após assinar, aguardar a resposta da rede e validar se o link final gerado leva corretamente ao Stellar Expert com o ManageData consolidado.
