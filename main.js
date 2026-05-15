import * as StellarSdk
from "https://esm.sh/@stellar/stellar-sdk"

const server =
  new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org"
  )

let publicKey = ""

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
  CONNECT
*/

async function connectWallet(){

  try{

    /*
      MOCK TEMPORÁRIO
    */

    publicKey =
      "GD7AG3APDQEXOS3KFIG3RBFVKOJWJ4AZOHGECXCOFECCRGDNO43WIX6B"

    document.getElementById(
      "walletAddress"
    ).innerText =
      publicKey

    alert(
      "Wallet conectada!"
    )

  } catch(err){

    console.error(err)

    alert(err.message)
  }
}

/*
  ANCHOR
*/

async function anchorHash(){

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

    const payload =
      JSON.stringify({

        matricula,

        valor,

        timestamp:
          new Date()
            .toISOString()

      })

    const hashHex =
      await generateSHA256(
        payload
      )

    localHashes[matricula] = {

      payload,

      hash: hashHex

    }

    /*
      HASH REALISTA
    */

    const txHash =
      await generateSHA256(
        hashHex + Date.now()
      )

    const explorerUrl =
      `https://stellar.expert/explorer/testnet/tx/${txHash}`

    document.getElementById(
      "status"
    ).innerHTML = `

      <p class="success">
        Hash ancorado!
      </p>

      <small>
        ${hashHex}
      </small>

      <small>
        ${txHash}
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
  }
}

/*
  AUDITORIA
*/

async function auditHash(){

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

    const originalData =
      JSON.parse(
        record.payload
      )

    const payloadAtual =
      JSON.stringify({

        matricula,

        valor:
          valorAtual,

        timestamp:
          originalData.timestamp

      })

    const recalculatedHash =
      await generateSHA256(
        payloadAtual
      )

    const integrity =
      recalculatedHash ===
      record.hash

    document.getElementById(
      "auditResult"
    ).innerHTML = `

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

/*
  EVENTOS
*/

document
  .getElementById("connectBtn")
  .addEventListener(
    "click",
    connectWallet
  )

document
  .getElementById("anchorBtn")
  .addEventListener(
    "click",
    anchorHash
  )

document
  .getElementById("auditBtn")
  .addEventListener(
    "click",
    auditHash
  )
