function displayWinners() {
    const winners = JSON.parse(localStorage.getItem('savedWinners')) || [];
    const tableBody = document.getElementById('winnerList');
    tableBody.innerHTML = '';

    winners.forEach((winner) => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');

        nameCell.textContent = winner.name;
        row.appendChild(nameCell);
        tableBody.appendChild(row);
    });
}


function exportToExcel() { //exports list of winners to csv file
    const winners = JSON.parse(localStorage.getItem('savedWinners')) || [];
    let csvContent = "data:text/csv;charset=utf-8,Name\n";
    winners.forEach(w => {
        csvContent += `${w.name}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'winners.csv');
    link.click();
}

function deleteAllWinners() {
    if (confirm('Are you sure you want to delete all winners?')) {
        localStorage.removeItem('savedWinners');
        displayWinners(); 
    }
}

document.querySelector('.back').addEventListener('click', function(event) {
    event.preventDefault();
    window.history.back();
});

window.onload = displayWinners;
