/**
 * RTS order mask v2 – start: link data, login, reasons, status lock, sending.
 * Uses the modules of the first mask (../config.js, ../utils.js, ../auth.js, ../orders.js) so both masks
 * share the endpoints per environment (?env=), the link decoding and the login.
 */
(function () {
    'use strict';
    const $ = s => document.querySelector(s);
    const linkOrders = Utils.getOrdersFromUrl();
    const orders = RtsV2Map.fromLink(linkOrders);

    // same call as the first mask: tell RTS that the link was opened
    if (linkOrders.length) OrderModule.notifyLinkOpened(linkOrders).catch(() => {});

    function fallbackReasons() {
        return APP_CONFIG.reasons.filter(r => r.value !== 'None').map(r => r.text);
    }

    async function loadReasons() {
        const live = await OrderModule.fetchDunningReasons();
        const list = (live || []).map(r => String(r.text || '').trim()).filter(t => /^\d\d/.test(t));
        return list.length ? list : fallbackReasons();
    }

    /** Current status per transport. Not configured or not reachable -> no lock (as in the first mask). */
    async function loadStatus() {
        const url = typeof ENDPOINTS !== 'undefined' && ENDPOINTS.statusRead;
        if (!url || !orders.length) return { available: false, transports: [] };
        try {
            const r = await fetch(url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mask: 'order', orderIds: orders.map(o => o.id).slice(0, 200), sessionToken: AuthModule.getSessionToken() || '' })
            });
            if (!r.ok) return { available: false, transports: [] };
            const body = await r.json();
            return { available: true, transports: Array.isArray(body.transports) ? body.transports : [] };
        } catch (e) {
            console.warn('Status could not be read', e);
            return { available: false, transports: [] };
        }
    }

    /** Sends transports to the write-back flow. Resolves {success, message}. */
    async function submit(list) {
        const sessionToken = AuthModule.getSessionToken();
        if (!sessionToken) return { success: false, message: 'Sitzung abgelaufen. Bitte die Seite neu laden und erneut anmelden.' };
        try {
            const r = await fetch(APP_CONFIG.api.orderSubmitUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Session-Token': sessionToken },
                body: JSON.stringify({ submissionTimestamp: new Date().toISOString(), sessionToken, orders: list.map(RtsV2Map.toSubmit) })
            });
            if (r.ok) return { success: true, message: '' };
            return { success: false, message: `Senden fehlgeschlagen (Status ${r.status}). Es wurde nichts gespeichert – bitte erneut versuchen.` };
        } catch (e) {
            console.error('Submit error', e);
            return { success: false, message: 'Senden fehlgeschlagen. Bitte die Verbindung prüfen und erneut versuchen.' };
        }
    }

    async function start() {
        $('#loginScreen').hidden = true;
        $('#loading').hidden = false;
        const [reasons, status] = await Promise.all([loadReasons(), loadStatus()]);
        const locked = RtsV2Map.applyStatus(orders, status.transports);
        $('#loading').hidden = true;
        document.body.classList.remove('gate');
        if (!orders.length) { $('#noData').hidden = false; return; }
        startMask({ orders, reasons, locked, statusAvailable: status.available, submit,
                    supplier: orders[0].supplier, cw: orders[0].cw });
    }

    $('#loginForm').addEventListener('submit', async ev => {
        ev.preventDefault();
        const btn = $('#loginBtn'), msg = $('#loginMsg');
        btn.disabled = true; btn.textContent = 'Überprüfung …'; msg.textContent = '';
        const res = await AuthModule.authenticate($('#username').value.trim(), $('#password').value);
        if (res.success) { start(); return; }
        msg.textContent = res.message;
        btn.disabled = false; btn.textContent = 'Anmelden';
    });
})();
