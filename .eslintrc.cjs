module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    parserOptions: {
        allowImportExportEverywhere: true,
        ecmaVersion: 2016,
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
    },
    extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', '@vue/typescript/recommended', '@vue/prettier'],
    rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-reserved-component-names': 'off',
        'no-undef': 'off',
        'vue/no-v-html': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
    },
};
