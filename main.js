let publicKey = ""

const localHashes = {}

async function connectWallet() {

  try {

    /*
      Wallet mockada para MVP
    */

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
      Simula persistência
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
      Recalcula SHA-256
    */

    const recalculatedHash =
      await generateSHA256(
        record.payload
      )

    const integrity =
      recalculatedHash ===
      record.hash

    document.getElementById(
      "auditResult"
    ).innerHTML = `

      <p>
        <strong>
          Matrícula
        </strong>
      </p>

      <small>
        ${matricula}
      </small>

      <p>
        <strong>
          Hash armazenado
        </strong>
      </p>

      <small>
        ${record.hash}
      </small>

      <p>
        <strong>
          Hash recalculado
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
            : "Alteração detectada"
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
