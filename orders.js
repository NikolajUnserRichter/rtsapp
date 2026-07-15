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
                departureDate: document.getElementById(`departure-date-${id}`)?.value || '',
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
            if (!order.wagonProfile) {
                errors.push(`Bestellung ${order.orderId}: Wagenprofil muss ausgewählt werden.`);
            }
            if (!order.wagonType) {
                errors.push(`Bestellung ${order.orderId}: Wagentyp muss ausgewählt werden.`);
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

        const sessionToken = AuthModule.getSessionToken();
        if (!sessionToken) {
            return {
                success: false,
                message: 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.'
            };
        }

        const payload = {
            submissionTimestamp: new Date().toISOString(),
            sessionToken: sessionToken,
            orders: orders
        };

        try {
            const response = await fetch(APP_CONFIG.api.orderSubmitUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
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

    /**
     * Notify server that the link was opened
     * Sends order IDs, supplier info, and timestamp when the link was opened
     * @param {Array<Object>} orders - Array of order objects from URL
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async function notifyLinkOpened(orders) {
        if (!orders || orders.length === 0) {
            return {
                success: false,
                message: 'No orders to notify about.'
            };
        }

        // Create an array of order objects with orderId and supplier for Power Automate looping
        const ordersArray = orders
            .filter(order => order.orderId != null && order.orderId !== '')
            .map(order => ({
                orderId: order.orderId,
                supplier: order.supplier || ''
            }));
        
        if (ordersArray.length === 0) {
            return {
                success: false,
                message: 'No valid order IDs found.'
            };
        }

        const payload = {
            linkOpenedTimestamp: new Date().toISOString(),
            orders: ordersArray
        };

        try {
            const response = await fetch(APP_CONFIG.api.linkOpenedUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                return {
                    success: true,
                    message: 'Link opened notification sent successfully.'
                };
            } else {
                return {
                    success: false,
                    message: `Failed to send link opened notification. Status: ${response.status}`
                };
            }
        } catch (error) {
            console.error('Link opened notification error:', error);
            return {
                success: false,
                message: 'Failed to send link opened notification due to network error.'
            };
        }
    }

    /**
     * Fetch the live dunning-notice reasons from Dataverse via the
     * GetDunningReasons flow. Returns an array of {value, text, cluster}
     * ordered by code, or null on any failure (caller falls back to
     * the static APP_CONFIG.reasons list).
     * @returns {Promise<Array<Object>|null>}
     */
    async function fetchDunningReasons() {
        const url = APP_CONFIG.api.dunningReasonsUrl;
        if (!url) return null;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                console.warn(`Dunning reasons fetch failed (HTTP ${response.status}); using fallback list.`);
                return null;
            }

            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                return data;
            }
            console.warn('Dunning reasons response was empty; using fallback list.');
            return null;
        } catch (error) {
            console.warn('Dunning reasons fetch error; using fallback list.', error);
            return null;
        }
    }

    // Public API
    return {
        collectOrderData,
        validateOrders,
        submitOrders,
        notifyLinkOpened,
        fetchDunningReasons
    };
})();
