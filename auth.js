/**
 * Authentication Module
 * Handles user authentication and session management
 */

const AuthModule = (function() {
    // Private variables
    let sessionToken = null;
    let loginAttempts = 0;
    let lastAttemptTime = 0;

    /**
     * Check if user has exceeded login attempts
     * @returns {boolean} True if too many attempts
     */
    function isTooManyAttempts() {
        const currentTime = Date.now();
        const timeSinceLastAttempt = currentTime - lastAttemptTime;
        
        // Reset counter if window has passed
        if (timeSinceLastAttempt > APP_CONFIG.security.loginAttemptWindow) {
            loginAttempts = 0;
        }
        
        return loginAttempts >= APP_CONFIG.security.maxLoginAttempts;
    }

    /**
     * Record a login attempt
     */
    function recordAttempt() {
        loginAttempts++;
        lastAttemptTime = Date.now();
    }

    /**
     * Reset login attempts counter
     */
    function resetAttempts() {
        loginAttempts = 0;
        lastAttemptTime = 0;
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
                sessionToken = result.token || null;
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
