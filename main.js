import {
  isConnected,
  requestAccess,
  getAddress
} from "https://esm.sh/@stellar/freighter-api"

/*
  Wallet
*/

let publicKey = ""

/*
  Storage local mockado
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
  Conectar Freighter
*/

window.connectWallet =
  async function () {

    try {

      const connected =
        await isConnected()

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
  Registrar hash
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
        Simula blockchain
      */

      localHashes[matricula] = {

        payload,

        hash: hashHex

      }

      /*
        Fake TX
      */

      const fakeTxHash =
        crypto.randomUUID()

      /*
        Explorer
      */

      const explorerUrl =
        `https://stellar.expert/explorer/testnet/tx/${fakeTxHash}`

      /*
        Render
      */

      document.getElementById(
        "status"
      ).innerHTML = `

        <p>
          Payload
        </p>

        <small>
          ${payload}
        </small>

        <p class="success">
          SHA-256
        </p>

        <small>
          ${hashHex}
        </small>

        <p class="success">
          Hash ancorado
        </p>

        <small>
          ${fakeTxHash}
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

      alert(err.message)
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
        Timestamp original
      */

      const originalData =
        JSON.parse(record.payload)

      /*
        Payload atual
      */

      const payloadAtual =
        JSON.stringify({

          matricula,

          valor: valorAtual,

          timestamp:
            originalData.timestamp

        })

      /*
        Recalcula SHA
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

      alert(err.message)
    }
}
