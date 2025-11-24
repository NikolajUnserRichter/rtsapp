/**
 * UI Module
 * Handles all UI-related operations
 */

const UIModule = (function() {
    /**
     * Show alert message in specified container
     * @param {string} containerId - ID of the container element
     * @param {string} message - Alert message
     * @param {string} type - Alert type (success, danger, warning, info)
     */
    function showAlert(containerId, message, type) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Alert container ${containerId} not found`);
            return;
        }
        
        const sanitizedMessage = Utils.escapeHtml(message);
        container.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${sanitizedMessage}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Schließen"></button>
            </div>
        `;
        
        // Scroll to alert
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Show login screen
     */
    function showLoginScreen() {
        document.getElementById('login-screen')?.classList.remove('hidden');
        document.getElementById('main-app')?.classList.add('hidden');
    }

    /**
     * Show main application
     */
    function showMainApp() {
        document.getElementById('login-screen')?.classList.add('hidden');
        document.getElementById('main-app')?.classList.remove('hidden');
    }

    /**
     * Toggle button loading state
     * @param {string} buttonId - ID of the button element
     * @param {string} textId - ID of the button text element
     * @param {string} spinnerId - ID of the spinner element
     * @param {boolean} loading - True to show loading state
     * @param {string} loadingText - Text to show when loading
     * @param {string} normalText - Text to show when not loading
     */
    function setButtonLoading(buttonId, textId, spinnerId, loading, loadingText, normalText) {
        const button = document.getElementById(buttonId);
        const text = document.getElementById(textId);
        const spinner = document.getElementById(spinnerId);
        
        if (!button || !text || !spinner) {
            console.error('Button elements not found');
            return;
        }
        
        button.disabled = loading;
        text.textContent = loading ? loadingText : normalText;
        
        if (loading) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }

    /**
     * Create option elements for select dropdown
     * @param {Array} items - Array of items
     * @param {string} valueKey - Key for value attribute
     * @param {string} textKey - Key for text content
     * @param {string} selectedValue - Value to mark as selected
     * @returns {string} HTML string of options
     */
    function createSelectOptions(items, valueKey, textKey, selectedValue = '') {
        return items.map(item => {
            const value = typeof item === 'object' ? item[valueKey] : item;
            const text = typeof item === 'object' ? item[textKey] : item;
            const selected = value === selectedValue ? 'selected' : '';
            return `<option value="${Utils.escapeHtml(value)}" ${selected}>${Utils.escapeHtml(text)}</option>`;
        }).join('');
    }

    /**
     * Create an order card HTML
     * @param {Object} order - Order object
     * @param {Array} arrivalSlots - Arrival time slots
     * @param {Array} departureSlots - Departure time slots
     * @returns {string} HTML string for order card
     */
    function createOrderCard(order, arrivalSlots, departureSlots) {
        const id = Utils.escapeHtml(order.orderId || 'UNKNOWN');
        const supplier = Utils.escapeHtml(order.supplier || 'N/A');
        const route = Utils.escapeHtml(order.route || 'N/A');
        const cw = Utils.escapeHtml(order.cw || 'N/A');
        const departure = Utils.escapeHtml(order.departure || '');
        const destination = Utils.escapeHtml(order.destination || '');
        
        const profileOptions = createSelectOptions(
            APP_CONFIG.profiles, 
            null, 
            null, 
            order.wagonProfile
        );
        
        const typeOptions = createSelectOptions(
            APP_CONFIG.wagonTypes, 
            null, 
            null, 
            order.wagonType
        );
        
        const reasonOptions = createSelectOptions(
            APP_CONFIG.reasons,
            'value',
            'text'
        );
        
        const arrivalOptions = createSelectOptions(
            arrivalSlots,
            'value',
            'text'
        );
        
        const departureOptions = createSelectOptions(
            departureSlots,
            'value',
            'text'
        );
        
        return `
            <div class="order-card" data-order-id="${id}">
                <h5>Order ID: ${id} | Supplier: ${supplier} | Route: ${route}</h5>
                <p class="mb-3 text-muted small">KW: ${cw}</p>
                <div class="row g-3">
                    <div class="col-md-4">
                        <label for="wagons-${id}" class="form-label">Wagons (Qty.)</label>
                        <input type="number" class="form-control" id="wagons-${id}" name="wagons-${id}" 
                               value="${order.wagons || 1}" min="1" required aria-required="true">
                    </div>
                    <div class="col-md-4">
                        <label for="date-${id}" class="form-label">Transport Date</label>
                        <input type="date" class="form-control" id="date-${id}" name="date-${id}" 
                               value="${Utils.convertDateToISO(order.transportDate)}" required aria-required="true">
                    </div>
                    <div class="col-md-4">
                        <label for="profile-${id}" class="form-label">Wagon Profile</label>
                        <select class="form-select" id="profile-${id}" name="profile-${id}" required aria-required="true">
                            ${profileOptions}
                        </select>
                    </div>
                    <div class="col-md-12">
                        <label for="type-${id}" class="form-label">Wagon Type</label>
                        <select class="form-select" id="type-${id}" name="type-${id}" required aria-required="true">
                            ${typeOptions}
                        </select>
                    </div>
                    
                    <!-- DEPARTURE TIME SLOTS -->
                    <div class="col-12 mt-3">
                        <h6 class="text-primary border-bottom pb-2">📍 Departure Time Slots (${departure})</h6>
                    </div>
                    <div class="col-md-6">
                        <label for="departure-arrival-slot-${id}" class="form-label">Arrival Time Slot (2h)</label>
                        <select class="form-select" id="departure-arrival-slot-${id}" name="departure-arrival-slot-${id}" 
                                required aria-required="true">
                            ${arrivalOptions}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="departure-time-${id}" class="form-label">Departure Time (15min)</label>
                        <select class="form-select" id="departure-time-${id}" name="departure-time-${id}" 
                                required aria-required="true">
                            ${departureOptions}
                        </select>
                    </div>
                    
                    <!-- DESTINATION TIME SLOTS -->
                    <div class="col-12 mt-3">
                        <h6 class="text-success border-bottom pb-2">🎯 Destination Time Slots (${destination})</h6>
                    </div>
                    <div class="col-md-4">
                        <label for="delivery-date-${id}" class="form-label">Delivery Date</label>
                        <input type="date" class="form-control" id="delivery-date-${id}" name="delivery-date-${id}" 
                               value="${Utils.convertDateToISO(order.deliveryDate)}" required aria-required="true">
                    </div>
                    <div class="col-md-4">
                        <label for="destination-arrival-slot-${id}" class="form-label">Arrival Time Slot (2h)</label>
                        <select class="form-select" id="destination-arrival-slot-${id}" name="destination-arrival-slot-${id}" 
                                required aria-required="true">
                            ${arrivalOptions}
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="destination-departure-time-${id}" class="form-label">Departure Time (15min)</label>
                        <select class="form-select" id="destination-departure-time-${id}" name="destination-departure-time-${id}" 
                                required aria-required="true">
                            ${departureOptions}
                        </select>
                    </div>
                    
                    <div class="col-md-6 mt-3">
                        <label for="reason-${id}" class="form-label">Reason for Underdelivery</label>
                        <select class="form-select" id="reason-${id}" name="reason-${id}" required aria-required="true">
                            ${reasonOptions}
                        </select>
                    </div>
                    <div class="col-12">
                        <label for="comment-${id}" class="form-label" id="comment-label-${id}">Comment (Free Text)</label>
                        <textarea class="form-control" id="comment-${id}" name="comment-${id}" 
                                  rows="2" placeholder="Freitextkommentar eingeben..." 
                                  maxlength="500" aria-describedby="comment-label-${id}"></textarea>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load and display order form
     */
    function loadOrderForm() {
        const ordersData = Utils.getOrdersFromUrl();
        const container = document.getElementById('orders-container');
        
        if (!container) {
            console.error('Orders container not found');
            return;
        }
        
        container.innerHTML = '';
        
        if (ordersData.length === 0) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <strong>Fehler:</strong> Es wurden keine Bestelldaten übergeben oder die Daten konnten nicht geladen werden.
                    <br><br>
                    Bitte wenden Sie sich an das Logistik-Team oder überprüfen Sie den Link.
                </div>`;
            
            const submitBtn = document.querySelector('#order-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            return;
        }
        
        // Generate time slots
        const arrivalSlots = Utils.generateTimeSlots(APP_CONFIG.timeSlots.arrivalInterval);
        const departureSlots = Utils.generateTimeSlots(APP_CONFIG.timeSlots.departureInterval);
        
        // Create cards for each order
        ordersData.forEach(order => {
            container.innerHTML += createOrderCard(order, arrivalSlots, departureSlots);
        });
    }

    /**
     * Clear all form inputs
     */
    function clearForm() {
        document.getElementById('order-form')?.reset();
    }

    // Public API
    return {
        showAlert,
        showLoginScreen,
        showMainApp,
        setButtonLoading,
        createOrderCard,
        loadOrderForm,
        clearForm
    };
})();
