let publicKey = ""

async function connectWallet() {

  try {

    let api = null

    if (window.freighterApi) {
      api = window.freighterApi
    }

    else if (window.freighter) {
      api = window.freighter
    }

    else if (window.stellar) {
      api = window.stellar
    }

    if (!api) {

      console.log(window)

      alert(
        "Freighter API não encontrada"
      )

      return
    }

    console.log("API encontrada:", api)

    let response = null

    if (api.getAddress) {

      response =
        await api.getAddress()

    } else {

      throw new Error(
        "Método getAddress não encontrado"
      )
    }

    console.log(response)

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

    const payload = JSON.stringify({

      matricula,

      valor,

      timestamp:
        new Date().toISOString()

    })

    console.log(
      "Payload:",
      payload
    )

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

    console.log(
      "SHA-256:",
      hashHex
    )

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

      <br/><br/>

      <p>
        <strong>
          SHA-256 Gerado
        </strong>
      </p>

      <small>
        ${hashHex}
      </small>

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
