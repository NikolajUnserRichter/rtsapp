/**
 * RTS order mask v2 – data mapping (no DOM).
 * Link data (F10)  ->  mask model  ->  payload of the write-back flow
 * "Aufträge bestätigen & an Logistik senden" (same payload as the first mask).
 */
const RtsV2Map = (function () {
    const PROFILES = ['G1', 'G2'];
    const TYPES = ['Offen', 'Geschlossen', 'Offen + Geschlossen'];
    // 2-hour slots as the mask shows them (en dash). The flow splits on '-', so toSubmit() converts them.
    const SLOTS = Array.from({ length: 12 }, (_, i) => {
        const a = String(i * 2).padStart(2, '0'), b = String((i * 2 + 2) % 24).padStart(2, '0');
        return a + ':00 – ' + b + ':00';
    });

    /** dd.MM.yyyy, d.M.yy or yyyy-MM-dd[THH:mm…] -> yyyy-MM-dd ('' if not a date) */
    function iso(value) {
        const v = String(value == null ? '' : value).trim();
        let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return `${m[1]}-${m[2]}-${m[3]}`;
        m = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
        if (m) return `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
        return '';
    }

    /** "06:00 – 08:00" (mask) -> "06:00 - 08:00" (flow: split on '-') */
    function slotOut(slot) {
        return String(slot || '').replace(/\s*[–—-]\s*/, ' - ');
    }

    /** from/until times stored in RTS -> the slot text of the mask ('' if incomplete) */
    function slotIn(from, until) {
        const a = String(from || '').trim().slice(0, 5), b = String(until || '').trim().slice(0, 5);
        return a && b ? `${a} – ${b}` : '';
    }

    /**
     * Normalised link orders (Utils.getOrdersFromUrl) -> mask model.
     * The link carries: order id, supplier, CW, ordered wagons, transport date, profile, type, plant, destination.
     * It carries no times: the dropdowns start with their first option (agreed 17.11.2026), the arrival date
     * at the destination stays empty and is required.
     */
    function fromLink(list) {
        return (list || []).filter(o => o && o.orderId).map(o => {
            const date = iso(o.transportDate);
            const ordered = parseInt(o.wagons, 10) || 0;
            const profile = PROFILES.includes(o.wagonProfile) ? o.wagonProfile : '';
            const type = TYPES.includes(o.wagonType) ? o.wagonType : '';
            return {
                id: String(o.orderId), supplier: o.supplier || '', cw: o.cw == null ? '' : String(o.cw),
                plant: o.departure || '', dest: o.destination || '', date, ordered, profile, type,
                conf: {
                    wagons: ordered, profile: profile || PROFILES[0], type: type || TYPES[0], date,
                    arrSlot: SLOTS[0], depDate: date, depTime: '00:00',
                    delDate: iso(o.deliveryDate), delSlot: SLOTS[0], reason: '', comment: ''
                },
                status: 'open'
            };
        });
    }

    /** One transport of the mask -> one entry of payload.orders (all strings the flow schema requires are present) */
    function toSubmit(o) {
        const c = o.conf;
        return {
            orderId: o.id,
            wagons: parseInt(c.wagons, 10) || 0,
            orderedWagons: o.ordered,
            transportDate: c.depDate || '',          // confirmed transport date = departure day at the plant
            originalTransportDate: o.date || '',
            deliveryDate: c.delDate || '',
            wagonProfile: c.profile || '',
            wagonType: c.type || '',
            departureArrivalSlot: slotOut(c.arrSlot),
            departureDate: c.depDate || '',
            departureTime: c.depTime || '',
            destinationArrivalSlot: slotOut(c.delSlot),
            destinationDepartureTime: '',
            reasonUnderdelivery: c.reason || '',
            comment: c.comment || ''
        };
    }

    /** The status RTS sets after this answer: 13 when nothing differs from the order, else 12.2 */
    function statusAfterSend(o) {
        const c = o.conf;
        const same = c.wagons === o.ordered && c.depDate === o.date && !!o.profile && c.profile === o.profile && !!o.type && c.type === o.type;
        return same ? '13' : '12.2';
    }

    const PROFILE_BY_VALUE = { 914890000: 'G1', 914890001: 'G2' };
    const TYPE_BY_VALUE = { 914890000: 'Offen', 914890001: 'Geschlossen', 914890002: 'Offen + Geschlossen' };

    /**
     * Response of the flow "Transportstatus lesen" (mask "order") -> lock every transport that is no longer
     * in status 11 and show what RTS holds for it. Returns the number of locked transports.
     */
    function applyStatus(orders, transports) {
        const byId = {};
        (transports || []).forEach(t => { if (t && t.orderId != null) byId[String(t.orderId)] = t; });
        let locked = 0;
        orders.forEach(o => {
            const t = byId[o.id];
            if (!t || t.open === true) return;
            o.status = 'sent'; o.lockedOnOpen = true; locked++;
            o.rts = t.found === false ? '' : String(t.statusCode || '');
            o.rtsLabel = t.found === false ? 'nicht mehr in RTS' : String(t.statusLabel || '');
            const v = t.values || {}, c = o.conf;
            // a locked row shows what RTS holds, never the mask's own prefill
            c.arrSlot = ''; c.depTime = ''; c.delSlot = ''; c.delDate = '';
            if (v.confirmedWagons != null) c.wagons = parseInt(v.confirmedWagons, 10) || 0;
            if (PROFILE_BY_VALUE[v.wagonProfile]) c.profile = PROFILE_BY_VALUE[v.wagonProfile];
            if (TYPE_BY_VALUE[v.wagonType]) c.type = TYPE_BY_VALUE[v.wagonType];
            const dep = iso(v.departureDate) || iso(v.transportDate);
            if (dep) c.depDate = dep;
            if (v.departureTime) c.depTime = String(v.departureTime).slice(0, 5);
            if (slotIn(v.arrivalFrom, v.arrivalUntil)) c.arrSlot = slotIn(v.arrivalFrom, v.arrivalUntil);
            if (iso(v.deliveryDate)) c.delDate = iso(v.deliveryDate);
            if (slotIn(v.destinationFrom, v.destinationUntil)) c.delSlot = slotIn(v.destinationFrom, v.destinationUntil);
            if (v.comment) c.comment = String(v.comment);
            o.confirmedAt = v.confirmedAt || '';
        });
        return locked;
    }

    return { PROFILES, TYPES, SLOTS, iso, slotOut, slotIn, fromLink, toSubmit, statusAfterSend, applyStatus };
})();

if (typeof module !== 'undefined') module.exports = RtsV2Map;
