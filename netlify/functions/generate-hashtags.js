// 1. Importar la nueva librería: OpenAI
import { OpenAI } from "openai";

// La clave ahora se lee de la variable OPENAI_API_KEY
const apiKey = process.env.OPENAI_API_KEY;

// Inicializa el cliente de OpenAI.
const openai = new OpenAI({ apiKey });

// ----------------------------------------------------------------------
// FUNCIÓN PRINCIPAL DE NETLIFY HANDLER
// ----------------------------------------------------------------------
export const handler = async (event) => { // Cambiado a 'export const handler' para la sintaxis moderna
    // 1. Verificación básica del método y clave
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido. Usa POST." }) };
    }

    if (!apiKey) {
        console.error("Error: OPENAI_API_KEY no está definida en Netlify.");
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Fallo de configuración: La clave de API de OpenAI no está definida." }) 
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
        
        // 3. Prompt de la IA (Adaptado ligeramente para GPT)
        const systemPrompt = "Actúa como un experto en SEO de Instagram. Tu única tarea es devolver el resultado como un objeto JSON válido con tres propiedades: 'popular', 'medium', y 'niche'. NO incluyas ninguna explicación, markdown, o texto adicional, solo el JSON puro.";
        
        const userPrompt = `Genera exactamente 30 hashtags para una publicación/Reel con la siguiente descripción: "${description}". Clasifica los 30 hashtags en tres grupos: 10 Populares, 10 Medios y 10 de Nicho. El JSON debe tener esta estructura: {"popular": ["#tag1", ...], "medium": ["#tag1", ...], "niche": ["#tag1", ...]}`;
        
        // 4. Llamada a la API de OpenAI con configuración de JSON
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Modelo rápido y económico
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            // Esto le indica a la IA que debe devolver un objeto JSON
            response_format: { type: "json_object" }, 
            temperature: 0.2
        });
        
        const jsonText = response.choices[0].message.content.trim();

        // 5. Devolver la respuesta al frontend
        // El contenido de la respuesta ya debería ser el JSON generado.
        return {
            statusCode: 200,
            body: jsonText, 
        };

    } catch (error) {
        // 6. Captura de Errores Robustos
        console.error("Error en Netlify Function (OpenAI):", error.message);
        
        let errorMessage = "Error en la función Serverless (OpenAI). Revisa los logs de Netlify.";
        if (error.message && (error.message.includes('API key') || error.message.includes('rate limit'))) {
            errorMessage = `Verifica tu clave de API en Netlify sea válida. Detalle: ${error.message}`;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage }),
        };
    }
};