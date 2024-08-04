/** @type {import('tailwindcss').Config} */
import { tailwindColors } from '@churchtools/colors';
import colors from 'tailwindcss/colors';

const safelistedColors = Object.keys(tailwindColors).flatMap(key => [
    `bg-${key}-b-pale`,
    `bg-${key}-b-bright`,
    `bg-${key}-500`,
    `bg-${key}-bright`,
    `text-${key}-500`,
    `text-${key}-900`,
    `text-${key}-bright`,
    `text-${key}-primary`,
]);

export default {
    content: [
        './src/**/*.{html,js,ts,vue}',
        './node_modules/@churchtools/styleguide/dist/churchtools-styleguide.es.js',
    ],
    safelist: [...safelistedColors],
    theme: {
        extend: {
            spacing: {
                4.5: '1.125rem',
                13: '3.25rem',
                15: '3.75rem',
                17: '4.25rem',
                18: '4.5rem',
                19: '4.75rem',
            },
            maxWidth: {
                0: '0px',
                none: 'none',
                xs: '20rem',
                sm: '24rem',
                md: '28rem',
                lg: '32rem',
                xl: '36rem',
                '2xl': '40rem',
                p: '43.75rem',
                content: '57.5rem',
            },
        },
        colors: {
            ...tailwindColors,
            white: colors.white,
            black: colors.black,
            transparent: colors.transparent,
        },
        fontSize: {
            xs: ['0.6875rem', '1rem'],
            sm: ['0.8125rem', '1.125rem'],
            base: ['0.875rem', '1.25rem'],
            lg: ['1.125rem', '1.625rem'],
            xl: ['1.25rem', '1.625rem'],
            '2xl': ['1.75rem', '2.125rem'],
            '3xl': ['2.375rem', '2.875rem'],
            'display-l': [
                'var(--text-display-size-l, 34px)',
                {
                    lineHeight: 'var(--text-display-height-l, 40px)',
                    fontWeight: '700',
                },
            ],
            'display-m': [
                'var(--text-display-size-m, 28px)',
                {
                    lineHeight: 'var(--text-display-height-m, 36px)',
                    fontWeight: '700',
                },
            ],
            'display-s': [
                'var(--text-display-size-s, 20px)',
                {
                    lineHeight: 'var(--text-display-height-s, 28px)',
                    fontWeight: '700',
                },
            ],
            'body-l-emphasized': [
                'var(--text-body-size-l, 18px)',
                {
                    lineHeight: 'var(--text-body-height-l, 26px)',
                    fontWeight: '700',
                },
            ],
            'body-l': [
                'var(--text-body-size-l, 18px)',
                {
                    lineHeight: 'var(--text-body-height-l, 26px)',
                    fontWeight: '400',
                },
            ],
            'body-m-emphasized': [
                'var(--text-body-size-m, 14px)',
                {
                    lineHeight: 'var(--text-body-height-m, 20px)',
                    fontWeight: '700',
                },
            ],
            'body-m': [
                'var(--text-body-size-m, 14px)',
                {
                    lineHeight: 'var(--text-body-height-m, 20px)',
                    fontWeight: '400',
                },
            ],
            'body-s-emphasized': [
                'var(--text-body-size-s, 13px)',
                {
                    lineHeight: 'var(--text-body-height-s, 18px)',
                    fontWeight: '700',
                },
            ],
            'body-s': [
                'var(--text-body-size-s, 13px)',
                {
                    lineHeight: 'var(--text-body-height-s, 18px)',
                    fontWeight: '400',
                },
            ],
            'body-xs-emphasized': [
                'var(--text-body-size-xs, 11px)',
                {
                    lineHeight: 'var(--text-body-height-xs, 16px)',
                    fontWeight: '700',
                },
            ],
            'body-xs': [
                'var(--text-body-size-xs, 11px)',
                {
                    lineHeight: 'var(--text-body-height-xs, 16px)',
                    fontWeight: '400',
                },
            ],
            'icon-s': [
                'var(--text-icon-size-s, 12px)',
                {
                    lineHeight: 'var(--text-icon-height-s, 18px)',
                    fontWeight: '900',
                },
            ],
            'icon-m': [
                'var(--text-icon-size-m, 14px)',
                {
                    lineHeight: 'var(--text-icon-height-m, 20px)',
                    fontWeight: '900',
                },
            ],
            'icon-l': [
                'var(--text-icon-size-l, 17px)',
                {
                    lineHeight: 'var(--text-icon-height-l, 22px)',
                    fontWeight: '900',
                },
            ],
            'icon-xl': [
                'var(--text-icon-size-xl, 20px)',
                {
                    lineHeight: 'var(--text-icon-height-xl, 22px)',
                    fontWeight: '900',
                },
            ],
            'icon-xxl': [
                'var(--text-icon-size-xxl, 26px)',
                {
                    lineHeight: 'var(--text-icon-height-xxl, 28px)',
                    fontWeight: '900',
                },
            ],
        },
    },
    plugins: [],
};
