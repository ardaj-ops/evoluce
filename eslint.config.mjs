// Klientské skripty sdílejí jeden globální rozsah (bez modulů), proto kontrolu nedefinovaných názvů
// dělá test/check.js (npm run check). Tady jen základní pravidla pro editor.
import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        languageOptions: { sourceType: 'script', globals: { ...globals.browser, ...globals.es2021, ...globals.node } },
        rules: { 'no-undef': 'off', 'no-unused-vars': 'off', 'no-empty': 'off', 'no-redeclare': 'off' },
    },
];
