"use strict";
cc._RFpush(module, '6ca57sW9mFCR6xlB5LGptuu', 'Score');
// Script\Score.js

cc.Class({
    "extends": cc.Component,

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
        totalCount: 0,
        eatCount: 0
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.label = this.getComponent(cc.Label);
    },
    eat: function eat() {
        this.eatCount++;
        this.label.string = this.eatCount;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RFpop();