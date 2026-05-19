# Arquitetura: Como Ancorar Atualizações Legítimas com Segurança?

O estágio atual do **IPTU Chain** atua como uma robusta Prova de Conceito (PoC) para demonstrar transparência governamental. Nele, garantimos a integridade dos dados validando-os através de um Oráculo (Auditor). No entanto, em um ambiente de produção em larga escala, precisamos garantir que as atualizações legítimas (como revisão do valor do IPTU, pagamentos parciais, etc.) sejam processadas e ancoradas na blockchain de forma inviolável e automática.

Para atingir essa maturidade e garantir que apenas registros autênticos sejam ancorados, o sistema emissor (aplicação municipal) deve evoluir. Abaixo apresentamos as três principais abordagens arquiteturais para resolver este desafio, destacando seus prós e contras (*trade-offs*).

---

## 1. Event Sourcing com Worker Blockchain (Fila de Mensageria)

Nesta abordagem, a aplicação atua como um sistema orientado a eventos. Sempre que a API da prefeitura efetivar uma alteração legítima no banco de dados (ex: um processo de recálculo deferido por um fiscal), o sistema emite um evento para uma fila de mensageria assíncrona (como RabbitMQ, Apache Kafka ou AWS SQS). Um serviço isolado (Worker) consome essa fila, gera o novo Hash e assina a ancoragem na rede Stellar.

**Trade-offs:**
- **Prós:** Altamente escalável e resiliente. O sistema backend principal não sofre com a latência de comunicação da blockchain. Se a rede Stellar apresentar lentidão, a mensagem permanece segura na fila para retentativa (garantia de entrega).
- **Contras:** Introduz o paradigma de "Consistência Eventual", onde pode haver um pequeno *delay* de tempo entre o salvamento no banco de dados local e o reflexo na blockchain. Exige uma gestão avançada de infraestrutura de mensageria.

---

## 2. Assinatura Digital de Payloads (Web3 Híbrida)

Antes de persistir a alteração no banco de dados relacional, o sistema back-end cria uma assinatura digital assimétrica (usando criptografia RSA ou ECDSA) para o payload do IPTU. O banco de dados passa a armazenar, além dos dados brutos, a assinatura do servidor. O Oráculo, ao auditar ou ancorar, verifica se a criptografia do dado bate com a chave pública do serviço municipal autorizado.

**Trade-offs:**
- **Prós:** Impede que um invasor ou um Administrador de Banco de Dados (DBA) faça alterações manuais fraudulentas diretamente na base de dados (`Update in-place`), pois ele não tem como forjar a assinatura sem passar pela regra de negócio.
- **Contras:** A segurança é falha caso a aplicação principal seja completamente comprometida. Se o atacante acessar as chaves do servidor (vazamento de API Keys), ele ainda poderá assinar dados fraudulentos, validando a fraude.

---

## 3. A Evolução Definitiva: Smart Contracts (Soroban na Stellar)

Para que a aplicação atinja o estado da arte em segurança, descentralização e confiança (`Trustless`), o modelo de simplesmente salvar Hashes de forma passiva através de operações de `ManageData` deve evoluir para **Contratos Inteligentes (Smart Contracts)** utilizando a plataforma **Soroban** nativa da rede Stellar.

Ao invés da regra de negócio existir exclusivamente no banco de dados da prefeitura, ela passa a viver na própria blockchain. 

### Como funcionaria?
Quando há uma necessidade de alterar o IPTU, a prefeitura não apenas altera o seu banco local. Ela invoca a função `update_tax_record` diretamente no Contrato Inteligente na Stellar. O contrato exige que as condições matemáticas e de negócio sejam satisfeitas antes de atualizar o "Estado Oficial" do IPTU.

### Vantagens Estratégicas para o Futuro:
1. **Imutabilidade em Nível de Regra de Negócio:** A lógica de recálculo ou perdão de dívida fica codificada na blockchain. Ninguém, nem mesmo o prefeito, pode alterar o imposto sem cumprir as exigências matemáticas estabelecidas no código.
2. **Aprovação Multi-assinatura (Multisig):** É possível exigir que alterações superiores a 50% do valor do imóvel exijam assinaturas conjuntas (ex: do auditor fiscal, do sistema automatizado e do chefe da receita).
3. **Auditoria Transparente e Ativa:** Qualquer alteração disparará eventos (`Smart Contract Events`) que o frontend cidadão pode escutar e validar em tempo real, sem depender de um Oráculo local comparando bancos de dados.

**Trade-offs:**
- Exige reescrever parte fundamental da lógica transacional do backend em linguagens compatíveis com o ecossistema (ex: Rust).
- Envolve custos marginais por transação computacional (Gas fees) um pouco mais elevados se comparados com transações cruas da Stellar tradicional.
- A sincronização entre o banco de dados interno relacional e o estado do Smart Contract (On-chain) requer sincronizadores avançados bidirecionais.

> **Visão de Longo Prazo:** Migrar para Contratos Inteligentes transforma o projeto de um simples "Carimbo de Tempo Descentralizado" em uma verdadeira **Plataforma Fiscal Autônoma e Inviolável**, eliminando por completo a dependência cega em servidores e bancos de dados centralizados da prefeitura.
