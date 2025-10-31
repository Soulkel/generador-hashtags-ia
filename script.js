// ** CONFIGURACIÓN DE LA API **
// ******* ¡IMPORTANTE! *******
// ¡REEMPLAZA ESTA CLAVE CON LA TUYA DE GEMINI!
const GEMINI_API_KEY = "AIzaSyBElPMaw8cq_-7XjXA4SSZb4829VisEVlI"; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";


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

    // ** EL PROMPT CLAVE: Instrucción estricta para que la IA use etiquetas **
    const prompt = `Actúa como un experto en SEO de Instagram. Genera exactamente 30 hashtags para una publicación/Reel con la siguiente descripción: "${description}". Clasifica los 30 hashtags en tres grupos: 10 Populares, 10 Medios y 10 de Nicho. 
Presenta la respuesta usando las siguientes etiquetas de encabezado exactamente como se escriben:
###POPULARES
[Lista de 10 hashtags]
###MEDIOS
[Lista de 10 hashtags]
###NICHO
[Lista de 10 hashtags]
No incluyas ningún texto adicional (como "Aquí tienes..." o introducciones), solo el encabezado y los hashtags, cada hashtag en una línea nueva.`;

    try {
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.2 // Baja temperatura para resultados enfocados
                }
            })
        });

        const data = await response.json();
        
        // 1. Extraer el texto de la respuesta
        const generatedText = data.candidates[0].content.parts[0].text.trim();
        
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
        console.error("Error al conectar con la API de Gemini:", error);
        alert("Hubo un error al generar los hashtags. Revisa la consola o tu clave de API.");
        // Si hay error, se mostrará el mensaje en la consola.
    } finally {
        // 4. Ocultar carga y restablecer botón
        loadingDiv.style.display = 'none';
        generateButton.disabled = false;
    }
}


function copyCategory(id) {
    const textToCopy = document.getElementById(id).innerText;
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
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert("✅ ¡Los 30 Hashtags copiados!");
        })
        .catch(err => {
            console.error('Error al intentar copiar: ', err);
            alert("Error al copiar. Por favor, selecciona y copia el texto manualmente.");
        });
}