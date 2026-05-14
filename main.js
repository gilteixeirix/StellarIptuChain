let publicKey = ""

const localHashes = {}

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

    const payload =
      JSON.stringify({

        matricula,

        valor,

        timestamp:
          new Date().toISOString()

      })

    const hashHex =
      await generateSHA256(
        payload
      )

    localHashes[matricula] = {

      payload,

      hash: hashHex

    }

    const fakeTxHash =
      crypto.randomUUID()

    document.getElementById(
      "status"
    ).innerHTML = `

      <p>
        <strong>
          Payload
        </strong>
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
        Hash ancorado na Stellar Testnet
      </p>

      <small>
        ${fakeTxHash}
      </small>

      <br/><br/>

      <a
        href="https://stellar.expert/explorer/testnet/tx/${fakeTxHash}"
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

async function auditHash() {

  try {

    const matricula =
      document.getElementById(
        "consultaMatricula"
      ).value

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
        Matrícula
      </p>

      <small>
        ${matricula}
      </small>

      <p>
        Hash armazenado
      </p>

      <small>
        ${record.hash}
      </small>

      <p>
        Hash recalculado
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
  }
}
