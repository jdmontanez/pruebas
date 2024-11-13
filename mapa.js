// Inicialización del Mapa de OpenStreetMap en Bogotá con Leaflet
const map = L.map('map').setView([4.601485, -74.066445], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Agregar marcador en la Universidad de los Andes
L.marker([4.601485, -74.066445]).addTo(map)
    .bindPopup("Universidad de los Andes")
    .openPopup();

let monthlyIncome = 0;

// Cargar mensualidad y gastos guardados al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadMonthlyIncome();
    loadExpenses();
    setupMutationObserver();
    updateFinancialSummary(); // Actualiza el resumen financiero al cargar la página
});

// Función para establecer y guardar la mensualidad en localStorage
function setMonthlyIncome() {
    monthlyIncome = parseFloat(document.getElementById("monthly-income").value);
    localStorage.setItem("monthlyIncome", monthlyIncome); // Guardar en localStorage
    alert(`Mensualidad guardada: COP ${monthlyIncome}`);
    updateFinancialSummary(); // Actualiza el resumen financiero después de guardar la mensualidad
}

// Función para cargar la mensualidad desde localStorage
function loadMonthlyIncome() {
    const storedIncome = localStorage.getItem("monthlyIncome");
    if (storedIncome) {
        monthlyIncome = parseFloat(storedIncome);
        document.getElementById("monthly-income").value = monthlyIncome;
        alert(`Mensualidad cargada: COP ${monthlyIncome}`);
        updateFinancialSummary(); // Actualiza el resumen financiero después de cargar la mensualidad
    }
}

// Función para localizar restaurantes cercanos usando marcadores en el mapa
function findNearbyRestaurants() {
    const restaurants = [
        { name: "Aloz Chino", lat: 4.6031380, lng: -74.0653168, recommendation: "Económico: 9000COP - 15000COP" },
        { name: "Arepa Soñada", lat: 4.6033568, lng: -74.0660477, recommendation: "Accesible: 1000COP - 10000COP" },
        { name: "Gasolinería", lat: 4.6023840, lng: -74.0661962, recommendation: "Accesible: 27000COP - 49000COP" },
        { name: "Açai, Bowls, Coffee (ABC)", lat: 4.6024529, lng: -74.0663609, recommendation: "Gasto Medio: 4000COP - 17000COP" },
        { name: "La Cabra Sanduchera", lat: 4.6025153, lng: -74.0666471, recommendation: "Gasto Medio: 11000COP - 23000COP" },
        { name: "Burger Play", lat: 4.6026245, lng: -74.066913, recommendation: "Gasto Medio: 14000COP - 19000COP" },
        { name: "Takoy", lat: 4.603166, lng: -74.065837, recommendation: "Gasto Medio: 13500COP" },
        { name: "WingStop", lat: 4.604558, lng: -74.065448, recommendation: "Gasto Medio: 20000COP" },
        { name: "BOXPLAZA", lat: 4.603870, lng: -74.065926, recommendation: "Rango variado de precios." },
        { name: "Mi Caserito", lat: 4.603840, lng: -74.065891, recommendation: "Rango variado de precios." },
        { name: "Randy's", lat: 4.603618, lng: -74.066042, recommendation: "Rango variado de precios." },
        { name: "Pan Pa'Ya", lat: 4.603565, lng: -74.066079, recommendation: "Rango variado de precios." },
        { name: "Panadería Doña Blanca", lat: 4.603258, lng: -74.066244, recommendation: "Rango variado de precios." },
        { name: "Andrés Exprés", lat: 4.603329, lng: -74.066480, recommendation: "Rango variado de precios." },
        { name: "City U", lat: 4.603319, lng: -74.067153, recommendation: "Rango variado de precios." }
    ];

    const bounds = [];

    restaurants.forEach((restaurant) => {
        const marker = L.marker([restaurant.lat, restaurant.lng]).addTo(map)
            .bindPopup(`${restaurant.name} - ${restaurant.recommendation}`);
        bounds.push([restaurant.lat, restaurant.lng]);
    });

    map.fitBounds(bounds);
}

findNearbyRestaurants();

// Función para guardar el gasto en la tabla y en localStorage
function saveExpense(description = null) {
    const date = new Date().toLocaleDateString();
    const descriptionText = description || document.getElementById("user-input").value;
    
    if (descriptionText.trim() === "") return; // No guardar si la descripción está vacía

    const expenseTable = document.getElementById("expenses-table").getElementsByTagName("tbody")[0];
    const row = expenseTable.insertRow();
    row.insertCell(0).textContent = date;
    row.insertCell(1).textContent = descriptionText;

    // Guardar en localStorage
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    expenses.push({ date, description: descriptionText });
    localStorage.setItem("expenses", JSON.stringify(expenses));

    // Limpiar el campo de descripción
    document.getElementById("user-input").value = "";
}

// Función para cargar gastos desde localStorage
function loadExpenses() {
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    expenses.forEach(expense => saveExpense(expense.description));
}

// Función para calcular el total de gastos
function calculateTotalExpenses() {
    const table = document.getElementById("expenses-table").getElementsByTagName("tbody")[0];
    let total = 0;

    for (let i = 0; i < table.rows.length; i++) {
        const amount = parseFloat(table.rows[i].cells[1].textContent);
        total += amount;
    }

    return total.toFixed(2);
}

// Función para actualizar el resumen financiero
function updateFinancialSummary() {
    const totalExpenses = calculateTotalExpenses();
    const remainingBalance = monthlyIncome - totalExpenses;

    document.getElementById("monthly-income-value").textContent = monthlyIncome.toFixed(2);
    document.getElementById("total-expenses-value").textContent = totalExpenses;
    document.getElementById("remaining-balance").textContent = remainingBalance.toFixed(2);
}

// Configurar MutationObserver para observar cambios en la tabla de gastos
function setupMutationObserver() {
    const table = document.getElementById("expenses-table").getElementsByTagName("tbody")[0];

    const observer = new MutationObserver(() => {
        updateFinancialSummary();
    });

    observer.observe(table, { childList: true, subtree: true });
}