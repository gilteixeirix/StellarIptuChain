import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction
} from "https://esm.sh/@stellar/freighter-api"

import * as StellarSdk
from "https://esm.sh/@stellar/stellar-sdk"

/*
  Horizon Testnet
*/

const server =
  new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org"
  )

/*
  Wallet
*/

let publicKey = ""

/*
  Cache local auditoria
*/

const localHashes = {}

/*
  SHA-256
*/

async function generateSHA256(payload) {

  const encoder =
    new TextEncoder()

  const data =
    encoder.encode(payload)

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    )

  const hashArray =
    Array.from(
      new Uint8Array(hashBuffer)
    )

  return hashArray
    .map(
      b =>
        b.toString(16)
         .padStart(2, "0")
    )
    .join("")
}

/*
  Conectar wallet REAL
*/

window.connectWallet =
  async function () {

    try {

      const connected =
        await isConnected()

      if (!connected.isConnected) {

        alert(
          "Freighter não encontrada"
        )

        return
      }

      await requestAccess()

      const result =
        await getAddress()

      publicKey =
        result.address

      document.getElementById(
        "walletAddress"
      ).innerText =
        publicKey

      alert(
        "Carteira Stellar conectada!"
      )

    } catch(err){

      console.error(err)

      alert(err.message)
    }
}

/*
  Anchor REAL na Stellar
*/

window.anchorHash =
  async function () {

    try {

      if (!publicKey) {

        alert(
          "Conecte a carteira"
        )

        return
      }

      const matricula =
        document.getElementById(
          "matricula"
        ).value

      const valor =
        document.getElementById(
          "valor"
        ).value

      if (!matricula || !valor) {

        alert(
          "Preencha os campos"
        )

        return
      }

      /*
        Payload
      */

      const payload =
        JSON.stringify({

          matricula,

          valor,

          timestamp:
            new Date().toISOString()

        })

      /*
        SHA-256
      */

      const hashHex =
        await generateSHA256(
          payload
        )

      /*
        Cache auditoria
      */

      localHashes[matricula] = {

        payload,

        hash: hashHex

      }

      /*
        UI parcial
      */

      document.getElementById(
        "status"
      ).innerHTML = `

        <p>
          SHA-256
        </p>

        <small>
          ${hashHex}
        </small>

        <p>
          Enviando transação...
        </p>

      `

      /*
        Carrega conta
      */

      const account =
        await server.loadAccount(
          publicKey
        )

      /*
        Cria TX
      */

      const tx =
        new StellarSdk.TransactionBuilder(
          account,
          {
            fee:
              StellarSdk.BASE_FEE,

            networkPassphrase:
              StellarSdk.Networks.TESTNET
          }
        )

        .addOperation(

          StellarSdk.Operation.manageData({

            name:
              matricula.slice(0,64),

            value:
              hashHex.slice(0,64)

          })

        )

        .setTimeout(30)

        .build()

      /*
        Assina Freighter
      */

      const signed =
        await signTransaction(
          tx.toXDR(),
          {
            networkPassphrase:
              StellarSdk.Networks.TESTNET
          }
        )

      /*
        Reconstrói TX
      */

      const signedTx =
        StellarSdk.TransactionBuilder
          .fromXDR(
            signed.signedTxXdr,
            StellarSdk.Networks.TESTNET
          )

      /*
        Submit REAL
      */

      const result =
        await server.submitTransaction(
          signedTx
        )

      /*
        Explorer REAL
      */

      const explorerUrl =
        `https://stellar.expert/explorer/testnet/tx/${result.hash}`

      /*
        Render final
      */

      document.getElementById(
        "status"
      ).innerHTML = `

        <p class="success">
          Hash ancorado com sucesso!
        </p>

        <p>
          SHA-256
        </p>

        <small>
          ${hashHex}
        </small>

        <p>
          TX Hash
        </p>

        <small>
          ${result.hash}
        </small>

        <br><br>

        <a
          href="${explorerUrl}"
          target="_blank"
        >
          Ver no Explorer
        </a>

      `

    } catch(err){

      console.error(err)

      document.getElementById(
        "status"
      ).innerHTML = `

        <p class="error">
          ${err.message}
        </p>

      `
    }
}

/*
  Auditoria
*/

window.auditHash =
  async function () {

    try {

      const matricula =
        document.getElementById(
          "consultaMatricula"
        ).value

      const valorAtual =
        document.getElementById(
          "consultaValor"
        ).value

      if (!matricula || !valorAtual) {

        alert(
          "Preencha os campos"
        )

        return
      }

      const record =
        localHashes[matricula]

      if (!record) {

        document.getElementById(
          "auditResult"
        ).innerHTML = `

          <p class="error">
            Matrícula não encontrada
          </p>

        `

        return
      }

      /*
        Payload atual
      */

      const originalData =
        JSON.parse(record.payload)

      const payloadAtual =
        JSON.stringify({

          matricula,

          valor: valorAtual,

          timestamp:
            originalData.timestamp

        })

      /*
        Recalcula hash
      */

      const recalculatedHash =
        await generateSHA256(
          payloadAtual
        )

      /*
        Integridade
      */

      const integrity =
        recalculatedHash ===
        record.hash

      /*
        Render
      */

      document.getElementById(
        "auditResult"
      ).innerHTML = `

        <p>
          Hash Original
        </p>

        <small>
          ${record.hash}
        </small>

        <p>
          Hash Recalculado
        </p>

        <small>
          ${recalculatedHash}
        </small>

        <p class="${
          integrity
            ? "success"
            : "error"
        }">

          ${
            integrity
              ? "Registro íntegro"
              : "ALTERAÇÃO DETECTADA"
          }

        </p>

      `

    } catch(err){

      console.error(err)
    }
}
