// 1. Importar la librería de OpenAI
import { OpenAI } from "openai";

// La clave se lee de la variable de entorno de Vercel
const apiKey = process.env.OPENAI_API_KEY;

// Inicializa el cliente de OpenAI.
const openai = new OpenAI({ apiKey });

// ----------------------------------------------------------------------
// FUNCIÓN PRINCIPAL DE VERSEL (Sintaxis request/response)
// ----------------------------------------------------------------------
export default async function handler(request, response) {
    
    // 1. Verificación básica del método y clave
    if (request.method !== 'POST') {
        return response.status(405).json({ error: "Método no permitido. Usa POST." });
    }

    if (!apiKey) {
        return response.status(500).json({ error: "Fallo de configuración: La clave de API de OpenAI no está definida." });
    }

    try {
        // 2. Extraer y verificar la descripción (Vercel lee el body automáticamente)
        const { description } = request.body;

        if (!description || description.trim() === '') {
            return response.status(400).json({ error: "Descripción del Reel requerida." });
        }
        
        // 3. Prompt de la IA
        const systemPrompt = "Actúa como un experto en SEO de Instagram. Tu única tarea es devolver el resultado como un objeto JSON válido con tres propiedades: 'popular', 'medium', y 'niche'. NO incluyas ninguna explicación, markdown, o texto adicional, solo el JSON puro.";
        
        const userPrompt = `Genera exactamente 30 hashtags para una publicación/Reel con la siguiente descripción: "${description}". Clasifica los 30 hashtags en tres grupos: 10 Populares, 10 Medios y 10 de Nicho. El JSON debe tener esta estructura: {"popular": ["#tag1", ...], "medium": ["#tag1", ...], "niche": ["#tag1", ...]}`;
        
        // 4. Llamada a la API de OpenAI
        const openaiResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: "json_object" }, 
            temperature: 0.2
        });
        
        const jsonText = openaiResponse.choices[0].message.content.trim();

        // 5. Comprobación de Seguridad: Aseguramos que la respuesta es JSON
        try {
            const hashtagsObject = JSON.parse(jsonText); 
            // 6. Devolver la respuesta al frontend (¡ÉXITO!)
            return response.status(200).json(hashtagsObject);
        } catch (e) {
            console.error("ERROR GPT FORMATO:", jsonText);
            return response.status(500).json({ error: `Fallo de OpenAI: La IA devolvió texto que no era JSON. Contenido: ${jsonText.substring(0, 100)}...` });
        }

    } catch (error) {
        // 7. Captura de Errores FINAL y Robusta 
        console.error("ERROR FINAL DE API:", error); 
        
        let errorMessage = "Fallo desconocido de la función Serverless.";
        let statusCode = 500;

        if (error.status === 401) {
             errorMessage = "Clave de API INVÁLIDA o no activa. Verifica la facturación en OpenAI.";
             statusCode = 401;
        } else if (error.status === 429) {
             errorMessage = "Límite de Gasto o Cuota Excedido. Verifica los límites en el panel de OpenAI.";
             statusCode = 429;
        } else if (error.message) {
            errorMessage = `Fallo de API: ${error.message.substring(0, 100)}...`;
        }

        return response.status(statusCode).json({ error: errorMessage });
    }
}