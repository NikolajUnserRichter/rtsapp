/**
 * Utility functions for the RTS Application
 */

const Utils = {
    /**
     * Generate time slots with specified interval
     * @param {number} intervalMinutes - Interval in minutes (15 or 120)
     * @returns {Array<{value: string, text: string}>} Array of time slot objects
     */
    generateTimeSlots(intervalMinutes) {
        const slots = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += intervalMinutes) {
                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                if (intervalMinutes === 15) {
                    slots.push({ value: time, text: time });
                } else if (intervalMinutes === 120 && m === 0) {
                    const nextHour = String((h + 2) % 24).padStart(2, '0');
                    const slotText = `${time} - ${nextHour}:00`;
                    slots.push({ value: slotText, text: slotText });
                }
            }
        }
        return slots;
    },

    /**
     * Convert date from DD.MM.YYYY to YYYY-MM-DD format
     * @param {string} dateStr - Date string in DD.MM.YYYY format
     * @returns {string} Date string in YYYY-MM-DD format
     */
    convertDateToISO(dateStr) {
        if (!dateStr) return '';
        const trimmed = dateStr.trim();
        const parts = trimmed.split('.');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return trimmed;
    },

    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Decode data from URL parameter (supports both base64 and URL encoding)
     * @param {string} encodedData - Encoded data string
     * @returns {string|null} Decoded string or null on error
     */
    decodeUrlData(encodedData) {
        if (!encodedData) return null;
        
        try {
            // Try base64 decoding first
            return atob(encodedData);
        } catch (base64Error) {
            try {
                // Fallback to URL decoding for backward compatibility
                return decodeURIComponent(encodedData);
            } catch (urlError) {
                console.error('Failed to decode data:', urlError);
                return null;
            }
        }
    },

    /**
     * Normalize order data to expected format
     * @param {Object} order - Raw order object
     * @returns {Object} Normalized order object
     */
    normalizeOrder(order) {
        const departure = order.Departure || order.departure || 'N/A';
        const destination = order.Destination || order.destination || 'N/A';
        
        return {
            orderId: order.OrderID || order.orderId,
            supplier: order.SupplierName || order.supplier,
            cw: order.CW || order.cw,
            wagons: order.RequiredWagons || order.wagons,
            transportDate: (order.Transportdatum || order.transportDate || '').trim(),
            wagonProfile: order.WagonProfile || order.wagonProfile,
            wagonType: order.WagonType || order.wagonType,
            departure: departure,
            destination: destination,
            route: `${departure} nach ${destination}`,
            deliveryDate: order.deliveryDate || ''
        };
    },

    /**
     * Parse orders from URL query parameters
     * @returns {Array<Object>} Array of normalized order objects
     */
    getOrdersFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const encodedData = params.get('data');
        
        try {
            const jsonString = this.decodeUrlData(encodedData);
            if (!jsonString) {
                return [];
            }
            
            const parsedData = JSON.parse(jsonString);
            const ordersArray = Array.isArray(parsedData) ? parsedData : [parsedData];
            
            // Normalize all orders to match expected format
            return ordersArray.map(order => this.normalizeOrder(order));
        } catch (e) {
            console.error("Error parsing order data:", e);
            return [];
        }
    },

    /**
     * Format date for display
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        return date.toISOString().split('T')[0];
    },

    /**
     * Debounce function to limit rate of function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Make Utils object immutable
Object.freeze(Utils);
