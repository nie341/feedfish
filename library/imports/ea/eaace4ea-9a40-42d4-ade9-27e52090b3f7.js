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
        star1: cc.Node,
        star2: cc.Node,
        star3: cc.Node,
        lock: cc.Node,
        stageString: cc.Node
    },

    // use this for initialization
    onLoad: function onLoad() {},
    init: function init(stageData) {
        var self = this;
        this.stage = stageData.stage;
        this.stageString.getComponent(cc.Label).string = "第" + this.stage + "关";
        var stageStorage = cc.sys.localStorage.getItem('stage' + this.stage);
        if (stageStorage) {
            var score = JSON.parse(stageStorage).bestScore;
            if (score >= stageData.star1) {
                this.star1.color = new cc.Color(255, 255, 255);
            } else {
                this.star1.color = new cc.Color(100, 100, 100);
            }
            if (score >= stageData.star2) {
                this.star2.color = new cc.Color(255, 255, 255);
            } else {
                this.star2.color = new cc.Color(100, 100, 100);
            }
            if (score >= stageData.star3) {
                this.star3.color = new cc.Color(255, 255, 255);
            } else {
                this.star3.color = new cc.Color(100, 100, 100);
            }
            this.lock.active = false;
        } else {
            this.star1.color = new cc.Color(100, 100, 100);
            this.star2.color = new cc.Color(100, 100, 100);
            this.star3.color = new cc.Color(100, 100, 100);
            this.star1.active = false;
            this.star2.active = false;
            this.star3.active = false;
            this.lock.active = true;
        }

        if (self.stage === 1) {
            this.lock.active = false;
            this.star1.active = true;
            this.star2.active = true;
            this.star3.active = true;
        }
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (!self.lock.active) {
                var select_event = new cc.Event.EventCustom('select_stage', true);
                //把选中的关放出去
                select_event.setUserData(self.stage);
                self.node.dispatchEvent(select_event);
                //self.node.active=false;
            }
        });
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});