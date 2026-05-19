import re

header = """
<div style="background: #1e293b; padding: 15px; text-align: center; margin-bottom: 20px; border-radius: 12px; border: 2px solid #f59e0b;">
  <h2 style="color: #f59e0b; margin-bottom: 10px;">V1: Abordagem Descentralizada (Manual)</h2>
  <p style="color: #cbd5e1; margin-bottom: 10px;">Assinatura via carteira do cidadão (Freighter).</p>
  <a href="oracle.html" style="color: white; background: #f59e0b; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">👉 Ir para V2: Oráculo Automático</a>
</div>
"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<div class="container">', f'<div class="container">\n{header}')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

oracle_header = """
<div style="background: #1e293b; padding: 15px; text-align: center; margin-bottom: 20px; border-radius: 12px; border: 2px solid #38bdf8;">
  <h2 style="color: #38bdf8; margin-bottom: 10px;">V2: Abordagem Centralizada (Oráculo)</h2>
  <p style="color: #cbd5e1; margin-bottom: 10px;">Sincronização automática pela source_account da prefeitura.</p>
  <a href="index.html" style="color: white; background: #38bdf8; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">👈 Voltar para V1: Assinatura Manual</a>
</div>
"""

with open('oracle.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('src="main.js"', 'src="oracle.js"')
content = content.replace('<div class="search-box">', f'{oracle_header}\n    <div class="search-box">')

# Add a terminal div for logs
terminal_html = """
    <div id="terminal" style="background: #000; color: #0f0; font-family: monospace; padding: 15px; border-radius: 8px; margin-bottom: 20px; height: 150px; overflow-y: auto; display: none;">
      <div id="terminalContent"></div>
    </div>
"""
content = content.replace('<div id="resultCard"', f'{terminal_html}\n    <div id="resultCard"')

with open('oracle.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Headers added")
