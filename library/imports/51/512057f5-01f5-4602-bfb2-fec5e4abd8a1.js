var Loading = require('Loading');

cc.Class({
    'extends': cc.Component,

    properties: {
        loading: Loading
    },

    // use this for initialization
    onLoad: function onLoad() {
        var self = this;
        //在webGL下有问题
        //cc.view.enableAntiAlias(false);
        cc.game.addPersistRootNode(this.node);
        // this.loading.startLoading();
        this.loadScene('main');
        this.loading.loadScene = function () {
            cc.director.loadScene(self.curLoadingScene);
        };
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    loadScene: function loadScene(sceneName) {
        var self = this;
        this.loading.startLoading();
        this.curLoadingScene = sceneName;
        //this.onSceneLoaded.bind(this);
        cc.loader.loadRes('stages.json', function (err, data) {
            self.loading.stagesData = data;
            cc.director.preloadScene(sceneName, self.onSceneLoaded.bind(self));
        });
    },

    onSceneLoaded: function onSceneLoaded(event) {
        cc.log(this);
        this.loading.stopLoading();

        // cc.director.loadScene(this.curLoadingScene);
    }
});