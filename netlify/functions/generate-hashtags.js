import { GoogleGenAI } from '@google/genai';


// La clave se lee automáticamente de la variable de entorno GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;

// Inicializa el cliente de la IA.
const ai = new GoogleGenAI({ apiKey });

// ----------------------------------------------------------------------
// FUNCIÓN PRINCIPAL DE NETLIFY HANDLER
// ----------------------------------------------------------------------
exports.handler = async (event) => {
    // 1. Verificación básica del método y clave
    // Esto es lo que devuelve el error 405 (Method Not Allowed)
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido. Usa POST." }) };
    }

    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY no está definida en Netlify.");
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Fallo de configuración: La clave de API no está definida." }) 
        };
    }

    try {
        // 2. Extraer y verificar la descripción
        const { description } = JSON.parse(event.body);

        if (!description || description.trim() === '') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Descripción del Reel requerida." }),
            };
        }
        
        // 3. Prompt de la IA
        const prompt = `Actúa como un experto en SEO de Instagram. Genera exactamente 30 hashtags para una publicación/Reel con la siguiente descripción: "${description}". Clasifica los 30 hashtags en tres grupos: 10 Populares, 10 Medios y 10 de Nicho.
        
        Devuélveme la respuesta ÚNICAMENTE como un objeto JSON válido con tres propiedades: "popular", "medium", y "niche", donde cada una contiene un array de 10 strings (hashtags). NO incluyas ninguna explicación, markdown (como \`\`\`json), o texto adicional, solo el JSON puro.`;
        
        // 4. Llamada a la API de Gemini con configuración de JSON
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                // Esto fuerza a la IA a devolver UNICAMENTE formato JSON
                responseMimeType: "application/json", 
                temperature: 0.2
            }
        });
        
        // 5. Devolver la respuesta al frontend
        // El SDK asegura que response.text es el JSON generado.
        return {
            statusCode: 200,
            body: response.text, 
        };

    } catch (error) {
        // 6. Captura de Errores Robustos (Autenticación, Límite, o JSON Inválido)
        console.error("Error en Netlify Function:", error.message);
        
        let errorMessage = "Error en la función Serverless. Revisa los logs de Netlify.";
        if (error.message && (error.message.includes('API key') || error.message.includes('rate limit'))) {
            errorMessage = `Verifica tu clave de API en Netlify sea válida. Detalle: ${error.message}`;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage }),
        };
    }
};