/*
  IMPORTS
*/

import * as StellarSdk
from "https://esm.sh/@stellar/stellar-sdk"

import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  allowAllModules
}
from "https://esm.sh/@creit.tech/stellar-wallets-kit"

/*
  STELLAR KIT
*/

const kit =
  new StellarWalletsKit({

    network:
      WalletNetwork.TESTNET,

    selectedWalletId:
      FREIGHTER_ID,

    modules:
      allowAllModules()

  })

/*
  HORIZON
*/

const server =
  new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org"
  )

/*
  WALLET
*/

let publicKey = ""

/*
  CACHE
*/

const localHashes = {}

/*
  SHA-256
*/

async function generateSHA256(payload){

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
         .padStart(2,"0")
    )
    .join("")
}

/*
  CONNECT WALLET
*/

window.connectWallet =
  async function(){

    try{

      await kit.openModal({

        onWalletSelected:
          async option => {

            try{

              kit.setWallet(
                option.id
              )

              const {
                address
              } =
                await kit.getAddress()

              publicKey =
                address

              document.getElementById(
                "walletAddress"
              ).innerText =
                publicKey

              alert(
                "Wallet conectada!"
              )

            } catch(innerErr){

              console.error(innerErr)

              alert(
                innerErr.message
              )
            }
          }
      })

    } catch(err){

      console.error(err)

      alert(err.message)
    }
}

/*
  ANCHOR HASH
*/

window.anchorHash =
  async function(){

    try{

      if(!publicKey){

        alert(
          "Conecte a wallet"
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

      if(!matricula || !valor){

        alert(
          "Preencha os campos"
        )

        return
      }

      /*
        PAYLOAD
      */

      const payload =
        JSON.stringify({

          matricula,

          valor,

          timestamp:
            new Date()
              .toISOString()

        })

      /*
        SHA
      */

      const hashHex =
        await generateSHA256(
          payload
        )

      /*
        CACHE
      */

      localHashes[matricula] = {

        payload,

        hash: hashHex

      }

      /*
        STATUS
      */

      document.getElementById(
        "status"
      ).innerHTML = `

        <p>
          Gerando transação...
        </p>

        <small>
          ${hashHex}
        </small>

      `

      /*
        ACCOUNT
      */

      const account =
        await server.loadAccount(
          publicKey
        )

      /*
        TX
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
        SIGN
      */

      const {
        signedTxXdr
      } =
        await kit.signTransaction(
          tx.toXDR(),
          {
            networkPassphrase:
              StellarSdk.Networks.TESTNET
          }
        )

      /*
        REBUILD
      */

      const signedTx =
        StellarSdk.TransactionBuilder
          .fromXDR(
            signedTxXdr,
            StellarSdk.Networks.TESTNET
          )

      /*
        REAL SUBMIT
      */

      const result =
        await server.submitTransaction(
          signedTx
        )

      console.log(result)

      /*
        EXPLORER
      */

      const explorerUrl =
        `https://stellar.expert/explorer/testnet/tx/${result.hash}`

      /*
        RENDER
      */

      document.getElementById(
        "status"
      ).innerHTML = `

        <p class="success">
          Hash ancorado!
        </p>

        <p>
          SHA-256
        </p>

        <small>
          ${hashHex}
        </small>

        <p>
          TX Hash REAL
        </p>

        <small>
          ${result.hash}
        </small>

        <br><br>

        <a
          href="${explorerUrl}"
          target="_blank"
        >
          Ver Explorer
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
  AUDITORIA
*/

window.auditHash =
  async function(){

    try{

      const matricula =
        document.getElementById(
          "consultaMatricula"
        ).value

      const valorAtual =
        document.getElementById(
          "consultaValor"
        ).value

      const record =
        localHashes[matricula]

      if(!record){

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
        ORIGINAL
      */

      const originalData =
        JSON.parse(
          record.payload
        )

      /*
        PAYLOAD ATUAL
      */

      const payloadAtual =
        JSON.stringify({

          matricula,

          valor:
            valorAtual,

          timestamp:
            originalData.timestamp

        })

      /*
        RECALCULA
      */

      const recalculatedHash =
        await generateSHA256(
          payloadAtual
        )

      /*
        INTEGRIDADE
      */

      const integrity =
        recalculatedHash ===
        record.hash

      /*
        RENDER
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
          Hash Atual
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
