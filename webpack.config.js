const Encore = require('@symfony/webpack-encore');
const path = require('path');
const bundles = require('./var/encore/ez.config.js');
const eZConfigManager = require('./ez.webpack.config.manager.js');
const configManagers = require('./var/encore/ez.config.manager.js');
const customConfigs = require('./ez.webpack.custom.configs.js');

// Configure Encore for combined build
Encore.setOutputPath('public/assets/ezplatform/build')
    .setPublicPath('/assets/ezplatform/build')
    .addExternals({
        react: 'React',
        'react-dom': 'ReactDOM',
        jquery: 'jQuery',
        moment: 'moment',
        'popper.js': 'Popper',
        alloyeditor: 'AlloyEditor',
        'prop-types': 'PropTypes',
    })
    .enableSassLoader()
    .enableReactPreset()
    .enableSingleRuntimeChunk()
    .copyFiles({
        from: './assets/images',
        to: 'images/[path][name].[ext]',
        pattern: /\.(png|svg)$/
    });

// Add project entries
Encore.addEntry('welcome_page', [
    path.resolve(__dirname, './assets/scss/welcome-page.scss'),
]);

Encore.addEntry('app_js', [
    path.resolve(__dirname, './assets/app.js'),
]);

Encore.addEntry('app_styles', [
    path.resolve(__dirname, './assets/styles/app.css'),
]);

// Add EZ Platform bundles
bundles.forEach((configPath) => {
    const addEntries = require(configPath);
    addEntries(Encore);
});

const combinedConfig = Encore.getWebpackConfig();
combinedConfig.name = 'combined';

// Apply EZ Platform config managers
configManagers.forEach((configManagerPath) => {
    const configManager = require(configManagerPath);
    configManager(combinedConfig, eZConfigManager);
});

module.exports = [ combinedConfig, ...customConfigs ];

// uncomment this line if you've commented-out the above lines
// module.exports = [ eZConfig, ...customConfigs ];
