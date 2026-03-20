// ===============================
//  MENÚ DESPLEGABLE
// ===============================
const menuCheckbox = document.getElementById("menu");
const navbar = document.querySelector(".navbar");

menuCheckbox.addEventListener("change", () => {
    if (menuCheckbox.checked) {
        navbar.style.height = "220px"; 
    } else {
        navbar.style.height = "0px";
    }
});

// ================================
// INFO BOX DEL MENÚ (tooltip animado)
// ================================
document.querySelectorAll(".item").forEach(item => {
    const infoBox = item.querySelector(".info-box");

    item.addEventListener("mouseenter", () => {
        infoBox.style.opacity = "1";
        infoBox.style.transform = "translateY(0)";
    });

    item.addEventListener("mouseleave", () => {
        infoBox.style.opacity = "0";
        infoBox.style.transform = "translateY(10px)";
    });
});


// ================================
// ANIMACIÓN SCROLL (fadeInUp)
// ================================
const animatedElements = document.querySelectorAll(".section, .sectionts, .service-box, .box-contact, .review-form, .Viajs-1");

function handleScrollAnimation() {
    animatedElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }
    });
}

window.addEventListener("scroll", handleScrollAnimation);
handleScrollAnimation(); // Activación inicial


// ================================
// SISTEMA DE RESEÑAS (Backend + DeviceId)
// ================================
const REVIEWS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsZc-hUqnijaaq_B8uSix0JcTYNp1BE4HoNLgFkdZU0W3w7OW0lMVD4bXHjpQ29i0rZQ/exec";

const reviewForm = document.getElementById("reviewForm");
const reviewsList = document.getElementById("reviewsList");
const btnResena = document.getElementById("btnResena");
const reviewStatus = document.getElementById("reviewStatus");

// ── DeviceId: genera uno único o recupera el existente ──
function getDeviceId() {
    let id = localStorage.getItem("vc_device_id");
    if (!id) {
        id = crypto.randomUUID
            ? crypto.randomUUID()
            : "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 10);
        localStorage.setItem("vc_device_id", id);
    }
    return id;
}

const deviceId = getDeviceId();

// ── Estrellas interactivas ──
const starBtns = document.querySelectorAll(".star-btn");
const estrellasInput = document.getElementById("rev-estrellas");
let selectedStars = 5;

function updateStars(value) {
    selectedStars = value;
    estrellasInput.value = value;
    starBtns.forEach(btn => {
        btn.classList.toggle("active", parseInt(btn.dataset.value) <= value);
    });
}

starBtns.forEach(btn => {
    btn.addEventListener("click", () => updateStars(parseInt(btn.dataset.value)));
    btn.addEventListener("mouseenter", () => {
        const val = parseInt(btn.dataset.value);
        starBtns.forEach(b => {
            b.classList.toggle("active", parseInt(b.dataset.value) <= val);
        });
    });
});

document.querySelector(".stars-input").addEventListener("mouseleave", () => {
    updateStars(selectedStars);
});

// Inicializar 5 estrellas por defecto
updateStars(5);

// ── Foto upload custom ──
const fotoInput = document.getElementById("rev-foto");
const fotoUpload = document.getElementById("fotoUpload");
const fotoPreview = document.getElementById("fotoPreview");
const fotoPreviewImg = document.getElementById("fotoPreviewImg");
const fotoRemove = document.getElementById("fotoRemove");

fotoUpload.addEventListener("click", () => fotoInput.click());

fotoInput.addEventListener("change", () => {
    if (fotoInput.files.length > 0) {
        const file = fotoInput.files[0];
        if (!file.type.startsWith("image/")) {
            mostrarToast("Solo se permiten imágenes (JPG, PNG, WebP).", "error");
            fotoInput.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            fotoPreviewImg.src = reader.result;
            fotoUpload.hidden = true;
            fotoPreview.hidden = false;
        };
        reader.readAsDataURL(file);
    }
});

fotoRemove.addEventListener("click", () => {
    fotoInput.value = "";
    fotoPreviewImg.src = "";
    fotoPreview.hidden = true;
    fotoUpload.hidden = false;
});

// ── Cargar reseñas aprobadas desde el backend ──
document.addEventListener("DOMContentLoaded", () => {
    loadReviewsFromBackend();
    loadMyReview();
});

function loadReviewsFromBackend() {
    if (!REVIEWS_SCRIPT_URL) {
            loadReviewsFromLocal();
        return;
    }

    fetch(REVIEWS_SCRIPT_URL + "?accion=listar")
        .then(res => res.json())
        .then(data => {
            if (data.success && data.resenas) {
                reviewsList.innerHTML = "";
                data.resenas.forEach(r => displayReview({
                    name: r.nombre,
                    comment: r.comentario,
                    image: r.imagen,
                    stars: r.estrellas,
                    date: r.fecha
                }));

                mostrarResumenResenas(data);
            }
        })
        .catch(() => loadReviewsFromLocal());
}

