//可不可以做成公共的
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
        // 增加还是减少
        isGrowUp: true,
        // 是否是时分秒
        isClock: true,

        totaltime: 20,

        initTime: 0
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.label = this.getComponent(cc.Label);
        //this.init();
    },
    init: function init(initTime) {
        this.unscheduleAllCallbacks();
        var self = this;
        var type = function type(o) {
            var s = Object.prototype.toString.call(o);
            return s.match(/\[object (.*?)\]/)[1].toLowerCase();
        };
        if (type(initTime) === 'number') self.initTime = initTime;
        this.label.string = self.formatSeconds(self.initTime);
        //cc.log('start timer!');
        this.callback = this.schedule(function () {
            self.label.string = self.formatSeconds(self.initTime);
            if (self.isGrowUp) {
                self.initTime++;
            } else {
                self.initTime--;
            }

            if (self.initTime < 0) {
                //告诉主控，时间到
                self.node.dispatchEvent(new cc.Event.EventCustom('time_up', true));
                self.unscheduleAllCallbacks(); //(self.callback);
            }
            if (self.initTime > self.totaltime) {
                self.node.dispatchEvent(new cc.Event.EventCustom('time_up', true));
                self.unscheduleAllCallbacks(); //(self.callback);
            }
        }, 1);
    },
    formatSeconds: function formatSeconds(value) {

        var theTime = parseInt(value); // 秒

        var theTime1 = 0; // 分

        var theTime2 = 0; // 小时

        if (theTime > 60) {

            theTime1 = parseInt(theTime / 60);

            theTime = parseInt(theTime % 60);

            if (theTime1 > 60) {

                theTime2 = parseInt(theTime1 / 60);

                theTime1 = parseInt(theTime1 % 60);
            }
        }

        var result = "" + parseInt(theTime) + "秒";

        if (theTime1 > 0) {

            result = "" + parseInt(theTime1) + "分" + result;
        }

        if (theTime2 > 0) {

            result = "" + parseInt(theTime2) + "小时" + result;
        }

        return result;
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },