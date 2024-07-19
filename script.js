document.addEventListener('DOMContentLoaded', () => {
    loadInvoices();

    // Formulaire pour ajouter une facture
    document.getElementById('invoice-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const client = document.getElementById('client').value;
        const montant = parseFloat(document.getElementById('montant').value);
        const date = document.getElementById('date').value;
        const type = document.getElementById('type').value;
        
        const invoice = { id: Date.now(), client, montant, date, type, status: 'Non payé' };
        saveInvoice(invoice);
        addInvoiceToTable(invoice);
        updateSummary();
        updateClientTotals();
        updateFournisseurTotals();
        updateProfitLoss();
        
        this.reset();
    });

    // Liens pour télécharger les PDFs
    document.getElementById('pdf-clients-link').addEventListener('click', (event) => {
        event.preventDefault();
        window.open(event.target.href, '_blank');
    });

    document.getElementById('pdf-fournisseurs-link').addEventListener('click', (event) => {
        event.preventDefault();
        window.open(event.target.href, '_blank');
    });

    // Filtrage des factures par client ou fournisseur
    document.getElementById('searchClientInvoices').addEventListener('input', function() {
        filterInvoices('client', this.value.trim().toLowerCase());
    });

    document.getElementById('searchFournisseurInvoices').addEventListener('input', function() {
        filterInvoices('fournisseur', this.value.trim().toLowerCase());
    });
});

// Fonction pour filtrer les factures par type (client ou fournisseur)
function filterInvoices(type, searchTerm) {
    const invoicesTable = type === 'client' ? document.getElementById('client-invoices') : document.getElementById('fournisseur-invoices');
    const rows = invoicesTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    for (let row of rows) {
        const invoiceNumber = row.getElementsByTagName('td')[0].textContent.toLowerCase();
        row.style.display = invoiceNumber.includes(searchTerm) ? '' : 'none';
    }
}

// Fonction pour mettre à jour le résumé des factures
function updateSummary() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const clientInvoices = invoices.filter(invoice => invoice.type === 'client');
    const fournisseurInvoices = invoices.filter(invoice => invoice.type === 'fournisseur');

    const clientPaid = clientInvoices.filter(invoice => invoice.status === 'Payé').length;
    const clientUnpaid = clientInvoices.filter(invoice => invoice.status === 'Non payé').length;
    const fournisseurPaid = fournisseurInvoices.filter(invoice => invoice.status === 'Payé').length;
    const fournisseurUnpaid = fournisseurInvoices.filter(invoice => invoice.status === 'Non payé').length;

    const ctx = document.getElementById('summary-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Clients Payés', 'Clients Non payés', 'Fournisseurs Payés', 'Fournisseurs Non payés'],
            datasets: [{
                label: 'Nombre de Factures',
                data: [clientPaid, clientUnpaid, fournisseurPaid, fournisseurUnpaid],
                backgroundColor: ['#4CAF50', '#FF5722', '#4CAF50', '#FF5722']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonction pour calculer et mettre à jour les sommes des factures clients payées et non payées
function updateClientTotals() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const clientInvoices = invoices.filter(invoice => invoice.type === 'client');

    const totalClientPaid = clientInvoices
        .filter(invoice => invoice.status === 'Payé')
        .reduce((sum, invoice) => sum + parseFloat(invoice.montant), 0);

    const totalClientUnpaid = clientInvoices
        .filter(invoice => invoice.status === 'Non payé')
        .reduce((sum, invoice) => sum + parseFloat(invoice.montant), 0);

    document.getElementById('total-client-paid').textContent = totalClientPaid.toFixed(2);
    document.getElementById('total-client-unpaid').textContent = totalClientUnpaid.toFixed(2);
}

// Fonction pour calculer et mettre à jour les sommes des factures fournisseurs payées et non payées
function updateFournisseurTotals() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const fournisseurInvoices = invoices.filter(invoice => invoice.type === 'fournisseur');

    const totalFournisseurPaid = fournisseurInvoices
        .filter(invoice => invoice.status === 'Payé')
        .reduce((sum, invoice) => sum + parseFloat(invoice.montant), 0);

    const totalFournisseurUnpaid = fournisseurInvoices
        .filter(invoice => invoice.status === 'Non payé')
        .reduce((sum, invoice) => sum + parseFloat(invoice.montant), 0);

    document.getElementById('total-fournisseur-paid').textContent = totalFournisseurPaid.toFixed(2);
    document.getElementById('total-fournisseur-unpaid').textContent = totalFournisseurUnpaid.toFixed(2);
}

