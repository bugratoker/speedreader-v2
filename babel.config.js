module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
            'nativewind/babel',
        ],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['.'],
                    alias: {
                        '@': './src',
                        '@components': './src/components',
                        '@screens': './src/screens',
                        '@navigation': './src/navigation',
                        '@hooks': './src/hooks',
                        '@services': './src/services',
                        '@utils': './src/utils',
                        '@theme': './src/theme',
                        '@constants': './src/constants',
                        '@types': './src/types',
                        '@store': './src/store',
                        '@assets': './assets',
                    },
                },
            ],
        ],
    };
};
