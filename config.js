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

// Flow endpoints per environment. The sending flows (F10/F21/F22/F41) add &env=<first 8 characters of
// the environment id> to the link. PROD app environment = 28ade5d3; no or unknown env = DEV, so older links keep working.
const RTS_ENV = /^28ade5d3/i.test(new URLSearchParams(window.location.search).get('env') || '') ? 'prod' : 'dev';
const ENDPOINTS = {
    dev: {
        auth: 'https://c06da98d80beeed0b9dfc8dfbc6001.57.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/17/workflows/05f3abfc061845e5a32f218dae03a4c2/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=QbpMBZDp4Mo6HqUS6tXGIwNeZW41ikD0tOeDlyeqU3E',
        orderSubmit: 'https://c06da98d80beeed0b9dfc8dfbc6001.57.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/10/workflows/ae5f10001e5d4a929a65cd900a72c8a5/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Pb8UhhuhvSpACqQe6nSLJN5k0r3byGeBxKXJ8G9aMmU',
        linkOpened: 'https://c06da98d80beeed0b9dfc8dfbc6001.57.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/30/workflows/89c99df931084816b7f93fd45b883d64/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Tl7lG3HhIiO1yTemexP3Y4Ud5yb8koqBK7fk38Lb3Ro',
        dunningReasons: 'https://c06da98d80beeed0b9dfc8dfbc6001.57.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/02/workflows/e386642d2eb2449db36063e61260979d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=WYCXHuUO-KSnMOVLgeymaZCDy2xyuRAzDqxOxnXiaqw',
    },
    prod: {
        auth: 'https://28ade5d300a5e6ea8868bd488be7b8.49.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/08/workflows/35c2caca7ded4d9c9de850a53cc6b18c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=yQXA9VOaBvgB7Brx6BpTCdPO7f9uTXl2Ye2PCQaUA5A',
        orderSubmit: 'https://28ade5d300a5e6ea8868bd488be7b8.49.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/19/workflows/c36e15c066a441c7a191c795914dfabf/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=r3YhtkDgMqrGo--YkKcFlDSxk3s1MNUeBbdhSILi_8A',
        linkOpened: 'https://28ade5d300a5e6ea8868bd488be7b8.49.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/24/workflows/87ea10bb96e5482bac24f7917429d11c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=t3dgwqs3C8OkUubJ363hrmx559IGMkUzF8qB1vJ2Ouw',
        dunningReasons: 'https://28ade5d300a5e6ea8868bd488be7b8.49.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/09/workflows/e78222f842354579ade3bb9db6b06384/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rzY1EyyoxDpxBbv4aBtw_34BWrTUPYMLyooApZkBfik',
    },
}[RTS_ENV];

const APP_CONFIG = {
    // API endpoints - SECURITY: These should be proxied through a backend in production
    api: {
        authFlowUrl: ENDPOINTS.auth,
        orderSubmitUrl: ENDPOINTS.orderSubmit,
        linkOpenedUrl: ENDPOINTS.linkOpened,
        dunningReasonsUrl: ENDPOINTS.dunningReasons
    },
    
    // Business logic configuration
    profiles: ['G1', 'G2'],
    
    wagonTypes: ['Offen', 'Geschlossen', 'Offen + Geschlossen'],
    
    // Reason codes for underdelivery — FALLBACK only.
    // At runtime the live list is fetched from Dataverse via api.dunningReasonsUrl
    // (flow 3104_flow_RTS - GetDunningReasons). This static list is used only if that fetch fails.
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
