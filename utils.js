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
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            
            // Validate parsed values
            if (isNaN(day) || isNaN(month) || isNaN(year)) {
                console.warn(`Invalid date format: ${dateStr}`);
                return trimmed;
            }
            
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
            // Check if it looks like URL-encoded data (contains % followed by hex digits)
            if (/%[0-9A-Fa-f]{2}/.test(encodedData)) {
                // Handle URL encoding - decode multiple times if needed
                let decoded = encodedData;
                let previousDecoded;
                let iterations = 0;
                const MAX_ITERATIONS = 10; // Prevent infinite loops
                
                // Keep decoding while the string changes and still contains encoded characters
                // This handles cases where data was double (or more) encoded
                do {
                    previousDecoded = decoded;
                    try {
                        decoded = decodeURIComponent(decoded);
                    } catch (e) {
                        // If decode fails, return what we have so far
                        break;
                    }
                    iterations++;
                } while (decoded !== previousDecoded && /%[0-9A-Fa-f]{2}/.test(decoded) && iterations < MAX_ITERATIONS);
                
                return decoded;
            }
            
            // Check if it looks like base64 (only contains base64 characters and has proper length)
            // Base64 strings must have length divisible by 4 (with padding)
            if (/^[A-Za-z0-9+/]+={0,2}$/.test(encodedData) && encodedData.length % 4 === 0 && encodedData.length >= 4) {
                try {
                    const decoded = atob(encodedData);
                    // Verify the decoded result doesn't contain replacement characters (�)
                    // which indicate invalid UTF-8 sequences from incorrect base64 decoding
                    if (decoded.includes('\uFFFD')) {
                        // Contains replacement characters, likely not valid base64
                        return encodedData;
                    }
                    // Base64 decode succeeded and result looks reasonable
                    return decoded;
                } catch (base64Error) {
                    // Base64 decode failed, fall through to return original
                }
            }
            
            // If it doesn't match URL encoding or base64 patterns, assume it's already plain text
            return encodedData;
        } catch (error) {
            console.error('Failed to decode data:', error);
            return encodedData; // Return original if all else fails
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
