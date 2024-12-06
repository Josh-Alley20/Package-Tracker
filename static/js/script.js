$(document).ready(function () {
    $('#trackButton').click(function () {
        const trackingIds = $('#trackingIds').val().split(',').map(id => id.trim());
        if (trackingIds.length === 0) {
            alert('Please enter at least one tracking number.');
            return;
        }

        $.ajax({
            url: '/track',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ trackingIds }),
            success: function (data) {
                const resultsDiv = $('#results');
                resultsDiv.empty();

                if (data.shipments) {
                    data.shipments.forEach((shipment, index) => {
                        const updates = shipment.states || [];
                        let updateHtml = updates.map(update => `
                            <li>[${update.date}] ${update.status} @ ${update.location || 'Unknown'}</li>
                        `).join('');

                        resultsDiv.append(`
                            <div class="mb-4">
                                <h5>Shipment #${index + 1}</h5>
                                <p><strong>Tracking ID:</strong> ${shipment.trackingId || 'N/A'}</p>
                                <p><strong>Status:</strong> ${shipment.status || 'Unknown'}</p>
                                <p><strong>Last Update:</strong> ${shipment.lastState?.date || 'N/A'}</p>
                                <p><strong>Location:</strong> ${shipment.lastState?.location || 'Unknown'}</p>
                                <p><strong>Carrier:</strong> ${shipment.carrier?.name || shipment.carrier || 'Unknown'}</p>
                                <ul>${updateHtml}</ul>
                            </div>
                        `);
                    });
                } else {
                    resultsDiv.append('<p>No shipment details found.</p>');
                }
            },
            error: function () {
                alert('Failed to fetch tracking details. Please try again later.');
            }
        });
    });
});
