const pdfUrl = 'Guia-seleccion.pdf'; 
const primaryColor = '#28577a'; 

// 1. Estilos optimizados para Web (Desktop y Mobile)
const styles = `
    body { margin: 0; background: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; overflow: hidden; }
    #canvas-container { 
        position: relative; width: 100vw; height: 100dvh; 
        display: flex; justify-content: center; align-items: center;
        background: transparent; perspective: 2000px;
    }
    #flipbook { 
        display: none; 
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .page { background: white; }
    canvas { width: 100%; height: 100%; display: block; }
    
    .nav-btn {
        position: absolute; top: 50%; transform: translateY(-50%);
        background: ${primaryColor}; color: white; border: none; 
        width: 60px; height: 60px; border-radius: 50%; cursor: pointer; 
        font-size: 30px; z-index: 2000; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transition: background 0.3s;
    }
    .nav-btn:hover { background: #28577a; }
    #prev-page { left: 30px; }
    #next-page { right: 30px; }
    
    #page-counter {
        position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
        color: white; background: rgba(0,0,0,0.7); padding: 8px 20px;
        border-radius: 25px; font-size: 14px; z-index: 1500;
    }

    /* Ajuste para móviles: flechas abajo para no tapar el texto */
    @media (max-width: 768px) {
        .nav-btn { top: auto; bottom: 30px; transform: none; width: 50px; height: 50px; }
        #prev-page { left: 15px; }
        #next-page { right: 15px; }
    }
`;
$('<style>').text(styles).appendTo('head');

$('#canvas-container').append(`
    <div id="flipbook"></div>
    <button id="prev-page" class="nav-btn">‹</button>
    <button id="next-page" class="nav-btn">›</button>
    <div id="page-counter">Cargando libro...</div>
`);

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

async function init() {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const flipbook = $('#flipbook');
    const isMobile = window.innerWidth <= 768;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 }); // Calidad para web
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        flipbook.append($('<div class="page"></div>').append(canvas));
    }

    // --- CÁLCULO PROPORCIÓN TAMAÑO CARTA ---
    // Relación carta: 8.5 / 11 = 0.77
    const ratio = 0.77; 
    let finalHeight = window.innerHeight * 0.85;
    let finalWidth = finalHeight * ratio;

    // En desktop mostramos 2 páginas, así que el ancho se duplica
    if (!isMobile) {
        finalWidth = finalWidth * 2;
    } else {
        // En móvil nos basamos en el ancho de la pantalla
        finalWidth = window.innerWidth * 0.9;
        finalHeight = finalWidth / ratio;
    }

    flipbook.show().turn({
        width: finalWidth,
        height: finalHeight,
        display: isMobile ? 'single' : 'double',
        acceleration: true,
        elevation: 50,
        when: {
            turned: (e, page) => {
                $('#page-counter').text(`Página ${page} de ${pdf.numPages}`);
            }
        }
    });

    $('#prev-page').on('click touchstart', (e) => { e.preventDefault(); flipbook.turn('previous'); });
    $('#next-page').on('click touchstart', (e) => { e.preventDefault(); flipbook.turn('next'); });
}

$(document).ready(init);
