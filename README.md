# <img src="public/assets/iptu-chain-image.jpeg" alt="Logo IPTU Chain" width="60" align="absmiddle"/> Stellar IPTU Chain

**Lançamento e auditoria de IPTU na Blockchain Stellar.**

O **IPTU Chain** é uma Prova de Conceito (PoC) de uma aplicação web descentralizada (DApp) projetada para garantir a imutabilidade e a transparência do lançamento e auditoria de impostos municipais (como o IPTU) utilizando a rede blockchain da Stellar.

## 🚀 O Problema e a Solução

Bancos de dados municipais tradicionais são suscetíveis a alterações indevidas (fraudes de recálculo ou perdão de dívidas) feitas por insiders. O **IPTU Chain** resolve esse problema "ancorando" um Hash criptográfico do estado da dívida (Matrícula + Valor + Proprietário + Timestamp) na rede Stellar.

Toda vez que a aplicação consulta o banco de dados da prefeitura, ela atua como um **Oráculo Híbrido**:
1. Lê os dados atuais do banco de dados (off-chain).
2. Calcula o Hash SHA-256 local.
3. Busca o Hash histórico salvo na conta da blockchain (on-chain).
4. **Valida a integridade**: Se os hashes forem iguais, o registro é autêntico (**Apto**). Se forem diferentes, o sistema detecta a adulteração (**Divergente**) e recusa-se a atualizar a blockchain com os dados fraudulentos.

Para registros legítimos (**Novos**), o Oráculo monta uma transação XDR e a devolve ao usuário (Auditor), que a **assina de forma descentralizada** usando a carteira Freighter.

## 💻 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 (Glassmorphism), Vanilla JavaScript, SSE (Server-Sent Events).
- **Backend (Oráculo):** Node.js, Express.js.
- **Blockchain:** [Stellar Network](https://stellar.org/) (Testnet).
- **Integração Web3:** 
  - `@stellar/stellar-sdk` para comunicação com o Horizon (API da rede Stellar).
  - `@stellar/freighter-api` (V3) para login e assinatura de transações sem vazar as chaves privadas (`Secret Key`).

## 📁 Estrutura de Diretórios

O repositório está organizado seguindo padrões de segurança e componentização web:

```text
/StellarIptuChain
├── public/                 # Todo o Frontend seguro e estático (exposto pelo servidor)
│   ├── assets/             # Imagens e logos
│   ├── css/                # Folhas de estilo (Glassmorphism, responsividade)
│   ├── js/                 # Lógicas de interface (main.js, oracle.js)
│   └── *.html              # Dashboards, Mocks e Oráculos
├── docs/                   # Documentação, relatórios, diagramas (.docx, .pdf, .md)
├── scripts/                # Scripts Python e JS utilitários
├── data/                   # Armazenamento do "banco de dados" em JSON (isolado do público)
├── server.js               # O Servidor Backend / Oráculo Node.js principal
├── swagger.json            # Configuração e rotas documentadas para o Swagger UI
└── package.json / .env     # Dependências e Variáveis de Ambiente sensíveis
```
*Atenção: Todos os dados sensíveis e lógica pesada ficam no root ou nas subpastas seguras. Apenas a pasta `public/` é servida publicamente.*

## 🛠 Como Instalar e Executar o Projeto Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o Servidor do Oráculo:**
   O servidor irá servir as páginas HTML e a API do Oráculo na porta 3000.
   ```bash
   node server.js
   ```

3. **Acesse o Dashboard Hub:**
   Abra seu navegador em: [http://localhost:3000](http://localhost:3000)

## 🦊 Requisito Crítico: Carteira Freighter & Friendbot

Para testar o fluxo Híbrido e Manual, você **obrigatoriamente** precisa ter a carteira da Stellar instalada e financiada com saldos de teste.

1. **Instale a Extensão:** Baixe a extensão [Freighter](https://www.freighter.app/) para Chrome ou Firefox.
2. **Crie uma Conta:** Siga o passo a passo na extensão para gerar sua senha e suas palavras de recuperação.
3. **Mude para a Testnet:** Abra a extensão, clique na Engrenagem (Configurações) no canto superior direito > *Preferences* > e selecione a rede **Testnet**.
4. **Financie a Conta (Adicionar XLM):** Uma carteira nova não existe na blockchain até ter saldo. Na tela inicial da extensão Freighter (certifique-se de estar na Testnet), procure pelo botão/opção **"Fund with Friendbot"** ou **"Fund on Testnet"**. Clique nele, aguarde alguns segundos e você receberá `10.000 XLM` de saldo de teste. 
   *(Se a conta não for financiada, o sistema apresentará erro ao consultar o ledger informando que a carteira conectada não existe na rede).*

## 🧪 Passo a Passo para Testar e Validar (Demonstração Completa)

Siga este roteiro para testar o sistema de ponta a ponta:

### Passo 1: Ancorando uma Nova Matrícula (Interface Híbrida)
1. Abra o **Dashboard Hub** (`http://localhost:3000`).
2. Clique no card **"Oráculo Híbrido (Freighter)"**.
3. O sistema solicitará a conexão com sua carteira Freighter. Aprove o acesso.
4. Digite a matrícula `IPTU-2026-NOVO` (ou qualquer outra existente no arquivo `database.json`) e clique em **Auditar**.
5. O terminal inteligente na tela mostrará a conciliação. Como é o primeiro acesso, ele detectará um **Registro Novo** e montará uma transação.
6. A extensão Freighter **abrirá um Pop-up**. Revise a operação e clique em **Approve/Sign**.
7. O card verde aparecerá mostrando que a ancoragem foi um sucesso, preenchendo o Hash da Blockchain.
8. Role a tela para ver a tabela **Histórico de Ancoragens (Blockchain)** atualizada instantaneamente e clique nos links para ver as transações direto no explorador *Stellar Expert*.

### Passo 2: Verificando um Registro Saudável (Apto)
1. Na mesma tela, clique novamente em **Auditar** para a mesma matrícula que acabou de ancorar (`IPTU-2026-NOVO`).
2. O servidor fará a conciliação e confirmará que o Hash Local da Prefeitura é idêntico ao Hash On-Chain gravado na rede Stellar.
3. O card de resultado ficará Verde com o status **Apto**, não sendo necessária nenhuma assinatura adicional.

### Passo 3: Simulando e Detectando uma Fraude (Swagger + Oráculo)
1. No **Dashboard Hub**, acesse o card **"API Docs & Simulação"** (ou vá para `http://localhost:3000/api-docs`).
2. Abra a rota `POST /api/simular-fraude` e clique em *Try it out*.
3. No corpo da requisição (JSON), insira:
   ```json
   {
     "matricula": "IPTU-2026-NOVO",
     "novoValor": 150
   }
   ```
4. Clique em **Execute**. Isso altera silenciosamente o valor no "banco de dados da prefeitura" (`database.json`), fingindo ser um hacker interno.
5. Volte para a aba do **Oráculo Híbrido** e clique em **Auditar** mais uma vez na matrícula `IPTU-2026-NOVO`.
6. O Oráculo fará a re-checagem e detectará a fraude! A interface piscará um card vermelho marcando a matrícula como **Divergente**, evidenciando que os Hashes não batem.
7. O Oráculo **se recusará a ancorar** a fraude na blockchain e interromperá o fluxo, preservando a integridade do estado original da dívida.

---
**Nota sobre Evolução:** Verifique o painel "Evolução da Arquitetura" no Dashboard para entender o plano futuro da ferramenta, que visa mover toda essa lógica de Oráculo local para Contratos Inteligentes nativos da Stellar via **Soroban**.
