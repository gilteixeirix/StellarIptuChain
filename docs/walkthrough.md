# Implementação do Oráculo IPTU Chain

A arquitetura do sistema foi completamente reestruturada para atender aos requisitos de conformidade estabelecidos, transferindo a responsabilidade da assinatura criptográfica das transações do navegador do usuário final (Frontend/Freighter) para o servidor da prefeitura (Backend/Oráculo).

## O que foi desenvolvido?

1. **API Node.js (Oráculo)**
   - Criado o arquivo `server.js` utilizando o framework `Express` para fornecer a API de auditoria de forma centralizada.
   - O oráculo agora carrega a chave privada da "Conta Fonte" (source_account) de um arquivo `.env` seguro.
   - O sistema gera, assina e submete transações à rede `Stellar Testnet` sem depender de carteiras de terceiros.

2. **Banco de Dados Simulado (Off-chain)**
   - O arquivo `database.json` foi implementado para atuar como o banco de dados oficial da prefeitura. Ele retorna as informações cruas do imóvel (Matrícula, Valor, Proprietário, e Timestamp) quando o oráculo consulta a matrícula.

3. **Fluxo Automático de Reconciliação (Server-Sent Events)**
   - Na nova rota `GET /api/auditar/stream`, o sistema faz a "reconciliação do estado" e emite os eventos de processamento (logs em tempo real) via **Server-Sent Events (SSE)**. 
   - Ao receber a matrícula, o oráculo extrai o Hash (SHA-256) dos dados atuais do banco local. Em seguida, busca o último registro atrelado àquela matrícula diretamente no ledger da Stellar.
   - **Caso de uso - Novo:** Se o oráculo constatar que não há hash anterior registrado na blockchain para essa matrícula, ele emite o log `[INFO] Registro Novo detectado!`, fará a primeira ancoragem na rede e finalizará com o status **Novo (Ancorado)**.
   - **Caso de uso - Apto:** Se os dados do banco baterem perfeitamente com os dados blindados na blockchain, a auditoria é confirmada, e nenhuma transação nova é forjada.
   - **Caso de uso - Divergente:** Se o banco sofreu mutação fraudulenta (ex: o valor do imposto diminuiu sem gerar um novo timestamp/evento), o oráculo detecta a violação, exibe um alerta de "Divergência", e *reprova a auditoria*, recusando-se terminantemente a ancorar o novo hash fraudulento na Blockchain.

4. **Comparativo de Interfaces**
   - A aplicação agora suporta diferentes abordagens, o que permite o comparativo prático na demonstração a partir da Página Inicial (`index.html`).
   - A interface antiga foi renomeada e dividida em duas: `auditoria_manual_mock.html` (para demonstrações sem carteira) e `auditoria_manual_freighter.html` (implementação real utilizando a extensão Web3 Freighter).
   - O grande diferencial agora é a versão **Híbrida (`auditoria_hibrida.html`)**: nela, o servidor atua como um Oráculo que faz toda a validação de segurança e delega a assinatura da transação via Freighter para o Cidadão/Auditor, aliando a segurança da automação à descentralização de chaves.
   - O `server.js` do oráculo foi configurado para também servir o frontend (`app.use(express.static('.'))`), então não é mais necessário o servidor HTTP Python.
5. **Documentação e Simulação (Swagger UI)**
   - O oráculo agora expõe uma interface gráfica do **Swagger** em `http://localhost:3000/api-docs`.
   - Através do Swagger, é possível consultar a documentação de arquitetura da API e disparar testes para a rota `POST /api/simular-fraude`, que permite realizar injeções manuais no banco de forma interativa durante a demonstração.

## 🛠️ Como Testar e Validar

Execute o comando `node server.js` em seu terminal. Isso vai iniciar a API e servir os arquivos no porto 3000.

1. Acesse o front-end V2 pelo link: [http://localhost:3000/oracle.html](http://localhost:3000/oracle.html)
2. No campo **Matrícula**, insira uma matrícula nunca testada, como por exemplo: `IPTU-2026-TESTE`
3. Clique em **Auditar**.
4. Observe o painel do "Terminal" no dashboard: Como é a primeira vez que esse hash é validado na blockchain, o Oráculo irá detectar que ele é **Novo** e fará a **ancoragem na Stellar Testnet**. O Dashboard retornará com o status azul **Novo (Ancorado)**.
5. Em seguida, clique em **Auditar** *novamente*. Dessa vez, o Hash já está na blockchain. O Oráculo detectará a paridade dos Hashes, e você receberá um status verde **Apto**, não precisando ancorar novamente!

### Quer testar a detecção de fraude?
Para validar o Event Sourcing e a detecção de alteração fraudulenta (Update in-place), você pode utilizar a interface do Swagger:

1. Acesse o **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
2. Expanda o endpoint `POST /api/simular-fraude` e clique em **Try it out**.
3. Envie o JSON com a matrícula e o novo valor (ex: `{"matricula": "IPTU-2026-0001", "novoValor": 150}`). Execute a requisição. O valor será alterado silenciosamente no banco.
4. Volte à página (`http://localhost:3000/oracle.html`), insira `IPTU-2026-0001` e aperte **Auditar**.
5. O sistema imediatamente acenderá o alerta vermelho de **Divergente**, o terminal acusará a fraude, e o auditor recusará a ancorar o novo "Estado" fraudulento na blockchain.


### 🧪 Como Testar a Nova Interface Real

> [!WARNING]
> Certifique-se de que a extensão **Freighter** esteja instalada, desbloqueada e configurada para a **Stellar Testnet** no navegador.

1. Acesse o **Dashboard Freighter**: [http://localhost:3000/auditoria_manual_freighter.html](http://localhost:3000/auditoria_manual_freighter.html)
2. Clique em "Conectar Wallet" e aprove o pop-up de conexão que a extensão Freighter exibirá.
3. Preencha uma matrícula e um valor de IPTU.
4. Clique no botão verde. A interface mudará o status para *"Aguardando assinatura na extensão Freighter..."*.
5. A extensão abrirá pedindo que você aprove e assine a transação. 
6. Ao aprovar, o sistema vai submeter via Horizon e gerar o Hash Final na Blockchain!