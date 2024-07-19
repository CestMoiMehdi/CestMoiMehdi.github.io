document.addEventListener('DOMContentLoaded', () => {
    loadInvoices();
    document.getElementById('invoice-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const client = document.getElementById('client').value;
        const montant = document.getElementById('montant').value;
        const date = document.getElementById('date').value;
        const type = document.getElementById('type').value;
        
        const invoice = { id: Date.now(), client, montant, date, type, status: 'Non payé' };
        saveInvoice(invoice);
        addInvoiceToTable(invoice);
        updateSummary();
        
        document.getElementById('client').value = '';
        document.getElementById('montant').value = '';
        document.getElementById('date').value = '';
        document.getElementById('type').value = 'client';
    });
});

function saveInvoice(invoice) {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

function loadInvoices() {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.forEach(invoice => addInvoiceToTable(invoice));
    updateSummary();
}

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
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', function() {
        deleteInvoice(invoice.id);
        row.remove();
        updateSummary();
    });
    actionsCell.appendChild(deleteButton);

    const payButton = document.createElement('button');
    payButton.textContent = 'Marquer comme payé';
    payButton.classList.add('pay-btn');
    payButton.addEventListener('click', function() {
        markAsPaid(invoice.id);
        row.cells[4].textContent = 'Payé';
        updateSummary();
    });
    actionsCell.appendChild(payButton);

    const unpayButton = document.createElement('button');
    unpayButton.textContent = 'Marquer comme Non payé';
    unpayButton.classList.add('unpay-btn');
    unpayButton.addEventListener('click', function() {
        markAsUnpaid(invoice.id);
        row.cells[4].textContent = 'Non payé';
        updateSummary();
    });
    actionsCell.appendChild(unpayButton);
}

function deleteInvoice(id) {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices = invoices.filter(invoice => invoice.id !== id);
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

function markAsPaid(id) {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices = invoices.map(invoice => {
        if (invoice.id === id) {
            invoice.status = 'Payé';
        }
        return invoice;
    });
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

function markAsUnpaid(id) {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices = invoices.map(invoice => {
        if (invoice.id === id) {
            invoice.status = 'Non payé';
        }
        return invoice;
    });
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

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
