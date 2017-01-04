"use strict";
cc._RFpush(module, 'b23a41E/OhBYLJETDQftNiQ', 'Board');
// Script\Board.js

cc.Class({
    "extends": cc.Component,

    properties: {
        star1: cc.Node,
        star2: cc.Node,
        star3: cc.Node,
        stageString: cc.Node,
        stageScore: cc.Node,
        stageBestScore: cc.Node
    },

    // use this for initialization
    onLoad: function onLoad() {},
    init: function init(result) {
        var self = this;
        //result.time
        //result.eatlureCount
        //result.stage
        var stage = result.stage;
        self.stage = stage;
        self.stageString.getComponent(cc.Label).string = "第" + stage + "关";
        self.currStage = result;
        self.stageScore.getComponent(cc.Label).string = result.score;
        self.getStars(result.score);
        var stagestring = cc.sys.localStorage.getItem('stage' + stage);
        if (!stagestring) {
            var stageStorage = JSON.parse(stagestring);

            self.stageBestScore.getComponent(cc.Label).string = stageStorage.bestScore;
            self.bestScore = stageStorage.bestScore;
        } else {
            self.bestScore = 0;
        }
    },
    getStars: function getStars(score) {
        var self = this;
        var stagesData = cc.find('Canvas').getComponent('Game').stagesData;
        for (var i = 0; i < stagesData.length; i++) {
            if (stagesData[i].stage === self.stage) {
                if (score >= stagesData[i].star1) {
                    this.star1.color = new cc.Color(255, 255, 255);
                } else {
                    this.star1.color = new cc.Color(100, 100, 100);
                }
                if (score >= stagesData[i].star2) {
                    this.star2.color = new cc.Color(255, 255, 255);
                } else {
                    this.star2.color = new cc.Color(100, 100, 100);
                }
                if (score >= stagesData[i].star3) {
                    this.star3.color = new cc.Color(255, 255, 255);
                } else {
                    this.star3.color = new cc.Color(100, 100, 100);
                }
                break;
            }
        }
    },
    //下一关
    command: function command(event, customEventData) {
        var self = this;
        self.saveData();
        cc.log(customEventData);
        self.node.dispatchEvent(new cc.Event.EventCustom(customEventData, true));
        self.node.active = false;
    },
    // menu: function() {
    //     let self = this;
    //     self.saveData();
    //     self.node.dispatchEvent(new cc.Event.EventCustom('menu', true));
    //     self.node.active = false;
    // },
    saveData: function saveData() {
        var self = this;
        //保存本关数据
        if (self.currStage.score > self.bestScore) {
            self.bestScore = self.currStage.score;
        }
        var stageJson = {
            bestScore: self.bestScore
        };
        cc.sys.localStorage.setItem('stage' + self.stage, JSON.stringify(stageJson));
    },
    // reload:function(){
    //     let self = this;
    //     self.saveData();
    //     self.node.dispatchEvent(new cc.Event.EventCustom('reload', true));
    //     self.node.active = false;
    // },
    //暂时简单计算，只算未被吃到的饵数
    countStar: function countStar(eatLureCount, throwLureCount) {
        var score = throwLureCount - eatLureCount;
        if (score === 0) {}
        if (score > 0 && score <= 3) {}
        if (score > 3) {}
        //最后利用game的功能读取localstorage保存结果
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RFpop();