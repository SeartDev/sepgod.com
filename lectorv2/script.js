document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');

    analyzeBtn.addEventListener('click', async () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        const fileInput = document.getElementById('fileInput');
        const responseArea = document.getElementById('responseArea');

        // Validaciones
        if (!apiKey) {
            alert('Por favor, ingresa tu API Key de Gemini.');
            return;
        }
        if (fileInput.files.length === 0) {
            alert('Por favor, selecciona un archivo .v2.');
            return;
        }

        const file = fileInput.files[0];
        
        // Preparar UI
        analyzeBtn.disabled = true;
        analyzeBtn.innerText = 'Analizando...';
        responseArea.style.display = 'block';
        responseArea.innerText = 'Leyendo archivo e interactuando con Gemini...';

        try {
            // Leer archivo
            const fileContent = await readFileAsync(file);

            // Construir petición
            const prompt = `Actúa como un analista de datos. Por favor interpreta el siguiente contenido extraído de un archivo .v2 y explícame de qué trata o dame un resumen estructurado:\n\n${fileContent}`;
            
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            
            const requestBody = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };

            // Llamada a la API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status} - Verifica tu API Key.`);
            }

            const data = await response.json();
            
            // Mostrar respuesta
            const aiResponse = data.candidates[0].content.parts[0].text;
            responseArea.innerText = aiResponse;

        } catch (error) {
            console.error(error);
            responseArea.innerText = `Ocurrió un error: ${error.message}`;
        } finally {
            // Restaurar UI
            analyzeBtn.disabled = false;
            analyzeBtn.innerText = 'Interpretar con AI';
        }
    });
});

// Función para leer el archivo
function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
        reader.readAsText(file);
    });
}
