let mix = require('laravel-mix');
// mix.js('resources/js/app.js', 'public/js/app.js').setPublicPath('public/js/app.js');
// mix.scss('resources/scss/app.scss', 'public/css/app.css').setPublicPath('public/css/app.css');

mix.js('resources/js/app.js', 'public/js/app.js').sass('resources/scss/app.scss', 'public/css/app.css');