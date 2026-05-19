# 🌟 Entrega: Refatoração da Camada de Assinatura Descentralizada

Atendendo ao pedido para mantermos ambas as estratégias didáticas e melhorarmos a semântica do projeto, dividimos e refatoramos as antigas interfaces.

### 📝 O que mudou?

1. **Renomeação Semântica**:
   - `v1.html` -> **`auditoria_manual_mock.html`**: A versão que usamos anteriormente. Mantém a simulação ("Mock") da carteira, permitindo demonstrar a prova de conceito de forma instantânea sem precisar instalar a extensão no navegador (Ideal para a apresentação em palco).
   
2. **Nova Implementação Real Web3**:
   - Criamos o arquivo **`auditoria_manual_freighter.html`**. Ele importa o pacote oficial `@stellar/freighter-api`.
   - Agora, ao invés de usar uma chave hardcoded, a aplicação aciona a extensão oficial do Freighter instalada no seu navegador.
   - O processo de ancoragem na Stellar aguarda a resposta assíncrona do usuário assinando criptograficamente a operação (`ManageData`) na própria carteira, consolidando a verdadeira **Integração Web3**.

3. **Atualização da Landing Page (`index.html`)**:
   - A página inicial foi expandida e agora contém **Cards Dedicados** para as duas abordagens manuais (com ícones distintos 🪪 e 🦊), deixando muito claro qual interface o usuário está acessando.
   
4. **Alinhamento Documental**:
   - Os links de navegação entre as telas foram todos atualizados para refletir as novas nomenclaturas. O `README.md` e o nosso repositório de `walkthrough.md` já apontam para essas novas URLs.

---

