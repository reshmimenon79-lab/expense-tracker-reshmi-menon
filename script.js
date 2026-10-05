let transactions = [];
let editId = null; // Tracks if we are updating an existing transaction

// 1. Load saved transactions from Local Storage
const savedTransactions = localStorage.getItem("transactions");
if (savedTransactions) {
    transactions = JSON.parse(savedTransactions);
}

// 2. Save transactions to Local Storage
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// 3. Get form and input fields
const transactionForm = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const submitBtn = transactionForm.querySelector("button[type='submit']");

// 4. Get display and filter elements
const transactionList = document.getElementById("transaction-list");
const incomeDisplay = document.getElementById("total-income");
const expenseDisplay = document.getElementById("total-expenses");
const balanceDisplay = document.getElementById("balance");
const filterType = document.getElementById("filter-type");
const filterCategory = document.getElementById("filter-category");

// 5. Function to update the webpage UI
function updateUI() {
    // Clear the current list
    transactionList.innerHTML = "";
    
    let totalIncome = 0;
    let totalExpenses = 0;

    // Apply the dropdown filters to our array
    const filteredTransactions = transactions.filter(function(transaction) {
        const matchType = filterType.value === "all" || transaction.type === filterType.value;
        const matchCategory = filterCategory.value === "all" || transaction.category === filterCategory.value;
        return matchType && matchCategory;
    });

    // Loop through only the FILTERED transactions
    filteredTransactions.forEach(function(transaction) {
        // Add up the math
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
            totalExpenses += transaction.amount;
        }

        // Create a new list item
        const li = document.createElement("li");
        li.classList.add("transaction");
        
        // Include BOTH Edit and Delete buttons
        li.innerHTML = `
            <div>
                <strong>${transaction.category}</strong>: ${transaction.description} <br>
                <small>${transaction.date}</small>
            </div>
            <div class="transaction-actions">
                <span>₹${transaction.amount}</span>
                <button class="edit-button" onclick="editTransaction(${transaction.id})">Edit</button>
                <button class="delete-button" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
        `;
        
        transactionList.appendChild(li);
    });

    // Update the summary cards
    const balance = totalIncome - totalExpenses;
    incomeDisplay.innerText = `₹${totalIncome.toFixed(2)}`;
    expenseDisplay.innerText = `₹${totalExpenses.toFixed(2)}`;
    balanceDisplay.innerText = `₹${balance.toFixed(2)}`;
}

// 6. Handle form submission (Handles BOTH Add and Edit)
transactionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (editId !== null) {
        // We are UPDATING an existing transaction
        const transactionIndex = transactions.findIndex(t => t.id === editId);
        if (transactionIndex !== -1) {
            transactions[transactionIndex].type = typeInput.value;
            transactions[transactionIndex].amount = Number(amountInput.value);
            transactions[transactionIndex].category = categoryInput.value;
            transactions[transactionIndex].date = dateInput.value;
            transactions[transactionIndex].description = descriptionInput.value;
        }
        
        // Reset the form back to "Add" mode
        editId = null;
        submitBtn.innerText = "Add Transaction";
    } else {
        // We are ADDING a new transaction
        const transaction = {
            id: Date.now(),
            type: typeInput.value,
            amount: Number(amountInput.value),
            category: categoryInput.value,
            date: dateInput.value,
            description: descriptionInput.value
        };
        transactions.push(transaction);
    }

    // Save, update screen, and clear form
    saveTransactions();
    updateUI();
    transactionForm.reset();
});

// 7. Function to delete a transaction
function deleteTransaction(id) {
    transactions = transactions.filter(function(transaction) {
        return transaction.id !== id;
    });

    if (editId === id) {
        editId = null;
        submitBtn.innerText = "Add Transaction";
        transactionForm.reset();
    }

    saveTransactions();
    updateUI();
}

// 8. Function to edit a transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    
    if (transaction) {
        // Fill the form fields with that transaction's data
        typeInput.value = transaction.type;
        amountInput.value = transaction.amount;
        categoryInput.value = transaction.category;
        dateInput.value = transaction.date;
        descriptionInput.value = transaction.description;

        // Set the editId so submit knows to update, not add
        editId = id;
        submitBtn.innerText = "Update Transaction";
    }
}

// 9. Listen for filter changes
filterType.addEventListener("change", updateUI);
filterCategory.addEventListener("change", updateUI);

// 10. Run immediately on load
updateUI();