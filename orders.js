/**
 * Order Management Module
 * Handles order data collection and submission
 */

const OrderModule = (function() {
    /**
     * Collect order data from form
     * @returns {Array<Object>} Array of order objects
     */
    function collectOrderData() {
        const ordersData = [];
        const orderCards = document.querySelectorAll('.order-card');
        
        orderCards.forEach(card => {
            const id = card.getAttribute('data-order-id');
            
            const orderData = {
                orderId: id,
                wagons: parseInt(document.getElementById(`wagons-${id}`)?.value || '1', 10),
                transportDate: document.getElementById(`date-${id}`)?.value || '',
                deliveryDate: document.getElementById(`delivery-date-${id}`)?.value || '',
                wagonProfile: document.getElementById(`profile-${id}`)?.value || '',
                wagonType: document.getElementById(`type-${id}`)?.value || '',
                departureArrivalSlot: document.getElementById(`departure-arrival-slot-${id}`)?.value || '',
                departureTime: document.getElementById(`departure-time-${id}`)?.value || '',
                destinationArrivalSlot: document.getElementById(`destination-arrival-slot-${id}`)?.value || '',
                destinationDepartureTime: document.getElementById(`destination-departure-time-${id}`)?.value || '',
                reasonUnderdelivery: document.getElementById(`reason-${id}`)?.selectedOptions[0]?.text || '',
                comment: document.getElementById(`comment-${id}`)?.value || ''
            };
            
            ordersData.push(orderData);
        });
        
        return ordersData;
    }

    /**
     * Validate order data
     * @param {Array<Object>} orders - Array of order objects
     * @returns {{valid: boolean, errors: Array<string>}}
     */
    function validateOrders(orders) {
        const errors = [];
        
        if (orders.length === 0) {
            errors.push('Keine Bestellungen zum Absenden vorhanden.');
            return { valid: false, errors };
        }
        
        orders.forEach((order, index) => {
            if (!order.orderId) {
                errors.push(`Bestellung ${index + 1}: Bestell-ID fehlt.`);
            }
            if (!order.wagons || order.wagons < 1) {
                errors.push(`Bestellung ${order.orderId}: Ungültige Wagenanzahl.`);
            }
            if (!order.transportDate) {
                errors.push(`Bestellung ${order.orderId}: Transportdatum fehlt.`);
            }
            if (!order.deliveryDate) {
                errors.push(`Bestellung ${order.orderId}: Lieferdatum fehlt.`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Submit orders to server
     * @param {Array<Object>} orders - Array of order objects
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async function submitOrders(orders) {
        // Validate orders first
        const validation = validateOrders(orders);
        if (!validation.valid) {
            return {
                success: false,
                message: `Validierungsfehler: ${validation.errors.join(', ')}`
            };
        }

        const payload = {
            submissionTimestamp: new Date().toISOString(),
            sessionToken: AuthModule.getSessionToken(),
            orders: orders
        };

        try {
            const response = await fetch(APP_CONFIG.api.orderSubmitUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                return {
                    success: true,
                    message: 'Alle Transportaufträge wurden erfolgreich bestätigt und an die Logistik gesendet.'
                };
            } else {
                const errorText = await response.text().catch(() => 'Unbekannter Fehler');
                return {
                    success: false,
                    message: `Übermittlung fehlgeschlagen. Server-Status: ${response.status}. ${errorText}`
                };
            }
        } catch (error) {
            console.error('Submit error:', error);
            return {
                success: false,
                message: 'Ein Fehler ist aufgetreten. Bitte prüfen Sie Ihre Verbindung oder wenden Sie sich an den Support.'
            };
        }
    }

    // Public API
    return {
        collectOrderData,
        validateOrders,
        submitOrders
    };
})();
