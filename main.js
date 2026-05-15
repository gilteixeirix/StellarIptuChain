let publicKey = ""

/*
  Stellar Horizon Testnet
*/

const server =
  new StellarSdk.Server(
    "https://horizon-testnet.stellar.org"
  )

/*
  Conectar Freighter Wallet
*/

async function connectWallet() {

  try {

    /*
      Detecta API
    */

    const api =
      window.freighterApi ||
      window.freighter ||
      window.stellar

    if (!api) {

      alert(
        "Freighter Wallet não encontrada"
      )

      return
    }

    /*
      Obtém chave pública
    */

    const response =
      await api.getAddress()

    publicKey =
      response.address || response

    /*
      Render wallet
    */

    document.getElementById(
      "walletAddress"
    ).innerText = publicKey

    alert(
      "Carteira conectada!"
    )

  } catch(err){

    console.error(err)

    alert(err.message)
  }
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
  Anchor hash na Stellar
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
      Render parcial
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

      <p>
        Enviando transação...
      </p>

    `

    /*
      Carrega conta Stellar
    */

    const account =
      await server.loadAccount(
        publicKey
      )

    /*
      Cria transação
    */

    const transaction =
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
      Assina via Freighter
    */

    const api =
      window.freighterApi ||
      window.freighter

    const signed =
      await api.signTransaction(
        transaction.toXDR(),
        {
          networkPassphrase:
            StellarSdk.Networks.TESTNET
        }
      )

    /*
      Reconstrói TX assinada
    */

    const signedTx =
      StellarSdk.TransactionBuilder
        .fromXDR(
          signed.signedTxXdr,
          StellarSdk.Networks.TESTNET
        )

    /*
      Submit Horizon
    */

    const result =
      await server.submitTransaction(
        signedTx
      )

    /*
      Explorer
    */

    const explorerUrl =
      `https://stellar.expert/explorer/testnet/tx/${result.hash}`

    /*
      Render final
    */

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
  Auditoria simples
*/

async function auditHash() {

  document.getElementById(
    "auditResult"
  ).innerHTML = `

    <p class="success">
      Auditoria disponível apenas
      na versão backend completa.
    </p>

  `
}
