import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import * as StellarSdk from '@stellar/stellar-sdk';
import crypto from 'crypto';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'TESTNET';
const server = new StellarSdk.Horizon.Server(
  STELLAR_NETWORK === 'TESTNET'
    ? 'https://horizon-testnet.stellar.org'
    : 'https://horizon.stellar.org'
);

const sourcePublicKey = process.env.PUBLIC_KEY;
const sourceSecretKey = process.env.SECRET_KEY;
const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);

const getDatabase = () => {
  const data = fs.readFileSync('data/database.json', 'utf8');
  return JSON.parse(data);
};

const generateSHA256 = (payload) => {
  return crypto.createHash('sha256').update(payload).digest('hex');
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.get('/api/auditar/stream', async (req, res) => {
  const { matricula, auditorPublicKey } = req.query;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (msg, data = {}) => {
    res.write(`data: ${JSON.stringify({ msg, ...data })}\n\n`);
  };

  const db = getDatabase();
  const record = db[matricula];

  if (!record) {
    sendEvent('[ERRO] Matrícula não encontrada no banco da prefeitura.');
    res.write('event: end\ndata: {}\n\n');
    res.end();
    return;
  }

  try {
    sendEvent('1. Buscando dados da prefeitura off-chain...');
    await sleep(1000);

    const payload = JSON.stringify({
      matricula: record.matricula,
      valor: record.valor,
      proprietario: record.proprietario,
      timestamp: record.timestamp
    });

    sendEvent(`2. Gerando Hash SHA-256 local...`);
    const hashLocal = generateSHA256(payload);
    await sleep(1000);
    sendEvent(`-> Hash Local: ${hashLocal}`);
    await sleep(1000);

    sendEvent('3. Consultando a rede Blockchain (Stellar Ledger)...');
    let account;
    let hashOnChain = null;

    try {
      const targetPublicKey = auditorPublicKey || sourcePublicKey;
      account = await server.loadAccount(targetPublicKey);
      const dataAttrB64 = account.data_attr[matricula.slice(0, 64)];
      if (dataAttrB64) {
        hashOnChain = Buffer.from(dataAttrB64, 'base64').toString('utf8');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        sendEvent('[ERRO] A carteira conectada não existe na rede Stellar Testnet. Acesse o Freighter e ative/financie sua conta.');
      } else {
        sendEvent('[ERRO] Falha ao consultar a rede Stellar: ' + err.message);
      }
      res.write('event: end\ndata: {}\n\n');
      res.end();
      return;
    }

    await sleep(1000);

    if (hashOnChain === hashLocal) {
      sendEvent(`-> Hash On-Chain recuperado: ${hashOnChain}`);
      await sleep(1000);
      sendEvent('4. Conciliação concluída: Hashes idênticos. Nenhuma alteração fraudulenta.');
      await sleep(500);
      res.write(`event: result\ndata: ${JSON.stringify({
        status: 'Apto', hashLocal, hashOnChain, message: 'Registro íntegro. Nenhuma alteração foi detectada.'
      })}\n\n`);
      res.write('event: end\ndata: {}\n\n');
      res.end();
      return;
    }

    let status = 'Divergente';
    let finalMessage = 'Alteração ancorada no ledger.';

    if (!hashOnChain) {
      sendEvent('-> Nenhum hash encontrado na rede para esta matrícula.');
      await sleep(1000);
      sendEvent('[INFO] Registro Novo detectado! Iniciando ancoragem na Stellar...');
      status = 'Novo';
      finalMessage = 'Novo registro ancorado no ledger.';
    } else {
      sendEvent(`-> Hash On-Chain: ${hashOnChain}`);
      await sleep(1000);
      sendEvent('[ALERTA] Divergência de Hash detectada! Possível alteração manual/fraude no banco de dados!');
      await sleep(1000);
      sendEvent('[BLOQUEADO] O auditor se recusa a ancorar um hash divergente e potencialmente fraudulento na blockchain.');
      
      res.write(`event: result\ndata: ${JSON.stringify({
        status: 'Divergente', hashLocal, hashOnChainAnterior: hashOnChain, txHash: null, message: 'Auditoria Reprovada: O registro não corresponde ao estado seguro da blockchain.'
      })}\n\n`);
      res.write('event: end\ndata: {}\n\n');
      res.end();
      return;
    }

    await sleep(1000);
    sendEvent('5. Construindo transação ManageData com o novo Hash...');
    await sleep(1000);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks[STELLAR_NETWORK]
    })
      .addOperation(StellarSdk.Operation.manageData({
        name: matricula.slice(0, 64),
        value: hashLocal.slice(0, 64)
      }))
      .setTimeout(30)
      .build();

    if (!auditorPublicKey) {
      sendEvent('6. Assinando transação autonomamente com a chave privada do Oráculo...');
      tx.sign(sourceKeypair);
      await sleep(1000);

      sendEvent('7. Submetendo transação à rede Stellar...');
      const result = await server.submitTransaction(tx);
      sendEvent(`-> Transação aprovada e ancorada! TX Hash: ${result.hash}`);
      await sleep(1000);

      res.write(`event: result\ndata: ${JSON.stringify({
        status: status, hashLocal, hashOnChainAnterior: hashOnChain || 'Nenhum', txHash: result.hash, message: finalMessage
      })}\n\n`);
      res.write('event: end\ndata: {}\n\n');
      res.end();
    } else {
      sendEvent('6. [HÍBRIDO] Transação montada. Aguardando assinatura do Auditor via Freighter...');
      await sleep(1000);
      
      res.write(`event: result\ndata: ${JSON.stringify({
        status: 'AguardandoAssinatura', 
        xdr: tx.toXDR(),
        hashLocal: hashLocal
      })}\n\n`);
      res.write('event: end\ndata: {}\n\n');
      res.end();
    }

  } catch (error) {
    sendEvent(`[ERRO] ${error.message}`);
    res.write('event: end\ndata: {}\n\n');
    res.end();
  }
});

app.post('/api/simular-fraude', (req, res) => {
  const { matricula, novoValor } = req.body;
  if (!matricula || !novoValor) {
    return res.status(400).json({ error: 'Matrícula e novoValor são obrigatórios.' });
  }

  try {
    const db = getDatabase();
    if (!db[matricula]) {
      return res.status(404).json({ error: 'Matrícula não encontrada.' });
    }

    db[matricula].valor = novoValor;
    // Salva a alteração fraudulenta silenciosamente no banco, sem gerar novo timestamp
    fs.writeFileSync('data/database.json', JSON.stringify(db, null, 2));

    res.json({ message: `Fraude simulada com sucesso! O valor da matrícula ${matricula} foi alterado para ${novoValor} no banco de dados local (data/database.json).` });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao simular fraude.' });
  }
});

app.listen(PORT, () => {
  console.log(`Oráculo IPTU Chain rodando na porta ${PORT}`);
});
