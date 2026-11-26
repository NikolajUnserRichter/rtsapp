/**
 * Order mask v2 – mapping tests.  Run:  node tests/v2.test.js
 * Covers: link data -> mask model, mask -> payload of the write-back flow (field names, slot format the flow
 * can split, strings for every required field), status after sending, lock from the status flow.
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const M = require('../v2/map.js');

let failed = 0;
const eq = (name, got, want) => {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`}`);
};

// the link exactly as F10 builds it, decoded by the shared utils.js
function ordersFromUrl(search, hash = '') {
    const ctx = { console: { log() {}, warn() {}, error() {} }, window: { location: { search, hash } }, URLSearchParams,
                  atob: s => Buffer.from(String(s), 'base64').toString('latin1'), TextDecoder, Uint8Array };
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'utils.js'), 'utf8') + '\n;this.__U = Utils;', ctx);
    return ctx.__U.getOrdersFromUrl();
}
const link = [
    { OrderID: 'WP-1501', SupplierName: 'Müller Rail', CW: 47, RequiredWagons: 20, Transportdatum: '16.11.2026', DepartureDate: '', WagonProfile: 'G1', WagonType: 'Offen', Departure: 'DINGOLFING', Destination: 'Bremerhaven Süd' },
    { OrderID: 'WP-1502', SupplierName: 'Müller Rail', CW: 47, RequiredWagons: 18, Transportdatum: '17.11.2026', DepartureDate: '', WagonProfile: '', WagonType: '', Departure: 'LEIPZIG WERK 5.0', Destination: 'Verona' },
    { SupplierName: 'no id – dropped' }
];
const search = '?data=' + encodeURIComponent(Buffer.from(JSON.stringify(link), 'utf8').toString('base64')) + '&env=c06da98d';
const orders = M.fromLink(ordersFromUrl(search));

eq('link: transports without an order id are dropped', orders.length, 2);

// data after '#' (new links: ?env=…#data=…) – never sent to the server, so big orders do not hit the 400 size limit
const b64link = encodeURIComponent(Buffer.from(JSON.stringify(link), 'utf8').toString('base64'));
eq('link: #data= gives the same orders as ?data=', M.fromLink(ordersFromUrl('?env=c06da98d', '#data=' + b64link)), orders);
eq('link: ?data= wins over #data=', M.fromLink(ordersFromUrl(search, '#data=xxx')).length, 2);
const big = Array.from({ length: 40 }, (_, i) => ({ orderId: 'WP-' + (3000 + i), supplier: 'ARS Altmann', cw: 49.0, wagons: 24, transportDate: '30.11.2026', wagonProfile: 'G1', wagonType: 'Offen + Geschlossen', Departure: 'WERK DINGOLFING', Destination: 'ZEEBRUGGE TERMINAL', departureDate: '30.11.2026' }));
const bigHash = '#data=' + encodeURIComponent(Buffer.from(JSON.stringify(big), 'utf8').toString('base64'));
eq('link: 40 transports after # (> 8 KB) are all read', [bigHash.length > 8192, M.fromLink(ordersFromUrl('?env=28ade5d3', bigHash)).length], [true, 40]);
eq('link: id, supplier, week, route, date, ordered wagons',
    [orders[0].id, orders[0].supplier, orders[0].cw, orders[0].plant, orders[0].dest, orders[0].date, orders[0].ordered],
    ['WP-1501', 'Müller Rail', '47', 'DINGOLFING', 'Bremerhaven Süd', '2026-11-16', 20]);
eq('link: prefill = order values, departure on the transport day, first slot, arrival date empty',
    orders[0].conf, { wagons: 20, profile: 'G1', type: 'Offen', date: '2026-11-16', arrSlot: '00:00 – 02:00', depDate: '2026-11-16', depTime: '00:00', delDate: '', delSlot: '00:00 – 02:00', reason: '', comment: '' });
eq('link: empty profile / type stay empty in the order and start with the first option',
    [orders[1].profile, orders[1].type, orders[1].conf.profile, orders[1].conf.type], ['', '', 'G1', 'Offen']);

eq('dates: dd.MM.yyyy, ISO with time, short year, rubbish',
    [M.iso('07.01.2027'), M.iso('2026-11-16T00:00:00Z'), M.iso('7.1.27'), M.iso('morgen'), M.iso(null)],
    ['2027-01-07', '2026-11-16', '2027-01-07', '', '']);

// payload: exactly the fields the flow "Aufträge bestätigen & an Logistik senden" reads
const o = orders[0];
Object.assign(o.conf, { wagons: 18, arrSlot: '06:00 – 08:00', depTime: '14:30', delDate: '2026-11-17', delSlot: '22:00 – 00:00', reason: '06 Fehlende Waggons - Schadwaggon', comment: 'zwei Schadwagen' });
const p = M.toSubmit(o);
eq('payload: values', p, { orderId: 'WP-1501', wagons: 18, orderedWagons: 20, transportDate: '2026-11-16', originalTransportDate: '2026-11-16',
    deliveryDate: '2026-11-17', wagonProfile: 'G1', wagonType: 'Offen', departureArrivalSlot: '06:00 - 08:00', departureDate: '2026-11-16',
    departureTime: '14:30', destinationArrivalSlot: '22:00 - 00:00', destinationDepartureTime: '', reasonUnderdelivery: '06 Fehlende Waggons - Schadwaggon', comment: 'zwei Schadwagen' });
const required = ['orderId', 'wagons', 'transportDate', 'deliveryDate', 'wagonProfile', 'wagonType', 'departureArrivalSlot', 'departureTime', 'destinationArrivalSlot', 'destinationDepartureTime', 'reasonUnderdelivery', 'comment'];
eq('payload: every field the flow schema requires is present with the right type',
    required.filter(k => !(k in p) || (k === 'wagons' ? !Number.isInteger(p[k]) : typeof p[k] !== 'string')), []);
// the flow does trim(first(split(slot,'-'))) / trim(last(split(slot,'-')))
const flowSplit = s => [s.split('-')[0].trim(), s.split('-').slice(-1)[0].trim()];
eq('payload: slots split into from / until the way the flow does it',
    [flowSplit(p.departureArrivalSlot), flowSplit(p.destinationArrivalSlot)], [['06:00', '08:00'], ['22:00', '00:00']]);
eq('payload: reason starts with the 2-digit code the flow looks up', p.reasonUnderdelivery.slice(0, 2), '06');

eq('status after sending: unchanged -> 13', M.statusAfterSend(M.fromLink(ordersFromUrl(search))[0]), '13');
eq('status after sending: fewer wagons -> 12.2', M.statusAfterSend(o), '12.2');
eq('status after sending: profile was empty in the order -> 12.2', M.statusAfterSend(orders[1]), '12.2');
const moved = M.fromLink(ordersFromUrl(search))[0]; moved.conf.depDate = '2026-11-18';
eq('status after sending: other departure day -> 12.2', M.statusAfterSend(moved), '12.2');

// lock from the status flow
const fresh = M.fromLink(ordersFromUrl(search));
const locked = M.applyStatus(fresh, [
    { orderId: 'WP-1501', found: true, open: false, statusCode: '12.2', statusLabel: '12.2 Bestätigung editiert',
      values: { confirmedWagons: 17, wagonProfile: 914890001, wagonType: 914890002, transportDate: '2026-11-16', departureDate: '2026-11-16',
                departureTime: '13:15', arrivalFrom: '04:00', arrivalUntil: '06:00', deliveryDate: '2026-11-18', destinationFrom: '10:00', destinationUntil: '12:00', comment: 'ok', confirmedAt: '2026-11-12T10:20:00Z' } },
    { orderId: 'WP-1502', found: true, open: true, statusCode: '11', statusLabel: '11 Bestellung versendet', values: {} }
]);
eq('lock: only transports that are no longer open', [locked, fresh[0].status, fresh[1].status], [1, 'sent', 'open']);
eq('lock: shows what RTS holds', [fresh[0].rts, fresh[0].conf.wagons, fresh[0].conf.profile, fresh[0].conf.type, fresh[0].conf.depTime, fresh[0].conf.arrSlot, fresh[0].conf.delDate, fresh[0].conf.delSlot],
    ['12.2', 17, 'G2', 'Offen + Geschlossen', '13:15', '04:00 – 06:00', '2026-11-18', '10:00 – 12:00']);
const gone = M.fromLink(ordersFromUrl(search));
eq('lock: a transport that no longer exists is locked too', [M.applyStatus(gone, [{ orderId: 'WP-1501', found: false, open: false }]), gone[0].status], [1, 'sent']);
eq('lock: no status answer -> nothing locked', M.applyStatus(M.fromLink(ordersFromUrl(search)), []), 0);

console.log(failed ? `\n${failed} test(s) FAILED` : '\nall tests passed');
process.exit(failed ? 1 : 0);
