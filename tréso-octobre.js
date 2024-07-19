document.addEventListener('DOMContentLoaded', (event) => {
    const weekInflows = document.querySelectorAll('[id^="week-inflows"]');
    const weekOutflows = document.querySelectorAll('[id^="week-outflows"]');
    const weekBalances = document.querySelectorAll('[id^="week-balance"]');
    const monthInflows = document.getElementById('month-inflows');
    const monthOutflows = document.getElementById('month-outflows');
    const monthBalance = document.getElementById('month-balance');
    const yearInflows = document.getElementById('year-inflows');
    const yearOutflows = document.getElementById('year-outflows');
    const yearBalance = document.getElementById('year-balance');

    function saveData() {
        const data = {
            weekInflows: [],
            weekOutflows: [],
        };
        
        weekInflows.forEach((input, index) => {
            data.weekInflows[index] = input.value;
        });
        
        weekOutflows.forEach((input, index) => {
            data.weekOutflows[index] = input.value;
        });
        
        localStorage.setItem('comptaData9', JSON.stringify(data));
    }

    function loadData() {
        const data = JSON.parse(localStorage.getItem('comptaData9'));
        
        if (data) {
            weekInflows.forEach((input, index) => {
                if (data.weekInflows[index] !== undefined) {
                    input.value = data.weekInflows[index];
                }
            });
            
            weekOutflows.forEach((input, index) => {
                if (data.weekOutflows[index] !== undefined) {
                    input.value = data.weekOutflows[index];
                }
            });
            
            calculateWeekBalance();
            calculateYearBalance();
        }
    }

    function calculateWeekBalance() {
        let totalInflows = 0;
        let totalOutflows = 0;
        for (let i = 0; i < weekInflows.length; i++) {
            const inflow = parseFloat(weekInflows[i].value) || 0;
            const outflow = parseFloat(weekOutflows[i].value) || 0;
            const balance = inflow - outflow;
            weekBalances[i].value = balance.toFixed(2);

            totalInflows += inflow;
            totalOutflows += outflow;
        }
        monthInflows.value = totalInflows.toFixed(2);
        monthOutflows.value = totalOutflows.toFixed(2);
        monthBalance.value = (totalInflows - totalOutflows).toFixed(2);
    }

    function calculateYearBalance() {
        const inflow = parseFloat(monthInflows.value) || 0;
        const outflow = parseFloat(monthOutflows.value) || 0;
        yearInflows.value = inflow.toFixed(2);
        yearOutflows.value = outflow.toFixed(2);
        yearBalance.value = (inflow - outflow).toFixed(2);
    }

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            calculateWeekBalance();
            calculateYearBalance();
            saveData();
        });
        document.getElementById('save-button').addEventListener('click', saveData);
    });

    // Initial calculation
    loadData();
});