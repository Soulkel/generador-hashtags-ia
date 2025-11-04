// 1. Importar la librería de OpenAI
import { OpenAI } from "openai";

// La clave se lee de la variable de entorno (localmente del .env, remotamente de Netlify)
const apiKey = process.env.OPENAI_API_KEY;

// Inicializa el cliente de OpenAI.
const openai = new OpenAI({ apiKey });

// ----------------------------------------------------------------------
// FUNCIÓN PRINCIPAL DE NETLIFY HANDLER
// ----------------------------------------------------------------------
export const handler = async (event) => {
    // 1. Verificación básica del método
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido. Usa POST." }) };
    }

    // Verificación de la clave: Se mantiene para un diagnóstico rápido
    if (!apiKey) {
        console.error("Error: OPENAI_API_KEY no está definida.");
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
        
        // 3. Prompt de la IA (Optimizado para generar el JSON)
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

        // 5. Comprobación de Seguridad de Respuesta JSON
        try {
            // Intentamos parsear para confirmar que la IA envió JSON correcto
            JSON.parse(jsonText); 
        } catch (e) {
            console.error("ERROR GPT FORMATO:", jsonText);
            return {
                 statusCode: 500,
                 body: JSON.stringify({ error: `Fallo de OpenAI: La IA devolvió texto que no era JSON. Contenido: ${jsonText.substring(0, 100)}...` }),
            };
        }

        // 6. Devolver la respuesta al frontend
        return {
            statusCode: 200,
            body: jsonText, 
        };

    } catch (error) {
        // 7. Captura de Errores FINAL y Robusta (Para diagnosticar clave o cuota)
        console.error("ERROR FINAL DE API:", error); 
        
        let errorMessage = "Fallo desconocido de la función Serverless.";

        // Diagnóstico basado en el estado HTTP de la API de OpenAI
        if (error.status === 401) {
             errorMessage = "Clave de API INVÁLIDA o no activa. Verifica el valor y la facturación en OpenAI.";
        } else if (error.status === 429) {
             errorMessage = "Límite de Gasto o Cuota Excedido. Verifica los límites en el panel de OpenAI.";
        } else if (error.message) {
            // Mensaje de error general
            errorMessage = `Fallo de API: ${error.message.substring(0, 100)}...`;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage }), // Siempre devolvemos JSON válido
        };
    }
};