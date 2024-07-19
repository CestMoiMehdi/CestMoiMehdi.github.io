function generatePDF() {
    const { jsPDF } = window.jspdf;

    const clientName = document.getElementById('clientName').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const serviceDescription = document.getElementById('serviceDescription').value;
    const servicePrice = document.getElementById('servicePrice').value;

    const doc = new jsPDF();

    doc.setFontSize(32);
    doc.text('Devis', 20, 20);

    doc.setFontSize(16);
    doc.text(`Nom du Client: ${clientName}`, 20, 50);
    doc.text(`Adresse du Client: ${clientAddress}`, 20, 70);
    doc.text(`Description du Service: ${serviceDescription}`, 20, 90);
    doc.text(`Prix du Service: ${servicePrice} €`, 20, 110);
    doc.text(`Date du Service: ${servicePrice}`, 20, 130)

    doc.save('devis.pdf');
}