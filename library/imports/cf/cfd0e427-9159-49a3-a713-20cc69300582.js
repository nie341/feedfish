cc.Class({
    'extends': cc.Component,

    properties: {
        speed: 1,
        lurePer: 1,
        interval: 5
    },

    // use this for initialization
    onLoad: function onLoad() {
        var self = this;
        //行为：1.开始时出现在横轴的某个点
        //2.向一个方式移动，移动形式可能是随机的
        //3.不会移出屏幕
        //4.点击后，放下一（多）个饵，然后这个大饵消失
        //5.当一定时间间隔后再出现（暂定）
        this.moveDirection = 1;
        this.throwCount = 0;

        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.node.opacity === 255) {
                cc.log('throw_lure');
                //发出事件
                var eventCustom = new cc.Event.EventCustom('throw_lure', true);
                eventCustom.setUserData(self.node.x);
                self.node.dispatchEvent(eventCustom);
                //计量
                self.throwCount++;
                if (self.throwCount === self.lurePer) {
                    self.node.opacity = 0;
                    self.throwCount = 0;
                    //下次出现时间
                    self.scheduleOnce(function () {
                        self.init();
                        self.node.opacity = 255;
                    }, self.interval);
                }
            }
        });
    },
    init: function init() {
        var x = -cc.winSize.width / 2 + 50 + (cc.winSize.width - 50) * Math.random();
        this.node.x = x;
    },

    strategyRun: function strategyRun() {
        var x = this.node.x + this.speed * this.moveDirection;

        if (x > cc.winSize.width / 2 - 50) {

            x = cc.winSize.width / 2 - 50;
            this.moveDirection = -this.moveDirection;
            cc.log('turn left and x:' + x + ' moveDirection:' + this.moveDirection);
        }
        if (x < -cc.winSize.width / 2 + 50) {

            x = -cc.winSize.width / 2 + 50;
            this.moveDirection = -this.moveDirection;
        }
        this.node.x = x;
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        this.strategyRun();
    }
});