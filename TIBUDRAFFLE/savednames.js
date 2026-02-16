function render() {
    const winners = JSON.parse(localStorage.getItem('raffleWinners')) || [];
    const tbody = document.getElementById('tbody');
    const totalDisplay = document.getElementById('totalCount');

    if (totalDisplay) {
        totalDisplay.textContent = `${winners.length} Winners Total`;
    }

    if (winners.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" style="padding: 50px; color: #999;">No winners yet</td></tr>`;
        return;
    }

    // Reverse the list so the newest winners are at the top
    tbody.innerHTML = winners.slice().reverse().map((w, i) => {
        const name = typeof w === 'object' ? w.name : w;
        const displayNo = winners.length - i;
        return `
            <tr>
                <td>${name}</td>
            </tr>
        `;
    }).join('');
}

function clearAll() {
    if (confirm("Delete all winners permanently?")) {
        localStorage.removeItem('raffleWinners');
        render();
    }
}

function exportToExcel() {
    const winners = JSON.parse(localStorage.getItem('raffleWinners')) || [];
    if (winners.length === 0) return alert("Nothing to export!");

    let csv = "No.,Winner Name\n";
    winners.forEach((w, i) => {
        const name = typeof w === 'object' ? w.name : w;
        csv += `${i + 1},${name}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Raffle_Winners.csv';
    a.click();
}

document.addEventListener('DOMContentLoaded', render);