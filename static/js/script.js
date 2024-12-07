$(document).ready(function () {
    // Load tracking numbers from cookies on page load
    const savedTrackingNumbers = getCookie('trackingIds');
    if (savedTrackingNumbers) {
        $('#trackingIds').val(savedTrackingNumbers.replace(/,/g, '\n'));
    }

    // Track button click
    $('#trackButton').click(function () {
        const trackingIds = $('#trackingIds')
            .val()
            .split('\n')
            .map(id => id.trim())
            .filter(id => id !== '');

        if (trackingIds.length === 0) {
            alert('Please enter at least one tracking number.');
            return;
        }

        // Save tracking numbers to cookies
        setCookie('trackingIds', trackingIds.join(','), 30); // Save for 30 days
        fetchTrackingDetails(trackingIds);
    });

    function fetchTrackingDetails(trackingIds) {
        $.ajax({
            url: '/track',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ trackingIds }),
            success: function (data) {
                const resultsDiv = $('#shipmentResults');
                resultsDiv.empty();

                if (data.shipments) {
                    data.shipments.forEach((shipment, index) => {
                        const states = shipment.states || [];
                        const trackingUpdates = states.length
                            ? states
                                  .map(
                                      state => `
                                    <li>
                                        <strong>[${state.date || 'N/A'}]</strong> ${state.status || 'Unknown'}
                                        <span>@ ${state.location || 'Unknown'}</span>
                                    </li>`
                                  )
                                  .join('')
                            : '<li>No updates available.</li>';

                        const lastUpdateTime = new Date().toLocaleString();

                        const details = `
                            <div class="shipment-details">
                                <p><strong>Tracking ID:</strong> ${shipment.trackingId || 'N/A'}</p>
                                <p><strong>Origin:</strong> ${shipment.origin || 'Unknown'}</p>
                                <p><strong>Destination:</strong> ${shipment.destination || 'Unknown'}</p>
                                <p><strong>Status:</strong> ${shipment.status || 'Unknown'}</p>
                                <p><strong>Last Known Location:</strong> ${shipment.lastState?.location || 'N/A'}</p>
                                <p><strong>Last Update:</strong> ${shipment.lastState?.date || 'N/A'}</p>
                                <p><strong>Current Carrier:</strong> ${shipment.carrier?.name || 'Unknown'}</p>
                                <h6>Tracking Updates:</h6>
                                <ul>${trackingUpdates}</ul>
                                <div class="d-flex align-items-center justify-content-between">
                                    <button class="btn btn-sm btn-primary update-tracking" data-tracking-id="${shipment.trackingId}">Update Tracking</button>
                                    <span class="last-updated">Last pulled: <span class="timestamp">${lastUpdateTime}</span></span>
                                </div>
                            </div>`;

                        resultsDiv.append(`
                            <div class="card shipment-card" data-index="${index}">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>${shipment.trackingId || 'Unknown'}</strong>
                                        <span class="badge bg-primary">${shipment.status || 'Unknown'}</span>
                                    </div>
                                    <small>${shipment.lastState?.date || 'N/A'}</small>
                                </div>
                                <div class="card-body hidden">${details}</div>
                            </div>`);
                    });

                    // Add click event for toggling details
                    $('.shipment-card').click(function () {
                        $(this).find('.card-body').toggleClass('hidden');
                    });

                    // Add click event for "Update Tracking" button
                    $('.update-tracking').click(function (event) {
                        event.stopPropagation(); // Prevent triggering card toggle
                        const trackingId = $(this).data('tracking-id');
                        updateTracking(trackingId, $(this).siblings('.last-updated').find('.timestamp'));
                    });
                } else {
                    resultsDiv.append('<p>No shipment details found.</p>');
                }
            },
            error: function () {
                alert('Failed to fetch tracking details. Please try again later.');
            },
        });
    }

    function updateTracking(trackingId, timestampElement) {
        $.ajax({
            url: '/track',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ trackingIds: [trackingId] }),
            success: function (data) {
                if (data.shipments && data.shipments.length > 0) {
                    const updatedShipment = data.shipments[0];
                    const card = $(`.shipment-card[data-index="${trackingId}"]`);
                    const states = updatedShipment.states || [];
                    const trackingUpdates = states.length
                        ? states
                              .map(
                                  state => `
                                <li>
                                    <strong>[${state.date || 'N/A'}]</strong> ${state.status || 'Unknown'}
                                    <span>@ ${state.location || 'Unknown'}</span>
                                </li>`
                              )
                              .join('')
                        : '<li>No updates available.</li>';

                    // Update the shipment details
                    card.find('.card-body .shipment-details').html(`
                        <p><strong>Tracking ID:</strong> ${updatedShipment.trackingId || 'N/A'}</p>
                        <p><strong>Origin:</strong> ${updatedShipment.origin || 'Unknown'}</p>
                        <p><strong>Destination:</strong> ${updatedShipment.destination || 'Unknown'}</p>
                        <p><strong>Status:</strong> ${updatedShipment.status || 'Unknown'}</p>
                        <p><strong>Last Known Location:</strong> ${updatedShipment.lastState?.location || 'N/A'}</p>
                        <p><strong>Last Update:</strong> ${updatedShipment.lastState?.date || 'N/A'}</p>
                        <p><strong>Current Carrier:</strong> ${updatedShipment.carrier?.name || 'Unknown'}</p>
                        <h6>Tracking Updates:</h6>
                        <ul>${trackingUpdates}</ul>
                        <div class="d-flex align-items-center justify-content-between">
                            <button class="btn btn-sm btn-primary update-tracking" data-tracking-id="${updatedShipment.trackingId}">Update Tracking</button>
                            <span class="last-updated">Last pulled: <span class="timestamp">${new Date().toLocaleString()}</span></span>
                        </div>`);

                    // Update the timestamp
                    if (timestampElement) {
                        timestampElement.text(new Date().toLocaleString());
                    }
                } else {
                    alert('Failed to update tracking details. Please try again later.');
                }
            },
            error: function () {
                alert('Failed to update tracking details. Please try again later.');
            },
        });
    }

    // Helper functions to set and get cookies
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = 'expires=' + d.toUTCString();
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    function getCookie(name) {
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArr = decodedCookie.split(';');
        for (let i = 0; i < cookieArr.length; i++) {
            let c = cookieArr[i].trim();
            if (c.indexOf(name + '=') === 0) {
                return c.substring(name.length + 1, c.length);
            }
        }
        return null;
    }
});