function mostrarResumenResenas(data) {
    const resenas = data.resenas || [];
    const totalGeneral = data.totalGeneral || resenas.length;

    if (resenas.length === 0) return;

    // Calcular promedio de estrellas de las aprobadas
    const sumaEstrellas = resenas.reduce((sum, r) => sum + (r.estrellas || 5), 0);
    const promedio = (sumaEstrellas / resenas.length).toFixed(1);

    // Generar estrellas visuales del promedio
    const promedioRedondeado = Math.round(sumaEstrellas / resenas.length);
    let estrellasVisual = "";
    for (let i = 0; i < 5; i++) estrellasVisual += i < promedioRedondeado ? "★" : "☆";

    // Insertar resumen antes de la lista
    let resumen = document.getElementById("reviewsSummary");
    if (!resumen) {
        resumen = document.createElement("div");
        resumen.id = "reviewsSummary";
        resumen.className = "reviews-summary";
        reviewsList.parentNode.insertBefore(resumen, reviewsList);
    }

    resumen.innerHTML =
        '<span class="summary-stars">' + estrellasVisual + '</span> ' +
        '<span class="summary-avg">' + promedio + '</span> ' +
        '<span class="summary-count">(' + totalGeneral + ' reseña' + (totalGeneral !== 1 ? 's' : '') + ')</span>';
}

// Fallback: reseñas locales si no hay backend
function loadReviewsFromLocal() {
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews.forEach(review => displayReview(review));
}

// ── Cargar reseña propia (pre-llenar formulario si ya existe) ──
function loadMyReview() {
    if (!REVIEWS_SCRIPT_URL) return;

    fetch(REVIEWS_SCRIPT_URL + "?accion=mi-resena&deviceId=" + encodeURIComponent(deviceId))
        .then(res => res.json())
        .then(data => {
            if (data.success && data.resena) {
                const r = data.resena;
                document.getElementById("rev-nombre").value = r.nombre || "";
                document.getElementById("rev-email").value = r.email || "";
                document.getElementById("rev-comentario").value = r.comentario || "";
                updateStars(r.estrellas || 5);

                // Sincronizar fingerprint de texto con lo que ya está en el backend
                lastTextFp = buildTextFp(r.nombre || "", r.email || "", r.estrellas || 5, r.comentario || "");
                localStorage.setItem("vc_review_text_fp", lastTextFp);

                btnResena.textContent = "Actualizar Reseña";

                if (r.estado === "PENDIENTE") {
                    reviewStatus.textContent = "Tu reseña está pendiente de aprobación.";
                    reviewStatus.className = "review-status status-pending";
                } else if (r.estado === "APROBADA") {
                    reviewStatus.textContent = "Tu reseña está publicada. Podés editarla.";
                    reviewStatus.className = "review-status status-approved";
                }
            }
        })
        .catch(() => {});
}

// ── Idempotencia: texto e imagen por separado ──
let lastTextFp = localStorage.getItem("vc_review_text_fp") || "";
let lastImageKey = localStorage.getItem("vc_review_img_key") || "";

function buildTextFp(nombre, email, estrellas, comentario) {
    return [nombre, email, estrellas, comentario].join("|");
}

function buildImageKey(file) {
    if (!file) return "";
    return file.name + "_" + file.size + "_" + file.type;
}

