import {
  isConnected,
  requestAccess,
  getAddress
} from "https://esm.sh/@stellar/freighter-api"

window.connectWallet =
  async function () {

    try {

      const connected =
        await isConnected()
let publicKey = ""

const localHashes = {}

/*
  Wallet mockada
*/

async function connectWallet() {

  publicKey =
    "GD7AG3APDQEXOS3KFIG3RBFVKOJWJ4AZOHGECXCOFECCRGDNO43WIX6B"

  document.getElementById(
    "walletAddress"
  ).innerText = publicKey

  alert(
    "Carteira mock conectada!"
  )
}

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
  Registro e ancoragem mockada
*/

async function anchorHash() {

  try {

    if (!publicKey) {

      alert(
        "Conecte a carteira primeiro"
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
      Payload original
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
      Persistência mockada
    */

    localHashes[matricula] = {

      payload,

      hash: hashHex

    }

    /*
      TX fake
    */

    const fakeTxHash =
      crypto.randomUUID()

    const explorerUrl =
      `https://stellar.expert/explorer/testnet/tx/${fakeTxHash}`

    /*
      Render
    */

    document.getElementById(
      "status"
    ).innerHTML = `

      <p>
        Payload Auditado
      </p>

      <small>
        ${payload}
      </small>

      <p class="success">
        SHA-256 Gerado
      </p>

      <small>
        ${hashHex}
      </small>

      <p class="success">
        Hash ancorado na Stellar Testnet
      </p>

      <small>
        ${fakeTxHash}
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

async function auditHash() {

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
      Recupera timestamp original
    */

    const originalData =
      JSON.parse(record.payload)

    /*
      Reconstrói payload atual
    */

    const payloadAtual =
      JSON.stringify({

        matricula,

        valor: valorAtual,

        timestamp:
          originalData.timestamp

      })

    /*
      Recalcula SHA-256
    */

    const recalculatedHash =
      await generateSHA256(
        payloadAtual
      )

    const integrity =
      recalculatedHash ===
      record.hash

    /*
      Render auditoria
    */

    document.getElementById(
      "auditResult"
    ).innerHTML = `

      <p>
        Payload Atual
      </p>

      <small>
        ${payloadAtual}
      </small>

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

    document.getElementById(
      "auditResult"
    ).innerHTML = `

      <p class="error">
        ${err.message}
      </p>

    `
  }
}

      console.log(connected)

      if (!connected.isConnected) {

        alert(
          "Freighter não encontrada"
        )

        return
      }

      await requestAccess()

      const result =
        await getAddress()

      document.getElementById(
        "wallet"
      ).innerText =
        result.address

      alert(
        "Freighter conectada!"
      )

    } catch(err){

      console.error(err)

      alert(err.message)
    }
}
