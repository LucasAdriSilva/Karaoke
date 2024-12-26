console.log('A página foi carregada ou redirecionada!');

if (window.electronAPI) {
    console.log("electronAPI já está disponível.");

    // Remover botões antigos e criar novos
    document.querySelectorAll('button').forEach(btn => btn.remove());

    // Botão de Voltar
    const button = document.createElement('button');
    button.innerText = 'Voltar';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#007BFF';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';

    // Botão de Download
    const button2 = document.createElement('button');
    button2.innerText = 'Fazer download';
    button2.style.position = 'fixed';
    button2.style.bottom = '60px';
    button2.style.right = '20px';
    button2.style.padding = '10px 15px';
    button2.style.backgroundColor = '#007BF5';
    button2.style.color = 'white';
    button2.style.border = 'none';
    button2.style.borderRadius = '5px';
    button2.style.cursor = 'pointer';
    button2.style.zIndex = '1000';

    // Botão para abrir a lista de vídeos baixados
    const button3 = document.createElement('button');
    button3.innerText = 'Vídeos Baixados';
    button3.style.position = 'fixed';
    button3.style.bottom = '100px';
    button3.style.right = '20px';
    button3.style.padding = '10px 15px';
    button3.style.backgroundColor = '#28a745';
    button3.style.color = 'white';
    button3.style.border = 'none';
    button3.style.borderRadius = '5px';
    button3.style.cursor = 'pointer';
    button3.style.zIndex = '1000';

    button.onclick = () => {
        window.history.back();
    };

    button2.onclick = () => {
        const videoUrl = getVideoUrlFromPage();
        if (videoUrl) {
            button2.style.backgroundColor = 'yellow'; // Indicador visual
            button2.style.color = 'black'
            window.electronAPI.downloadVideo(videoUrl);
        }
    };

    button3.onclick = () => {
        window.electronAPI.openDownloadsPage();
    };
    document.body.appendChild(button);
    document.body.appendChild(button2);
    document.body.appendChild(button3);

    window.electronAPI.onDownloadComplete((event, videoData) => {
        //window.electronAPI.openPath(videoData.path);
        button2.style.backgroundColor = '#007BF5';
        button2.style.color = '#fff'
    });

    window.electronAPI.onDownloadError((event, errorData) => {
        button2.style.backgroundColor = '#007BF5';
        button2.style.color = '#fff'
    });

    // Verifica a possibilidade de download quando a tela for carregada
    const checkAndStartDownload = () => {
        const videoUrl = getVideoUrlFromPage();
        if (videoUrl) {
            console.log('Iniciando download...');
            button2.style.backgroundColor = 'yellow';
            button2.style.color = '#fff'
            window.electronAPI.downloadVideo(videoUrl);
        }
    };

    // Função que retorna a URL de vídeo (modifique conforme necessário)
    const getVideoUrlFromPage = () => {
        const url = new URL(window.location.href);
        if (url.hostname.includes('youtube.com') && url.searchParams.has('v')) {
            return `https://www.youtube.com/watch?v=${url.searchParams.get('v')}`;
        }
        return null;
    };


    // Chama a função de verificação assim que a página for carregada
    window.addEventListener('load', checkAndStartDownload);
} else {
    console.error("electronAPI não está disponível. Verifique o preload.js e as configurações do BrowserWindow.");
}
