/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['index.html', './src/**/*.vue'],
    theme: {
        colors: {
            main: 'rgba(0, 0, 32, 1)',
            surface: 'rgba(0, 0, 0, 1)',
            'overlay-main': 'rgba(0, 0, 32, 0.9)',

            'text-normal': 'rgba(255, 255, 255, 1)',
            'text-disabled': 'rgba(255, 255, 255, 0.25)',

            'button-normal': 'rgba(255, 255, 255, 0.125)',
            'button-highlighted': 'rgba(255, 255, 255, 0.25)',
            'button-pressed': 'rgba(255, 255, 255, 0.0625)',
            'button-disabled': 'rgba(255, 255, 255, 0.03125)',

            current: 'currentColor',
        },
    },
}
