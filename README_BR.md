# Poke Idle - Better Map

🌍 Languages: [English](README.md) | [Português](README_BR.md) | [Español](README_ES.md)

Um userscript avançado de qualidade de vida que adiciona indicadores de captura, rastreadores de progresso e várias melhorias ao mapa do Poke Idle World.

---

## ⚡ Recursos

- **Indicadores de Captura:** Adiciona um pequeno ícone de Pokébola ao lado dos Pokémon que você já capturou diretamente no mapa.
- **Ocultar Pokémon Capturados:** Opção para ocultar completamente do mapa os Pokémon que você já capturou, deixando apenas os que faltam visíveis.
- **Rastreador de Bônus de EXP (100 Derrotas):** Exibe um ícone de Espada (⚔️), um contador de texto (ex: `10/100`) ou uma marca de conclusão (✅) nos sprites do mapa para rastrear facilmente seu progresso em direção ao bônus de EXP de 100 abates sem abrir a Pokédex.
- **Ajustes no Tamanho do Mapa:** Alterne entre os tamanhos de mapa *Normal* e *Grande* para melhor visibilidade.
- **Correção de Tooltip:** Injeção de CSS personalizado que corrige a posição nativa do tooltip do mapa para que não seja mais cortado ou se comporte de forma irregular quando o mapa é ampliado.
- **Menu de Configuração no Jogo:** Menu de configurações fácil de usar acessível através de um emblema personalizado "Better Map" ao lado das abas das zonas do mapa.

---
## 📸 Pré-visualização e Capturas de Tela
### Adiciona um botão extra à interface do mapa; o botão "Better Map" contém as configurações da ferramenta.
<img width="920" height="917" alt="image" src="https://github.com/user-attachments/assets/407f0bbc-44a0-4499-8898-e3b54bb92177" />

### Tamanho grande do mapa e configurações do script.
<img width="1209" height="1248" alt="image" src="https://github.com/user-attachments/assets/69c548fc-d5cb-4f00-9a87-babc09f5456f" />

### Fix Map tooltip.
<img width="965" height="827" alt="image" src="https://github.com/user-attachments/assets/f866b09a-bcc3-4551-b95e-507545bd8b33" />
---

## 📖 Como Usar

1. **Preencher Dados:**
   - Abra sua Pokédex no jogo pelo menos uma vez para que o script possa escanear e armazenar em cache seus Pokémon capturados atualmente e contagens de abates.
   - **Atualizações em Tempo Real:** Após a verificação inicial, o script escuta automaticamente o tráfego de rede do jogo. Toda vez que você derrotar ou capturar um Pokémon, o mapa será atualizado instantaneamente em tempo real. Você não precisa ficar abrindo a Pokédex.

2. **Acessar Configurações:**
   - Abra a janela do Mapa.
   - Procure o emblema **Better Map** ao lado das abas da zona (Kanto, Johto, etc.).
   - Clique nele para abrir a janela de configuração.

3. **Configurar Opções:**
   - **Mostrar / ocultar ícones de pokemon capturados:** Alterne o ícone da Pokébola em Pokémon capturados.
   - **Apenas pokemon faltando para capturar:** Oculte Pokémon capturados completamente do mapa.
   - **Mostrar / ocultar verificação de 100 abates concluídos:** Alterne o ícone ✅ para Pokémon que você já derrotou 100 vezes.
   - **Apenas mostrar pokemon faltando 100 abates:** Oculte Pokémon completamente do mapa se eles já tiverem alcançado o marco de 100 abates.
   - **Tamanho do Mapa:** Escolha entre as visualizações de mapa *Normal* ou *Grande*.
   - **Mostrar bônus de EXP para 100 derrotas:** Escolha como deseja exibir o progresso de 100 abates (*x/100*, *Apenas ícone* ou *Desativado*).

---
## 🌐 Compatibilidade de Navegador

Este userscript é compatível com qualquer navegador de desktop moderno que execute uma extensão de gerenciador de scripts:

| Navegador | Extensão de Gerenciador Recomendada |
| :--- | :--- |
| **Google Chrome / Brave / Edge** | [Tampermonkey](https://www.tampermonkey.net/) ou [Violentmonkey](https://violentmonkey.github.io/) |
| **Mozilla Firefox** | [Tampermonkey](https://www.tampermonkey.net/) ou [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/) |
| **Opera / Opera GX** | [Tampermonkey](https://www.tampermonkey.net/) |
| **Safari** | [Tampermonkey](https://www.tampermonkey.net/) |

---

## 📦 Instalação

### Opção 1: Instalação Automática (Recomendado)

1. Certifique-se de ter uma extensão de gerenciador de scripts (como o **[Tampermonkey](https://www.tampermonkey.net/)**) instalada em seu navegador.
2. Clique no link abaixo para instalar o script automaticamente:

👉 **[INSTALAR USERSCRIPT DIRETAMENTE](https://raw.githubusercontent.com/Phoslead/pokeidle_bettermap/main/pokeidle_bettermap.user.js)** 👈

3. O Tampermonkey solicitará uma guia de instalação. Clique em **"Instalar"**.
4. Abra ou atualize a guia do jogo!

---

### Opção 2: Instalação Manual

Se o link automático não acionar seu gerenciador de scripts, siga estas etapas:

1. Abra o painel de extensão do seu navegador para **Tampermonkey** e clique em **"Criar um novo script..."**.
2. Abra o arquivo de script deste repositório: [`pokeidle_bettermap.user.js`](https://github.com/Phoslead/pokeidle_bettermap/blob/main/pokeidle_bettermap.user.js).
3. Copie todo o código JavaScript.
4. Cole o código no editor de scripts do Tampermonkey, substituindo qualquer texto de modelo padrão.
5. Salve o script (**Ctrl + S** ou `Arquivo -> Salvar`).
6. Atualize a guia do jogo.

---

### Opção 3: Launchers Desktop (ex., [PokeGrid](https://github.com/soufoka/PokeGrid-source))

Se você estiver jogando por meio de um launcher de desktop dedicado como o **PokeGrid** que inclui um gerenciador de scripts personalizado, você deve fazer um pequeno ajuste no código do script para garantir a compatibilidade e a proteção de dados.

1. Cole o script no gerenciador de scripts do launcher.
2. Bem no topo do script, encontre estas duas linhas no cabeçalho:
   ```javascript
   // @grant        GM_getValue
   // @grant        GM_setValue
   ```
3. Altere-as para:
   ```javascript
   // @grant        none
   ```
4. **Salve e recarregue.**