// Fonction pour calculer le bénéfice ou la perte
function updateProfitLoss() {
    const totalClientPaid = parseFloat(document.getElementById('total-client-paid').textContent);
    const totalFournisseurPaid = parseFloat(document.getElementById('total-fournisseur-paid').textContent);

    const profitLoss = totalClientPaid - totalFournisseurPaid;
    const profitLossElement = document.getElementById('profit-loss');

    if (profitLoss >= 0) {
        profitLossElement.textContent = `Bénéfice: ${profitLoss.toFixed(2)}€`;
        profitLossElement.style.color = 'green';
    } else {
        profitLossElement.textContent = `Perte: ${Math.abs(profitLoss).toFixed(2)}€`;
        profitLossElement.style.color = 'red';
    }
}

// Fonction pour sauvegarder une facture dans le localStorage
function saveInvoice(invoice) {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

// Fonction pour charger les factures depuis le localStorage au chargement de la page
function loadInvoices() {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.forEach(invoice => addInvoiceToTable(invoice));
    updateSummary();
    updateClientTotals();
    updateFournisseurTotals();
    updateProfitLoss();
}

// Fonction pour ajouter une facture à la table
function addInvoiceToTable(invoice) {
    const tableId = invoice.type === 'client' ? 'client-invoices' : 'fournisseur-invoices';
    const table = document.getElementById(tableId).querySelector('tbody');
    const row = table.insertRow();
    row.setAttribute('data-id', invoice.id);
    
    row.insertCell(0).textContent = invoice.id;
    row.insertCell(1).textContent = invoice.client;
    row.insertCell(2).textContent = invoice.montant;
    row.insertCell(3).textContent = invoice.date;
    row.insertCell(4).textContent = invoice.status;
    
    const actionsCell = row.insertCell(5);
    const deleteButton = createButton('Supprimer', 'delete-btn', () => {
        deleteInvoiceConfirmation(invoice.id);
    });
    actionsCell.appendChild(deleteButton);

    const payButton = createButton('Marquer comme payé', 'pay-btn', () => {
        markInvoiceStatus(invoice.id, 'Payé');
        row.cells[4].textContent = 'Payé';
        updateSummary();
        updateClientTotals();
        updateFournisseurTotals();
        updateProfitLoss();
    });
    actionsCell.appendChild(payButton);

    const unpayButton = createButton('Marquer comme Non payé', 'unpay-btn', () => {
        markInvoiceStatus(invoice.id, 'Non payé');
        row.cells[4].textContent = 'Non payé';
        updateSummary();
        updateClientTotals();
        updateFournisseurTotals();
        updateProfitLoss();
    });
    actionsCell.appendChild(unpayButton);
}

// Fonction utilitaire pour créer des boutons
function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(className);
    button.addEventListener('click', onClick);
    return button;
}

// Fonction pour demander confirmation avant la suppression d'une facture
function deleteInvoiceConfirmation(id) {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
        deleteInvoice(id);
        document.querySelector(`[data-id="${id}"]`).remove();
        updateSummary();
        updateClientTotals();
        updateFournisseurTotals();
        updateProfitLoss();
    }
}

// Fonction pour supprimer une facture du localStorage
function deleteInvoice(id) {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices = invoices.filter(invoice => invoice.id !== id);
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

// Fonction pour mettre à jour le statut d'une facture (Payé ou Non payé)
function markInvoiceStatus(id, status) {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices = invoices.map(invoice => {
        if (invoice.id === id) {
            invoice.status = status;
        }
        return invoice;
    });
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

function updateCashFlow() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const today = new Date();
    
    const periods = {
        week: { inflows: 0, outflows: 0 },
        month: { inflows: 0, outflows: 0 },
        last3months: { inflows: 0, outflows: 0 },
        year: { inflows: 0, outflows: 0 },
        previousyears: { inflows: 0, outflows: 0 }
    };

    invoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.date);
        const amount = parseFloat(invoice.montant);
        const isPaid = invoice.status === 'Payé';

        // Hebdomadaire
        if (isInSameWeek(invoiceDate, today)) {
            isPaid ? periods.week.inflows += amount : periods.week.outflows += amount;
        }

        // Mensuel
        if (isInSameMonth(invoiceDate, today)) {
            isPaid ? periods.month.inflows += amount : periods.month.outflows += amount;
        }

        // Derniers 3 Mois
        if (isInLastThreeMonths(invoiceDate, today)) {
            isPaid ? periods.last3months.inflows += amount : periods.last3months.outflows += amount;
        }

        // Annuel
        if (isInSameYear(invoiceDate, today)) {
            isPaid ? periods.year.inflows += amount : periods.year.outflows += amount;
        }

        // Années Précédentes
        if (invoiceDate < new Date(today.getFullYear(), 0, 1)) {
            isPaid ? periods.previousyears.inflows += amount : periods.previousyears.outflows += amount;
        }
    });

    updateCashFlowTable(periods);
    updateCashFlowChart(periods);
}

