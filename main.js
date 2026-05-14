let publicKey = ""

const localHashes = {}

/*
  Conexão mockada da wallet
*/

async function connectWallet() {

  try {

    publicKey =
      "GD7AG3APDQEXOS3KFIG3RBFVKOJWJ4AZOHGECXCOFECCRGDNO43WIX6B"

    document.getElementById(
      "walletAddress"
    ).innerText = publicKey

    alert(
      "Carteira mock conectada!"
    )

  } catch(err){

    console.error(err)

    alert(err.message)
  }
}

/*
  Geração SHA-256
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
  Ancoragem mockada
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
      Payload auditável
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
      Simula persistência blockchain
    */

    localHashes[matricula] = {

      payload,

      hash: hashHex

    }

    /*
      Mock TX Hash
    */

    const fakeTxHash =
      crypto.randomUUID()

    const explorerUrl =
      `https://stellar.expert/explorer/testnet/tx/${fakeTxHash}`

    /*
      Render HTML
    */

    document.getElementById(
      "status"
    ).innerHTML = `

      <p>
        <strong>
          Payload Auditado
        </strong>
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

      <p>
        TX Hash
      </p>

      <small>
        ${fakeTxHash}
      </small>

      <br/><br/>

      <a
        href="${explorerUrl}"
        target="_blank"
      >
        Ver no Stellar Explorer
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
  Auditoria de integridade
*/

async function auditHash() {

  try {

    const matricula =
      document.getElementById(
        "consultaMatricula"
      ).value

    if (!matricula) {

      alert(
        "Informe a matrícula"
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
      Simulação de alteração fraudulenta
    */

    const payloadAtual =
      JSON.stringify({

        matricula,

        valor:"999999.99",

        timestamp:
          new Date().toISOString()

      })

    /*
      Recalcula SHA-256
    */

    const recalculatedHash =
      await generateSHA256(
        payloadAtual
      )

    /*
      Verifica integridade
    */

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
        <strong>
          Payload Original
        </strong>
      </p>

      <small>
        ${record.payload}
      </small>

      <p>
        <strong>
          Payload Atual
        </strong>
      </p>

      <small>
        ${payloadAtual}
      </small>

      <p>
        <strong>
          Hash Original
        </strong>
      </p>

      <small>
        ${record.hash}
      </small>

      <p>
        <strong>
          Hash Recalculado
        </strong>
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
