cc.Class({
    'extends': cc.Component,

    properties: {
        label: cc.Node,
        fish: cc.Node
    },

    //interval: 0
    onLoad: function onLoad() {
        // this.dotCount = 0;
        // this.dotMaxCount = 3;
        var self = this;
        this.label.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.loadScene();
        });
    },

    // use this for initialization
    startLoading: function startLoading() {
        this.label.enabled = false;
        //this.dotCount = 0;
        var size = cc.view.getVisibleSize();
        this.node.setPosition(cc.p(size.width / 2 - this.node.width / 2, size.height / 4));
        this.fish.setPosition(0, 0);
        // this.schedule(this.updateLabel, this.interval, this);      
    },

    stopLoading: function stopLoading() {
        var self = this;
        // this.scheduleOnce(function(){
        self.label.enabled = true;
        //},3);

        cc.log('stop loading');
        // this.unschedule(this.updateLabel);
        // this.node.setPosition(cc.p(2000, 2000));
    }

});
// updateLabel () {
//     let dots = '.'.repeat(this.dotCount);
//     this.label.string = 'Loading' + dots;
//     this.dotCount += 1;
//     if (this.dotCount > this.dotMaxCount) {
//         this.dotCount = 0;
//     }
// }