// ====================================================================
// FUNCIONES AUXILIARES DE COPIA
// ====================================================================

// Función auxiliar de respaldo para la copia (más fiable en localhost/pruebas)
function fallbackCopyText(textToCopy, successMessage) {
    if (!textToCopy) return;
    const tempInput = document.createElement('textarea');
    tempInput.value = textToCopy;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.focus();
    tempInput.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert(successMessage);
        } else {
            throw new Error('Copia manual requerida.');
        }
    } catch (err) {
        console.error('Error al intentar copiar:', err);
        alert('Error al copiar. Por favor, selecciona el texto y cópialo manualmente.');
    } finally {
        document.body.removeChild(tempInput);
    }
}

// Función para copiar una categoría específica de hashtags
function copyCategory(elementId) {
    const outputElement = document.getElementById(elementId);
    const textToCopy = outputElement ? outputElement.innerText.trim() : '';
    const successMsg = '¡Hashtags copiados! Listo para pegar en Instagram.';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert(successMsg);
        }).catch(err => {
            console.error('navigator.clipboard falló, usando método de respaldo:', err);
            fallbackCopyText(textToCopy, successMsg);
        });
    } else {
        fallbackCopyText(textToCopy, successMsg);
    }
}

// Función para copiar todos los hashtags
function copyAllHashtags() {
    const popular = document.getElementById('popular-output').innerText.trim();
    const medium = document.getElementById('medium-output').innerText.trim();
    const niche = document.getElementById('niche-output').innerText.trim();
    const allHashtags = `${popular}\n\n${medium}\n\n${niche}`;
    const successMsg = '¡Los 30 Hashtags copiados! Listo para pegar en Instagram.';

    if (navigator.clipboard) {
        navigator.clipboard.writeText(allHashtags).then(() => {
            alert(successMsg);
        }).catch(err => {
            console.error('navigator.clipboard falló, usando método de respaldo:', err);
            fallbackCopyText(allHashtags, successMsg);
        });
    } else {
        fallbackCopyText(allHashtags, successMsg);
    }
}

// Función auxiliar para formatear con el símbolo # y saltos de línea
const formatForDisplay = (list) => list.map(h => `#${h.replace(/^#/, '')}`).join('\n');


// ====================================================================
// FUNCIÓN PRINCIPAL DE GENERACIÓN (CORREGIDA PARA VERCEL)
// ====================================================================

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
        // RUTA DE VERSEL CORREGIDA: Usamos '/api/generate-hashtags' (sin .js ni mayúsculas en la carpeta)
        const response = await fetch('/api/generate', { 
            method: 'POST', // CRÍTICO: Usar POST, como requiere la función serverless
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });

        // 2. Leemos la respuesta.
        const responseData = await response.json(); 
        
        // 3. Manejo de errores: Si el status HTTP no es 200, o si el JSON tiene un campo 'error'.
        if (!response.ok) {
            // responseData.error contendrá el mensaje de la API de OpenAI si falla la clave, etc.
            const errorMessage = responseData.error || `Error del Servidor: HTTP ${response.status}`;
            throw new Error(errorMessage);
        }
        
        // La respuesta ya es el objeto JSON directo de los hashtags.
        const hashtags = responseData;
        
        // 4. Ocultar carga y mostrar resultados
        loadingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';

        // Llenar las columnas con los resultados
        document.getElementById('popular-output').innerText = formatForDisplay(hashtags.popular);
        document.getElementById('medium-output').innerText = formatForDisplay(hashtags.medium);
        document.getElementById('niche-output').innerText = formatForDisplay(hashtags.niche);

    } catch (error) {
        console.error('Error al generar hashtags:', error);
        alert(`Ocurrió un error: ${error.message}`);
        loadingDiv.style.display = 'none';
    } finally {
        generateButton.disabled = false;
    }
}