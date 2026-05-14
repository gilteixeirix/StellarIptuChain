let publicKey = ""

const server =
  new StellarSdk.Server(
    "https://horizon-testnet.stellar.org"
  )

const localHashes = {}

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
      hash:hashHex
    }

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

      <p>
        Enviando para Stellar Testnet...
      </p>

    `

    const account =
      await server.loadAccount(
        publicKey
      )

    const transaction =
      new StellarSdk.TransactionBuilder(
        account,
        {
          fee:"100",
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

const fakeTxHash =
  crypto.randomUUID()

const fakeExplorerUrl =
  `https://stellar.expert/explorer/testnet/tx/${fakeTxHash}`

document.getElementById(
  "status"
).innerHTML += `

  <p class="success">
    Hash ancorado com sucesso!
  </p>

  <p>
    TX Hash
  </p>

  <small>
    ${fakeTxHash}
  </small>

  <br/><br/>

  <a
    href="${fakeExplorerUrl}"
    target="_blank"
  >
    Ver no Stellar Explorer
  </a>

`

    document.getElementById(
      "status"
    ).innerHTML += `

      <p class="success">
        Hash ancorado com sucesso!
      </p>

      <p>
        TX Hash
      </p>

      <small>
        ${result.hash}
      </small>

      <br/><br/>

      <a
        href="https://stellar.expert/explorer/testnet/tx/${result.hash}"
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

        <p class="warning">
          Matrícula não encontrada
        </p>

      `

      return
    }

    const recalculatedHash =
      await generateSHA256(
        record.payload
      )

    const isValid =
      recalculatedHash ===
      record.hash

    document.getElementById(
      "auditResult"
    ).innerHTML = `

      <p>
        Matrícula:
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
        isValid
          ? "success"
          : "error"
      }">

        ${
          isValid
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
