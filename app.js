/**
 * Main Application Entry Point
 * Initializes the RTS (Rail Transport System) application
 */

(function initApp() {
    'use strict';

    /**
     * Handle login form submission
     * @param {Event} event - Form submit event
     */
    async function handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value;
        
        // Show loading state
        UIModule.setButtonLoading(
            'login-btn',
            'login-btn-text',
            'login-spinner',
            true,
            'Überprüfung...',
            'Anmelden'
        );
        
        // Attempt authentication
        const result = await AuthModule.authenticate(username, password);
        
        if (result.success) {
            // Show main application
            UIModule.showMainApp();
            UIModule.loadOrderForm();
        } else {
            // Show error message
            UIModule.showAlert('login-alert', result.message, 'danger');
            
            // Reset button state
            UIModule.setButtonLoading(
                'login-btn',
                'login-btn-text',
                'login-spinner',
                false,
                'Überprüfung...',
                'Anmelden'
            );
        }
    }

    /**
     * Handle order form submission
     * @param {Event} event - Form submit event
     */
    async function handleOrderSubmit(event) {
        event.preventDefault();
        
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (!submitButton) return;
        
        // Disable submit button to prevent double submission
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird gesendet...';
        
        // Collect order data
        const ordersData = OrderModule.collectOrderData();
        
        // Submit orders
        const result = await OrderModule.submitOrders(ordersData);
        
        if (result.success) {
            UIModule.showAlert('alert-container', result.message, 'success');
            // Keep submit button disabled after successful submission
        } else {
            UIModule.showAlert('alert-container', result.message, 'danger');
            // Re-enable submit button on error
            submitButton.disabled = false;
            submitButton.innerHTML = 'Aufträge bestätigen & an Logistik senden';
        }
    }

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        // Order form
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', handleOrderSubmit);
        }

        // Add form input validation
        addFormValidation();
    }

    /**
     * Add real-time form validation
     */
    function addFormValidation() {
        // Add input validation for number fields
        document.addEventListener('input', function(event) {
            const target = event.target;
            
            // Validate number inputs
            if (target.type === 'number') {
                const min = parseInt(target.min || '0', 10);
                const value = parseInt(target.value || '0', 10);
                
                if (value < min) {
                    target.setCustomValidity(`Wert muss mindestens ${min} sein.`);
                } else {
                    target.setCustomValidity('');
                }
            }
            
            // Validate date inputs
            if (target.type === 'date' && target.value) {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Check if date is in the past (optional validation)
                // Uncomment if you want to prevent past dates
                // if (selectedDate < today) {
                //     target.setCustomValidity('Datum darf nicht in der Vergangenheit liegen.');
                // } else {
                //     target.setCustomValidity('');
                // }
            }
        });
    }

    /**
     * Initialize application on DOM ready
     */
    function init() {
        // Check if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initEventListeners();
            });
        } else {
            // DOM is already loaded
            initEventListeners();
        }
    }

    // Start the application
    init();
})();
