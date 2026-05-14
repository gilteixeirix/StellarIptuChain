<script src="https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/10.4.1/stellar-sdk.min.js"></script>

<script>

let publicKey = ""

async function connectWallet() {

  try {

    if (
      !window.freighterApi &&
      !window.freighter
    ) {

      alert("Freighter não encontrada")

      return
    }

    const api =
      window.freighterApi ||
      window.freighter

    const response =
      await api.getAddress()

    publicKey =
      response.address || response

    document.getElementById(
      "walletAddress"
    ).innerText = publicKey

    alert("Carteira conectada!")

  } catch(err){

    console.error(err)

    alert(err.message)
  }
}

async function anchorHash() {

  try {

    if (!publicKey) {

      alert("Conecte a carteira")

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

      <p style="color:lime">
        Hash gerado:
      </p>

      <small>${hashHex}</small>

    `

  } catch(err){

    console.error(err)

    alert(err.message)
  }
}

</script>
