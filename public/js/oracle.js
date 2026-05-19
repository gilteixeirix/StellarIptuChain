document.addEventListener("DOMContentLoaded", () => {
  const auditBtn = document.getElementById("auditBtn");
  const matriculaInput = document.getElementById("matricula");
  const resultCard = document.getElementById("resultCard");
  const statusBadge = document.getElementById("statusBadge");
  const messageEl = document.getElementById("message");
  const hashLocalEl = document.getElementById("hashLocal");
  const hashOnChainEl = document.getElementById("hashOnChain");
  const explorerDiv = document.getElementById("explorerDiv");
  const explorerLink = document.getElementById("explorerLink");
  const loader = document.getElementById("loader");
  const terminal = document.getElementById("terminal");
  const terminalContent = document.getElementById("terminalContent");

  function performAudit() {
    const matricula = matriculaInput.value.trim();
    if (!matricula) {
      alert("Por favor, informe a matrícula para realizar a auditoria.");
      return;
    }

    // Reset UI
    resultCard.style.display = "none";
    resultCard.className = "card";
    explorerDiv.style.display = "none";
    loader.style.display = "block";
    auditBtn.disabled = true;

    terminal.style.display = "block";
    terminalContent.innerHTML = "";

    function logToTerminal(msg) {
      terminalContent.innerHTML += `> ${msg}<br>`;
      terminal.scrollTop = terminal.scrollHeight;
    }

    const eventSource = new EventSource(`http://localhost:3000/api/auditar/stream?matricula=${encodeURIComponent(matricula)}`);

    eventSource.onmessage = (e) => {
      const parsed = JSON.parse(e.data);
      if (parsed.msg) {
        logToTerminal(parsed.msg);
      }
    };

    eventSource.addEventListener('result', (e) => {
      const data = JSON.parse(e.data);

      loader.style.display = "none";
      resultCard.style.display = "flex";
      auditBtn.disabled = false;

      hashLocalEl.innerText = data.hashLocal;
      hashOnChainEl.innerText = data.hashOnChain || data.hashOnChainAnterior || "Nenhum registro anterior";
      messageEl.innerText = data.message;

      if (data.status === "Apto") {
        resultCard.classList.add("apto");
        statusBadge.innerText = "Apto";
      } else if (data.status === "Novo") {
        resultCard.classList.add("novo");
        statusBadge.innerText = "Novo (Ancorado)";
        if (data.txHash) {
          explorerDiv.style.display = "block";
          explorerLink.href = `https://stellar.expert/explorer/testnet/tx/${data.txHash}`;
        }
      } else {
        resultCard.classList.add("divergente");
        statusBadge.innerText = "Divergente";
        if (data.txHash) {
          explorerDiv.style.display = "block";
          explorerLink.href = `https://stellar.expert/explorer/testnet/tx/${data.txHash}`;
        }
      }
    });

    eventSource.addEventListener('end', () => {
      eventSource.close();
      loader.style.display = "none";
      auditBtn.disabled = false;
    });

    eventSource.onerror = (err) => {
      console.error(err);
      eventSource.close();
      loader.style.display = "none";
      auditBtn.disabled = false;
      logToTerminal("[ERRO DE CONEXÃO] Não foi possível comunicar com o Oráculo.");
    };
  }

  auditBtn.addEventListener("click", performAudit);
  matriculaInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performAudit();
  });
});