function updateCashFlowTable(periods) {
    document.getElementById('week-inflows').textContent = periods.week.inflows.toFixed(2);
    document.getElementById('week-outflows').textContent = periods.week.outflows.toFixed(2);
    document.getElementById('week-balance').textContent = (periods.week.inflows - periods.week.outflows).toFixed(2);

    document.getElementById('month-inflows').textContent = periods.month.inflows.toFixed(2);
    document.getElementById('month-outflows').textContent = periods.month.outflows.toFixed(2);
    document.getElementById('month-balance').textContent = (periods.month.inflows - periods.month.outflows).toFixed(2);

    document.getElementById('last3months-inflows').textContent = periods.last3months.inflows.toFixed(2);
    document.getElementById('last3months-outflows').textContent = periods.last3months.outflows.toFixed(2);
    document.getElementById('last3months-balance').textContent = (periods.last3months.inflows - periods.last3months.outflows).toFixed(2);

    document.getElementById('year-inflows').textContent = periods.year.inflows.toFixed(2);
    document.getElementById('year-outflows').textContent = periods.year.outflows.toFixed(2);
    document.getElementById('year-balance').textContent = (periods.year.inflows - periods.year.outflows).toFixed(2);

    document.getElementById('previousyears-inflows').textContent = periods.previousyears.inflows.toFixed(2);
    document.getElementById('previousyears-outflows').textContent = periods.previousyears.outflows.toFixed(2);
    document.getElementById('previousyears-balance').textContent = (periods.previousyears.inflows - periods.previousyears.outflows).toFixed(2);
}

function updateCashFlowChart(periods) {
    const ctx = document.getElementById('cash-flow-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Semaine', 'Mois', '3 Derniers Mois', 'Année', 'Années Précédentes'],
            datasets: [{
                label: 'Entrées',
                data: [
                    periods.week.inflows,
                    periods.month.inflows,
                    periods.last3months.inflows,
                    periods.year.inflows,
                    periods.previousyears.inflows
                ],
                backgroundColor: '#4CAF50',
            }, {
                label: 'Sorties',
                data: [
                    periods.week.outflows,
                    periods.month.outflows,
                    periods.last3months.outflows,
                    periods.year.outflows,
                    periods.previousyears.outflows
                ],
                backgroundColor: '#FF5722',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonctions utilitaires pour vérifier les intervalles de dates
function isInSameWeek(invoiceDate, today) {
    const startOfWeek = today.getDate() - today.getDay();
    const endOfWeek = startOfWeek + 6;
    const start = new Date(today.setDate(startOfWeek));
    const end = new Date(today.setDate(endOfWeek));
    return invoiceDate >= start && invoiceDate <= end;
}

function isInSameMonth(invoiceDate, today) {
    return invoiceDate.getFullYear() === today.getFullYear() && invoiceDate.getMonth() === today.getMonth();
}

function isInLastThreeMonths(invoiceDate, today) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    return invoiceDate >= threeMonthsAgo && invoiceDate <= today;
}

function isInSameYear(invoiceDate, today) {
    return invoiceDate.getFullYear() === today.getFullYear();
}

function updateCashFlow() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const today = new Date();
    
    const periods = {
        week: { inflows: 0, outflows: 0 },
        month: { inflows: 0, outflows: 0 },
        last3months: { inflows: 0, outflows: 0 },
        year: { inflows: 0, outflows: 0 },
        previousyears: { inflows: 0, outflows: 0 }
    };

    invoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.date);
        const amount = parseFloat(invoice.montant);
        const isPaid = invoice.status === 'Payé';

        // Hebdomadaire
        if (isInSameWeek(invoiceDate, today)) {
            isPaid ? periods.week.inflows += amount : periods.week.outflows += amount;
        }

        // Mensuel
        if (isInSameMonth(invoiceDate, today)) {
            isPaid ? periods.month.inflows += amount : periods.month.outflows += amount;
        }

        // Derniers 3 Mois
        if (isInLastThreeMonths(invoiceDate, today)) {
            isPaid ? periods.last3months.inflows += amount : periods.last3months.outflows += amount;
        }

        // Annuel
        if (isInSameYear(invoiceDate, today)) {
            isPaid ? periods.year.inflows += amount : periods.year.outflows += amount;
        }

        // Années Précédentes
        if (invoiceDate < new Date(today.getFullYear(), 0, 1)) {
            isPaid ? periods.previousyears.inflows += amount : periods.previousyears.outflows += amount;
        }
    });

    updateCashFlowTable(periods);
    updateCashFlowChart(periods);
}

