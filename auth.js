/**
 * Authentication Module
 * Handles user authentication and session management
 */

const AuthModule = (function() {
    // Private variables
    let sessionToken = null;
    
    // Load login attempts from localStorage for persistence
    const STORAGE_KEY = 'rts_login_attempts';
    
    /**
     * Generate a UUID v4 for session token
     * Uses crypto.getRandomValues for cryptographically secure random values
     * @returns {string} UUID v4 string
     */
    function generateUUID() {
        // Use crypto.getRandomValues for secure random generation
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const bytes = new Uint8Array(16);
            crypto.getRandomValues(bytes);
            // Set version (4) and variant (RFC 4122)
            bytes[6] = (bytes[6] & 0x0f) | 0x40;
            bytes[8] = (bytes[8] & 0x3f) | 0x80;
            
            const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
            return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
        }
        // Fallback for older browsers without crypto API (less secure)
        console.warn('crypto.getRandomValues not available, using Math.random() fallback for UUID generation');
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * Get stored login attempts data
     * @returns {{count: number, timestamp: number}}
     */
    function getStoredAttempts() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to read login attempts from storage:', e);
        }
        return { count: 0, timestamp: 0 };
    }
    
    /**
     * Store login attempts data
     * @param {number} count - Number of attempts
     * @param {number} timestamp - Timestamp of last attempt
     */
    function storeAttempts(count, timestamp) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, timestamp }));
        } catch (e) {
            console.warn('Failed to store login attempts:', e);
        }
    }

    /**
     * Check if user has exceeded login attempts
     * @returns {boolean} True if too many attempts
     */
    function isTooManyAttempts() {
        const currentTime = Date.now();
        const stored = getStoredAttempts();
        const timeSinceLastAttempt = currentTime - stored.timestamp;
        
        // Reset counter if window has passed
        if (timeSinceLastAttempt > APP_CONFIG.security.loginAttemptWindow) {
            storeAttempts(0, 0);
            return false;
        }
        
        return stored.count >= APP_CONFIG.security.maxLoginAttempts;
    }

    /**
     * Record a login attempt
     */
    function recordAttempt() {
        const stored = getStoredAttempts();
        storeAttempts(stored.count + 1, Date.now());
    }

    /**
     * Reset login attempts counter
     */
    function resetAttempts() {
        storeAttempts(0, 0);
    }

    /**
     * Authenticate user with credentials
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise<{success: boolean, message: string, token?: string}>}
     */
    async function authenticate(username, password) {
        // Check for too many attempts
        if (isTooManyAttempts()) {
            const waitMinutes = Math.ceil(APP_CONFIG.security.loginAttemptWindow / 60000);
            return {
                success: false,
                message: `Zu viele fehlgeschlagene Anmeldeversuche. Bitte warten Sie ${waitMinutes} Minuten.`
            };
        }

        // Validate inputs
        if (!username || !password) {
            return {
                success: false,
                message: 'Benutzername und Passwort sind erforderlich.'
            };
        }

        try {
            const response = await fetch(APP_CONFIG.api.authFlowUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password,
                    timestamp: new Date().toISOString()
                })
            });

            const result = await response.json();
            
            if (response.ok && result.authenticated === true) {
                // Use token from backend if available, otherwise generate a unique session token
                sessionToken = result.token || generateUUID();
                resetAttempts();
                return {
                    success: true,
                    message: 'Anmeldung erfolgreich.',
                    token: sessionToken
                };
            } else {
                recordAttempt();
                return {
                    success: false,
                    message: 'Ungültiger Benutzername oder Passwort.'
                };
            }
        } catch (error) {
            console.error('Authentication error:', error);
            recordAttempt();
            return {
                success: false,
                message: 'Verbindungsfehler. Bitte versuchen Sie es später erneut.'
            };
        }
    }

    /**
     * Get current session token
     * @returns {string|null} Session token or null
     */
    function getSessionToken() {
        return sessionToken;
    }

    /**
     * Clear session token (logout)
     */
    function clearSession() {
        sessionToken = null;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    function isAuthenticated() {
        return sessionToken !== null;
    }

    // Public API
    return {
        authenticate,
        getSessionToken,
        clearSession,
        isAuthenticated
    };
})();
