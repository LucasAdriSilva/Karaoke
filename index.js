const { app, BrowserWindow, ipcMain, shell } = require('electron');

const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');
const downloadsFolder = path.join(__dirname, 'karaoke'); // Pasta para downloads

// Cria a pasta se não existir
if (!fs.existsSync(downloadsFolder)) {
  fs.mkdirSync(downloadsFolder, { recursive: true });
}

let scriptInjected = false;
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'mic.jpg'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  win.loadFile('index.html');

  const executeScript = () => {
    if (scriptInjected) return; // Evita reinjetar o script
    const commandScript = fs.readFileSync(path.join(__dirname, 'comand.js'), 'utf-8');
    win.webContents.executeJavaScript(`${commandScript}`);
    scriptInjected = true; // Marca o script como injetado
    win.show();
  };

  win.webContents.on('did-finish-load', executeScript);
  win.webContents.on('did-navigate', executeScript);

  ipcMain.on('download-video', (event, url) => {
    console.log('Iniciando download para URL:', url);
    // Use o youtube-dl-exec para pegar os metadados, incluindo o título
    youtubedl(url, {
      dumpSingleJson: true
    }).then(output => {
      setTimeout(() => {
        const title = output.title;
        downloadVideo(url, downloadsFolder, `${title}.mp4`);
        event.reply('download-complete', { title, path: downloadsFolder });
      }, 2000)
    }).catch(err => {
      event.reply('download-error', { error: err.message });
    });
  });

  ipcMain.on('downloads-list', (event) => {
    // Verifica se a pasta existe
    if (fs.existsSync(downloadsFolder)) {
      // Lê todos os arquivos da pasta
      fs.readdir(downloadsFolder, (err, files) => {
        if (err) {
          console.error('Erro ao ler a pasta de downloads:', err);
          event.reply('downloads-list-error', { error: err.message });
          return;
        }

        // Filtra os arquivos para pegar apenas os .mp4
        const videoFiles = files.filter(file => file.endsWith('.mp4')).map(file => {
          return {
            title: path.parse(file).name, // Extrai o nome do arquivo sem a extensão
            path: path.join(downloadsFolder, file)
          };
        });

        // Envia a lista de vídeos para o frontend
        event.reply('downloads-list', videoFiles);
      });
    } else {
      console.error('A pasta de downloads não existe!');
      event.reply('downloads-list-error', { error: 'Pasta de downloads não encontrada' });
    }
  });

  ipcMain.on('open-downloads', () => {
    const downloadsWindow = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.join(__dirname, 'mic.jpg'),
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    downloadsWindow.loadFile('downloads.html');


    downloadsWindow.webContents.on('did-finish-load', () => {
      downloadsWindow.webContents.send('downloads-list', downloads);
    });
  });

  ipcMain.handle('open-file', async (event, filePath) => {
    try {
      await shell.openPath(filePath);
    } catch (error) {
      console.error('Erro ao abrir o arquivo:', error);
    }
  });

  ipcMain.on('check-online', (event) => {
    const isOnline = require('dns').resolve('www.google.com', (err) => !err);
    event.reply('online-status', isOnline);
  });

  ipcMain.on('openDownloadsPage', () => {
    const karaokeFolderPath = path.join(__dirname, 'karaoke');
    const downloads = [];

    fs.readdir(karaokeFolderPath, (err, files) => {
      if (err) {
        console.error('Erro ao ler a pasta karaoke:', err);
        return;
      }

      files.forEach(file => {
        const fileExtension = path.extname(file).toLowerCase();
        if (['.mp4', '.avi', '.mkv', '.mov'].includes(fileExtension)) {
          downloads.push({
            title: file,
            path: path.join(karaokeFolderPath, file)
          });
        }
      });

      console.log('Downloads a serem enviados:', downloads); // Verifique o que está sendo enviado
      const downloadsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'mic.jpg'),
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')  // Caminho para o arquivo preload.js
        },
      });

      downloadsWindow.loadFile('listVideos.html');

      downloadsWindow.webContents.on('did-finish-load', () => {
        setTimeout(() => {
          downloadsWindow.webContents.send('downloads-list', downloads);
        }, 100);  // Dê um pequeno delay para garantir que a janela foi completamente carregada
      });
    });
  });

  ipcMain.on('changeNameVideo', (event, oldName, newName) => {
    const oldFilePath = path.join(downloadsFolder, oldName);
    const newFilePath = path.join(downloadsFolder, newName);

    // Verifica se o novo nome já existe
    fs.exists(newFilePath, (exists) => {
      if (exists) {
        console.log('O arquivo com esse nome já existe!');
        event.reply('changeNameVideo-response', { success: false, message: 'Arquivo já existe' });
        return;
      }

      // Renomeia o arquivo
      fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
          event.reply('changeNameVideo-response', { success: false, message: 'Erro ao renomear o arquivo' });
          return;
        }

        // Atualiza a lista de downloads (se necessário)
        fs.readdir(downloadsFolder, (err, files) => {
          if (err) return

          const downloads = files.filter(file => ['.mp4', '.avi', '.mkv', '.mov'].includes(path.extname(file).toLowerCase()))
            .map(file => ({
              title: file,
              path: path.join(downloadsFolder, file)
            }));

          // Envia a lista atualizada para o frontend
          event.reply('downloads-list', downloads);
        });

        event.reply('changeNameVideo-response', { success: true, message: 'Arquivo renomeado com sucesso' });
      });
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

async function downloadVideo(videoUrl, outputFolder, fileName) {
  try {
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
      console.log(`Pasta "${outputFolder}" criada.`);
    }

    const outputPath = path.join(outputFolder, fileName);
    console.log(`Iniciando o download de: ${videoUrl}`);

    await youtubedl(videoUrl, {
      output: outputPath,
      format: 'mp4',
    });

    console.log(`Download concluído!`);
  } catch (error) {
    console.error(`Erro durante o download: ${error.message}`);
  }
}