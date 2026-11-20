$(document).ready(function () {

    // FUNCIÓN AUXILIAR PARA CAMBIAR DE PESTAÑA
    function activarSeccion(objetivoId) {
        $('.nav-tab').removeClass('active');
        $('.nav-tab[data-target="' + objetivoId + '"]').addClass('active');

        $('.vista-seccion').removeClass('active').hide();
        $('#' + objetivoId).addClass('active').fadeIn(400);

        $('html, body').animate({ scrollTop: $('header').height() }, 300);
    }

    // 1. CAMBIO DINÁMICO DE PESTAÑAS/SECCIONES DENTRO DEL MISMO HTML
    $('.nav-tab').on('click', function (e) {
        e.preventDefault();
        var objetivoId = $(this).data('target');
        activarSeccion(objetivoId);
    });

    // 2. FILTROS Y PLAN SOSTENIBLE EN CATÁLOGO 
    var habitosSeleccionados = [];

    $('.btn-filtro').on('click', function () {
        $('.btn-filtro').removeClass('active');
        $(this).addClass('active');

        var filtro = $(this).data('filtro');
        if (filtro === 'todos') {
            $('.item-habito').fadeIn(250);
        } else {
            $('.item-habito').hide();
            $('.item-habito[data-categoria="' + filtro + '"]').fadeIn(250);
        }
    });

    $('.btn-plan').on('click', function () {
        var nombreHabito = $(this).data('habito');
        var indice = habitosSeleccionados.indexOf(nombreHabito);

        if (indice === -1) {
            habitosSeleccionados.push(nombreHabito);
            $(this).text('✓ En mi plan').addClass('guardado');
        } else {
            habitosSeleccionados.splice(indice, 1);
            $(this).text('+ Agregar a mi plan').removeClass('guardado');
        }

        $('#contador-plan').html('Mi plan sostenible: <strong>' + habitosSeleccionados.length + '</strong> hábito(s)');
        if (habitosSeleccionados.length > 0) {
            $('#btn-limpiar-plan').show();
        } else {
            $('#btn-limpiar-plan').hide();
        }
    });

    $('#btn-limpiar-plan').on('click', function () {
        habitosSeleccionados = [];
        $('.btn-plan').text('+ Agregar a mi plan').removeClass('guardado');
        $('#contador-plan').html('Mi plan sostenible: <strong>0</strong> hábito(s)');
        $(this).hide();
    });

    // 3. NAVEGACIÓN DIRECTA DESDE SERVICIOS
    $('.btn-servicio').on('click', function () {
        var destino = $(this).data('ir');
        var tema = $(this).data('tema');
        var preseleccion = $(this).data('preseleccion');

        activarSeccion(destino);

        if (tema) {
            $('#contacto-tema').val(tema);
        }
        if (preseleccion) {
            $('.tarjeta').removeClass('seleccionada');
            $('.tarjeta[data-opcion="' + preseleccion + '"]').addClass('seleccionada');
        }
    });

    // 4. CALCULADORA Y SELECCIÓN DE OPCIONES EN "SOLUCIONES" 
    // Factor de referencia: un auto particular promedio emite ~0.19 kg CO2 por km
    var resultadosData = {
        bicicleta: {
            titulo: "¡Excelente elección: Usar bicicleta!",
            descripcion: "Al desplazarte en bicicleta eliminas al 100% las emisiones de CO2 de tus trayectos, mejoras tu salud cardiovascular y ocupas un espacio mínimo en las vías urbanas.",
            icono: "🚲",
            factorAhorro: 0.19
        },
        transporte: {
            titulo: "¡Gran decisión: Usar transporte público!",
            descripcion: "Al usar buses o metro reduces drásticamente la congestión vehicular en la ciudad. Un solo vehículo masivo puede retirar decenas de autos particulares de la vía.",
            icono: "🚌",
            factorAhorro: 0.12
        },
        caminar: {
            titulo: "¡La opción más ecológica: Caminar!",
            descripcion: "Para distancias cortas, caminar es completamente cero emisiones, promueve un estilo de vida activo y te conecta directamente con tu comunidad urbana.",
            icono: "🚶‍♂️",
            factorAhorro: 0.19
        }
    };

    $('.btn-elegir').on('click', function () {
        // Evitar que dispare en botones de otros formularios con la misma clase
        if (!$(this).closest('.tarjeta').length) return;

        var km = parseFloat($('#km-diarios').val());
        var dias = parseInt($('#dias-semana').val(), 10);
        var tarjetaPadre = $(this).closest('.tarjeta');
        var claveOpcion = tarjetaPadre.data('opcion');
        var info = resultadosData[claveOpcion];

        // Validación y recuperación de errores (Heurísticas H5 y H9)
        if (isNaN(km) || km <= 0 || isNaN(dias)) {
            var htmlError = `
                <div class="caja-error">
                    <strong>Faltan datos del recorrido:</strong> Por favor, ingresa tus kilómetros diarios (mayor a 0) y los días por semana en el <strong>Paso 2</strong> antes de elegir una alternativa.
                </div>
            `;
            $('#mensaje-resultado').hide().html(htmlError).fadeIn(300);
            $('html, body').animate({ scrollTop: $('#configurar-recorrido').offset().top - 80 }, 400);
            return;
        }

        $('.tarjeta').removeClass('seleccionada');
        tarjetaPadre.addClass('seleccionada');

        var kmMensuales = km * dias * 4;
        var co2Ahorrado = (kmMensuales * info.factorAhorro).toFixed(1);

        var htmlResultado = `
            <div class="caja-impacto">
                <h4>${info.icono} ${info.titulo}</h4>
                <p><strong>Resumen de tu recorrido:</strong> ${km} km/día durante ${dias} día(s) a la semana (${kmMensuales} km al mes).</p>
                <p><strong>Impacto estimado:</strong> Ahorrarías aproximadamente <strong>${co2Ahorrado} kg de CO₂ al mes</strong> frente al uso de auto particular.</p>
                <p>${info.descripcion}</p>
            </div>
        `;

        $('#mensaje-resultado').hide().html(htmlResultado).fadeIn(500);
        $('#btn-reiniciar-calculo').show();
        $('html, body').animate({ scrollTop: $('#resultado').offset().top - 80 }, 400);
    });

    $('#btn-reiniciar-calculo').on('click', function () {
        $('#km-diarios').val('');
        $('#dias-semana').val('');
        $('.tarjeta').removeClass('seleccionada');
        $('#mensaje-resultado').html('<p><em>Ingresa tus kilómetros, selecciona los días y elige una opción del Paso 3 para evaluar el impacto de tu decisión.</em></p>');
        $(this).hide();
    });

    // 5. VALIDACIÓN Y ENVÍO DE CONTACTO 
    $('#form-contacto').on('submit', function (e) {
        e.preventDefault();

        var nombre = $('#contacto-nombre').val().trim();
        var correo = $('#contacto-correo').val().trim();
        var tema = $('#contacto-tema').val();
        var mensaje = $('#contacto-mensaje').val().trim();

        if (!nombre || !correo || !tema || !mensaje) {
            $('#feedback-contacto').hide().html(`
                <div class="caja-error">
                    <strong>No se pudo enviar la consulta:</strong> Completa todos los campos obligatorios marcados con (*).
                </div>
            `).fadeIn(300);
            return;
        }

        $('#feedback-contacto').hide().html(`
            <div class="caja-impacto">
                <h4>✅ ¡Consulta registrada con éxito!</h4>
                <p>Gracias, <strong>${nombre}</strong>. Hemos recibido tu solicitud sobre <strong>${tema}</strong> y nos comunicaremos contigo a <em>${correo}</em>.</p>
            </div>
        `).fadeIn(400);

        this.reset();
    });
});