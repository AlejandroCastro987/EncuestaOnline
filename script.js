const surveyForm = document.getElementById('surveyForm');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');

surveyForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // UI Feedback
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando opinión...';

    // Obtener datos del formulario
    const formData = new FormData(surveyForm);
    const data = Object.fromEntries(formData.entries());

    try {
        // Validación básica
        if (!data.id_estudiante || !data.nivel_satisfaccion) {
            throw new Error('Por favor, completa los campos obligatorios.');
        }

        // Preparar datos para n8n (Proxy seguro para Airtable y Email)
        const n8nData = {
            id_estudiante: data.id_estudiante,
            satisfaccion: parseInt(data.nivel_satisfaccion),
            claridad: parseInt(data.claridad_contenido) || 0,
            aplicabilidad: parseInt(data.aplicabilidad_practica) || 0,
            comentarios: data.comentarios_adicionales || ""
        };

        const params = new URLSearchParams(n8nData).toString();
        // URL de producción definitiva
        const n8nWebhookUrl = `https://luishurtado.app.n8n.cloud/webhook/06ccde91-7c50-4d4e-81e5-1ae6ac43c659?${params}`;

        console.log('Enviando via POST a n8n TEST:', n8nWebhookUrl);

        // Envío via POST
        console.log('Iniciando envío a n8n...');
        
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            // El modo 'no-cors' impide que se envíe el Content-Type: application/json correctamente
            // n8n Cloud permite CORS por defecto en la mayoría de configuraciones
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(n8nData)
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(
                    "Error 404: El Webhook no está registrado. \n\n" +
                    "SOLUCIÓN: \n" +
                    "1. Pulsa el botón 'Active' (arriba a la derecha) en n8n.\n" +
                    "2. O cambia la URL en el código a 'webhook-test' para pruebas temporales."
                );
            }
            throw new Error(`n8n respondió con error ${response.status}. ¿Está el flujo Activo?`);
        }

        console.log('Petición recibida por n8n exitosamente');

        // Ocultar formulario y mostrar éxito
        surveyForm.classList.add('hidden');
        successMessage.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        alert('Problema detectado: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Opinión';
    }
});

function resetForm() {
    // Limpiar formulario
    surveyForm.reset();

    // Intercambiar visibilidad
    successMessage.classList.add('hidden');
    surveyForm.classList.remove('hidden');
}

// Añadir un efecto de sonido visual o animación extra al seleccionar ratings
const ratingInputs = document.querySelectorAll('.rating-group input');
ratingInputs.forEach(input => {
    input.addEventListener('change', () => {
        // Podríamos añadir una animación de "bounce" a la tarjeta o al grupo
        const group = input.closest('.rating-group');
        group.style.transform = 'scale(1.02)';
        setTimeout(() => {
            group.style.transform = 'scale(1)';
        }, 150)
    });
});
