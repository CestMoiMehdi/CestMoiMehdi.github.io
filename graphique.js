document.addEventListener('DOMContentLoaded', () => {
    loadInvoices();
    updateCashFlow(); // Appeler lors du chargement pour initialiser la trésorerie

    // Autres écouteurs d'événements existants...
});

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