function updateCashFlowTable(periods) {
    document.getElementById('week-inflows').textContent = periods.week.inflows.toFixed(2);
    document.getElementById('week-outflows').textContent = periods.week.outflows.toFixed(2);
    document.getElementById('week-balance').textContent = (periods.week.inflows - periods.week.outflows).toFixed(2);

    document.getElementById('month-inflows').textContent = periods.month.inflows.toFixed(2);
    document.getElementById('month-outflows').textContent = periods.month.outflows.toFixed(2);
    document.getElementById('month-balance').textContent = (periods.month.inflows - periods.month.outflows).toFixed(2);

    document.getElementById('last3months-inflows').textContent = periods.last3months.inflows.toFixed(2);
    document.getElementById('last3months-outflows').textContent = periods.last3months.outflows.toFixed(2);
    document.getElementById('last3months-balance').textContent = (periods.last3months.inflows - periods.last3months.outflows).toFixed(2);

    document.getElementById('year-inflows').textContent = periods.year.inflows.toFixed(2);
    document.getElementById('year-outflows').textContent = periods.year.outflows.toFixed(2);
    document.getElementById('year-balance').textContent = (periods.year.inflows - periods.year.outflows).toFixed(2);

    document.getElementById('previousyears-inflows').textContent = periods.previousyears.inflows.toFixed(2);
    document.getElementById('previousyears-outflows').textContent = periods.previousyears.outflows.toFixed(2);
    document.getElementById('previousyears-balance').textContent = (periods.previousyears.inflows - periods.previousyears.outflows).toFixed(2);
}

// Fonctions utilitaires pour vérifier les intervalles de dates
function isInSameWeek(invoiceDate, today) {
    const startOfWeek = today.getDate() - today.getDay();
    const endOfWeek = startOfWeek + 6;
    const start = new Date(today.setDate(startOfWeek));
    const end = new Date(today.setDate(endOfWeek));
    return invoiceDate >= start && invoiceDate <= end;
}

function isInSameMonth(invoiceDate, today) {
    return invoiceDate.getFullYear() === today.getFullYear() && invoiceDate.getMonth() === today.getMonth();
}

function isInLastThreeMonths(invoiceDate, today) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    return invoiceDate >= threeMonthsAgo && invoiceDate <= today;
}

function isInSameYear(invoiceDate, today) {
    return invoiceDate.getFullYear() === today.getFullYear();
}

// Dans la fonction pour ajouter une facture
this.reset();
updateCashFlow(); // Appeler pour mettre à jour la trésorerie après ajout

// Dans la fonction pour supprimer une facture
deleteInvoice(id);
document.querySelector(`[data-id="${id}"]`).remove();
updateCashFlow(); // Mettre à jour la trésorerie après suppression

// Dans la fonction pour marquer une facture comme payée
markInvoiceStatus(invoice.id, 'Payé');
row.cells[4].textContent = 'Payé';
updateCashFlow(); // Mettre à jour la trésorerie après changement de statut
document.addEventListener('DOMContentLoaded', () => {
    loadInvoices();
    updateCashFlow(); // Appeler lors du chargement pour initialiser la trésorerie
    // Autres écouteurs d'événements existants...
});