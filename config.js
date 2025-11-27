/**
 * Application Configuration
 * Separating configuration from application logic for better maintainability
 * 
 * SECURITY NOTE: API URLs with authentication signatures are currently stored client-side.
 * For production deployment, consider:
 * 1. Moving sensitive URLs to server-side proxy endpoints
 * 2. Using environment variables with a build process
 * 3. Implementing token rotation mechanisms
 * 4. Using OAuth or similar authentication flows
 */

const APP_CONFIG = {
    // API endpoints - SECURITY: These should be proxied through a backend in production
    api: {
        authFlowUrl: 'https://e157ee54d75be7b59e64b3c2c12166.51.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/3f3444f8c3514fe8873204c368389636/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SwlTj3if5ZKKomFHRBl7RZA-kmS3-X4oMm7NkNRVYFU',
        orderSubmitUrl: 'https://e157ee54d75be7b59e64b3c2c12166.51.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/57811f085180473188001322dee3482f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Av88DsAwouKcWS5YfbpnzNnY0g3_8WuksH9nLJQRj48',
        linkOpenedUrl: 'https://e157ee54d75be7b59e64b3c2c12166.51.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/aa9713b3555a45b0a5aef7f35561a667/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Up_sVwNriYWodZnl79asJHnQhEZte1zrmL_Plf2-j7Q'
    },
    
    // Business logic configuration
    profiles: ['G1', 'G2'],
    
    wagonTypes: ['Offen', 'Geschlossen', 'Offen + Geschlossen'],
    
    // Reason codes for underdelivery
    reasons: [
        { value: 'None', text: '— Keine Unterlieferung —' },
        { value: '05', text: '05 Falsche Waggongattung angeliefert' },
        { value: '06', text: '06 Fehlende Waggons - Schadwaggon' },
        { value: '07', text: '07 Ausrangierung Schadwaggons' },
        { value: '08', text: '08 fehlende Lokführerverfügbarkeit' },
        { value: '09', text: '09 zu wenige Waggons - falsche Planung Bahn-DL' },
        { value: '10', text: '10 zu spät angelieferte Waggons' },
        { value: '11', text: '11 Fehlende Lokführerverfügbarkeit' },
        { value: '12', text: '12 Zugverspätung - Arbeitszeit Ende' },
        { value: '13', text: '13 Zugverspätung - Sonstiges Bahn DL' },
        { value: '14', text: '14 Zugverspätung - Sonstiges' },
        { value: '15', text: '15 Streik - Bahn Infrastruktur' },
        { value: '25', text: '25 technische Störungen Bahnhof bzw. Rangierer' },
        { value: '26', text: '26 technische Störungen auf der Strecke (z.B. Bahnübergang, Stellwerkstörung)' },
        { value: '27', text: '27 Rangierleistung nicht ausreichend - Rangierdienst unterbesetzt' },
        { value: '28', text: '28 Rangierleistung nicht ausreichend - Rangierdienst in Pause' },
        { value: '29', text: '29 Rangierleistung nicht ausreichend - Lokschaden/ Lokstörung' },
        { value: '30', text: '30 Zeitplanung Rangierverkehr' },
        { value: '31', text: '31 Rangierleistung nicht ausreichend (z.B. bei zu viel Rangierung Schadwaggons/Züge gleichzeitig/Lokverfügbarkeit/Lokführer krank, Lokstörrung…)' },
        { value: '32', text: '32 Stellwerk nicht besetzt' },
        { value: '33', text: '33 Lokzuführung verspätet' },
        { value: '34', text: '34 Warten aus Lok - Störung auf der Strecke; Fahren auf Sicht' },
        { value: '35', text: '35 Warten auf Lok - Infrastruktur überlastet' },
        { value: '36', text: '36 Warten aus Lok - Sonstiges' },
        { value: '37', text: '37 Streckensperrung --> keine Umleitung möglich' },
        { value: '38', text: '38 Baustelle/ Infrastruktur' },
        { value: '39', text: '39 Blockierung Transportwege (Abgrenzung zur technischen Störrung, z.B. liegengebliebener Zug auf der Strecke)' },
        { value: '40', text: '40 Umleitung netzbedingt; Personen im Gleis' },
        { value: '41', text: '41 Infrastruktur (Baustellen, Oberleitungsstörung, Rückstau wg. Überfüllung der Umleitungen)' },
        { value: '42', text: '42 fehlende Trassenverfügbarkeit' },
        { value: '43', text: '43 Dispositive Zulaufsteuerung' },
        { value: '53', text: '53 Fehlende Waggons - falsche Planung Bahn-DL' }
    ],
    
    // Time slot configuration
    timeSlots: {
        arrivalInterval: 120,  // 2 hours
        departureInterval: 15  // 15 minutes
    },
    
    // Security configuration
    security: {
        maxLoginAttempts: 5,
        loginAttemptWindow: 900000  // 15 minutes in milliseconds
    }
};

// Make config immutable
Object.freeze(APP_CONFIG);
Object.freeze(APP_CONFIG.api);
Object.freeze(APP_CONFIG.timeSlots);
Object.freeze(APP_CONFIG.security);
