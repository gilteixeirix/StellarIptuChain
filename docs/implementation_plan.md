# Implementação do Oráculo (API Backend) para o IPTU Chain

Este plano detalha a criação da API em Node.js que funcionará como o Oráculo descrito no `RT-IPTUChain.docx`. O objetivo é mover a responsabilidade de assinatura e ancoragem da rede Stellar do Frontend (Freighter) para o Backend, utilizando uma conta controlada pela prefeitura.

## User Review Required

> [!WARNING]
> **Mudança Arquitetural:** O fluxo atual no Frontend usando a extensão **Freighter** será removido, já que o requisito de negócio define que a ancoragem deve ser feita pela conta oficial do sistema (prefeitura). O backend deterá a chave privada (Secret Key) para assinar as transações de forma automatizada. Você está de acordo com a remoção da integração com a Freighter do frontend?

## Open Questions

> [!IMPORTANT]
> - Podemos utilizar um arquivo `data.json` em memória ou SQLite simples para simular o banco de dados off-chain da prefeitura?
> - Gostaria que o frontend fosse alterado para consumir essa nova API ou prefere focar apenas no desenvolvimento do Backend neste momento?

## Proposed Changes

---

### Backend (Oráculo)

Criação de um novo projeto Node.js (`server.js`) que servirá a API e fará a sincronização.

#### [NEW] [package.json](file:///home/ilana/workspace/nearx26/StellarIptuChain/package.json)
- Configuração do projeto com as dependências `express`, `cors`, `dotenv` e `@stellar/stellar-sdk`.

#### [NEW] [server.js](file:///home/ilana/workspace/nearx26/StellarIptuChain/server.js)
- **Servidor Express:** Configuração de rotas e middlewares.
- **Rota `GET /api/iptu/:matricula`:** Simula a consulta ao banco de dados da prefeitura e retorna os dados off-chain do imóvel (valor, dono, etc).
- **Rota `POST /api/auditar`:** 
  1. Busca os dados do imóvel no banco simulado.
  2. Calcula o Hash SHA-256 dos dados atuais.
  3. Consulta o Horizon (Stellar) para resgatar o último Hash ancorado usando `loadAccount` e lendo o `data_attr` referente à matrícula.
  4. Se não existir hash ancorado ou se o hash atual for divergente do hash da blockchain, constrói e assina uma transação `ManageData` com a chave privada da prefeitura.
  5. Retorna o status de aptidão ("Apto" ou "Divergente / Re-ancorado") e o histórico.

#### [NEW] [.env](file:///home/ilana/workspace/nearx26/StellarIptuChain/.env)
- Variáveis de ambiente contendo:
  - `STELLAR_NETWORK=TESTNET`
  - `PUBLIC_KEY=...` (Chave pública da prefeitura)
  - `SECRET_KEY=...` (Chave privada para assinar as transações)

#### [NEW] [database.json](file:///home/ilana/workspace/nearx26/StellarIptuChain/database.json)
- Banco de dados em arquivo contendo os registros de imóveis e seus IPTUs para simular as respostas do banco off-chain.

---

### Frontend

Atualização da interface para interagir com o Oráculo ao invés de interagir diretamente com a blockchain via Freighter.

#### [MODIFY] [index.html](file:///home/ilana/workspace/nearx26/StellarIptuChain/index.html)
- Remoção do botão "Conectar Wallet" e do painel de carteira.
- Atualização do painel de Auditoria para buscar e exibir os dados vindos do Oráculo (`/api/auditar`).

#### [MODIFY] [main.js](file:///home/ilana/workspace/nearx26/StellarIptuChain/main.js)
- Remoção da integração com `@stellar/freighter-api` e `@stellar/stellar-sdk`.
- Implementação de requisições `fetch` para o backend `http://localhost:3000/api/auditar`.
- Lógica para exibir o "Card de Aptidão" baseado na resposta da API.

## Verification Plan

### Automated Tests
1. Realizar uma requisição `GET` para verificar os dados do imóvel mockado.
2. Realizar uma requisição `POST /api/auditar` para a matrícula. Verificar se ele ancora na Stellar e retorna "Divergente" (primeira vez).
3. Realizar a mesma requisição `POST` novamente e verificar se retorna "Apto" sem criar nova transação na rede.
4. Alterar manualmente o `database.json`, realizar a requisição `POST` novamente e verificar se o sistema detecta a violação e ancora o novo estado.

### Manual Verification
- Iniciar o `node server.js` e abrir o `index.html`. 
- Clicar no botão "Auditar" e observar a tela renderizando o Card de Aptidão e o link do *Stellar Expert*.
