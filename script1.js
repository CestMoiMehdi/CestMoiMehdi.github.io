document.addEventListener('DOMContentLoaded', function() {
    const accounts = ['capitaux', 'immobilisations', 'tiers', 'finances', 'charges', 'produits'];

    accounts.forEach(account => {
        const debitInput = document.getElementById(`${account}-debit`);
        const creditInput = document.getElementById(`${account}-credit`);
        const soldeSpan = document.getElementById(`${account}-solde`);

        function updateSolde() {
            const debit = parseFloat(debitInput.value) || 0;
            const credit = parseFloat(creditInput.value) || 0;
            const solde = debit - credit;
            soldeSpan.textContent = solde.toFixed(2);
        }

        debitInput.addEventListener('input', updateSolde);
        creditInput.addEventListener('input', updateSolde);

        updateSolde(); // Initial calculation
    });
});