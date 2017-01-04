"use strict";
cc._RFpush(module, 'ae375DjhbtMN7IDSy5GWlo7', 'Menu');
// Script\Menu.js

cc.Class({
    'extends': cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        stagePrefab: cc.Prefab,
        menuLayout: cc.Node
    },

    // use this for initialization
    onLoad: function onLoad() {},
    init: function init(stages) {
        var self = this;
        this.node.active = true;
        self.menuLayout.removeAllChildren();
        for (var i = 0; i < stages.length; i++) {
            var stageMenu = cc.instantiate(self.stagePrefab);
            var stageMenuScript = stageMenu.getComponent('StageMenu');
            stageMenuScript.init(stages[i]);
            self.menuLayout.addChild(stageMenu);
        }
        this.node.setPosition(0, 0);
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();