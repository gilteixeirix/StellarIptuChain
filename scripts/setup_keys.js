import * as StellarSdk from '@stellar/stellar-sdk';
import fs from 'fs';

async function main() {
  console.log("Gerando novo par de chaves...");
  const pair = StellarSdk.Keypair.random();
  console.log("Public Key:", pair.publicKey());
  console.log("Secret Key:", pair.secret());

  console.log("Financiando conta via Friendbot...");
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(pair.publicKey())}`);
    await response.json();
    console.log("Conta financiada com sucesso!");
    
    const envContent = `STELLAR_NETWORK=TESTNET\nPUBLIC_KEY=${pair.publicKey()}\nSECRET_KEY=${pair.secret()}\n`;
    fs.writeFileSync('.env', envContent);
    console.log("Arquivo .env atualizado com as novas chaves.");
  } catch (e) {
    console.error("Erro ao financiar:", e);
  }
}
main();
