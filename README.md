<a href="https://foundryvtt.com/packages/object-interaction-fx">
    <p align="center">
        <img src="https://raw.githubusercontent.com/ZotyDev/FoundryVTT-Wizard/main/branding/title.png" alt="Wizard Title">
    </p>
</a>

<p align="center">
    <a href="https://discord.gg/RAgPXB4zG7">
        <img src="https://discord.com/api/guilds/1071251491375042661/widget.png?style=shield"/>
    </a>
</p>

A FoundryVTT library that provides a extensive set of features to make our lives as developers easier! The module is still W.I.P so expect some bugs here and there. Please feel free to ask for any type of support on my discord.

Foundry is one of the best pieces of software that I've ever seen! But sometimes I feel like the current configuration system is not enough to create a hyper complex module such as [Automated Objects, Interactions and Effects](https://foundryvtt.com/packages/object-interaction-fx), because of that I created **Wizard**, note that the library was created just to support my module, but you can easily use it on your own module.

I use the core configuration implementation to handle the configs, Wizard is just a wrapper around the already existing system, that means that if you decide to stop using this library the data will be still there, as usable as possible, just without the additional layer that Wizard introduces.

_Before using Wizard on your existing/new module, ask yourself if you really should do that, Wizard is complex and might be a overkill for your needs. If you don't know if you should use this library, odds are you don't need to. Just use Wizard if you know that Foundry does not have enough customization/configuration options for your module, also consider that in the future this module could become obsolete and there is no guarantee that your data will be compatible with a possible official implementation._

Like my module? Consider supporting me :)

<a href='https://ko-fi.com/T6T8IFCB5' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi5.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

---
## Main Features
- Create custom configuration interfaces that allow for way better customization
- Data-based, so you just need to call `Wizard.RegisterConfigurations(<Options>)` once and
- Better dependency management
- ~~Node-based visual editor~~ W.I.P

---
<h2 align="center"> <a href="https://github.com/ZotyDev/FoundryVTT-Wizard/blob/main/CHANGELOG.md"> Changelog</a> </h2>
