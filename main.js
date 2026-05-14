import './style.css'

import {
  isConnected,
  requestAccess,
  getAddress
} from '@stellar/freighter-api'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>IPTU Chain</h1>

    <button id="connect">
      Conectar Freighter
    </button>

    <pre id="output"></pre>
  </div>
`

document
  .querySelector('#connect')
  .addEventListener('click', async () => {

    try {

      const connected = await isConnected()

      if (!connected.isConnected) {
        alert('Freighter não encontrada')
        return
      }

      await requestAccess()

      const address = await getAddress()

      document.querySelector('#output').innerText =
        JSON.stringify(address, null, 2)

    } catch (e) {

      console.error(e)

      alert(e.message)
    }
  })
