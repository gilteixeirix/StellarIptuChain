import {
  isConnected,
  requestAccess,
  getAddress
} from "https://esm.sh/@stellar/freighter-api"

window.connectWallet =
  async function () {

    try {

      const connected =
        await isConnected()

      console.log(connected)

      if (!connected.isConnected) {

        alert(
          "Freighter não encontrada"
        )

        return
      }

      await requestAccess()

      const result =
        await getAddress()

      document.getElementById(
        "wallet"
      ).innerText =
        result.address

      alert(
        "Freighter conectada!"
      )

    } catch(err){

      console.error(err)

      alert(err.message)
    }
}
