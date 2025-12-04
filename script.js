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
// SISTEMA DE RESEÑAS (LOCAL STORAGE)
// ================================
const reviewForm = document.getElementById("reviewForm");
const reviewsList = document.getElementById("reviewsList");

// Cargar reseñas guardadas
document.addEventListener("DOMContentLoaded", () => {
    loadReviews();
});

reviewForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("nombre").value;
    const comment = document.getElementById("comentario").value;
    const imageInput = document.getElementById("foto");

    let imageBase64 = "";

    const saveReview = () => {
        const review = { name, comment, image: imageBase64 };
        let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        reviews.push(review);
        localStorage.setItem("reviews", JSON.stringify(reviews));

        displayReview(review);
        reviewForm.reset();
    };

    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
            imageBase64 = reader.result;
            saveReview();
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveReview();
    }
});

// Mostrar reseñas guardadas
function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews.forEach(review => displayReview(review));
}

// Crear la tarjeta de reseña
function displayReview(review) {
    const reviewDiv = document.createElement("div");
    reviewDiv.classList.add("review-item");

    reviewDiv.innerHTML = `
        <div class="review-card">
            ${review.image ? `<img src="${review.image}" class="review-img">` : ""}
            <h4>${review.name}</h4>
            <p>${review.comment}</p>
        </div>
    `;

    reviewsList.prepend(reviewDiv);
}