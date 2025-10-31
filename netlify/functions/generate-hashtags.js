// netlify/functions/generate-hashtags.js

// La clave se lee de forma segura desde las variables de entorno de Netlify
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

exports.handler = async (event, context) => {
    // 1. Manejo básico de la petición (solo POST)
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: "Método no permitido" };
    }

    try {
        // 2. Extraer la descripción enviada desde el frontend
        const { description } = JSON.parse(event.body);

        if (!description || description.trim() === '') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Descripción del Reel requerida." }),
            };
        }

        // 3. El Prompt (Instrucción a la IA)
        const prompt = `Actúa como un experto en SEO de Instagram. Genera exactamente 30 hashtags para una publicación/Reel con la siguiente descripción: "${description}". Clasifica los 30 hashtags en tres grupos: 10 Populares, 10 Medios y 10 de Nicho. 
Presenta la respuesta usando las siguientes etiquetas de encabezado exactamente como se escriben:
###POPULARES
[Lista de 10 hashtags]
###MEDIOS
[Lista de 10 hashtags]
###NICHO
[Lista de 10 hashtags]
No incluyas ningún texto adicional (como "Aquí tienes..." o introducciones), solo el encabezado y los hashtags, cada hashtag en una línea nueva.`;
        
        // 4. Llamada segura a la API de Gemini
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.2 // Baja temperatura para precisión
                }
            })
        });

        const data = await response.json();
        
        // 5. Manejo de posibles errores de Gemini
        if (data.error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Error de la API de Gemini: " + data.error.message }),
            };
        }

        // 6. Devolver la respuesta al frontend
        const generatedText = data.candidates[0].content.parts[0].text;
        
        return {
            statusCode: 200,
            body: JSON.stringify({ text: generatedText }),
        };

    } catch (error) {
        console.error("Error en Netlify Function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error interno del servidor. Revisa los logs de Netlify." }),
        };
    }
};