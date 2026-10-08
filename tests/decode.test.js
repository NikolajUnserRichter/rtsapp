/**
 * Decoding test for the order-confirmation mask (F10 link).
 * The flow puts base64 JSON into ?data=. Run before every push:  node tests/decode.test.js
 * Covers: '+' that arrives as a space, URL-encoded value, URL-safe base64 without padding,
 * umlauts (UTF-8) and a long payload.
 */
const fs = require('fs'), path = require('path'), vm = require('vm');

// atob as browsers implement it (WHATWG forgiving-base64): whitespace is dropped,
// only A-Z a-z 0-9 + / are allowed, '=' padding optional, length % 4 === 1 is an error.
function browserAtob(input) {
    let s = String(input).replace(/[\t\n\f\r ]/g, '');
    if (s.length % 4 === 0) s = s.replace(/={1,2}$/, '');
    if (s.length % 4 === 1 || /[^A-Za-z0-9+/]/.test(s)) {
        const err = new Error('InvalidCharacterError'); err.name = 'InvalidCharacterError'; throw err;
    }
    return Buffer.from(s, 'base64').toString('latin1');
}

function ordersFromUrl(search) {
    const ctx = { console: { log() {}, warn() {}, error() {} }, window: { location: { search } },
                  URLSearchParams, atob: browserAtob, TextDecoder, Uint8Array };
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'utils.js'), 'utf8') + '\n;this.__U = Utils;', ctx);
    return ctx.__U.getOrdersFromUrl();
}

const order = i => ({ OrderID: 'WP-' + (1400 + i) + '?>'.repeat(i % 3), SupplierName: 'ARS Altmann', CW: 42, OrderedWagons: 20,
    Transportdatum: '16.10.2026', DepartureDate: '', WagonProfile: 'G1', WagonType: 'Offen',
    Departure: 'LEIPZIG WERK 5.0', Destination: 'Bremerhaven Süd – Überseehafen', ID: 'x' + i });

function payloadWithPlus(make) {
    for (let i = 0; i < 5000; i++) {
        const json = JSON.stringify(make(i));
        const b64 = Buffer.from(json, 'utf8').toString('base64');
        if (b64.includes('+')) return { b64, count: JSON.parse(json).length };
    }
    throw new Error('no payload with + found');
}

const cases = [
    { name: 'one order', make: i => [order(i)] },
    { name: '40 orders', make: i => Array.from({ length: 40 + (i % 5) }, (_, k) => order(k + i)) }
];

let failed = 0;
for (const c of cases) {
    const { b64, count } = payloadWithPlus(c.make);
    const variants = {
        'raw link, + arrives as space': '?data=' + b64,
        'URL-encoded link': '?data=' + encodeURIComponent(b64),
        'URL-safe, no padding': '?data=' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    };
    for (const [label, search] of Object.entries(variants)) {
        const r = ordersFromUrl(search);
        const ok = r.length === count && r[0].destination === 'Bremerhaven Süd – Überseehafen';
        console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.name.padEnd(10)} ${label}`);
        if (!ok) failed++;
    }
}
console.log(failed ? `\n${failed} test(s) failed` : '\nall decoding tests passed');
process.exit(failed ? 1 : 0);
