let publicKey = ""

async function connectWallet() {

  try {

    const api =
      window.freighterApi ||
      window.freighter

    if (!api) {

      alert(
        "Freighter Wallet não encontrada"
      )

      return
    }

    const response =
      await api.getAddress()

    publicKey =
      response.address || response

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
      `${matricula}-${valor}-${Date.now()}`

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

    const hashHex =
      hashArray
        .map(
          b =>
            b.toString(16)
             .padStart(2, "0")
        )
        .join("")

    document.getElementById(
      "status"
    ).innerHTML = `

      <p>
        Hash gerado:
      </p>

      <small>
        ${hashHex}
      </small>

    `

    const server =
      new StellarSdk.Server(
        "https://horizon-testnet.stellar.org"
      )

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
          name:"iptu_hash",
          value:hashHex.slice(0,64)
        })
      )

      .setTimeout(30)

      .build()

    const api =
      window.freighterApi ||
      window.freighter

    const signed =
      await api.signTransaction(
        transaction.toXDR(),
        {
          network:
            "TESTNET"
        }
      )

    const tx =
      StellarSdk.TransactionBuilder
        .fromXDR(
          signed.signedTxXdr ||
          signed,
          StellarSdk.Networks.TESTNET
        )

    const result =
      await server.submitTransaction(
        tx
      )

    document.getElementById(
      "status"
    ).innerHTML += `

      <p class="success">
        Hash ancorado!
      </p>

      <small>
        ${result.hash}
      </small>

      <br/><br/>

      <a
        href="https://stellar.expert/explorer/testnet/tx/${result.hash}"
        target="_blank"
      >
        Ver transação
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