// ── Enviar reseña ──
reviewForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("rev-nombre").value.trim();
    const email = document.getElementById("rev-email").value.trim();
    const comentario = document.getElementById("rev-comentario").value.trim();
    const imageInput = document.getElementById("rev-foto");
    const newFile = imageInput.files.length > 0 ? imageInput.files[0] : null;

    if (!nombre) return mostrarToast("Ingresá tu nombre.", "error");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return mostrarToast("El email no es válido.", "error");

    // Si no hay backend configurado, guardar en localStorage
    if (!REVIEWS_SCRIPT_URL) {
        saveReviewLocal(nombre, comentario, imageInput);
        return;
    }

    // Idempotencia: comparar texto e imagen por separado
    const currentTextFp = buildTextFp(nombre, email, selectedStars, comentario);
    const currentImgKey = newFile ? buildImageKey(newFile) : lastImageKey;
    const textoCambio = currentTextFp !== lastTextFp;
    const imagenCambio = newFile && buildImageKey(newFile) !== lastImageKey;

    if (!textoCambio && !imagenCambio) {
        mostrarToast("No hay cambios para enviar.", "error");
        return;
    }

    const enviar = (imagenBase64, imagenNombre, imagenTipo) => {
        const datos = {
            nombre,
            email,
            estrellas: selectedStars.toString(),
            comentario,
            deviceId,
            imagen: imagenBase64 || "",
            imagenNombre: imagenNombre || "",
            imagenTipo: imagenTipo || "",
            imageKey: currentImgKey || ""
        };

        btnResena.disabled = true;
        const textoOriginal = btnResena.textContent;
        btnResena.textContent = "Enviando...";

        fetch(REVIEWS_SCRIPT_URL, {
            method: "POST",
            redirect: "follow",
            body: JSON.stringify(datos)
        })
        .then(res => res.json().catch(() => ({ success: true })))
        .then(data => {
            if (data.success !== false) {
                // Actualizar fingerprints solo si el envío fue exitoso
                lastTextFp = currentTextFp;
                localStorage.setItem("vc_review_text_fp", lastTextFp);
                if (imagenCambio) {
                    lastImageKey = buildImageKey(newFile);
                    localStorage.setItem("vc_review_img_key", lastImageKey);
                }

                const msg = data.actualizada
                    ? "Tu reseña fue actualizada. Será revisada nuevamente."
                    : "¡Gracias por tu reseña! Será revisada y publicada pronto.";
                mostrarToast(msg, "success");
                btnResena.textContent = "Actualizar Reseña";
                reviewStatus.textContent = "Tu reseña está pendiente de aprobación.";
                reviewStatus.className = "review-status status-pending";
            } else {
                mostrarToast(data.mensaje || "Error al enviar la reseña.", "error");
            }
        })
        .catch(() => mostrarToast("Error de conexión. Intentá nuevamente.", "error"))
        .finally(() => {
            btnResena.disabled = false;
            if (btnResena.textContent === "Enviando...") btnResena.textContent = textoOriginal;
        });
    };

    // Solo enviar base64 si la imagen realmente cambió
    if (imagenCambio) {
        const reader = new FileReader();
        reader.onload = () => enviar(reader.result, newFile.name, newFile.type);
        reader.readAsDataURL(newFile);
    } else {
        // Texto cambió pero imagen no → enviar sin imagen, backend conserva la existente
        enviar("", "", "");
    }
});

// Fallback localStorage
function saveReviewLocal(nombre, comentario, imageInput) {
    const guardar = (imageBase64) => {
        const review = { name: nombre, comment: comentario, image: imageBase64, stars: selectedStars };
        let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        reviews.push(review);
        localStorage.setItem("reviews", JSON.stringify(reviews));
        displayReview(review);
        reviewForm.reset();
        updateStars(5);
        mostrarToast("Reseña guardada localmente.", "success");
    };

    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => guardar(reader.result);
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        guardar("");
    }
}

// ── Crear tarjeta de reseña ──
function displayReview(review) {
    const reviewDiv = document.createElement("div");
    reviewDiv.classList.add("review-item");

    const card = document.createElement("div");
    card.classList.add("review-card");

    if (review.image) {
        const img = document.createElement("img");
        img.src = review.image;
        img.classList.add("review-img");
        card.appendChild(img);
    }

    // Estrellas visuales
    if (review.stars) {
        const starsDiv = document.createElement("div");
        starsDiv.style.color = "#f59e0b";
        starsDiv.style.fontSize = "18px";
        starsDiv.style.marginBottom = "4px";
        for (let i = 0; i < 5; i++) {
            starsDiv.textContent += i < review.stars ? "★" : "☆";
        }
        card.appendChild(starsDiv);
    }

    const h4 = document.createElement("h4");
    h4.textContent = review.name;
    card.appendChild(h4);

    const p = document.createElement("p");
    p.textContent = review.comment;
    card.appendChild(p);

    if (review.date) {
        const dateP = document.createElement("p");
        dateP.style.fontSize = "12px";
        dateP.style.color = "rgba(255,255,255,0.5)";
        dateP.style.marginTop = "6px";
        dateP.textContent = review.date;
        card.appendChild(dateP);
    }

    reviewDiv.appendChild(card);
    reviewsList.prepend(reviewDiv);
}


// ================================
// SISTEMA DE RESERVAS (Google Sheets)
// ================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxiBeGyQwfUfdKGIYqRLgDqdQCHuzJYd_d02oolntDvRMJZSJYA68ZUeuRIqvVMLw_jvQ/exec";

const reservaForm = document.getElementById("reservaForm");
const reservaAviso = document.getElementById("reservaAviso");
const horaInput = document.getElementById("res-hora-h");
const minInput = document.getElementById("res-hora-m");

// Solo permitir números en los inputs de hora
[horaInput, minInput].forEach(input => {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "");
    });
});

// Auto-saltar de hora a minutos al escribir 2 dígitos
horaInput.addEventListener("input", () => {
    if (horaInput.value.length === 2) minInput.focus();
});

