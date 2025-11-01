// Función para copiar una categoría específica de hashtags (sin modificar)
function copyCategory(elementId) {
    const outputElement = document.getElementById(elementId);
    const textToCopy = outputElement ? outputElement.innerText.trim() : ''; 
    
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('¡Hashtags copiados! Listo para pegar en Instagram.');
        }).catch(err => {
            console.error('Error al copiar: ', err);
            alert('Error al intentar copiar.');
        });
    }
}

// Función para copiar todos los hashtags (sin modificar)
function copyAllHashtags() {
    const popular = document.getElementById('popular-output').innerText.trim();
    const medium = document.getElementById('medium-output').innerText.trim();
    const niche = document.getElementById('niche-output').innerText.trim();

    const allHashtags = `${popular}\n\n${medium}\n\n${niche}`;
    
    if (allHashtags.trim()) {
        navigator.clipboard.writeText(allHashtags).then(() => {
            alert('¡Los 30 Hashtags copiados! Listo para pegar en Instagram.');
        }).catch(err => {
            console.error('Error al copiar todos: ', err);
            alert('Error al intentar copiar todos.');
        });
    }
}

// Función principal para generar los hashtags (CORREGIDA LA RUTA Y EL PARSEO)
async function generateHashtags() {
    const description = document.getElementById('reel-description').value;
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const generateButton = document.getElementById('generate-button');
    
    // Limpiar resultados anteriores
    document.getElementById('popular-output').innerText = '';
    document.getElementById('medium-output').innerText = '';
    document.getElementById('niche-output').innerText = '';
    
    if (!description) {
        alert('Por favor, introduce una descripción para tu Reel.');
        return;
    }

    // 1. Mostrar carga y deshabilitar botón
    resultsDiv.style.display = 'none';
    loadingDiv.style.display = 'flex';
    generateButton.disabled = true;

    try {
        // Usamos /api/generate gracias a la redirección en netlify.toml
        const response = await fetch('/api/generate', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });

        // 2. Intentamos leer la respuesta del servidor como JSON
        const responseData = await response.json();
        
        // 3. Manejo de errores (Servidor o clave inválida)
        if (!response.ok || responseData.error) {
            const errorMessage = responseData.error || `Error del Servidor: HTTP ${response.status} (${response.statusText})`;
            throw new Error(errorMessage);
        }
        
        // <<<< CORRECCIÓN CRÍTICA: DOBLE PARSEO >>>>
        const hashtags = JSON.parse(responseData.body); 
        // <<<< FIN DE CORRECCIÓN CRÍTICA >>>>
        
        // 4. Ocultar carga y mostrar resultados
        loadingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';

        // Función auxiliar para formatear con el símbolo #
        const formatForDisplay = (list) => list.map(h => `#${h.replace(/^#/, '')}`).join(' ');

        // Llenar las columnas con los resultados
        document.getElementById('popular-output').innerText = formatForDisplay(hashtags.popular);
        document.getElementById('medium-output').innerText = formatForDisplay(hashtags.medium);
        document.getElementById('niche-output').innerText = formatForDisplay(hashtags.niche);

    } catch (error) {
        console.error('Error al generar hashtags:', error);
        alert(`Ocurrió un error. Verifica que tu clave de API en Netlify sea válida. Detalle: ${error.message}`);
        loadingDiv.style.display = 'none';
    } finally {
        generateButton.disabled = false;
    }
}