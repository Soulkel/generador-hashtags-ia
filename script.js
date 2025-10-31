// Función para copiar una categoría específica de hashtags
function copyCategory(elementId) {
    const outputElement = document.getElementById(elementId);
    const textToCopy = outputElement.innerText;
    
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('¡Hashtags copiados! Listo para pegar en Instagram.');
        }).catch(err => {
            console.error('Error al copiar: ', err);
            alert('Error al intentar copiar.');
        });
    }
}

// Función para copiar todos los hashtags
function copyAllHashtags() {
    const popular = document.getElementById('popular-output').innerText;
    const medium = document.getElementById('medium-output').innerText;
    const niche = document.getElementById('niche-output').innerText;

    const allHashtags = `${popular}\n${medium}\n${niche}`;
    
    if (allHashtags) {
        navigator.clipboard.writeText(allHashtags).then(() => {
            alert('¡Los 30 Hashtags copiados! Listo para pegar en Instagram.');
        }).catch(err => {
            console.error('Error al copiar todos: ', err);
            alert('Error al intentar copiar todos.');
        });
    }
}

// Función principal para generar los hashtags
async function generateHashtags() {
    const description = document.getElementById('reel-description').value;
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const generateButton = document.getElementById('generate-button'); // CRÍTICO

    if (!description) {
        alert('Por favor, introduce una descripción para tu Reel.');
        return;
    }

    // 1. Mostrar carga y deshabilitar botón
    resultsDiv.style.display = 'none';
    loadingDiv.style.display = 'flex';
    generateButton.disabled = true; // Deshabilitar para evitar spam de clicks

    // Limpiar resultados anteriores
    document.getElementById('popular-output').innerText = '';
    document.getElementById('medium-output').innerText = '';
    document.getElementById('niche-output').innerText = '';
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description })
        });

        if (!response.ok) {
            throw new Error(`Error en la función Serverless: ${response.statusText}`);
        }

        const data = await response.json();
        
        // 2. Ocultar carga y mostrar resultados
        loadingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';

        // Llenar las columnas con los resultados
        document.getElementById('popular-output').innerText = data.popular.join(' ');
        document.getElementById('medium-output').innerText = data.medium.join(' ');
        document.getElementById('niche-output').innerText = data.niche.join(' ');

    } catch (error) {
        console.error('Error al generar hashtags:', error);
        alert(`Ocurrió un error. Verifica que tu clave de API en Netlify sea válida. Detalle: ${error.message}`);
        loadingDiv.style.display = 'none';
    } finally {
        // 3. Habilitar botón al finalizar (o fallar)
        generateButton.disabled = false;
    }
}