// Al salir del campo, pad con 0 y clampar rango
horaInput.addEventListener("blur", () => {
    let v = parseInt(horaInput.value, 10);
    if (isNaN(v)) return;
    if (v < 6) v = 6;
    if (v > 23) v = 23;
    horaInput.value = v.toString().padStart(2, "0");
});

minInput.addEventListener("blur", () => {
    let v = parseInt(minInput.value, 10);
    if (isNaN(v)) return;
    if (v > 59) v = 59;
    minInput.value = v.toString().padStart(2, "0");
});

reservaForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Limpiar estados de error previos
    reservaForm.querySelectorAll(".campo-error").forEach(el => el.classList.remove("campo-error"));
    reservaAviso.textContent = "";
    reservaAviso.style.color = "#ff6b6b";

    const nombre = document.getElementById("res-nombre").value.trim();
    const email = document.getElementById("res-email").value.trim();
    const telefono = document.getElementById("res-telefono").value.trim();
    const fecha = document.getElementById("res-fecha").value;
    const personas = document.getElementById("res-personas").value;
    const mensaje = document.getElementById("res-mensaje").value.trim();

    // Leer hora custom
    const hh = horaInput.value.trim();
    const mm = minInput.value.trim();
    const hhNum = parseInt(hh, 10);
    const mmNum = parseInt(mm, 10);

    // Validación: campos obligatorios
    let hayError = false;

    if (!nombre) {
        marcarError("res-nombre");
        hayError = true;
    }
    if (!email && !telefono) {
        marcarError("res-email");
        marcarError("res-telefono");
        reservaAviso.textContent = "Completá al menos un email o un teléfono.";
        hayError = true;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        marcarError("res-email");
        reservaAviso.textContent = "El email no tiene un formato válido.";
        hayError = true;
    }
    if (telefono && !/^[\d\s\+\-\(\)]{7,20}$/.test(telefono)) {
        marcarError("res-telefono");
        reservaAviso.textContent = "El teléfono no tiene un formato válido.";
        hayError = true;
    }
    if (!fecha) {
        marcarError("res-fecha");
        hayError = true;
    }
    if (!hh || !mm || isNaN(hhNum) || isNaN(mmNum) || hhNum < 6 || hhNum > 23 || mmNum < 0 || mmNum > 59) {
        document.getElementById("res-hora-wrap").closest(".campo").classList.add("campo-error");
        reservaAviso.textContent = "Ingresá una hora válida (06 a 23) y minutos (00 a 59).";
        hayError = true;
    }
    if (!personas) {
        marcarError("res-personas");
        hayError = true;
    }

    if (hayError) {
        if (!reservaAviso.textContent) {
            reservaAviso.textContent = "Completá los campos marcados.";
        }
        return;
    }

    const hora = hh.padStart(2, "0") + ":" + mm.padStart(2, "0");

    // Preparar datos
    const datos = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        fechaReserva: fecha,
        hora: hora,
        personas: personas,
        mensaje: mensaje
    };

    // Protección doble submit
    const btnReserva = reservaForm.querySelector(".btn-reserva");
    if (btnReserva.disabled) return;
    const textoOriginal = btnReserva.textContent;
    btnReserva.disabled = true;
    btnReserva.textContent = "Enviando...";

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(datos)
    })
    .then(res => {
        // Apps Script redirige; si llegó respuesta intentamos parsear JSON
        if (!res.ok && res.type !== "opaque") {
            throw new Error("HTTP " + res.status);
        }
        return res.json().catch(() => ({ success: true }));
    })
    .then(data => {
        if (data.success !== false) {
            reservaForm.reset();
            if (window.resetDatepicker) window.resetDatepicker();
            mostrarToast("Reserva enviada correctamente. Te contactaremos pronto.", "success");
        } else {
            mostrarToast(data.mensaje || "Error al enviar la reserva.", "error");
        }
    })
    .catch(() => {
        mostrarToast("Error de conexión. Intentá nuevamente.", "error");
    })
    .finally(() => {
        btnReserva.disabled = false;
        btnReserva.textContent = textoOriginal;
    });
});

function marcarError(id) {
    document.getElementById(id).closest(".campo").classList.add("campo-error");
}


// ================================
// TOAST NOTIFICATIONS
// ================================
function mostrarToast(mensaje, tipo) {
    // Remover toast previo si existe
    const previo = document.querySelector(".toast");
    if (previo) previo.remove();

    const toast = document.createElement("div");
    toast.className = "toast toast-" + tipo;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    // Forzar reflow para que el browser registre el estado inicial (opacity:0)
    // antes de aplicar la clase que lo hace visible
    toast.offsetHeight;

    toast.classList.add("toast-visible");

    // Auto-cerrar después de 4.5 segundos
    setTimeout(() => {
        toast.classList.remove("toast-visible");
        setTimeout(() => toast.remove(), 400);
    }, 4500);
}
