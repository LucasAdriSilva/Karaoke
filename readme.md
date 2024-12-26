# Guia para Inicializar o Projeto Karaoke

Este documento fornece as instruções necessárias para configurar e rodar o projeto utilizando Electron.

## Requisitos
Certifique-se de ter os seguintes itens instalados antes de começar:
1. **Node.js**: Instale o Node.js em sua máquina.

## Passos para Configuração e Execução

1. **Inicie o projeto**
   ```bash
   npm start
   ```

2. **Instale o Electron**
   ```bash
   npm install electron
   ```

3. **Rode a aplicação**
   ```bash
   npm start
   ```

Agora sua aplicação estará rodando com sucesso!

# Descrição do Projeto

Após iniciar o projeto, será aberto um vídeo do YouTube com três botões localizados no lado direito da tela. Cada botão possui uma função específica:

1. **Videos baixados:**
   - Ao clicar neste botão, uma nova aba será aberta com todos os vídeos disponíveis para download.
   <img src="https://github.com/LucasAdriSilva/Karaoke/blob/master/videos/openDownload.gif" width="300" height="200">

2. **Fazer download:**
   - Quando estiver em uma tela com o vídeo, clique para iniciar o download. O botão ficará **amarelo** enquanto o download estiver em andamento. Quando o download for concluído, o botão voltará a ficar **azul**.
   <img src="https://github.com/LucasAdriSilva/Karaoke/blob/master/videos/download.gif" width="300" height="200">


3. **Voltar:**
   - Este botão funciona com a funcionalidade do botão de "Voltar" do navegador, permitindo retornar à página anterior.

### Funcionalidades da Aba de Vídeos

- Na aba aberta pelo segundo botão, você pode:
  - **Editar o nome do vídeo**: Clique duas vezes sobre o nome do vídeo para editá-lo.
  - **Iniciar o vídeo**: Clique para iniciar a reprodução do vídeo offline.
  <img src="https://github.com/LucasAdriSilva/Karaoke/blob/master/videos/filter.gif" width="400" height="300">
  
- Também há um **filtro de busca** por nome do vídeo disponível na parte superior da página.
