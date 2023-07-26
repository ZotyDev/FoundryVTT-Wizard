////////////////////////////////////////////////////////////////////////////////
//                                _                  _ 
//                               (_)                | |
//                      __      ___ ______ _ _ __ __| |
//                      \ \ /\ / / |_  / _` | '__/ _` |
//                       \ V  V /| |/ / (_| | | | (_| |
//                        \_/\_/ |_/___\__,_|_|  \__,_| LIBRARY
//                                                        By ZotyDev
////////////////////////////////////////////////////////////////////////////////
//? This is the main class that Wizard uses, it is used to register and use the
//? configs. It is basically a wrapper for the already existing FoundryVTT
//? settings but with more features and a nicer interface
//
//! This module can become obselete someday since Foundry constantly updates its
//! core functionalities, so consider that before using Wizard for your configs.
//! I'm aware of this possibility, because of that the settings handled by this
//! module are, in their essence, just normal settings with some extra bells and
//! whistles, so you are relatively safe to use Wizard as the setting provider
//! for your module.
//! Note that this module was made mainly to be used by me on my modules, so if
//! you encounter some design choices that differ from what you are trying to do
//! feel free to copy Wizard and do your own changes, its licensed under MIT...
//! As a last note, this module provides a very specific solution to a very
//! specific problem, the main focus of Wizard is to let players configure the 
//! smallest details of your module, the module was created because OIF got too
//! complex for the Foundry's default setting manager, if you are using
//! configurations that have dependencies and incompatibilies then Wizard is the
//! module you are looking for, otherwise you should in fact just use the
//! default solution provided by Foundry :D
export class ConfigurationSkeleton extends Application
{
    static get defaultOptions()
    {
        const DefaultOptions = super.defaultOptions;

        const OverrideOptions = 
        {
            closeOnSubmit : false,
            height        : 'auto',
            width         : 1200,
            submitOnChange: true,
            title         : 'Wizard',
            template      : 'modules/wizard/module/templates/ConfigurationSkeleton.hbs',
            module        : '',
        }

        DefaultOptions.classes.push('conf-skeleton-container');
        DefaultOptions.classes.push('window-content');

        const MergedOptions = foundry.utils.mergeObject(DefaultOptions, OverrideOptions);
        return MergedOptions;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Data
    ////////////////////////////////////////////////////////////////////////////
    static Data = 
    {
        Structured: {},
        Loose     : {}
    };

    ////////////////////////////////////////////////////////////////////////////
    // Register the configurations of the module
    ////////////////////////////////////////////////////////////////////////////
    static RegisterConfigurations(options)
    {
        ConfigurationSkeleton.Data.Structured[options.module] = options.data;
        ConfigurationSkeleton.Data.Loose[options.module] = {};
        let Data = ConfigurationSkeleton.Data.Structured[options.module];
        Data.name = options.module;
        
        // Gets the URL for bug reporting
        ConfigurationSkeleton.Data.Structured[options.module].bugs = game.modules.get(options.module).bugs;

        // Gets the changelog
        ConfigurationSkeleton.UpdateChangelog(Data);

        // Register the configs into the world
        options.data.topics.forEach((topic) => 
        {
            // Does it have settings?
            if (topic.settings != undefined)
            {
                // Iterate through the settings
                Object.values(topic.settings).forEach((setting) =>
                {
                    // Does it have configurations?
                    if (setting.configurations != undefined)
                    {
                        // Iterate through the configurations
                        setting.configurations.forEach((configuration) =>
                        {
                            // Build the settings
                            let FoundrySettingOptions = 
                            {
                                name   : configuration['name'],
                                hint   : configuration['hint'],
                                scope  : configuration['scope'],
                                default: configuration['default'],
                                config : false
                            }

                            // Detect and convert custom type to be used by foundry
                            switch (configuration['type'])
                            {
                                case 'checkbox':
                                    FoundrySettingOptions['type'] = Boolean;
                                    break;
                                
                                case 'slider':
                                    FoundrySettingOptions['type'] = Number;
                                    FoundrySettingOptions['range'] = configuration['range'];
                                    break;
                                
                                case 'string':
                                    FoundrySettingOptions['type'] = String;
                                    break;

                                case 'dropdown':
                                    FoundrySettingOptions['type'] = String;
                                    FoundrySettingOptions['choices'] = configuration['choices'];
                                    break;

                                default:
                                    console.error(`ConfigurationSkeleton.RegisterConfigurations: Cannot register confifguration, ${configuration['type']} is not a valid type`);
                                    break;
                            }

                            // Register the configuration inside Foundry
                            game.settings.register(options.module, configuration.id, FoundrySettingOptions);

                            // Get currently set value to be displayed
                            configuration['value'] = game.settings.get(options.module, configuration.id);

                            // Check for required modules
                            let RequiredModules = configuration.compatibility?.dependsOn;
                            if (RequiredModules != undefined)
                            {
                                // Check if the required modules are active
                                let DisabledModules = [];
                                let ShouldDisable = false;
                                RequiredModules.forEach((module) => 
                                {
                                    if (!game.modules.get(module)?.active)
                                    {
                                        ShouldDisable = true;
                                        DisabledModules.push(game.modules.get(module).title);
                                    }
                                });

                                // Check if the configuration should be disabled
                                if (ShouldDisable)
                                {
                                    configuration['disabled'] = true;

                                    // Sets the message for when one module is not enabled
                                    if (DisabledModules.length == 1)
                                    {
                                        configuration['disabledMessage'] = game.i18n.localize('Wizard.Error.ModuleRequired').replace('${module}', DisabledModules[0]);
                                    }
                                    // Sets the message for when two modules are required and not enabled
                                    else if (DisabledModules.length == 2)
                                    {
                                        configuration['disabledMessage'] = game.i18n.localize('Wizard.Error.ModulesRequired').replace('${modules}', DisabledModules[0]).replace('${modulesLast}', DisabledModules[1]);
                                    }
                                    // Sets the message for when three or more modules are required and not enabled
                                    else if (DisabledModules.length > 2)
                                    {
                                        let InnerMessage = '';
                                        for (let index = 0; index < DisabledModules.length; index++) 
                                        {
                                            const ModuleTitle = DisabledModules[index];
                                            InnerMessage = `${InnerMessage}, ${ModuleTitle}`;
                                        }
                                        configuration['disabledMessage'] = game.i18n.localize('Wizard.Error.ModulesRequired').replace('${modules}', InnerMessage).replace('${modulesLast}', DisabledModules[DisabledModules.length - 1]);
                                    }
                                }
                            }

                            // Register the configuration inside Wizard
                            ConfigurationSkeleton.Data.Loose[options.module][configuration.id] = configuration;
                        });
                    }
                });
            }
        });
    }

    ////////////////////////////////////////////////////////////////////////////
    // Gets the value stored at a registered configuration
    ////////////////////////////////////////////////////////////////////////////
    static async Get(module, configuration)
    {
        // Check if the module is registered
        if (ConfigurationSkeleton.Data.Loose[module] != undefined)
        {
            // Check if the config exists
            if (ConfigurationSkeleton.Data.Loose[module][configuration] != undefined)
            {
                let Config = ConfigurationSkeleton.Data.Loose[module][configuration];
                // Construct the return value
                // Return if the config is enabled alongside the value, if it is
                // disabled then the default value should be returned
                let ReturnValue = { enabled: !Config.disabled };
                if (Config.disabled) 
                {
                    ReturnValue.value = Config.default;
                }
                else
                {
                    ReturnValue.value = Config.value;
                }
                return ReturnValue;
            }
            else
            {
                console.error(`ConfigurationSkeleton.Get: ${configuration} not registered by ${module}`);
                return;
            }
        }
        else
        {
            console.error(`ConfigurationSkeleton.Get: ${module} not found inside Wizard`);
            return;
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    // Sets a value of a registered configuration
    //TODO check if the value is valid (same type, inside range, etc..)
    ////////////////////////////////////////////////////////////////////////////
    static async Set(module, configuration, value)
    {
        // Check if the module is registered
        if (ConfigurationSkeleton.Data.Loose[module] != undefined)
        {
            // Check if the config exists
            if (ConfigurationSkeleton.Data.Loose[module][configuration] != undefined)
            {
                // Set the configuration inside Foundry
                await game.settings.set(module, config, value);
                
                // Set the configuration inside Wizard
                ConfigurationSkeleton.Data.Loose[module][configuration].value = value;
            }
            else
            {
                console.error(`ConfigurationSkeleton.Set: ${configuration} not registered by ${module}`);
                return;
            }
        }
        else
        {
            console.error(`ConfigurationSkeleton.Set: ${module} not found inside Wizard`);
            return;
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    async _handleTopicSelection(html, event)
    {
        // Get the id of the selected item
        let ClickedElement = html.target;
        let SelectedId = ClickedElement.dataset.id;

        ConfigurationSkeleton.Data.Structured[this.options.module].topics.forEach((e) => 
        {
            if (e.id == SelectedId)
            {
                e.selected = true;
                ConfigurationSkeleton.Data.Structured[this.options.module].currentTopic = e;
            }
            else
            {
                e.selected = undefined;
            }
            e.selected = (e.id == SelectedId) ? true : undefined;
        });

        this.render();
    }

    async _handleConfigClick(html, event)
    {
        let ClickedElement = $(event.currentTarget)[0];
        let CurrentTopic = ConfigurationSkeleton.Data.Structured[this.options.module].currentTopic;

        CurrentTopic.settings.forEach((setting) => 
        {
            if (setting != undefined && setting.id == ClickedElement.dataset.id)
            {
                setting.expanded = setting.expanded == true ? undefined : true;
            }
        });

        this.render();
    }

    async _handleTooltipHoverOn(html, event)
    {
        let Tooltip = event.target.dataset.tooltip;
        game.tooltip.activate(event.target, {text: Tooltip, direction: "UP"});
    }

    async _handleTooltipHoverOff(html, event)
    {
        game.tooltip.deactivate();
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        html[0].parentElement.parentElement.children[0].children[1].lastChild.textContent = '';

        // Topic selection
        html.on('click', 'a[class="topic-button"]', this._handleTopicSelection.bind(this));

        // Config
        html.on('click', 'a[class="expand-button"]', this._handleConfigClick.bind(this, html));

        // Tooltip
        html.on('mouseenter', 'div[class*="tooltip"]', this._handleTooltipHoverOn.bind(this, html));
        html.on('mouseleave', 'div[class*="tooltip"]', this._handleTooltipHoverOff.bind(this, html));
    }

    static async getGithubMarkdown(url) {// Supported Remote APIs
		const APIs = {
			github: /https?:\/\/github.com\/(?<user>[^/]+)\/(?<repo>[^/]+)\/blob\/[^/]+\/(?<path>.*)/,
			rawGithub: /https?:\/\/raw.githubusercontent.com\/(?<user>[^/]+)\/(?<repo>[^/]+)\/master\/(?<path>.*)/
		}
		if (url.match(APIs.github) || url.match(APIs.rawGithub)) {
			const { user, repo, path } = (url.match(APIs.github) ?? url.match(APIs.rawGithub)).groups;
			return await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`).then(response => {
				if (response.status >= 200 && response.status <= 299) {
					try {
						return response.json();
					}catch (error) {
						throw TypeError("unable to fetch file content");
					}
				}
				throw TypeError("unable to fetch file content");
			}).then(response => {
				return atob(response.content)
			}).catch(error => {
				console.error(error);
				return undefined;
			})
		}
	}

    static async UpdateChangelog(data)
    {
        let ChangelogURL = game.modules.get(data.name).changelog;
        if (data.changelod == undefined && ChangelogURL != undefined)
        {
            let Result = await ConfigurationSkeleton.getGithubMarkdown(ChangelogURL);
            if (Result != undefined)
            {
                data.changelog = JournalTextPageSheet._converter.makeHtml(Result);
                this.render;
            }
        }
    }

    getData(options)
    {
        let Data = ConfigurationSkeleton.Data.Structured[this.options.module];
        return Data;
    }

    async _updateObject(event, formData)
    {}
}