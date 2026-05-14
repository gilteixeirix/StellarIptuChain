import './style.css'

import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction
} from '@stellar/freighter-api'

import * as StellarSdk
  from '@stellar/stellar-sdk'

document.querySelector('#app').innerHTML = `

  <div class="container">

    <h1>IPTU Chain</h1>

    <p>
      Auditoria de IPTU com Stellar Testnet
    </p>

    <button id="connectBtn">
      Conectar Freighter
    </button>

    <div class="card">

      <strong>Carteira:</strong>

      <div id="walletAddress">
        Não conectada
      </div>

    </div>

    <div class="card">

      <input
        id="matricula"
        placeholder="Matrícula do imóvel"
      />

      <input
        id="valor"
        placeholder="Valor IPTU"
      />

      <button id="anchorBtn">
        Ancorar Hash
      </button>

      <div id="status"></div>

    </div>

  </div>

`

let publicKey = ''

const connectBtn =
  document.querySelector('#connectBtn')

const anchorBtn =
  document.querySelector('#anchorBtn')

connectBtn.addEventListener(
  'click',
  async () => {

    try {

      const connected =
        await isConnected()

      if (!connected.isConnected) {

        alert(
          'Freighter não encontrada'
        )

        return
      }

      await requestAccess()

      const address =
        await getAddress()

      publicKey =
        address.address

      document.querySelector(
        '#walletAddress'
      ).innerText = publicKey

      alert(
        'Carteira conectada!'
      )

    } catch(err){

      console.error(err)

      alert(err.message)
    }
  }
)

anchorBtn.addEventListener(
  'click',
  async () => {

    try {

      if (!publicKey) {

        alert(
          'Conecte a carteira'
        )

        return
      }

      const matricula =
        document.querySelector(
          '#matricula'
        ).value

      const valor =
        document.querySelector(
          '#valor'
        ).value

      if (!matricula || !valor) {

        alert(
          'Preencha os campos'
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
          'SHA-256',
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
              b
                .toString(16)
                .padStart(2, '0')
          )
          .join('')

      const server =
        new StellarSdk.Horizon.Server(
          'https://horizon-testnet.stellar.org'
        )

      const account =
        await server.loadAccount(
          publicKey
        )

      const tx =
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
            name: 'iptu_hash',
            value:
              hashHex.slice(0, 64)
          })
        )

        .setTimeout(30)

        .build()

      const signed =
        await signTransaction(
          tx.toXDR(),
          {
            networkPassphrase:
              StellarSdk.Networks.TESTNET
          }
        )

      const finalTx =
        StellarSdk.TransactionBuilder
          .fromXDR(
            signed.signedTxXdr,
            StellarSdk.Networks.TESTNET
          )

      const result =
        await server.submitTransaction(
          finalTx
        )

      document.querySelector(
        '#status'
      ).innerHTML = `

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
          Ver Explorer
        </a>

      `

    } catch(err){

      console.error(err)

      document.querySelector(
        '#status'
      ).innerHTML = `

        <p class="error">
          ${err.message}
        </p>

      `
    }
  }
)
