import { ConfigurationSkeleton } from './ConfigurationSkeleton.js';

let HandlebarsParts =
{
    'wizard.config.name'     : 'Name.hbs',
    'wizard.config.checkbox' : 'Checkbox.hbs',
    'wizard.config.slider'   : 'Slider.hbs',
}

Hooks.on('ready', () => 
{
    Object.keys(HandlebarsParts).forEach((key) =>
    {
        HandlebarsParts[key] = `modules/wizard/module/templates/parts/${HandlebarsParts[key]}`;
    })

    loadTemplates(HandlebarsParts);

    window['Wizard'] =
    {
        ConfigurationSkeleton: ConfigurationSkeleton,
        RegisterConfigurations: ConfigurationSkeleton.RegisterConfigurations,
        Set: ConfigurationSkeleton.Set,
        Get: ConfigurationSkeleton.Get
    }

    console.log('🧙‍♂️ Wizard: Ready!');
    
    Hooks.call('wizard-ready');
});