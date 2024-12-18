let exchangeRates = {}; // Cache for storing default EUR-based rates
let userCurrencies = new Set(); // User-selected currencies

const baseCurrencySelect = document.getElementById("baseCurrency");
const amountInput = document.getElementById("amount");
const addCurrencySelect = document.getElementById("addCurrencySelect");
const ratesTableBody = document.getElementById("ratesTableBody");
const refreshButton = document.getElementById("refreshRates");
const addCurrencyButton = document.getElementById("addCurrencyButton");

// Function to fetch and cache rates
const apiUrl = "https://data.fixer.io/api/latest";
const apiKey = process.env.FIXER_IO_API_KEY; 

async function fetchRates() {
    try {
        const response = await fetch(`${apiUrl}?access_key=${apiKey}&base=EUR`);
        if (!response.ok) {
            throw new Error(`Failed to fetch rates: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Check if the 'rates' property exists in the response
        if (!data.rates) {
            throw new Error("Rates data is missing in the API response.");
        }

        exchangeRates = data.rates;

        console.log("Fetched EUR-based rates:", exchangeRates);

        // Populate base currency dropdown and add currency dropdown
        populateBaseCurrencySelect();
    } catch (error) {
        console.error("Error fetching rates:", error);
        alert("Failed to fetch rates. Please try again.");
    }
}

// Populate base currency dropdown and add currency dropdown
async function populateBaseCurrencySelect() {
    try {
        // Fetch rates (already done in fetchRates())

        const currencies = Object.keys(exchangeRates);

        // Preferred currencies
        const preferredCurrencies = ["INR", "SGD", "EUR", "USD"];

        // Move preferred currencies to the top
        const remainingCurrencies = currencies
            .filter(currency => !preferredCurrencies.includes(currency))
            .sort();

        const finalCurrencies = [...preferredCurrencies, ...remainingCurrencies];

        // Populate base currency dropdown
        finalCurrencies.forEach(currency => {
            const option = document.createElement("option");
            option.value = currency;
            option.textContent = currency;
            baseCurrencySelect.appendChild(option);
        });

        // Populate add-currency dropdown
        finalCurrencies.forEach(currency => {
            const option = document.createElement("option");
            option.value = currency;
            option.textContent = currency;
            addCurrencySelect.appendChild(option);
        });

        // Default base currency is INR, so update the table for INR
        baseCurrencySelect.value = "INR"; // Set INR as the default
        updateTable();
    } catch (error) {
        console.error("Error populating currencies:", error);
        alert("Failed to load currencies.");
    }
}

// Add currency to the table
addCurrencyButton.addEventListener("click", () => {
    const selectedCurrency = addCurrencySelect.value;
    if (!userCurrencies.has(selectedCurrency)) {
        userCurrencies.add(selectedCurrency);
        updateTable();
    }
});

// Remove currency from the table
function removeCurrency(currency) {
    userCurrencies.delete(currency);
    updateTable();
}

// Update the table dynamically based on user-selected currencies
function updateTable() {
    const amount = parseFloat(amountInput.value) || 0;
    const baseCurrency = baseCurrencySelect.value;
    ratesTableBody.innerHTML = "";

    userCurrencies.forEach(currency => {
        let rate = exchangeRates[currency] || 0;

        // Calculate conversion factor if baseCurrency is not EUR
        if (baseCurrency !== "EUR") {
            const eurToBaseRate = exchangeRates[baseCurrency];
            rate = rate / eurToBaseRate;
        }

        const convertedValue = (amount * rate).toFixed(2);

        const row = `
            <tr>
                <td>${currency}</td>
                <td>${rate.toFixed(2)}</td>
                <td>${convertedValue}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeCurrency('${currency}')">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </td>
            </tr>
        `;
        ratesTableBody.insertAdjacentHTML("beforeend", row);
    });
}

// Event listeners
baseCurrencySelect.addEventListener("change", updateTable); // When the base currency is changed, update the table
amountInput.addEventListener("input", updateTable); // Update table on amount change
refreshButton.addEventListener("click", fetchRates); // Refresh rates

// Initialize app
fetchRates(); // Fetch the rates and initialize the app
