// Función principal para generar los hashtags (VERSIÓN FINAL Y CORREGIDA)
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
        // Usamos la ruta directa a la función serverless
        const response = await fetch('/.netlify/functions/generate-hashtags', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });

        // 2. Leemos la respuesta. Si hay un error HTTP, esto contendrá el JSON de error.
        const responseData = await response.json(); 
        
        // 3. Manejo de errores: Si el status HTTP no es 200, o si el JSON de respuesta tiene un campo 'error'.
        if (!response.ok) {
            const errorMessage = responseData.error || `Error del Servidor: HTTP ${response.status}`;
            throw new Error(errorMessage);
        }
        
        // CORRECCIÓN CRÍTICA: responseData AHORA ES EL OBJETO JSON DIRECTO DE LOS HASHTAGS (porque el backend devolvió el texto JSON).
        const hashtags = responseData;
        
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
        alert(`Ocurrió un error: ${error.message}`);
        loadingDiv.style.display = 'none';
    } finally {
        generateButton.disabled = false;
    }
}