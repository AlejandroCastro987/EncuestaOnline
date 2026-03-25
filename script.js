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
        // URL de producción (Recuerda poner el flujo en "Active" en n8n)
        const n8nWebhookUrl = `https://luishurtado.app.n8n.cloud/webhook/06ccde91-7c50-4d4e-81e5-1ae6ac43c659?${params}`;

        console.log('Enviando via POST a n8n TEST:', n8nWebhookUrl);

        // Envío via GET (El método más compatible y con menos restricciones de seguridad)
        console.log('Iniciando envío a n8n (Modo GET Ultra-Compatible)...');
        
        // n8n recibirá los datos en los 'Query Parameters'.
        await fetch(n8nWebhookUrl, {
            method: 'GET',
            mode: 'no-cors', 
        });

        console.log('Petición enviada. Revisa n8n para confirmar la recepción.');

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
