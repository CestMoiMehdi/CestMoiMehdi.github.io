document.addEventListener('DOMContentLoaded', () => {
    loadInvoices();
    
    const pdfClientsLink = document.getElementById('pdf-clients-link');
    if (pdfClientsLink) {
        pdfClientsLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.open(pdfClientsLink.href, '_blank');
        });
    }

    const pdfFournisseursLink = document.getElementById('pdf-fournisseurs-link');
    if (pdfFournisseursLink) {
        pdfFournisseursLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.open(pdfFournisseursLink.href, '_blank');
        });
    }

    const searchClientInvoices = document.getElementById('searchClientInvoices');
    if (searchClientInvoices) {
        searchClientInvoices.addEventListener('input', function() {
            filterInvoices('client', this.value.trim().toLowerCase());
        });
    }

    const searchFournisseurInvoices = document.getElementById('searchFournisseurInvoices');
    if (searchFournisseurInvoices) {
        searchFournisseurInvoices.addEventListener('input', function() {
            filterInvoices('fournisseur', this.value.trim().toLowerCase());
        });
    }

    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', function(e) {
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
            document.getElementById('type').value = 'client'; // Assurez-vous que cela correspond à la valeur par défaut correcte
        });
    }

    function filterInvoices(type, searchTerm) {
        const invoicesTable = type === 'client' ? document.getElementById('client-invoices') : document.getElementById('fournisseur-invoices');
        if (!invoicesTable) return;

        const rows = invoicesTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const invoiceNumber = rows[i].getElementsByTagName('td')[0].textContent.toLowerCase();
            if (invoiceNumber.includes(searchTerm)) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }

    function updateSummary() {
        const summaryChart = document.getElementById('summary-chart');
        if (!summaryChart) {
            console.error('Element with ID "summary-chart" not found.');
            return;
        }
        const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        const clientInvoices = invoices.filter(invoice => invoice.type === 'client');
        const fournisseurInvoices = invoices.filter(invoice => invoice.type === 'fournisseur');

        const clientPaid = clientInvoices.filter(invoice => invoice.status === 'Payé').length;
        const clientUnpaid = clientInvoices.filter(invoice => invoice.status === 'Non payé').length;
        const fournisseurPaid = fournisseurInvoices.filter(invoice => invoice.status === 'Payé').length;
        const fournisseurUnpaid = fournisseurInvoices.filter(invoice => invoice.status === 'Non payé').length;

        const ctx = summaryChart.getContext('2d');
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

    function saveInvoice(invoice) {
        let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));
        location.reload(); // Recharge la page après avoir ajouté la facture
    }

    function loadInvoices() {
        let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        invoices.forEach(invoice => addInvoiceToTable(invoice));
        updateSummary();
    }

    function addInvoiceToTable(invoice) {
        const tableId = invoice.type === 'client' ? 'client-invoices' : 'fournisseur-invoices';
        const tableElement = document.getElementById(tableId);
        
        if (!tableElement) {
            console.error(`Table with ID ${tableId} not found.`);
            return;
        }

        const tableBody = tableElement.querySelector('tbody');

        if (!tableBody) {
            console.error(`Table body not found in table with ID ${tableId}.`);
            return;
        }

        const row = tableBody.insertRow();
        row.setAttribute('data-id', invoice.id);
        
        const invoiceIdCell = row.insertCell(0);
        const invoiceLink = document.createElement('a');
        invoiceLink.href = '#'; // Mettez ici le lien approprié
        invoiceLink.textContent = invoice.id;
        invoiceLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.open(invoiceLink.href, '_blank');
        });
        invoiceIdCell.appendChild(invoiceLink);

        row.insertCell(1).textContent = invoice.client;
        row.insertCell(2).textContent = invoice.montant;
        row.insertCell(3).textContent = invoice.date;
        row.insertCell(4).textContent = invoice.status;
        
        const actionsCell = row.insertCell(5);

        // Bouton Supprimer avec confirmation
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', function() {
            deleteInvoiceConfirmation(invoice.id); // Utilisation de la nouvelle fonction de confirmation
        });
        actionsCell.appendChild(deleteButton);

        // Bouton Marquer comme payé
        const payButton = document.createElement('button');
        payButton.textContent = 'Marquer comme payé';
        payButton.classList.add('pay-btn');
        payButton.addEventListener('click', function() {
            markInvoiceStatus(invoice.id, 'Payé');
            row.cells[4].textContent = 'Payé';
            updateSummary();
        });
        actionsCell.appendChild(payButton);

        // Bouton Marquer comme non payé
        const unpayButton = document.createElement('button');
        unpayButton.textContent = 'Marquer comme Non payé';
        unpayButton.classList.add('unpay-btn');
        unpayButton.addEventListener('click', function() {
            markInvoiceStatus(invoice.id, 'Non payé');
            row.cells[4].textContent = 'Non payé';
            updateSummary();
        });
        actionsCell.appendChild(unpayButton);
    }

    function deleteInvoiceConfirmation(id) {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
            deleteInvoice(id);
            document.querySelector(`[data-id="${id}"]`).remove();
            updateSummary();
        }
    }

    function deleteInvoice(id) {
        let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        invoices = invoices.filter(invoice => invoice.id !== id);
        localStorage.setItem('invoices', JSON.stringify(invoices));
        location.reload(); // Recharge la page après avoir supprimé la facture
    }

    function markInvoiceStatus(id, status) {
        let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        invoices = invoices.map(invoice => {
            if (invoice.id === id) {
                invoice.status = status;
            }
            return invoice;
        });
        localStorage.setItem('invoices', JSON.stringify(invoices));
        location.reload(); // Recharge la page après avoir mis à jour le statut de la facture
    }

    // Écouteur d'événement pour générer le PDF des factures clients
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.text('Factures Clients', 10, 10);

            let y = 20;
            doc.text('Client', 5, y);
            doc.text('Montant', 50, y);
            doc.text('Date', 110, y);
            doc.text('Status', 170, y);

            y += 10;

            const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
            invoices.forEach(invoice => {
                if (invoice.type === 'client') {
                    doc.text(invoice.client, 5, y);
                    doc.text(typeof invoice.montant === 'number' ? invoice.montant.toFixed(2) : invoice.montant, 50, y);
                    doc.text(typeof invoice.date === 'number' ? invoice.date.toFixed(2) : invoice.date, 110, y);
                    doc.text(invoice.status, 170, y);

                    y += 10;
                }
            });

            doc.save('factures_clients.pdf');
        });
    }
});