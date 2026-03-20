// ================================
// DATE PICKER CUSTOM
// ================================
(function () {
    const MESES = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

    const trigger = document.getElementById("dp-trigger");
    const dropdown = document.getElementById("dp-dropdown");
    const hiddenInput = document.getElementById("res-fecha");
    const valueDisplay = document.getElementById("dp-value");

    function getHoy() {
        var h = new Date();
        h.setHours(0, 0, 0, 0);
        return h;
    }

    let mesActual = getHoy().getMonth();
    let anioActual = getHoy().getFullYear();
    let fechaSeleccionada = null;

    // Exponer función para resetear desde afuera
    window.resetDatepicker = function () {
        fechaSeleccionada = null;
        hiddenInput.value = "";
        valueDisplay.textContent = "Seleccioná una fecha";
        valueDisplay.classList.remove("dp-has-value");
        mesActual = getHoy().getMonth();
        anioActual = getHoy().getFullYear();
    };

    function abrirDropdown() {
        dropdown.classList.add("dp-open");
    }

    function cerrarDropdown() {
        dropdown.classList.remove("dp-open");
    }

    function estaAbierto() {
        return dropdown.classList.contains("dp-open");
    }

    // Accesibilidad: hacer el trigger focusable y operable con teclado
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("role", "button");

    trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        if (estaAbierto()) {
            cerrarDropdown();
        } else {
            renderCalendario();
            abrirDropdown();
        }
    });

    trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            trigger.click();
        }
        if (e.key === "Escape" && estaAbierto()) {
            cerrarDropdown();
        }
    });

    // Cerrar al clickear fuera
    document.addEventListener("click", function (e) {
        if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
            cerrarDropdown();
        }
    });

    function renderCalendario() {
        var hoy = getHoy();
        var primerDia = new Date(anioActual, mesActual, 1);
        var ultimoDia = new Date(anioActual, mesActual + 1, 0);
        var diasEnMes = ultimoDia.getDate();

        // Día de la semana del primer día (0=domingo, ajustar a lunes=0)
        var inicioDia = primerDia.getDay();
        inicioDia = inicioDia === 0 ? 6 : inicioDia - 1;

        // ¿Es el mes actual? Si sí, deshabilitar botón "prev"
        var esMesActual = (mesActual === hoy.getMonth() && anioActual === hoy.getFullYear());

        var html = "";

        // Header con navegación
        html += '<div class="dp-header">';
        html += '  <button type="button" class="dp-nav' + (esMesActual ? ' dp-nav-disabled' : '') + '" id="dp-prev"' + (esMesActual ? ' disabled' : '') + '>';
        html += '    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/></svg>';
        html += '  </button>';
        html += '  <span class="dp-mes-anio">' + MESES[mesActual] + " " + anioActual + '</span>';
        html += '  <button type="button" class="dp-nav" id="dp-next">';
        html += '    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/></svg>';
        html += '  </button>';
        html += '</div>';

        // Días de la semana
        html += '<div class="dp-grid dp-weekdays">';
        for (var i = 0; i < 7; i++) {
            html += '<span class="dp-weekday">' + DIAS_SEMANA[i] + '</span>';
        }
        html += '</div>';

        // Grilla de días
        html += '<div class="dp-grid dp-days">';

        // Celdas vacías antes del primer día
        for (var j = 0; j < inicioDia; j++) {
            html += '<span class="dp-day dp-empty"></span>';
        }

        var hoyStr = hoy.getFullYear() + "-" +
            String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
            String(hoy.getDate()).padStart(2, "0");

        for (var d = 1; d <= diasEnMes; d++) {
            var fechaStr = anioActual + "-" +
                String(mesActual + 1).padStart(2, "0") + "-" +
                String(d).padStart(2, "0");

            var clases = "dp-day";

            // Deshabilitar días pasados
            var fechaCheck = new Date(anioActual, mesActual, d);
            fechaCheck.setHours(0, 0, 0, 0);

            if (fechaCheck < hoy) {
                clases += " dp-disabled";
            }

            if (fechaStr === hoyStr) {
                clases += " dp-today";
            }
            if (fechaSeleccionada === fechaStr) {
                clases += " dp-selected";
            }

            html += '<button type="button" class="' + clases + '" data-fecha="' + fechaStr + '">' + d + '</button>';
        }

        html += '</div>';

        dropdown.innerHTML = html;

        // Eventos de navegación
        document.getElementById("dp-prev").addEventListener("click", function (e) {
            e.stopPropagation();
            mesActual--;
            if (mesActual < 0) {
                mesActual = 11;
                anioActual--;
            }
            renderCalendario();
        });

        document.getElementById("dp-next").addEventListener("click", function (e) {
            e.stopPropagation();
            mesActual++;
            if (mesActual > 11) {
                mesActual = 0;
                anioActual++;
            }
            renderCalendario();
        });

        // Eventos de selección de día
        var botonesDia = dropdown.querySelectorAll(".dp-day:not(.dp-empty):not(.dp-disabled)");
        botonesDia.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                fechaSeleccionada = btn.getAttribute("data-fecha");
                hiddenInput.value = fechaSeleccionada;

                // Formatear para mostrar: "17 de Marzo de 2026"
                var partes = fechaSeleccionada.split("-");
                var dia = parseInt(partes[2], 10);
                var mes = parseInt(partes[1], 10) - 1;
                var anio = partes[0];
                valueDisplay.textContent = dia + " de " + MESES[mes] + " de " + anio;
                valueDisplay.classList.add("dp-has-value");

                cerrarDropdown();
                renderCalendario();
            });
        });
    }
})();
