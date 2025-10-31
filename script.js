// script.js (¡IMPORTANTE! Este código llama a la Netlify Function)

// ** CONFIGURACIÓN DEL ENDPOINT SEGURO **
// La clave de API ya no está aquí. Se encuentra oculta en Netlify.
const NETLIFY_FUNCTION_URL = '/api/generate'; 


async function generateHashtags() {
    const description = document.getElementById('reel-description').value;
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const generateButton = document.getElementById('generate-button');
    
    if (!description.trim()) {
        alert("Por favor, introduce una descripción para tu Reel.");
        return;
    }

    // 1. Mostrar estado de carga
    resultsDiv.style.display = 'none';
    loadingDiv.style.display = 'block';
    generateButton.disabled = true;

    try {
        // Llama a la función de Netlify, enviando la descripción en el body
        const response = await fetch(NETLIFY_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Enviamos la descripción dentro de un objeto JSON
            body: JSON.stringify({ description: description }) 
        });

        // Verificamos si la respuesta de la función es correcta
        if (!response.ok) {
            const errorData = await response.json();
            // Mostrará el error que vino de la Netlify Function
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.text.trim(); // La función devuelve un objeto { text: ... }

        // 2. Separar el texto en los tres grupos usando las etiquetas
        const parts = generatedText.split('###');
        
        // Limpiamos los contenedores antes de insertar
        document.getElementById('popular-output').innerText = '';
        document.getElementById('medium-output').innerText = '';
        document.getElementById('niche-output').innerText = '';

        // Procesamos cada parte e insertamos en la columna correcta
        for (const part of parts) {
            if (part.includes('POPULARES')) {
                document.getElementById('popular-output').innerText = part.replace('POPULARES\n', '').trim();
            } else if (part.includes('MEDIOS')) {
                document.getElementById('medium-output').innerText = part.replace('MEDIOS\n', '').trim();
            } else if (part.includes('NICHO')) {
                document.getElementById('niche-output').innerText = part.replace('NICHO\n', '').trim();
            }
        }
        
        // 3. Mostrar el contenedor de resultados
        resultsDiv.style.display = 'block';

    } catch (error) {
        console.error("Error al generar hashtags:", error);
        alert(`Hubo un error al generar los hashtags: ${error.message}.`);
    } finally {
        // 4. Ocultar carga y restablecer botón
        loadingDiv.style.display = 'none';
        generateButton.disabled = false;
    }
}


function copyCategory(id) {
    const textToCopy = document.getElementById(id).innerText;
    
    // ** MEJORA: Validar si hay texto para copiar **
    if (!textToCopy.trim()) { 
        alert("No hay hashtags que copiar en esta categoría.");
        return;
    }

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert(`✅ ¡Categoría copiada!`);
        })
        .catch(err => {
            console.error('Error al intentar copiar: ', err);
            alert("Error al copiar. Por favor, selecciona y copia el texto manualmente.");
        });
}

function copyAllHashtags() {
    const popular = document.getElementById('popular-output').innerText;
    const medium = document.getElementById('medium-output').innerText;
    const niche = document.getElementById('niche-output').innerText;
    
    // Unir todo el texto con saltos de línea para pegar directamente en Instagram
    const textToCopy = [popular, medium, niche].join('\n').trim();

    // ** MEJORA: Validar si hay texto para copiar **
    if (!textToCopy) { 
        alert("No hay hashtags que copiar todavía.");
        return;
    }
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert("✅ ¡Los 30 Hashtags copiados!");
        })
        .catch(err => {
            console.error('Error al intentar copiar: ', err);
            alert("Error al copiar. Por favor, selecciona y copia el texto manualmente.");
        });
}