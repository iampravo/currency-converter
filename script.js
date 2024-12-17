const apiUrl = "https://api.exchangerate-api.com/v4/latest/"; // API to fetch exchange rates
let exchangeRates = {}; // Cache for storing rates

const baseCurrencySelect = document.getElementById("baseCurrency");
const amountInput = document.getElementById("amount");
const ratesTableBody = document.getElementById("ratesTableBody");
const refreshButton = document.getElementById("refreshRates");

// Function to fetch and cache rates
async function fetchRates(baseCurrency = "USD") {
    try {
        const response = await fetch(apiUrl + baseCurrency);
        if (!response.ok) throw new Error("Failed to fetch rates");
        const data = await response.json();
        exchangeRates = data.rates; // Cache the rates
        console.log("Fetched rates:", exchangeRates);
        updateTable(); // Update table with new rates
    } catch (error) {
        console.error("Error fetching rates:", error);
        alert("Failed to fetch rates. Please try again.");
    }
}

// Populate base currency dropdown
async function populateBaseCurrencies() {
    try {
        const response = await fetch(apiUrl + "USD");
        const data = await response.json();
        const currencies = Object.keys(data.rates);
        currencies.forEach(currency => {
            const option = document.createElement("option");
            option.value = currency;
            option.textContent = currency;
            baseCurrencySelect.appendChild(option);
        });
        await fetchRates(); // Fetch rates for default currency
    } catch (error) {
        console.error("Error populating currencies:", error);
        alert("Failed to load currencies.");
    }
}

// Update the rates table dynamically
function updateTable() {
    const amount = parseFloat(amountInput.value) || 0;
    ratesTableBody.innerHTML = ""; // Clear table body

    Object.entries(exchangeRates).forEach(([currency, rate]) => {
        const convertedValue = (amount * rate).toFixed(2);
        const row = `
            <tr>
                <td>${currency}</td>
                <td>${rate.toFixed(4)}</td>
                <td>${convertedValue}</td>
            </tr>
        `;
        ratesTableBody.insertAdjacentHTML("beforeend", row);
    });
}

// Event listeners
baseCurrencySelect.addEventListener("change", () => {
    const baseCurrency = baseCurrencySelect.value;
    fetchRates(baseCurrency); // Fetch rates for selected currency
});

amountInput.addEventListener("input", updateTable); // Update table on amount change
refreshButton.addEventListener("click", () => {
    const baseCurrency = baseCurrencySelect.value;
    fetchRates(baseCurrency); // Refresh rates
});

// Initialize app
populateBaseCurrencies();
