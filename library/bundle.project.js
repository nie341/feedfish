require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Biglure":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'cfd0eQnkVlJo6cTIMxpMAWC', 'Biglure');
// Script\Biglure.js

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

cc._RFpop();
},{}],"Board":[function(require,module,exports){
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
        if (stagestring) {
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
},{}],"Camera":[function(require,module,exports){
"use strict";
cc._RFpush(module, '5371euSGt9HZ567kKwxoVB7', 'Camera');
// Script\Camera.js

cc.Class({
    "extends": cc.Component,

    properties: {
        target: {
            "default": null,
            type: cc.Node
        },

        map: {
            "default": null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        var winSize = cc.winSize;
        this.screenMiddle = cc.v2(winSize.width / 2, winSize.height / 2);

        this.boundingBox = cc.rect(0, 0, this.map.width, this.map.height);

        this.minx = -(this.boundingBox.xMax - winSize.width);
        this.maxx = this.boundingBox.xMin;
        this.miny = -(this.boundingBox.yMax - winSize.height);
        this.maxy = this.boundingBox.yMin;
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        var pos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        var targetPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        var dif = pos.sub(targetPos);

        var dest = dif.add(this.screenMiddle);

        dest.x = cc.clampf(dest.x, this.minx, this.maxx);
        dest.y = cc.clampf(dest.y, this.miny, this.maxy);

        this.node.position = this.node.parent.convertToNodeSpaceAR(dest);
    }
});

cc._RFpop();
},{}],"Control":[function(require,module,exports){
"use strict";
cc._RFpush(module, '4bf4e6w4ypNwKNdmlXGYAJe', 'Control');
// Script\Control.js

var FishRunStatus = cc.Enum({
    stop: 0,
    control: 1,
    find: 2,
    random: 3
});
cc.Class({
    'extends': cc.Component,

    properties: {
        //运行性，0~1之间，越小越爱动
        move_rate: 0.4,
        max_seed: 10,
        speed: 10,
        turn_speed: 5,
        idle_time: 5,
        favorite: false,
        star: cc.Node,
        lure: {
            type: cc.Node,
            'default': null
        }
    },

    onLoad: function onLoad() {
        var self = this;
        this.run_status = FishRunStatus.stop;
        /*   
        鱼的特性：
        1.自己游，会停一会儿，再游
        2.会找离自己最近的饵
        3.饵的出现会让鱼向其游近
        */
        // add key down and key up event

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        this.anim = this.getComponent(cc.Animation);
        this.moveDirection = null;
        this.sprite = this.getComponent(cc.Sprite);

        //每5秒想一下，是不是要游
        this.schedule(function () {
            cc.log('fish status:' + self.run_status);
            //从停止状态 进入 自由运动
            if (self.run_status === FishRunStatus.stop) {
                //某种属性，是不是爱动
                if (Math.random() > this.move_rate) self.randomRun();
            }
        }, self.idle_time * Math.random());
    },
    init: function init(properties) {
        //合并一些属性 mixin?
        cc.log(this);
        cc.js.mixin(this, properties);
        //this.favorite=properties.favorite;

        if (!this.favorite) {
            this.star.active = false;
        }
        cc.log('this.node.parent');
        cc.log(this.node.parent);
        // cc.log(this);
    },

    destroy: function destroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onKeyDown: function onKeyDown(event) {
        var self = this;
        var dirction_rotation = 0;
        if (event.keyCode !== this.moveDirection) {
            switch (event.keyCode) {
                case cc.KEY.left:

                    // this.countRotation(270);
                    dirction_rotation = 270;

                    break;
                case cc.KEY.right:

                    dirction_rotation = 90;

                    break;
                case cc.KEY.up:

                    dirction_rotation = 0;
                    // this.anim.play('fish_up');
                    break;
                case cc.KEY.down:
                    dirction_rotation = 180;
                    break;
                case cc.KEY.space:
                    // cc.log('dd'+this.lure);
                    this.eatAction();
                    return;

            }
            cc.log('this.moveDirection:' + this.moveDirection);
            this.actionControl(dirction_rotation, event.keyCode);
        }

        //this.countRotation(dirction_rotation);
        this.moveDirection = event.keyCode;
    },
    countAngle: function countAngle(target, self) {
        var len_y = target.y - self.y;
        var len_x = target.x - self.x;

        var tan_yx = Math.abs(len_y) / Math.abs(len_x);
        var angle = 0;
        if (len_y > 0 && len_x < 0) {
            angle = Math.atan(tan_yx) * 180 / Math.PI - 90;
        } else if (len_y > 0 && len_x > 0) {
            angle = 90 - Math.atan(tan_yx) * 180 / Math.PI;
        } else if (len_y < 0 && len_x < 0) {
            angle = -Math.atan(tan_yx) * 180 / Math.PI - 90;
        } else if (len_y < 0 && len_x > 0) {
            angle = Math.atan(tan_yx) * 180 / Math.PI + 90;
        }
        return angle;
    },
    eatAction: function eatAction() {
        var _this = this;

        if (this.lure) {
            var _ret = (function () {
                if (!_this.lure.isValid) {
                    _this.wantEatThink();
                }
                if (_this.lure == undefined || !_this.lure || _this.lure === null || !_this.lure.isValid) {
                    //在追的过程中，饵因为某种原因没了，
                    _this.run_status = FishRunStatus.stop;
                    return {
                        v: undefined
                    };
                }

                cc.log(' want eat ' + _this.lure.uuid + ' ' + _this.lure.x);
                var self = _this;
                // let len_y = this.lure.y - this.node.y;
                // let len_x = this.lure.x - this.node.x;

                // let tan_yx = Math.abs(len_y) / Math.abs(len_x);
                // let angle = 0;
                // if (len_y > 0 && len_x < 0) {
                //     angle = Math.atan(tan_yx) * 180 / Math.PI - 90;
                // } else if (len_y > 0 && len_x > 0) {
                //     angle = 90 - Math.atan(tan_yx) * 180 / Math.PI;
                // } else if (len_y < 0 && len_x < 0) {
                //     angle = -Math.atan(tan_yx) * 180 / Math.PI - 90;
                // } else if (len_y < 0 && len_x > 0) {
                //     angle = Math.atan(tan_yx) * 180 / Math.PI + 90;
                // }
                var angle = _this.countAngle(_this.lure, _this.node);
                //  cc.log('angle:'+angle);

                var x_ = Math.cos(angle) * _this.speed;
                var y_ = Math.sin(angle) * _this.speed;
                // cc.log('x_,y_:'+x_+','+y_);

                var finished = cc.callFunc(function (target, ind) {
                    //cc.log('finished');
                    self.node.stopAllActions();
                    // cc.log('this.lure:'+this.lure.position.x);
                    if (this.lure.isValid) {
                        //如果饵还在，继续吃
                        self.eatAction();
                    } else {
                        //找另一个饵
                        var canvasScript = cc.find('Canvas').getComponent('Game');
                        if (canvasScript.lures.length > 0) {
                            self.wantEatThink(canvasScript.lures);
                            // cc.log(' find '+canvasScript.lures[0].uuid);
                            // self.lure=canvasScript.lures[0];
                            // self.eatAction();
                        } else {
                                self.run_status = FishRunStatus.stop;
                            }
                    }
                }, _this, 0);
                //这个时间要变化
                var distance = cc.pDistance(_this.node.getPosition(), _this.lure.getPosition());
                var speed = _this.max_seed * 0.5;
                if (distance < 200) {
                    speed = _this.max_seed * 0.15;
                }
                if (distance < 80) {
                    speed = _this.max_seed * 0.01;
                }
                cc.log('new speed:' + speed);
                var rotateTo = cc.rotateTo(speed / 2, angle); //cc.rotateTo(0.5, angle);
                var followAction = cc.moveTo(speed, _this.lure);
                _this.node.stopAllActions();
                //学习的过程，当撞到后，记录了障碍，再思考时要考虑障碍
                // if (self.pathPolygons) {
                //     let paths = self.findPath(self.node.getPosition(), self.lure.getPosition(), self.pathPolygons, self.stonePolygons, []);
                //     let path = self.shortPath(paths);
                //     if (path === undefined || path === null) {
                //         cc.log('direct path');

                //     } else {
                //         cc.log(paths);
                //         cc.log('find path with stone ');
                //         cc.log(path);

                //         followAction = cc.cardinalSplineTo(speed,[cc.p(-202,0),cc.p(0,0)],0);//cc.cardinalSplineTo(speed, path, 0); //tension紧张度，要考量一下
                //         rotateTo = cc.rotateTo(speed , angle);
                //         this.node.runAction(cc.spawn(followAction, cc.sequence(rotateTo, finished)));
                //         return;
                //     }
                // }
                _this.node.runAction(cc.spawn(followAction, cc.sequence(rotateTo, finished)));

                // followAction.easing(cc.easeQuarticActionIn());

                //停止之前的动作，转而执行下面的动作

                return {
                    v: undefined
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        } else {
            this.run_status = FishRunStatus.stop;
            return;
        }
    },
    //任意游//也可能停下来
    randomRun: function randomRun() {
        var self = this;
        var x = -cc.winSize.width / 2 + cc.winSize.width * Math.random();
        var y = -cc.winSize.height / 2 + (cc.winSize.height - 100) * Math.random();
        var speed = this.max_seed * (Math.random() * 0.8 + 0.2);
        cc.log('fish random run ' + x + ',' + y + ' at ' + speed);
        var moveTo = cc.moveTo(speed, cc.p(x, y));

        var finished = cc.callFunc(function (target, ind) {
            self.run_status = FishRunStatus.stop;
        });
        var angle = this.countAngle(cc.p(x, y), this.node);
        cc.log('angle:' + angle);

        var rotateTo = cc.rotateTo(0.25 + Math.random() * 2, angle);
        this.run_status = FishRunStatus.random; //状态变化了
        var randomAction = cc.spawn(rotateTo, cc.sequence(moveTo, finished));
        randomAction.setTag(FishRunStatus.random);
        // cc.log(randomAction);
        this.node.runAction(randomAction);
    },
    //对所有饵进行评估，找到最想吃最近的一个
    wantEatThink: function wantEatThink(lures) {
        if (lures === null) {
            lures = cc.find('Canvas').getComponent('Game').lures; //node
            cc.log('find lures from canvas');
        }
        cc.log('lures:');
        cc.log(lures);
        if (!lures) {
            cc.log('undefined lures');
            return;
        }
        if (lures.length > 0) {
            this.run_status = FishRunStatus.find; //find lure
        }
        var distance = 9999;
        //对于距离差不多的，是不是随机处理呢？还是让两只鱼撞在一起？
        for (var i = 0; i < lures.length; i++) {
            var distance_ = cc.pDistance(this.node.getPosition(), lures[i].getPosition());
            if (distance > distance_) {
                distance = distance_;
                this.lure = lures[i];
            }
        }
        cc.log(' find ' + this.lure.uuid);
        this.eatAction();
    },
    //键盘控制，暂时不要了
    actionControl: function actionControl(dirction_rotation, code) {
        var x = this.node.position.x;
        var y = this.node.position.y;
        // cc.log('be x,y:' + x + ' ' + y + ' ' + code);
        var rotateTo = cc.rotateTo(0.5, dirction_rotation);
        rotateTo.easing(cc.easeElasticOut());
        var x_ = x;
        var y_ = y;
        switch (code) {

            case cc.KEY.left:
                x_ = x - 10;
                break;
            case cc.KEY.right:
                x_ = x + 10;
                break;
            case cc.KEY.up:
                y_ = y + 10;
                break;
            case cc.KEY.down:
                y_ = y - 10;
                break;
        }
        //cc.log(x_ + ' : ' + y_);
        var bezierTo = cc.moveTo(1.5, cc.p(x_, y_)); //,cc.p(x-30,y+20),cc.p(x-40,y)]);
        bezierTo.easing(cc.easeElasticIn());
        // bezierTo.easing(cc.easeCubicActionIn());     //cc.bezierTo(2,[cc.p(x,y),cc.p(x+40,y+40),cc.p(x,y+80),cc.p(x-40,y+40),cc.p(x,y)]);
        this.node.runAction(cc.spawn(rotateTo, bezierTo));
    },

    countRotation: function countRotation(dirction_rotation) {
        this.run_status = FishRunStatus.control; //running
        this.start_rotation = this.node.rotation;
        this.end_rotation = dirction_rotation;
        this.clockwise = 1;
        //方向第一次计算
        var dvalue = this.end_rotation - this.start_rotation;
        if (dvalue === 0 || dvalue === 360) this.run_status = FishRunStatus.stop;
        if (dvalue < 0) this.clockwise = -this.clockwise;
        //要转的角度
        if (Math.abs(this.end_rotation - this.start_rotation) > 180) {
            this.turn_rotation = 360 - Math.abs(this.end_rotation - this.start_rotation);
            //方向第二次计算
            this.clockwise = -this.clockwise;
        } else {
            this.turn_rotation = Math.abs(this.end_rotation - this.start_rotation); //要转的角度
        }
        //   cc.log(this.turn_rotation);
        //   cc.log(this.clockwise);
        //   cc.log(this.node.rotation);
        //cc.log(convertToWorldSpaceAR this.node.position);
    },

    onKeyUp: function onKeyUp(event) {
        if (event.keyCode === this.moveDirection) {
            this.moveDirection = null;
        }
    },

    onCollisionEnter: function onCollisionEnter(other, self) {
        if (other.node.group === 'stoneG') {
            cc.log('fish knock stone' + other.node.group);
            cc.log(other);
            //碰到鱼
            //记忆障碍
            if (this.stonePolygons === undefined) {
                var polygons = [];
                var canvas = cc.find('Canvas');
                for (var i = 0; i < other.points.length; i++) {
                    polygons[i] = canvas.convertToNodeSpaceAR(other.world.points[i]);
                }
                this.stonePolygons = polygons;
                cc.log('memo the stonePolygons');
            }
            //鱼要改变行动路线
            this.strategyRun(other.node);
        }
        if (other.node.group === 'pathG' && this.pathPolygons === undefined) {
            cc.log('memo the pathPolygons');
            var polygons = [];
            var canvas = cc.find('Canvas');
            for (var i = 0; i < other.points.length; i++) {
                polygons[i] = canvas.convertToNodeSpaceAR(other.world.points[i]);
            }
            this.pathPolygons = polygons;
        }
        if (other.node.group === 'fishG') {
            //如果是鱼与鱼相撞
            this.strategyRun(other.node, 0.15, 0.3, true, 50);
        }
    },
    //反弹的AI逻辑
    strategyRun: function strategyRun(other, tempSpeed, tempRotateSpeed, immediately, range) {
        var _this2 = this;

        var self = this;
        //当前是有目标的游，还是闲游
        if (self.run_status === FishRunStatus.random || self.run_status === FishRunStatus.find || self.run_status === FishRunStatus.stop) {
            (function () {

                // let x_range = Math.abs(cc.winSize.width / 2 - Math.abs(self.node.x));
                // let y_range = Math.abs(cc.winSize.height / 2 - Math.abs(self.node.y) - 100);
                // let x = self.node.x + x_range * Math.random();
                // let y = self.node.y + y_range * Math.random();
                var x_range = 100 + 50 * Math.random();
                var y_range = 100 + 50 * Math.random();
                if (range) {
                    x_range = range * Math.random();
                    y_range = range * Math.random();
                }

                var run_status_org = self.run_status;
                var x = undefined,
                    y = undefined;
                if (other.x >= self.node.x) {

                    x = self.node.x - x_range; //-cc.winSize.width / 2 + x_range * Math.random();
                } else {
                        x = self.node.x + x_range;
                    }
                if (other.y >= self.node.y) {
                    y = self.node.y - y_range; //-cc.winSize.height / 2 + y_range * Math.random();
                } else {
                        y = self.node.y + y_range;
                    }

                cc.log('after knock then want ' + x + ',' + y);

                var speed = _this2.max_seed * (Math.random() * 0.8 + 0.2);
                if (tempSpeed) speed = tempSpeed;
                var moveTo = cc.moveTo(speed, cc.p(x, y));
                //   x=50+cc.winSize.width/2*Math.random();
                //   y=50+cc.winSize.height/2*Math.random();
                // var mng = cc.director.getActionManager();
                // cc.log(mng.getActionByTag(FishRunStatus.random,this.node));
                // moveTo=cc.reverseTime(mng.getActionByTag(FishRunStatus.random,this.node));

                // let moveBy = cc.moveBy(speed, cc.p(x, y));
                var finished = cc.callFunc(function (target, ind) {
                    if (run_status_org === FishRunStatus.random) {
                        self.run_status = FishRunStatus.stop;
                    }
                    if (run_status_org === FishRunStatus.find) {
                        self.run_status = run_status_org;
                        //饵没有丢，还想着
                        ////驱散完了，应该重新找目标
                        self.wantEatThink(null);
                        //self.eatAction();
                    }
                });
                cc.log('other angle:' + _this2.countAngle(_this2.node.convertToNodeSpace(cc.p(x, y)), cc.p(0, 0)) + " | " + _this2.countAngle(cc.p(x, y), _this2.node));
                var angle = _this2.countAngle(cc.p(x, y), _this2.node);
                // angle=(angle>180?540-this.node.rotation:this.node.rotation-90);
                var rotateSpeed = _this2.turn_speed * Math.random() + 0.2;
                if (tempRotateSpeed) rotateSpeed = tempRotateSpeed;
                var rotateTo = cc.rotateTo(rotateSpeed, angle);
                //先停下原来正在进行的动作（导致碰撞的）
                _this2.node.stopAllActions();
                cc.log('knock run and status:' + _this2.run_status + ' speed:' + speed + ' and angle:' + angle);
                //向另一个方向运动
                // self.run_status=FishRunStatus.random;
                //
                if (immediately) _this2.node.stopAllActions();
                _this2.node.runAction(cc.spawn(rotateTo, cc.sequence(moveTo, finished)));
            })();
        }
    },
    //假设暂时只有一个障碍物
    findPath: function findPath(startPos, targetPos, pathPolygons, stonePolygons, path) {
        if (path === undefined) path = [];
        if (!cc.Intersection.linePolygon(startPos, targetPos, stonePolygons)) {

            path.unshift(startPos);
            return path;
        }
        var tempPolygons = [];
        var tempPolygons_ = [];
        for (var i = 0; i < pathPolygons.length; i++) {
            if (cc.Intersection.linePolygon(startPos, pathPolygons[i], stonePolygons)) {
                tempPolygons.push(pathPolygons[i]);
            } else {
                tempPolygons_.push(pathPolygons[i]);
            }
        }
        // if(tempPolygons_.length>1){
        //let len=path.length;
        // if (tempPolygons_.length === 0) {

        // }
        for (var i = 0; i < tempPolygons_.length; i++) {
            if (path === undefined) path = [];

            var pathBranch = this.findPath(tempPolygons_[i], targetPos, tempPolygons, stonePolygons, path[i]);
            if (pathBranch.length === 0) {
                //cc.log(path);
                pathBranch = null;
                //return null;
            } else {
                    if (Array.isArray(pathBranch[0])) {
                        for (var n = 0; n < pathBranch.length; n++) {
                            pathBranch[n].push(targetPos);
                        }
                        path = pathBranch;
                    } else {
                        pathBranch.unshift(startPos);
                        path[i] = pathBranch;
                    }
                }

            //path.concat(path,pathBranch);
            //path[len + i] = this.findPath_(tempPolygons_[i],targetPos,tempPolygons,stonePolygons,path[i]);
        }

        return path;
    },
    shortPath: function shortPath(paths) {
        var s = 0;
        var maxDistance = 0;
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            if (path === undefined || path === null) continue;
            if (Array.isArray(path)) {
                path.unshift(this.node.getPosition());
            } else {

                if (cc.pDistance(paths[0], this.node.getPosition()) == 0) return null;
                paths.unshift(this.node.getPosition());
                return paths;
            }

            var distance = 0;
            for (var n = 0; n < path.length - 1; n++) {
                distance += cc.pDistance(path[n], path[n + 1]);
            }
            if (distance > maxDistance) {
                maxDistance = distance;
                s = i;
            }
        }

        paths[s].shift();
        return paths[s];
    },

    update: function update(dt) {
        var self = this;
        if (this.run_status === FishRunStatus.control) {
            //在运动中的话

            // cc.log('curr_rotation:'+this.node.rotation+' end_rotation:'+this.end_rotation+' this.speed:'+this.speed);
            this.node.rotation += this.turn_speed * this.clockwise;

            if (this.node.rotation >= 0) {
                if (this.node.rotation === this.end_rotation || this.node.rotation - 360 === this.end_rotation) {
                    this.run_status = FishRunStatus.stop;
                }
            }
            if (this.node.rotation < 0) {
                if (360 + this.node.rotation === this.end_rotation || this.node.rotation + 360 === this.end_rotation) {
                    this.run_status = FishRunStatus.stop;
                }
            }
            if (this.node.rotation > 360) this.node.rotation = this.node.rotation - 360;
            if (this.node.rotation < -360) this.node.rotation = this.node.rotation + 360;
        }
        // cc.log('status:' + this.run_status);
        if (this.run_status != FishRunStatus.control) {
            switch (this.moveDirection) {

                case cc.KEY.left:
                    this.node.x -= this.speed;
                    break;
                case cc.KEY.right:
                    this.node.x += this.speed;
                    break;
                case cc.KEY.up:
                    this.node.y += this.speed;
                    break;
                case cc.KEY.down:
                    this.node.y -= this.speed;
                    break;
            }
        }

        // this.node.x=-400;
        if (Math.abs(this.node.x) > (cc.winSize.width - 100) / 2) {
            this.node.x = (cc.winSize.width - 100) / 2 * this.node.x / Math.abs(this.node.x);
        }
        //cc.log(this.node.x + " " + this.node.x);
        if (Math.abs(this.node.y) > (cc.winSize.height - 10) / 2) {
            this.node.y = (cc.winSize.height - 100) / 2 * this.node.y / Math.abs(this.node.y);
        }
    }
});

cc._RFpop();
},{}],"Game":[function(require,module,exports){
"use strict";
cc._RFpush(module, '39f2bgOI5VOFK2KRBCTA0jb', 'Game');
// Script\Game.js

cc.Class({
    'extends': cc.Component,

    properties: {

        lurePrefab: cc.Prefab,
        fishPrefab: cc.Prefab,
        //需要初始化的
        knock: cc.Node,
        score: cc.Node,
        timer: cc.Node,
        eatCount: cc.Node,
        board: cc.Node,
        bigLure: cc.Node,
        stone: cc.Node,
        menu: cc.Node,
        stageString: cc.Node,

        stage: 1,
        disperseDistance: 100,

        fish: {
            'default': null,
            type: cc.Node
        },
        otherFish: {
            'default': [],
            type: cc.Node
        }

    },

    // use this for initialization
    onLoad: function onLoad() {
        var self = this;
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this.knock.active = false;
        this.knockAnimation = this.knock.getComponent(cc.Animation);

        this.scoreLabel = this.score.getComponent(cc.Label);
        this.scoreScript = this.score.getComponent('Score');
        //取到关卡设计文件--放到loading中
        //cc.loader.loadRes('stages.json', function(err, data) {
        var data = cc.find('loading').getComponent('Loading').stagesData;
        self.menu.active = true;
        self.menu.getComponent('Menu').init(data);
        self.stagesData = data;
        //self.bigLure.getComponent('Biglure').init();//data

        //});

        //cc.log('temp:'+cc.Intersection.linePolygon(cc.p(0,0),cc.p(1,1),[cc.p(0,0),cc.p(0,1),cc.p(1,1),cc.p(1,0)] ))

        //不需要设定的变量
        this.lures = [];

        // cc.log('length:'+this.lures.length);
        // let result=self.findPath_(cc.p(12,9), cc.p(13,9), [cc.p(7,11),cc.p(11,11),cc.p(10.5,10.5),cc.p(10,9),cc.p(11,7),cc.p(7,7)], [cc.p(8,10),cc.p(10,10),cc.p(9,9),cc.p(10,8),cc.p(8,8)], []);
        // cc.log(result);

        //处理上报的各种事件，作为集中调度处理

        this.node.on('lure_over', function (event) {
            cc.log(event);
        });
        this.node.on('lure_eated', function (event) {
            self.scoreScript.eat();
        });
        this.node.on('throw_lure', function (event) {
            var x = event.getUserData();
            self.throw_lure(x);
            //是在这里告诉鱼要吃，还是放到鱼的自主AI中，让鱼发现有饵
            //也就是有新的饵是一个事件，触发了鱼的思考
            self.wantEatThink();
            // self.fishScript.wantEatThink(self.lures);

            // for (var i = 0; i < self.otherFish.length; i++) {
            //     self.otherFish[i].getComponent('Control').wantEatThink(self.lures);
            // }
            //self.lures.push(lure);
            //什么时候放回到池中呢？

            //这里要通知鱼，这里有饵，有多个饵怎么办，要记录所有饵，且饵会变化
            //另有多个鱼的情况
            // self.fishScript.lure = lure;
            // self.fishScript.eatAction();
        });
        this.node.on('lure_destroy', function (event) {
            //cc.log('event.detail.uuid:' + event.detail.uuid);
            //cc.log(self.lures);

            //这个饵被吃了，让鱼找下一个，暂时没有最近的逻辑
            for (var i = 0; i < self.lures.length; i++) {
                if (self.lures[i].uuid == event.detail.uuid) {
                    self.lures[i].destroy();
                    self.lures.splice(i, 1);
                }
            }
            cc.log('now there are ' + self.lures.length + ' lures');
        });
        //时间到
        this.node.on('time_up', function (event) {
            self.board.active = true;
            self.board.setPosition(0, 0);
            cc.log('self.stage:' + self.stage + ' self.scoreScript.eatCount:' + self.scoreScript.eatCount);
            self.board.getComponent('Board').init({
                stage: self.stage,
                score: self.scoreScript.eatCount
            });
            //清理场景
            self.unscheduleAllCallbacks(); //停止投放
            for (var i = 0; i < self.otherFish.length; i++) {
                self.fishPool.put(self.otherFish[i]);
                //self.otherFish[i].destroy();
            }

            //self.fishPool.put(self.fish);
            self.fish.destroy();

            for (var i = 0; i < self.lures.length; i++) {
                self.lures[i].destroy(); //put(self.lures[i]);
            }
            self.lures = [];
        });
        // 选择关卡了
        this.node.on('select_stage', function (event) {
            self.menu.active = false;

            self.enterStage();
            self.fishScript = self.fish.getComponent('Control');
            self.randomLures(self.stageData.throw_lure.count, self.stageData.throw_lure.interval);
            //self.randomLures(5, 10);

            //重置计时器
            self.timer.getComponent('Timer').totaltime = self.stageData.timer;
            self.timer.getComponent('Timer').isGrowUp = false;
            self.timer.getComponent('Timer').init(self.stageData.timer);
            //重置分数
            self.eatCount.getComponent(cc.Label).string = 0;
            self.scoreScript.eatCount = 0;
        });
        //下一关
        this.node.on('next_stage', function (event) {
            self.stage++;
            self.enterStage();
            self.fishScript = self.fish.getComponent('Control');
            self.randomLures(self.stageData.throw_lure.count, self.stageData.throw_lure.interval);
            //self.randomLures(5, 10);

            //重置计时器
            self.timer.getComponent('Timer').totaltime = self.stageData.timer;
            self.timer.getComponent('Timer').isGrowUp = false;
            self.timer.getComponent('Timer').init(self.stageData.timer);
            //重置分数
            self.eatCount.getComponent(cc.Label).string = 0;
            self.scoreScript.eatCount = 0;
        });
        //目录
        this.node.on('menu', function (event) {
            self.menu.active = true;
            self.menu.getComponent('Menu').init(self.stagesData);
        });
        //reload
        this.node.on('reload', function (event) {
            self.enterStage();
            self.fishScript = self.fish.getComponent('Control');
            self.randomLures(self.stageData.throw_lure.count, self.stageData.throw_lure.interval);
            //self.randomLures(5, 10);

            //重置计时器
            self.timer.getComponent('Timer').totaltime = self.stageData.timer;
            self.timer.getComponent('Timer').isGrowUp = false;
            self.timer.getComponent('Timer').init(self.stageData.timer);
            //重置分数
            self.eatCount.getComponent(cc.Label).string = 0;
            self.scoreScript.eatCount = 0;
        });

        //两个对像池，不一定
        this.lurePool = new cc.NodePool();
        this.fishPool = new cc.NodePool();
        // this.enterStage();
        // this.randomLures(5, 10);
        //this.fishScript = this.fish.getComponent('Control');

        // cc.rendererCanvas.enableDirtyRegion(false);
        // cc.rendererWebGL
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            // event.touch
            var target = event.getCurrentTarget();
            var pos = target.convertToNodeSpaceAR(event.getLocation());
            cc.log('touchX:' + pos.x);
            if (event.getLocation().x < 50 || event.getLocation.x > cc.winSize.width - 50) return;

            //敲部分
            self.knock.x = pos.x;
            self.knock.y = pos.y;
            self.knock.active = true;
            self.knockAnimation.play();

            self.disperseFish(pos);
        });
    },
    //驱散
    disperseFish: function disperseFish(pos) {
        for (var i = 0; i < this.otherFish.length; i++) {
            var _distance = cc.pDistance(pos, this.otherFish[i].getPosition());
            if (_distance < this.disperseDistance) {
                this.otherFish[i].stopAllActions();
                this.otherFish[i].getComponent('Control').strategyRun(pos, 0.3, 0.3, true);
                cc.log('disperse');
            }
        }
        var distance = cc.pDistance(pos, this.fish.getPosition());
        if (distance < this.disperseDistance) {
            this.fish.stopAllActions();
            this.fish.getComponent('Control').strategyRun(pos, 0.3, 0.3, true);
            cc.log('disperse');
        }
    },
    wantEatThink: function wantEatThink() {
        var self = this;
        self.fishScript.wantEatThink(self.lures);
        for (var i = 0; i < self.otherFish.length; i++) {
            self.otherFish[i].getComponent('Control').wantEatThink(self.lures);
        }
    },
    randomLures: function randomLures(count, interval) {
        var self = this;
        for (var i = 0; i < count; i++) {
            // for (var n = 0; n < Things.length; i++) {
            //     Things[i]
            // }
            var x = -cc.winSize.width / 2 + 50 + (cc.winSize.width - 100) * Math.random();
            self.throw_lure(x);
        }
        self.wantEatThink();
        this.schedule(function () {
            // self.randomLures();
            // 这里的 this 指向 component
            for (var i = 0; i < count; i++) {
                // for (var n = 0; n < Things.length; i++) {
                //     Things[i]
                // }
                var x = -cc.winSize.width / 2 + 50 + (cc.winSize.width - 100) * Math.random();
                self.throw_lure(x);
            }

            self.wantEatThink();
        }, interval);
    },

    enterStage: function enterStage() {
        var self = this;
        //从一个文件中取得：
        //1.其它鱼的数量
        //2.障碍的位置、数量
        //3.鱼的变量
        //4.大饵的变量
        //5.第几关
        //TODO 合并所有鱼为一种
        self.stageString.getComponent(cc.Label).string = "第" + self.stage + "关";
        if (self.stageData && self.stageData.stage === self.stage) {} else {
            for (var i = 0; i < self.stagesData.length; i++) {
                if (self.stagesData[i].stage === self.stage) {
                    self.stageData = self.stagesData[i];
                    break;
                }
            }
        }
        if (self.stageData.stone) {
            self.stone.active = true;
        } else {
            self.stone.active = false;
        }
        if (self.stageData.bigLure) {
            self.bigLure.active = true;
        } else {
            self.bigLure.active = false;
        }

        self.stageData.fish.favorite = false;
        var otherFishCount = self.stageData.otherFishCount;

        for (var i = 0; i < otherFishCount; i++) {
            var otherFish = null;
            if (self.fishPool.size() > 0) {
                // 通过 size 接口判断对象池中是否有空闲的对象
                otherFish = self.fishPool.get();
            } else {
                // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
                otherFish = cc.instantiate(self.fishPrefab);
                // self.lurePool.put(lure);
            }
            cc.log('create otherFish:' + otherFish.uuid);
            var _pos = this.getRandomPosition();
            otherFish.setPosition(_pos);

            otherFish.getComponent('Control').init(self.stageData.fish);
            // {
            //     favorite: false,
            //     max_seed: 15
            // }); //TODO 以后给一些参数

            otherFish.parent = self.node; // 将生成的敌人加入节点树

            self.otherFish.push(otherFish);
        }
        self.stageData.fish.favorite = true;
        var fish = cc.instantiate(self.fishPrefab);
        cc.log('create favorite fish :' + fish.uuid);
        var pos = this.getRandomPosition();
        fish.setPosition(pos);

        fish.getComponent('Control').init(self.stageData.fish);
        // {
        //     favorite: true,
        //     max_seed: 15
        // }); //TODO 以后给一些参数
        fish.parent = self.node; // 将生成的敌人加入节点树

        self.fish = fish;
    },
    getRandomPosition: function getRandomPosition() {
        var y = -cc.winSize.height / 2 + (cc.winSize.height - 100) * Math.random();
        var x = -cc.winSize.width / 2 + cc.winSize.width * Math.random();
        return cc.p(x, y);
    },

    throw_lure: function throw_lure(x) {
        var self = this;
        //点击后生成饵
        var lure = null;
        if (self.lurePool.size() > 0) {
            // 通过 size 接口判断对象池中是否有空闲的对象
            lure = self.lurePool.get();
        } else {
            // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            lure = cc.instantiate(self.lurePrefab);
            // self.lurePool.put(lure);
        }
        cc.log('throw_lure' + lure);
        lure.y = cc.winSize.height / 2 - 100;

        lure.getComponent('lure').init(x); //接下来就可以调用 enemy 身上的脚本进行初始化
        lure.parent = self.node; // 将生成的敌人加入节点树

        self.lures.push(lure);
    }
});

cc._RFpop();
},{}],"Knock":[function(require,module,exports){
"use strict";
cc._RFpush(module, '6981djXWnZIyrY6vL/UyAB5', 'Knock');
// Script\Knock.js

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
    },

    // use this for initialization
    onLoad: function onLoad() {},

    destory: function destory() {
        cc.log('knock completed');
        this.node.active = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RFpop();
},{}],"Loading":[function(require,module,exports){
"use strict";
cc._RFpush(module, '17cadHv4FRNUZia/ii039cz', 'Loading');
// Script\Loading.js

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

cc._RFpop();
},{}],"Menu":[function(require,module,exports){
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
},{}],"SceneManager":[function(require,module,exports){
"use strict";
cc._RFpush(module, '51205f1AfVGAr+y/sXkq9ih', 'SceneManager');
// Script\SceneManager.js

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

cc._RFpop();
},{"Loading":"Loading"}],"Score":[function(require,module,exports){
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
},{}],"StageMenu":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'eaaceTqmkBC1K3pJ+UgkLP3', 'StageMenu');
// Script\StageMenu.js

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

cc._RFpop();
},{}],"Stone":[function(require,module,exports){
"use strict";
cc._RFpush(module, '5af29gBhHtLF5gYaPGFMYC5', 'Stone');
// Script\Stone.js

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
    },

    // use this for initialization
    onLoad: function onLoad() {},
    onCollisionEnter: function onCollisionEnter(other, self) {
        cc.log('something knock stone' + other.node.group);
        if (other.node.group === 'fishG') {
            //碰到鱼
            //鱼要改变行动路线

        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RFpop();
},{}],"Timer":[function(require,module,exports){
"use strict";
cc._RFpush(module, '5ddf0KXb8FLdIM8fdfs48C1', 'Timer');
// Script\Timer.js

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

cc._RFpop();
},{}],"lure":[function(require,module,exports){
"use strict";
cc._RFpush(module, '98691dXmpBOwqyJ9EURgrAz', 'lure');
// Script\lure.js

var Game = require('Game');
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
    },

    // use this for initialization
    onLoad: function onLoad() {
        var self = this;
        this.anim = this.getComponent(cc.Animation);
        //向底部移动
        var target_x = this.node.x;
        var target_y = -cc.winSize.height / 2;
        //cc.log('target_x,target_y:'+target_x+','+target_y);
        var downSpeed = -30 - Math.random() * 30;
        cc.log('downspeed=' + downSpeed);
        //这种形式不对，要改一下，不能用缓动，不然有时在update时不能发现这个NODE
        var moveByLeft = cc.moveBy(1.5, cc.p(-40, downSpeed), 10);
        var moveByRight = cc.moveBy(1.5, cc.p(40, downSpeed), 10);

        this.node.runAction(cc.repeatForever(cc.sequence(moveByLeft, moveByRight)));
    },
    init: function init(x) {
        this.node.x = x; //-cc.winSize.width/2+ Math.random()*cc.winSize.width ;
        cc.log(this.node.uuid + ' is created');
    },

    // called every frame, uncomment this function to activate update callback
    lateUpdate: function lateUpdate(dt) {
        var self = this;
        if (this.node.y < -cc.winSize.height / 2 + 10) {
            //到底了
            cc.log(' over ' + this.node.uuid + ' this.node.y:' + this.node.y);
            self.deteriorate();
            // this.node.stopAllActions();
            // this.anim.stop();
            // //饵到底后变化
            // this.scheduleOnce(function() {
            //     let finished = cc.callFunc(function(target, ind) {
            //         // self.node.destroy();
            //         cc.find('Canvas').emit('lure_destory', {
            //             uuid: self.node.uuid
            //         });
            //     }, this, 0);
            //     let tintBy = cc.tintTo(10, 0, 0, 0);
            //     self.node.runAction(cc.sequence(tintBy, finished));

            // }, 1);
            var c = cc.find('Canvas');
            c.emit('lure_over', {
                msg: 'Hello, this is Cocos Creator' + self.node.uuid
            });
        }
        // if(this.node.y<-300 && this.node.y>-310)
        //   cc.log(this.node.uuid+'->'+this.node.y);
        this.node.y = cc.clampf(this.node.y, -cc.winSize.height / 2 + 10, cc.winSize.height / 2 - 100);
    },
    //变质过程
    deteriorate: function deteriorate() {
        var self = this;
        this.node.stopAllActions();
        this.anim.stop();
        //饵到底后变化
        this.scheduleOnce(function () {
            var finished = cc.callFunc(function (target, ind) {
                // self.node.destroy();
                cc.find('Canvas').emit('lure_destroy', {
                    uuid: self.node.uuid
                });
            }, this, 0);
            var tintBy = cc.tintTo(10, 0, 0, 0);
            self.node.runAction(cc.sequence(tintBy, finished));
        }, 1);
    },
    onCollisionEnter: function onCollisionEnter(other, self) {

        if (other.node.group === 'fishG') {
            cc.log('fish.node.group' + other.node.group);
            //碰到鱼
            this.node.stopAllActions();

            if (other.getComponent('Control').favorite) {
                this.node.dispatchEvent(new cc.Event.EventCustom('lure_eated', true));
            }

            cc.find('Canvas').emit('lure_destroy', {
                uuid: self.node.uuid
            });
        }
        if (other.node.group === 'stoneG') {
            cc.log('lure knock stone ' + other.node.group);
            //碰到障碍
            this.deteriorate();
        }
    }
});

cc._RFpop();
},{"Game":"Game"}]},{},["Loading","Game","Control","SceneManager","Camera","Stone","Timer","Knock","Score","lure","Menu","Board","Biglure","StageMenu"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L0NvY29zQ3JlYXRvci9yZXNvdXJjZXMvYXBwLmFzYXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImFzc2V0cy9TY3JpcHQvQmlnbHVyZS5qcyIsImFzc2V0cy9TY3JpcHQvQm9hcmQuanMiLCJhc3NldHMvU2NyaXB0L0NhbWVyYS5qcyIsImFzc2V0cy9TY3JpcHQvQ29udHJvbC5qcyIsImFzc2V0cy9TY3JpcHQvR2FtZS5qcyIsImFzc2V0cy9TY3JpcHQvS25vY2suanMiLCJhc3NldHMvU2NyaXB0L0xvYWRpbmcuanMiLCJhc3NldHMvU2NyaXB0L01lbnUuanMiLCJhc3NldHMvU2NyaXB0L1NjZW5lTWFuYWdlci5qcyIsImFzc2V0cy9TY3JpcHQvU2NvcmUuanMiLCJhc3NldHMvU2NyaXB0L1N0YWdlTWVudS5qcyIsImFzc2V0cy9TY3JpcHQvU3RvbmUuanMiLCJhc3NldHMvU2NyaXB0L1RpbWVyLmpzIiwiYXNzZXRzL1NjcmlwdC9sdXJlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnY2ZkMGVRbmtWbEpvNmNUSU14cE1BV0MnLCAnQmlnbHVyZScpO1xuLy8gU2NyaXB0XFxCaWdsdXJlLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgc3BlZWQ6IDEsXG4gICAgICAgIGx1cmVQZXI6IDEsXG4gICAgICAgIGludGVydmFsOiA1XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8v6KGM5Li677yaMS7lvIDlp4vml7blh7rnjrDlnKjmqKrovbTnmoTmn5DkuKrngrlcbiAgICAgICAgLy8yLuWQkeS4gOS4quaWueW8j+enu+WKqO+8jOenu+WKqOW9ouW8j+WPr+iDveaYr+maj+acuueahFxuICAgICAgICAvLzMu5LiN5Lya56e75Ye65bGP5bmVXG4gICAgICAgIC8vNC7ngrnlh7vlkI7vvIzmlL7kuIvkuIDvvIjlpJrvvInkuKrppbXvvIznhLblkI7ov5nkuKrlpKfppbXmtojlpLFcbiAgICAgICAgLy81LuW9k+S4gOWumuaXtumXtOmXtOmalOWQjuWGjeWHuueOsO+8iOaaguWumu+8iVxuICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSAxO1xuICAgICAgICB0aGlzLnRocm93Q291bnQgPSAwO1xuXG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKHNlbGYubm9kZS5vcGFjaXR5ID09PSAyNTUpIHtcbiAgICAgICAgICAgICAgICBjYy5sb2coJ3Rocm93X2x1cmUnKTtcbiAgICAgICAgICAgICAgICAvL+WPkeWHuuS6i+S7tlxuICAgICAgICAgICAgICAgIHZhciBldmVudEN1c3RvbSA9IG5ldyBjYy5FdmVudC5FdmVudEN1c3RvbSgndGhyb3dfbHVyZScsIHRydWUpO1xuICAgICAgICAgICAgICAgIGV2ZW50Q3VzdG9tLnNldFVzZXJEYXRhKHNlbGYubm9kZS54KTtcbiAgICAgICAgICAgICAgICBzZWxmLm5vZGUuZGlzcGF0Y2hFdmVudChldmVudEN1c3RvbSk7XG4gICAgICAgICAgICAgICAgLy/orqHph49cbiAgICAgICAgICAgICAgICBzZWxmLnRocm93Q291bnQrKztcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi50aHJvd0NvdW50ID09PSBzZWxmLmx1cmVQZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5ub2RlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRocm93Q291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAvL+S4i+asoeWHuueOsOaXtumXtFxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNjaGVkdWxlT25jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubm9kZS5vcGFjaXR5ID0gMjU1O1xuICAgICAgICAgICAgICAgICAgICB9LCBzZWxmLmludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgdmFyIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyA1MCArIChjYy53aW5TaXplLndpZHRoIC0gNTApICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgdGhpcy5ub2RlLnggPSB4O1xuICAgIH0sXG5cbiAgICBzdHJhdGVneVJ1bjogZnVuY3Rpb24gc3RyYXRlZ3lSdW4oKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5ub2RlLnggKyB0aGlzLnNwZWVkICogdGhpcy5tb3ZlRGlyZWN0aW9uO1xuXG4gICAgICAgIGlmICh4ID4gY2Mud2luU2l6ZS53aWR0aCAvIDIgLSA1MCkge1xuXG4gICAgICAgICAgICB4ID0gY2Mud2luU2l6ZS53aWR0aCAvIDIgLSA1MDtcbiAgICAgICAgICAgIHRoaXMubW92ZURpcmVjdGlvbiA9IC10aGlzLm1vdmVEaXJlY3Rpb247XG4gICAgICAgICAgICBjYy5sb2coJ3R1cm4gbGVmdCBhbmQgeDonICsgeCArICcgbW92ZURpcmVjdGlvbjonICsgdGhpcy5tb3ZlRGlyZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoeCA8IC1jYy53aW5TaXplLndpZHRoIC8gMiArIDUwKSB7XG5cbiAgICAgICAgICAgIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyA1MDtcbiAgICAgICAgICAgIHRoaXMubW92ZURpcmVjdGlvbiA9IC10aGlzLm1vdmVEaXJlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub2RlLnggPSB4O1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgICAgIHRoaXMuc3RyYXRlZ3lSdW4oKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2IyM2E0MUUvT2hCWUxKRVREUWZ0TmlRJywgJ0JvYXJkJyk7XG4vLyBTY3JpcHRcXEJvYXJkLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBzdGFyMTogY2MuTm9kZSxcbiAgICAgICAgc3RhcjI6IGNjLk5vZGUsXG4gICAgICAgIHN0YXIzOiBjYy5Ob2RlLFxuICAgICAgICBzdGFnZVN0cmluZzogY2MuTm9kZSxcbiAgICAgICAgc3RhZ2VTY29yZTogY2MuTm9kZSxcbiAgICAgICAgc3RhZ2VCZXN0U2NvcmU6IGNjLk5vZGVcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHJlc3VsdCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vcmVzdWx0LnRpbWVcbiAgICAgICAgLy9yZXN1bHQuZWF0bHVyZUNvdW50XG4gICAgICAgIC8vcmVzdWx0LnN0YWdlXG4gICAgICAgIHZhciBzdGFnZSA9IHJlc3VsdC5zdGFnZTtcbiAgICAgICAgc2VsZi5zdGFnZSA9IHN0YWdlO1xuICAgICAgICBzZWxmLnN0YWdlU3RyaW5nLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gXCLnrKxcIiArIHN0YWdlICsgXCLlhbNcIjtcbiAgICAgICAgc2VsZi5jdXJyU3RhZ2UgPSByZXN1bHQ7XG4gICAgICAgIHNlbGYuc3RhZ2VTY29yZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IHJlc3VsdC5zY29yZTtcbiAgICAgICAgc2VsZi5nZXRTdGFycyhyZXN1bHQuc2NvcmUpO1xuICAgICAgICB2YXIgc3RhZ2VzdHJpbmcgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0YWdlJyArIHN0YWdlKTtcbiAgICAgICAgaWYgKHN0YWdlc3RyaW5nKSB7XG4gICAgICAgICAgICB2YXIgc3RhZ2VTdG9yYWdlID0gSlNPTi5wYXJzZShzdGFnZXN0cmluZyk7XG5cbiAgICAgICAgICAgIHNlbGYuc3RhZ2VCZXN0U2NvcmUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBzdGFnZVN0b3JhZ2UuYmVzdFNjb3JlO1xuICAgICAgICAgICAgc2VsZi5iZXN0U2NvcmUgPSBzdGFnZVN0b3JhZ2UuYmVzdFNjb3JlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5iZXN0U2NvcmUgPSAwO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRTdGFyczogZnVuY3Rpb24gZ2V0U3RhcnMoc2NvcmUpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgc3RhZ2VzRGF0YSA9IGNjLmZpbmQoJ0NhbnZhcycpLmdldENvbXBvbmVudCgnR2FtZScpLnN0YWdlc0RhdGE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhZ2VzRGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHN0YWdlc0RhdGFbaV0uc3RhZ2UgPT09IHNlbGYuc3RhZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPj0gc3RhZ2VzRGF0YVtpXS5zdGFyMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXIxLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcjEuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA+PSBzdGFnZXNEYXRhW2ldLnN0YXIyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcjIuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFyMi5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNjb3JlID49IHN0YWdlc0RhdGFbaV0uc3RhcjMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFyMy5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXIzLmNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/kuIvkuIDlhbNcbiAgICBjb21tYW5kOiBmdW5jdGlvbiBjb21tYW5kKGV2ZW50LCBjdXN0b21FdmVudERhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNhdmVEYXRhKCk7XG4gICAgICAgIGNjLmxvZyhjdXN0b21FdmVudERhdGEpO1xuICAgICAgICBzZWxmLm5vZGUuZGlzcGF0Y2hFdmVudChuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oY3VzdG9tRXZlbnREYXRhLCB0cnVlKSk7XG4gICAgICAgIHNlbGYubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIG1lbnU6IGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgLy8gICAgIHNlbGYuc2F2ZURhdGEoKTtcbiAgICAvLyAgICAgc2VsZi5ub2RlLmRpc3BhdGNoRXZlbnQobmV3IGNjLkV2ZW50LkV2ZW50Q3VzdG9tKCdtZW51JywgdHJ1ZSkpO1xuICAgIC8vICAgICBzZWxmLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgLy8gfSxcbiAgICBzYXZlRGF0YTogZnVuY3Rpb24gc2F2ZURhdGEoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy/kv53lrZjmnKzlhbPmlbDmja5cbiAgICAgICAgaWYgKHNlbGYuY3VyclN0YWdlLnNjb3JlID4gc2VsZi5iZXN0U2NvcmUpIHtcbiAgICAgICAgICAgIHNlbGYuYmVzdFNjb3JlID0gc2VsZi5jdXJyU3RhZ2Uuc2NvcmU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0YWdlSnNvbiA9IHtcbiAgICAgICAgICAgIGJlc3RTY29yZTogc2VsZi5iZXN0U2NvcmVcbiAgICAgICAgfTtcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdGFnZScgKyBzZWxmLnN0YWdlLCBKU09OLnN0cmluZ2lmeShzdGFnZUpzb24pKTtcbiAgICB9LFxuICAgIC8vIHJlbG9hZDpmdW5jdGlvbigpe1xuICAgIC8vICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgLy8gICAgIHNlbGYuc2F2ZURhdGEoKTtcbiAgICAvLyAgICAgc2VsZi5ub2RlLmRpc3BhdGNoRXZlbnQobmV3IGNjLkV2ZW50LkV2ZW50Q3VzdG9tKCdyZWxvYWQnLCB0cnVlKSk7XG4gICAgLy8gICAgIHNlbGYubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAvLyB9LFxuICAgIC8v5pqC5pe2566A5Y2V6K6h566X77yM5Y+q566X5pyq6KKr5ZCD5Yiw55qE6aW15pWwXG4gICAgY291bnRTdGFyOiBmdW5jdGlvbiBjb3VudFN0YXIoZWF0THVyZUNvdW50LCB0aHJvd0x1cmVDb3VudCkge1xuICAgICAgICB2YXIgc2NvcmUgPSB0aHJvd0x1cmVDb3VudCAtIGVhdEx1cmVDb3VudDtcbiAgICAgICAgaWYgKHNjb3JlID09PSAwKSB7fVxuICAgICAgICBpZiAoc2NvcmUgPiAwICYmIHNjb3JlIDw9IDMpIHt9XG4gICAgICAgIGlmIChzY29yZSA+IDMpIHt9XG4gICAgICAgIC8v5pyA5ZCO5Yip55SoZ2FtZeeahOWKn+iDveivu+WPlmxvY2Fsc3RvcmFnZeS/neWtmOe7k+aenFxuICAgIH1cblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAgIC8vIH0sXG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzUzNzFldVNHdDlIWjU2N2tLd3hvVkI3JywgJ0NhbWVyYScpO1xuLy8gU2NyaXB0XFxDYW1lcmEuanNcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgXCJkZWZhdWx0XCI6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG5cbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgICBcImRlZmF1bHRcIjogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHdpblNpemUgPSBjYy53aW5TaXplO1xuICAgICAgICB0aGlzLnNjcmVlbk1pZGRsZSA9IGNjLnYyKHdpblNpemUud2lkdGggLyAyLCB3aW5TaXplLmhlaWdodCAvIDIpO1xuXG4gICAgICAgIHRoaXMuYm91bmRpbmdCb3ggPSBjYy5yZWN0KDAsIDAsIHRoaXMubWFwLndpZHRoLCB0aGlzLm1hcC5oZWlnaHQpO1xuXG4gICAgICAgIHRoaXMubWlueCA9IC0odGhpcy5ib3VuZGluZ0JveC54TWF4IC0gd2luU2l6ZS53aWR0aCk7XG4gICAgICAgIHRoaXMubWF4eCA9IHRoaXMuYm91bmRpbmdCb3gueE1pbjtcbiAgICAgICAgdGhpcy5taW55ID0gLSh0aGlzLmJvdW5kaW5nQm94LnlNYXggLSB3aW5TaXplLmhlaWdodCk7XG4gICAgICAgIHRoaXMubWF4eSA9IHRoaXMuYm91bmRpbmdCb3gueU1pbjtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5ub2RlLmNvbnZlcnRUb1dvcmxkU3BhY2VBUihjYy5WZWMyLlpFUk8pO1xuICAgICAgICB2YXIgdGFyZ2V0UG9zID0gdGhpcy50YXJnZXQuY29udmVydFRvV29ybGRTcGFjZUFSKGNjLlZlYzIuWkVSTyk7XG4gICAgICAgIHZhciBkaWYgPSBwb3Muc3ViKHRhcmdldFBvcyk7XG5cbiAgICAgICAgdmFyIGRlc3QgPSBkaWYuYWRkKHRoaXMuc2NyZWVuTWlkZGxlKTtcblxuICAgICAgICBkZXN0LnggPSBjYy5jbGFtcGYoZGVzdC54LCB0aGlzLm1pbngsIHRoaXMubWF4eCk7XG4gICAgICAgIGRlc3QueSA9IGNjLmNsYW1wZihkZXN0LnksIHRoaXMubWlueSwgdGhpcy5tYXh5KTtcblxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24gPSB0aGlzLm5vZGUucGFyZW50LmNvbnZlcnRUb05vZGVTcGFjZUFSKGRlc3QpO1xuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNGJmNGU2dzR5cE53S05kbWxYR1lBSmUnLCAnQ29udHJvbCcpO1xuLy8gU2NyaXB0XFxDb250cm9sLmpzXG5cbnZhciBGaXNoUnVuU3RhdHVzID0gY2MuRW51bSh7XG4gICAgc3RvcDogMCxcbiAgICBjb250cm9sOiAxLFxuICAgIGZpbmQ6IDIsXG4gICAgcmFuZG9tOiAzXG59KTtcbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy/ov5DooYzmgKfvvIwwfjHkuYvpl7TvvIzotorlsI/otorniLHliqhcbiAgICAgICAgbW92ZV9yYXRlOiAwLjQsXG4gICAgICAgIG1heF9zZWVkOiAxMCxcbiAgICAgICAgc3BlZWQ6IDEwLFxuICAgICAgICB0dXJuX3NwZWVkOiA1LFxuICAgICAgICBpZGxlX3RpbWU6IDUsXG4gICAgICAgIGZhdm9yaXRlOiBmYWxzZSxcbiAgICAgICAgc3RhcjogY2MuTm9kZSxcbiAgICAgICAgbHVyZToge1xuICAgICAgICAgICAgdHlwZTogY2MuTm9kZSxcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuc3RvcDtcbiAgICAgICAgLyogICBcbiAgICAgICAg6bG855qE54m55oCn77yaXG4gICAgICAgIDEu6Ieq5bex5ri477yM5Lya5YGc5LiA5Lya5YS/77yM5YaN5ri4XG4gICAgICAgIDIu5Lya5om+56a76Ieq5bex5pyA6L+R55qE6aW1XG4gICAgICAgIDMu6aW155qE5Ye6546w5Lya6K6p6bG85ZCR5YW25ri46L+RXG4gICAgICAgICovXG4gICAgICAgIC8vIGFkZCBrZXkgZG93biBhbmQga2V5IHVwIGV2ZW50XG5cbiAgICAgICAgY2Muc3lzdGVtRXZlbnQub24oY2MuU3lzdGVtRXZlbnQuRXZlbnRUeXBlLktFWV9ET1dOLCB0aGlzLm9uS2V5RG93biwgdGhpcyk7XG4gICAgICAgIGNjLnN5c3RlbUV2ZW50Lm9uKGNjLlN5c3RlbUV2ZW50LkV2ZW50VHlwZS5LRVlfVVAsIHRoaXMub25LZXlVcCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5hbmltID0gdGhpcy5nZXRDb21wb25lbnQoY2MuQW5pbWF0aW9uKTtcbiAgICAgICAgdGhpcy5tb3ZlRGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5zcHJpdGUgPSB0aGlzLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuXG4gICAgICAgIC8v5q+PNeenkuaDs+S4gOS4i++8jOaYr+S4jeaYr+imgea4uFxuICAgICAgICB0aGlzLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNjLmxvZygnZmlzaCBzdGF0dXM6JyArIHNlbGYucnVuX3N0YXR1cyk7XG4gICAgICAgICAgICAvL+S7juWBnOatoueKtuaAgSDov5vlhaUg6Ieq55Sx6L+Q5YqoXG4gICAgICAgICAgICBpZiAoc2VsZi5ydW5fc3RhdHVzID09PSBGaXNoUnVuU3RhdHVzLnN0b3ApIHtcbiAgICAgICAgICAgICAgICAvL+afkOenjeWxnuaAp++8jOaYr+S4jeaYr+eIseWKqFxuICAgICAgICAgICAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gdGhpcy5tb3ZlX3JhdGUpIHNlbGYucmFuZG9tUnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYuaWRsZV90aW1lICogTWF0aC5yYW5kb20oKSk7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHByb3BlcnRpZXMpIHtcbiAgICAgICAgLy/lkIjlubbkuIDkupvlsZ7mgKcgbWl4aW4/XG4gICAgICAgIGNjLmxvZyh0aGlzKTtcbiAgICAgICAgY2MuanMubWl4aW4odGhpcywgcHJvcGVydGllcyk7XG4gICAgICAgIC8vdGhpcy5mYXZvcml0ZT1wcm9wZXJ0aWVzLmZhdm9yaXRlO1xuXG4gICAgICAgIGlmICghdGhpcy5mYXZvcml0ZSkge1xuICAgICAgICAgICAgdGhpcy5zdGFyLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNjLmxvZygndGhpcy5ub2RlLnBhcmVudCcpO1xuICAgICAgICBjYy5sb2codGhpcy5ub2RlLnBhcmVudCk7XG4gICAgICAgIC8vIGNjLmxvZyh0aGlzKTtcbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgY2Muc3lzdGVtRXZlbnQub2ZmKGNjLlN5c3RlbUV2ZW50LkV2ZW50VHlwZS5LRVlfRE9XTiwgdGhpcy5vbktleURvd24sIHRoaXMpO1xuICAgICAgICBjYy5zeXN0ZW1FdmVudC5vZmYoY2MuU3lzdGVtRXZlbnQuRXZlbnRUeXBlLktFWV9VUCwgdGhpcy5vbktleVVwLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgb25LZXlEb3duOiBmdW5jdGlvbiBvbktleURvd24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgZGlyY3Rpb25fcm90YXRpb24gPSAwO1xuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSAhPT0gdGhpcy5tb3ZlRGlyZWN0aW9uKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5sZWZ0OlxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuY291bnRSb3RhdGlvbigyNzApO1xuICAgICAgICAgICAgICAgICAgICBkaXJjdGlvbl9yb3RhdGlvbiA9IDI3MDtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5yaWdodDpcblxuICAgICAgICAgICAgICAgICAgICBkaXJjdGlvbl9yb3RhdGlvbiA9IDkwO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnVwOlxuXG4gICAgICAgICAgICAgICAgICAgIGRpcmN0aW9uX3JvdGF0aW9uID0gMDtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5hbmltLnBsYXkoJ2Zpc2hfdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZG93bjpcbiAgICAgICAgICAgICAgICAgICAgZGlyY3Rpb25fcm90YXRpb24gPSAxODA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnNwYWNlOlxuICAgICAgICAgICAgICAgICAgICAvLyBjYy5sb2coJ2RkJyt0aGlzLmx1cmUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVhdEFjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNjLmxvZygndGhpcy5tb3ZlRGlyZWN0aW9uOicgKyB0aGlzLm1vdmVEaXJlY3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5hY3Rpb25Db250cm9sKGRpcmN0aW9uX3JvdGF0aW9uLCBldmVudC5rZXlDb2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vdGhpcy5jb3VudFJvdGF0aW9uKGRpcmN0aW9uX3JvdGF0aW9uKTtcbiAgICAgICAgdGhpcy5tb3ZlRGlyZWN0aW9uID0gZXZlbnQua2V5Q29kZTtcbiAgICB9LFxuICAgIGNvdW50QW5nbGU6IGZ1bmN0aW9uIGNvdW50QW5nbGUodGFyZ2V0LCBzZWxmKSB7XG4gICAgICAgIHZhciBsZW5feSA9IHRhcmdldC55IC0gc2VsZi55O1xuICAgICAgICB2YXIgbGVuX3ggPSB0YXJnZXQueCAtIHNlbGYueDtcblxuICAgICAgICB2YXIgdGFuX3l4ID0gTWF0aC5hYnMobGVuX3kpIC8gTWF0aC5hYnMobGVuX3gpO1xuICAgICAgICB2YXIgYW5nbGUgPSAwO1xuICAgICAgICBpZiAobGVuX3kgPiAwICYmIGxlbl94IDwgMCkge1xuICAgICAgICAgICAgYW5nbGUgPSBNYXRoLmF0YW4odGFuX3l4KSAqIDE4MCAvIE1hdGguUEkgLSA5MDtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5feSA+IDAgJiYgbGVuX3ggPiAwKSB7XG4gICAgICAgICAgICBhbmdsZSA9IDkwIC0gTWF0aC5hdGFuKHRhbl95eCkgKiAxODAgLyBNYXRoLlBJO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbl95IDwgMCAmJiBsZW5feCA8IDApIHtcbiAgICAgICAgICAgIGFuZ2xlID0gLU1hdGguYXRhbih0YW5feXgpICogMTgwIC8gTWF0aC5QSSAtIDkwO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbl95IDwgMCAmJiBsZW5feCA+IDApIHtcbiAgICAgICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuKHRhbl95eCkgKiAxODAgLyBNYXRoLlBJICsgOTA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFuZ2xlO1xuICAgIH0sXG4gICAgZWF0QWN0aW9uOiBmdW5jdGlvbiBlYXRBY3Rpb24oKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHRoaXMubHVyZSkge1xuICAgICAgICAgICAgdmFyIF9yZXQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghX3RoaXMubHVyZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLndhbnRFYXRUaGluaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMubHVyZSA9PSB1bmRlZmluZWQgfHwgIV90aGlzLmx1cmUgfHwgX3RoaXMubHVyZSA9PT0gbnVsbCB8fCAhX3RoaXMubHVyZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v5Zyo6L+955qE6L+H56iL5Lit77yM6aW15Zug5Li65p+Q56eN5Y6f5Zug5rKh5LqG77yMXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnN0b3A7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2OiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYy5sb2coJyB3YW50IGVhdCAnICsgX3RoaXMubHVyZS51dWlkICsgJyAnICsgX3RoaXMubHVyZS54KTtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IF90aGlzO1xuICAgICAgICAgICAgICAgIC8vIGxldCBsZW5feSA9IHRoaXMubHVyZS55IC0gdGhpcy5ub2RlLnk7XG4gICAgICAgICAgICAgICAgLy8gbGV0IGxlbl94ID0gdGhpcy5sdXJlLnggLSB0aGlzLm5vZGUueDtcblxuICAgICAgICAgICAgICAgIC8vIGxldCB0YW5feXggPSBNYXRoLmFicyhsZW5feSkgLyBNYXRoLmFicyhsZW5feCk7XG4gICAgICAgICAgICAgICAgLy8gbGV0IGFuZ2xlID0gMDtcbiAgICAgICAgICAgICAgICAvLyBpZiAobGVuX3kgPiAwICYmIGxlbl94IDwgMCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBhbmdsZSA9IE1hdGguYXRhbih0YW5feXgpICogMTgwIC8gTWF0aC5QSSAtIDkwO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAobGVuX3kgPiAwICYmIGxlbl94ID4gMCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBhbmdsZSA9IDkwIC0gTWF0aC5hdGFuKHRhbl95eCkgKiAxODAgLyBNYXRoLlBJO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAobGVuX3kgPCAwICYmIGxlbl94IDwgMCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBhbmdsZSA9IC1NYXRoLmF0YW4odGFuX3l4KSAqIDE4MCAvIE1hdGguUEkgLSA5MDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKGxlbl95IDwgMCAmJiBsZW5feCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgYW5nbGUgPSBNYXRoLmF0YW4odGFuX3l4KSAqIDE4MCAvIE1hdGguUEkgKyA5MDtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gX3RoaXMuY291bnRBbmdsZShfdGhpcy5sdXJlLCBfdGhpcy5ub2RlKTtcbiAgICAgICAgICAgICAgICAvLyAgY2MubG9nKCdhbmdsZTonK2FuZ2xlKTtcblxuICAgICAgICAgICAgICAgIHZhciB4XyA9IE1hdGguY29zKGFuZ2xlKSAqIF90aGlzLnNwZWVkO1xuICAgICAgICAgICAgICAgIHZhciB5XyA9IE1hdGguc2luKGFuZ2xlKSAqIF90aGlzLnNwZWVkO1xuICAgICAgICAgICAgICAgIC8vIGNjLmxvZygneF8seV86Jyt4XysnLCcreV8pO1xuXG4gICAgICAgICAgICAgICAgdmFyIGZpbmlzaGVkID0gY2MuY2FsbEZ1bmMoZnVuY3Rpb24gKHRhcmdldCwgaW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY2MubG9nKCdmaW5pc2hlZCcpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2MubG9nKCd0aGlzLmx1cmU6Jyt0aGlzLmx1cmUucG9zaXRpb24ueCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmx1cmUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzppbXov5jlnKjvvIznu6fnu63lkINcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZWF0QWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL+aJvuWPpuS4gOS4qumltVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNhbnZhc1NjcmlwdCA9IGNjLmZpbmQoJ0NhbnZhcycpLmdldENvbXBvbmVudCgnR2FtZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbnZhc1NjcmlwdC5sdXJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi53YW50RWF0VGhpbmsoY2FudmFzU2NyaXB0Lmx1cmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYy5sb2coJyBmaW5kICcrY2FudmFzU2NyaXB0Lmx1cmVzWzBdLnV1aWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbGYubHVyZT1jYW52YXNTY3JpcHQubHVyZXNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VsZi5lYXRBY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuc3RvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBfdGhpcywgMCk7XG4gICAgICAgICAgICAgICAgLy/ov5nkuKrml7bpl7TopoHlj5jljJZcbiAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBjYy5wRGlzdGFuY2UoX3RoaXMubm9kZS5nZXRQb3NpdGlvbigpLCBfdGhpcy5sdXJlLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgIHZhciBzcGVlZCA9IF90aGlzLm1heF9zZWVkICogMC41O1xuICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBzcGVlZCA9IF90aGlzLm1heF9zZWVkICogMC4xNTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgODApIHtcbiAgICAgICAgICAgICAgICAgICAgc3BlZWQgPSBfdGhpcy5tYXhfc2VlZCAqIDAuMDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNjLmxvZygnbmV3IHNwZWVkOicgKyBzcGVlZCk7XG4gICAgICAgICAgICAgICAgdmFyIHJvdGF0ZVRvID0gY2Mucm90YXRlVG8oc3BlZWQgLyAyLCBhbmdsZSk7IC8vY2Mucm90YXRlVG8oMC41LCBhbmdsZSk7XG4gICAgICAgICAgICAgICAgdmFyIGZvbGxvd0FjdGlvbiA9IGNjLm1vdmVUbyhzcGVlZCwgX3RoaXMubHVyZSk7XG4gICAgICAgICAgICAgICAgX3RoaXMubm9kZS5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIC8v5a2m5Lmg55qE6L+H56iL77yM5b2T5pKe5Yiw5ZCO77yM6K6w5b2V5LqG6Zqc56KN77yM5YaN5oCd6ICD5pe26KaB6ICD6JmR6Zqc56KNXG4gICAgICAgICAgICAgICAgLy8gaWYgKHNlbGYucGF0aFBvbHlnb25zKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGxldCBwYXRocyA9IHNlbGYuZmluZFBhdGgoc2VsZi5ub2RlLmdldFBvc2l0aW9uKCksIHNlbGYubHVyZS5nZXRQb3NpdGlvbigpLCBzZWxmLnBhdGhQb2x5Z29ucywgc2VsZi5zdG9uZVBvbHlnb25zLCBbXSk7XG4gICAgICAgICAgICAgICAgLy8gICAgIGxldCBwYXRoID0gc2VsZi5zaG9ydFBhdGgocGF0aHMpO1xuICAgICAgICAgICAgICAgIC8vICAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkIHx8IHBhdGggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNjLmxvZygnZGlyZWN0IHBhdGgnKTtcblxuICAgICAgICAgICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY2MubG9nKHBhdGhzKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNjLmxvZygnZmluZCBwYXRoIHdpdGggc3RvbmUgJyk7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjYy5sb2cocGF0aCk7XG5cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGZvbGxvd0FjdGlvbiA9IGNjLmNhcmRpbmFsU3BsaW5lVG8oc3BlZWQsW2NjLnAoLTIwMiwwKSxjYy5wKDAsMCldLDApOy8vY2MuY2FyZGluYWxTcGxpbmVUbyhzcGVlZCwgcGF0aCwgMCk7IC8vdGVuc2lvbue0p+W8oOW6pu+8jOimgeiAg+mHj+S4gOS4i1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgcm90YXRlVG8gPSBjYy5yb3RhdGVUbyhzcGVlZCAsIGFuZ2xlKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24oY2Muc3Bhd24oZm9sbG93QWN0aW9uLCBjYy5zZXF1ZW5jZShyb3RhdGVUbywgZmluaXNoZWQpKSk7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgX3RoaXMubm9kZS5ydW5BY3Rpb24oY2Muc3Bhd24oZm9sbG93QWN0aW9uLCBjYy5zZXF1ZW5jZShyb3RhdGVUbywgZmluaXNoZWQpKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBmb2xsb3dBY3Rpb24uZWFzaW5nKGNjLmVhc2VRdWFydGljQWN0aW9uSW4oKSk7XG5cbiAgICAgICAgICAgICAgICAvL+WBnOatouS5i+WJjeeahOWKqOS9nO+8jOi9rOiAjOaJp+ihjOS4i+mdoueahOWKqOS9nFxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdjogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3JldCA9PT0gJ29iamVjdCcpIHJldHVybiBfcmV0LnY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnN0b3A7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8v5Lu75oSP5ri4Ly/kuZ/lj6/og73lgZzkuIvmnaVcbiAgICByYW5kb21SdW46IGZ1bmN0aW9uIHJhbmRvbVJ1bigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgeCA9IC1jYy53aW5TaXplLndpZHRoIC8gMiArIGNjLndpblNpemUud2lkdGggKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICB2YXIgeSA9IC1jYy53aW5TaXplLmhlaWdodCAvIDIgKyAoY2Mud2luU2l6ZS5oZWlnaHQgLSAxMDApICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgdmFyIHNwZWVkID0gdGhpcy5tYXhfc2VlZCAqIChNYXRoLnJhbmRvbSgpICogMC44ICsgMC4yKTtcbiAgICAgICAgY2MubG9nKCdmaXNoIHJhbmRvbSBydW4gJyArIHggKyAnLCcgKyB5ICsgJyBhdCAnICsgc3BlZWQpO1xuICAgICAgICB2YXIgbW92ZVRvID0gY2MubW92ZVRvKHNwZWVkLCBjYy5wKHgsIHkpKTtcblxuICAgICAgICB2YXIgZmluaXNoZWQgPSBjYy5jYWxsRnVuYyhmdW5jdGlvbiAodGFyZ2V0LCBpbmQpIHtcbiAgICAgICAgICAgIHNlbGYucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuc3RvcDtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBhbmdsZSA9IHRoaXMuY291bnRBbmdsZShjYy5wKHgsIHkpLCB0aGlzLm5vZGUpO1xuICAgICAgICBjYy5sb2coJ2FuZ2xlOicgKyBhbmdsZSk7XG5cbiAgICAgICAgdmFyIHJvdGF0ZVRvID0gY2Mucm90YXRlVG8oMC4yNSArIE1hdGgucmFuZG9tKCkgKiAyLCBhbmdsZSk7XG4gICAgICAgIHRoaXMucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMucmFuZG9tOyAvL+eKtuaAgeWPmOWMluS6hlxuICAgICAgICB2YXIgcmFuZG9tQWN0aW9uID0gY2Muc3Bhd24ocm90YXRlVG8sIGNjLnNlcXVlbmNlKG1vdmVUbywgZmluaXNoZWQpKTtcbiAgICAgICAgcmFuZG9tQWN0aW9uLnNldFRhZyhGaXNoUnVuU3RhdHVzLnJhbmRvbSk7XG4gICAgICAgIC8vIGNjLmxvZyhyYW5kb21BY3Rpb24pO1xuICAgICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKHJhbmRvbUFjdGlvbik7XG4gICAgfSxcbiAgICAvL+WvueaJgOaciemltei/m+ihjOivhOS8sO+8jOaJvuWIsOacgOaDs+WQg+acgOi/keeahOS4gOS4qlxuICAgIHdhbnRFYXRUaGluazogZnVuY3Rpb24gd2FudEVhdFRoaW5rKGx1cmVzKSB7XG4gICAgICAgIGlmIChsdXJlcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbHVyZXMgPSBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoJ0dhbWUnKS5sdXJlczsgLy9ub2RlXG4gICAgICAgICAgICBjYy5sb2coJ2ZpbmQgbHVyZXMgZnJvbSBjYW52YXMnKTtcbiAgICAgICAgfVxuICAgICAgICBjYy5sb2coJ2x1cmVzOicpO1xuICAgICAgICBjYy5sb2cobHVyZXMpO1xuICAgICAgICBpZiAoIWx1cmVzKSB7XG4gICAgICAgICAgICBjYy5sb2coJ3VuZGVmaW5lZCBsdXJlcycpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsdXJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLmZpbmQ7IC8vZmluZCBsdXJlXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRpc3RhbmNlID0gOTk5OTtcbiAgICAgICAgLy/lr7nkuo7ot53nprvlt67kuI3lpJrnmoTvvIzmmK/kuI3mmK/pmo/mnLrlpITnkIblkaLvvJ/ov5jmmK/orqnkuKTlj6rpsbzmkp7lnKjkuIDotbfvvJ9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsdXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRpc3RhbmNlXyA9IGNjLnBEaXN0YW5jZSh0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKSwgbHVyZXNbaV0uZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPiBkaXN0YW5jZV8pIHtcbiAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlXztcbiAgICAgICAgICAgICAgICB0aGlzLmx1cmUgPSBsdXJlc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYy5sb2coJyBmaW5kICcgKyB0aGlzLmx1cmUudXVpZCk7XG4gICAgICAgIHRoaXMuZWF0QWN0aW9uKCk7XG4gICAgfSxcbiAgICAvL+mUruebmOaOp+WItu+8jOaaguaXtuS4jeimgeS6hlxuICAgIGFjdGlvbkNvbnRyb2w6IGZ1bmN0aW9uIGFjdGlvbkNvbnRyb2woZGlyY3Rpb25fcm90YXRpb24sIGNvZGUpIHtcbiAgICAgICAgdmFyIHggPSB0aGlzLm5vZGUucG9zaXRpb24ueDtcbiAgICAgICAgdmFyIHkgPSB0aGlzLm5vZGUucG9zaXRpb24ueTtcbiAgICAgICAgLy8gY2MubG9nKCdiZSB4LHk6JyArIHggKyAnICcgKyB5ICsgJyAnICsgY29kZSk7XG4gICAgICAgIHZhciByb3RhdGVUbyA9IGNjLnJvdGF0ZVRvKDAuNSwgZGlyY3Rpb25fcm90YXRpb24pO1xuICAgICAgICByb3RhdGVUby5lYXNpbmcoY2MuZWFzZUVsYXN0aWNPdXQoKSk7XG4gICAgICAgIHZhciB4XyA9IHg7XG4gICAgICAgIHZhciB5XyA9IHk7XG4gICAgICAgIHN3aXRjaCAoY29kZSkge1xuXG4gICAgICAgICAgICBjYXNlIGNjLktFWS5sZWZ0OlxuICAgICAgICAgICAgICAgIHhfID0geCAtIDEwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjYy5LRVkucmlnaHQ6XG4gICAgICAgICAgICAgICAgeF8gPSB4ICsgMTA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjLktFWS51cDpcbiAgICAgICAgICAgICAgICB5XyA9IHkgKyAxMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY2MuS0VZLmRvd246XG4gICAgICAgICAgICAgICAgeV8gPSB5IC0gMTA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLy9jYy5sb2coeF8gKyAnIDogJyArIHlfKTtcbiAgICAgICAgdmFyIGJlemllclRvID0gY2MubW92ZVRvKDEuNSwgY2MucCh4XywgeV8pKTsgLy8sY2MucCh4LTMwLHkrMjApLGNjLnAoeC00MCx5KV0pO1xuICAgICAgICBiZXppZXJUby5lYXNpbmcoY2MuZWFzZUVsYXN0aWNJbigpKTtcbiAgICAgICAgLy8gYmV6aWVyVG8uZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbkluKCkpOyAgICAgLy9jYy5iZXppZXJUbygyLFtjYy5wKHgseSksY2MucCh4KzQwLHkrNDApLGNjLnAoeCx5KzgwKSxjYy5wKHgtNDAseSs0MCksY2MucCh4LHkpXSk7XG4gICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24oY2Muc3Bhd24ocm90YXRlVG8sIGJlemllclRvKSk7XG4gICAgfSxcblxuICAgIGNvdW50Um90YXRpb246IGZ1bmN0aW9uIGNvdW50Um90YXRpb24oZGlyY3Rpb25fcm90YXRpb24pIHtcbiAgICAgICAgdGhpcy5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5jb250cm9sOyAvL3J1bm5pbmdcbiAgICAgICAgdGhpcy5zdGFydF9yb3RhdGlvbiA9IHRoaXMubm9kZS5yb3RhdGlvbjtcbiAgICAgICAgdGhpcy5lbmRfcm90YXRpb24gPSBkaXJjdGlvbl9yb3RhdGlvbjtcbiAgICAgICAgdGhpcy5jbG9ja3dpc2UgPSAxO1xuICAgICAgICAvL+aWueWQkeesrOS4gOasoeiuoeeul1xuICAgICAgICB2YXIgZHZhbHVlID0gdGhpcy5lbmRfcm90YXRpb24gLSB0aGlzLnN0YXJ0X3JvdGF0aW9uO1xuICAgICAgICBpZiAoZHZhbHVlID09PSAwIHx8IGR2YWx1ZSA9PT0gMzYwKSB0aGlzLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnN0b3A7XG4gICAgICAgIGlmIChkdmFsdWUgPCAwKSB0aGlzLmNsb2Nrd2lzZSA9IC10aGlzLmNsb2Nrd2lzZTtcbiAgICAgICAgLy/opoHovaznmoTop5LluqZcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMuZW5kX3JvdGF0aW9uIC0gdGhpcy5zdGFydF9yb3RhdGlvbikgPiAxODApIHtcbiAgICAgICAgICAgIHRoaXMudHVybl9yb3RhdGlvbiA9IDM2MCAtIE1hdGguYWJzKHRoaXMuZW5kX3JvdGF0aW9uIC0gdGhpcy5zdGFydF9yb3RhdGlvbik7XG4gICAgICAgICAgICAvL+aWueWQkeesrOS6jOasoeiuoeeul1xuICAgICAgICAgICAgdGhpcy5jbG9ja3dpc2UgPSAtdGhpcy5jbG9ja3dpc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnR1cm5fcm90YXRpb24gPSBNYXRoLmFicyh0aGlzLmVuZF9yb3RhdGlvbiAtIHRoaXMuc3RhcnRfcm90YXRpb24pOyAvL+imgei9rOeahOinkuW6plxuICAgICAgICB9XG4gICAgICAgIC8vICAgY2MubG9nKHRoaXMudHVybl9yb3RhdGlvbik7XG4gICAgICAgIC8vICAgY2MubG9nKHRoaXMuY2xvY2t3aXNlKTtcbiAgICAgICAgLy8gICBjYy5sb2codGhpcy5ub2RlLnJvdGF0aW9uKTtcbiAgICAgICAgLy9jYy5sb2coY29udmVydFRvV29ybGRTcGFjZUFSIHRoaXMubm9kZS5wb3NpdGlvbik7XG4gICAgfSxcblxuICAgIG9uS2V5VXA6IGZ1bmN0aW9uIG9uS2V5VXAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IHRoaXMubW92ZURpcmVjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5tb3ZlRGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkNvbGxpc2lvbkVudGVyOiBmdW5jdGlvbiBvbkNvbGxpc2lvbkVudGVyKG90aGVyLCBzZWxmKSB7XG4gICAgICAgIGlmIChvdGhlci5ub2RlLmdyb3VwID09PSAnc3RvbmVHJykge1xuICAgICAgICAgICAgY2MubG9nKCdmaXNoIGtub2NrIHN0b25lJyArIG90aGVyLm5vZGUuZ3JvdXApO1xuICAgICAgICAgICAgY2MubG9nKG90aGVyKTtcbiAgICAgICAgICAgIC8v56Kw5Yiw6bG8XG4gICAgICAgICAgICAvL+iusOW/humanOeijVxuICAgICAgICAgICAgaWYgKHRoaXMuc3RvbmVQb2x5Z29ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvbHlnb25zID0gW107XG4gICAgICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoJ0NhbnZhcycpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3RoZXIucG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvbHlnb25zW2ldID0gY2FudmFzLmNvbnZlcnRUb05vZGVTcGFjZUFSKG90aGVyLndvcmxkLnBvaW50c1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3RvbmVQb2x5Z29ucyA9IHBvbHlnb25zO1xuICAgICAgICAgICAgICAgIGNjLmxvZygnbWVtbyB0aGUgc3RvbmVQb2x5Z29ucycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy/psbzopoHmlLnlj5jooYzliqjot6/nur9cbiAgICAgICAgICAgIHRoaXMuc3RyYXRlZ3lSdW4ob3RoZXIubm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG90aGVyLm5vZGUuZ3JvdXAgPT09ICdwYXRoRycgJiYgdGhpcy5wYXRoUG9seWdvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2MubG9nKCdtZW1vIHRoZSBwYXRoUG9seWdvbnMnKTtcbiAgICAgICAgICAgIHZhciBwb2x5Z29ucyA9IFtdO1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoJ0NhbnZhcycpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdGhlci5wb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwb2x5Z29uc1tpXSA9IGNhbnZhcy5jb252ZXJ0VG9Ob2RlU3BhY2VBUihvdGhlci53b3JsZC5wb2ludHNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wYXRoUG9seWdvbnMgPSBwb2x5Z29ucztcbiAgICAgICAgfVxuICAgICAgICBpZiAob3RoZXIubm9kZS5ncm91cCA9PT0gJ2Zpc2hHJykge1xuICAgICAgICAgICAgLy/lpoLmnpzmmK/psbzkuI7psbznm7jmkp5cbiAgICAgICAgICAgIHRoaXMuc3RyYXRlZ3lSdW4ob3RoZXIubm9kZSwgMC4xNSwgMC4zLCB0cnVlLCA1MCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8v5Y+N5by555qEQUnpgLvovpFcbiAgICBzdHJhdGVneVJ1bjogZnVuY3Rpb24gc3RyYXRlZ3lSdW4ob3RoZXIsIHRlbXBTcGVlZCwgdGVtcFJvdGF0ZVNwZWVkLCBpbW1lZGlhdGVseSwgcmFuZ2UpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL+W9k+WJjeaYr+acieebruagh+eahOa4uO+8jOi/mOaYr+mXsua4uFxuICAgICAgICBpZiAoc2VsZi5ydW5fc3RhdHVzID09PSBGaXNoUnVuU3RhdHVzLnJhbmRvbSB8fCBzZWxmLnJ1bl9zdGF0dXMgPT09IEZpc2hSdW5TdGF0dXMuZmluZCB8fCBzZWxmLnJ1bl9zdGF0dXMgPT09IEZpc2hSdW5TdGF0dXMuc3RvcCkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIC8vIGxldCB4X3JhbmdlID0gTWF0aC5hYnMoY2Mud2luU2l6ZS53aWR0aCAvIDIgLSBNYXRoLmFicyhzZWxmLm5vZGUueCkpO1xuICAgICAgICAgICAgICAgIC8vIGxldCB5X3JhbmdlID0gTWF0aC5hYnMoY2Mud2luU2l6ZS5oZWlnaHQgLyAyIC0gTWF0aC5hYnMoc2VsZi5ub2RlLnkpIC0gMTAwKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgeCA9IHNlbGYubm9kZS54ICsgeF9yYW5nZSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHkgPSBzZWxmLm5vZGUueSArIHlfcmFuZ2UgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIHZhciB4X3JhbmdlID0gMTAwICsgNTAgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIHZhciB5X3JhbmdlID0gMTAwICsgNTAgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIGlmIChyYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICB4X3JhbmdlID0gcmFuZ2UgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICB5X3JhbmdlID0gcmFuZ2UgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBydW5fc3RhdHVzX29yZyA9IHNlbGYucnVuX3N0YXR1cztcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgeSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAob3RoZXIueCA+PSBzZWxmLm5vZGUueCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHggPSBzZWxmLm5vZGUueCAtIHhfcmFuZ2U7IC8vLWNjLndpblNpemUud2lkdGggLyAyICsgeF9yYW5nZSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSBzZWxmLm5vZGUueCArIHhfcmFuZ2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3RoZXIueSA+PSBzZWxmLm5vZGUueSkge1xuICAgICAgICAgICAgICAgICAgICB5ID0gc2VsZi5ub2RlLnkgLSB5X3JhbmdlOyAvLy1jYy53aW5TaXplLmhlaWdodCAvIDIgKyB5X3JhbmdlICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgeSA9IHNlbGYubm9kZS55ICsgeV9yYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2MubG9nKCdhZnRlciBrbm9jayB0aGVuIHdhbnQgJyArIHggKyAnLCcgKyB5KTtcblxuICAgICAgICAgICAgICAgIHZhciBzcGVlZCA9IF90aGlzMi5tYXhfc2VlZCAqIChNYXRoLnJhbmRvbSgpICogMC44ICsgMC4yKTtcbiAgICAgICAgICAgICAgICBpZiAodGVtcFNwZWVkKSBzcGVlZCA9IHRlbXBTcGVlZDtcbiAgICAgICAgICAgICAgICB2YXIgbW92ZVRvID0gY2MubW92ZVRvKHNwZWVkLCBjYy5wKHgsIHkpKTtcbiAgICAgICAgICAgICAgICAvLyAgIHg9NTArY2Mud2luU2l6ZS53aWR0aC8yKk1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgLy8gICB5PTUwK2NjLndpblNpemUuaGVpZ2h0LzIqTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICAvLyB2YXIgbW5nID0gY2MuZGlyZWN0b3IuZ2V0QWN0aW9uTWFuYWdlcigpO1xuICAgICAgICAgICAgICAgIC8vIGNjLmxvZyhtbmcuZ2V0QWN0aW9uQnlUYWcoRmlzaFJ1blN0YXR1cy5yYW5kb20sdGhpcy5ub2RlKSk7XG4gICAgICAgICAgICAgICAgLy8gbW92ZVRvPWNjLnJldmVyc2VUaW1lKG1uZy5nZXRBY3Rpb25CeVRhZyhGaXNoUnVuU3RhdHVzLnJhbmRvbSx0aGlzLm5vZGUpKTtcblxuICAgICAgICAgICAgICAgIC8vIGxldCBtb3ZlQnkgPSBjYy5tb3ZlQnkoc3BlZWQsIGNjLnAoeCwgeSkpO1xuICAgICAgICAgICAgICAgIHZhciBmaW5pc2hlZCA9IGNjLmNhbGxGdW5jKGZ1bmN0aW9uICh0YXJnZXQsIGluZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocnVuX3N0YXR1c19vcmcgPT09IEZpc2hSdW5TdGF0dXMucmFuZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnN0b3A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bl9zdGF0dXNfb3JnID09PSBGaXNoUnVuU3RhdHVzLmZpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucnVuX3N0YXR1cyA9IHJ1bl9zdGF0dXNfb3JnO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/ppbXmsqHmnInkuKLvvIzov5jmg7PnnYBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vLy/pqbHmlaPlrozkuobvvIzlupTor6Xph43mlrDmib7nm67moIdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYud2FudEVhdFRoaW5rKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9zZWxmLmVhdEFjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2MubG9nKCdvdGhlciBhbmdsZTonICsgX3RoaXMyLmNvdW50QW5nbGUoX3RoaXMyLm5vZGUuY29udmVydFRvTm9kZVNwYWNlKGNjLnAoeCwgeSkpLCBjYy5wKDAsIDApKSArIFwiIHwgXCIgKyBfdGhpczIuY291bnRBbmdsZShjYy5wKHgsIHkpLCBfdGhpczIubm9kZSkpO1xuICAgICAgICAgICAgICAgIHZhciBhbmdsZSA9IF90aGlzMi5jb3VudEFuZ2xlKGNjLnAoeCwgeSksIF90aGlzMi5ub2RlKTtcbiAgICAgICAgICAgICAgICAvLyBhbmdsZT0oYW5nbGU+MTgwPzU0MC10aGlzLm5vZGUucm90YXRpb246dGhpcy5ub2RlLnJvdGF0aW9uLTkwKTtcbiAgICAgICAgICAgICAgICB2YXIgcm90YXRlU3BlZWQgPSBfdGhpczIudHVybl9zcGVlZCAqIE1hdGgucmFuZG9tKCkgKyAwLjI7XG4gICAgICAgICAgICAgICAgaWYgKHRlbXBSb3RhdGVTcGVlZCkgcm90YXRlU3BlZWQgPSB0ZW1wUm90YXRlU3BlZWQ7XG4gICAgICAgICAgICAgICAgdmFyIHJvdGF0ZVRvID0gY2Mucm90YXRlVG8ocm90YXRlU3BlZWQsIGFuZ2xlKTtcbiAgICAgICAgICAgICAgICAvL+WFiOWBnOS4i+WOn+adpeato+WcqOi/m+ihjOeahOWKqOS9nO+8iOWvvOiHtOeisOaSnueahO+8iVxuICAgICAgICAgICAgICAgIF90aGlzMi5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgY2MubG9nKCdrbm9jayBydW4gYW5kIHN0YXR1czonICsgX3RoaXMyLnJ1bl9zdGF0dXMgKyAnIHNwZWVkOicgKyBzcGVlZCArICcgYW5kIGFuZ2xlOicgKyBhbmdsZSk7XG4gICAgICAgICAgICAgICAgLy/lkJHlj6bkuIDkuKrmlrnlkJHov5DliqhcbiAgICAgICAgICAgICAgICAvLyBzZWxmLnJ1bl9zdGF0dXM9RmlzaFJ1blN0YXR1cy5yYW5kb207XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBpZiAoaW1tZWRpYXRlbHkpIF90aGlzMi5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgX3RoaXMyLm5vZGUucnVuQWN0aW9uKGNjLnNwYXduKHJvdGF0ZVRvLCBjYy5zZXF1ZW5jZShtb3ZlVG8sIGZpbmlzaGVkKSkpO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/lgYforr7mmoLml7blj6rmnInkuIDkuKrpmpznoo3nialcbiAgICBmaW5kUGF0aDogZnVuY3Rpb24gZmluZFBhdGgoc3RhcnRQb3MsIHRhcmdldFBvcywgcGF0aFBvbHlnb25zLCBzdG9uZVBvbHlnb25zLCBwYXRoKSB7XG4gICAgICAgIGlmIChwYXRoID09PSB1bmRlZmluZWQpIHBhdGggPSBbXTtcbiAgICAgICAgaWYgKCFjYy5JbnRlcnNlY3Rpb24ubGluZVBvbHlnb24oc3RhcnRQb3MsIHRhcmdldFBvcywgc3RvbmVQb2x5Z29ucykpIHtcblxuICAgICAgICAgICAgcGF0aC51bnNoaWZ0KHN0YXJ0UG9zKTtcbiAgICAgICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0ZW1wUG9seWdvbnMgPSBbXTtcbiAgICAgICAgdmFyIHRlbXBQb2x5Z29uc18gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoUG9seWdvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChjYy5JbnRlcnNlY3Rpb24ubGluZVBvbHlnb24oc3RhcnRQb3MsIHBhdGhQb2x5Z29uc1tpXSwgc3RvbmVQb2x5Z29ucykpIHtcbiAgICAgICAgICAgICAgICB0ZW1wUG9seWdvbnMucHVzaChwYXRoUG9seWdvbnNbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wUG9seWdvbnNfLnB1c2gocGF0aFBvbHlnb25zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBpZih0ZW1wUG9seWdvbnNfLmxlbmd0aD4xKXtcbiAgICAgICAgLy9sZXQgbGVuPXBhdGgubGVuZ3RoO1xuICAgICAgICAvLyBpZiAodGVtcFBvbHlnb25zXy5sZW5ndGggPT09IDApIHtcblxuICAgICAgICAvLyB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVtcFBvbHlnb25zXy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCkgcGF0aCA9IFtdO1xuXG4gICAgICAgICAgICB2YXIgcGF0aEJyYW5jaCA9IHRoaXMuZmluZFBhdGgodGVtcFBvbHlnb25zX1tpXSwgdGFyZ2V0UG9zLCB0ZW1wUG9seWdvbnMsIHN0b25lUG9seWdvbnMsIHBhdGhbaV0pO1xuICAgICAgICAgICAgaWYgKHBhdGhCcmFuY2gubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy9jYy5sb2cocGF0aCk7XG4gICAgICAgICAgICAgICAgcGF0aEJyYW5jaCA9IG51bGw7XG4gICAgICAgICAgICAgICAgLy9yZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhdGhCcmFuY2hbMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHBhdGhCcmFuY2gubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoQnJhbmNoW25dLnB1c2godGFyZ2V0UG9zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoQnJhbmNoO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aEJyYW5jaC51bnNoaWZ0KHN0YXJ0UG9zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhbaV0gPSBwYXRoQnJhbmNoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL3BhdGguY29uY2F0KHBhdGgscGF0aEJyYW5jaCk7XG4gICAgICAgICAgICAvL3BhdGhbbGVuICsgaV0gPSB0aGlzLmZpbmRQYXRoXyh0ZW1wUG9seWdvbnNfW2ldLHRhcmdldFBvcyx0ZW1wUG9seWdvbnMsc3RvbmVQb2x5Z29ucyxwYXRoW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgIH0sXG4gICAgc2hvcnRQYXRoOiBmdW5jdGlvbiBzaG9ydFBhdGgocGF0aHMpIHtcbiAgICAgICAgdmFyIHMgPSAwO1xuICAgICAgICB2YXIgbWF4RGlzdGFuY2UgPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGF0aCA9IHBhdGhzW2ldO1xuICAgICAgICAgICAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCB8fCBwYXRoID09PSBudWxsKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhdGgpKSB7XG4gICAgICAgICAgICAgICAgcGF0aC51bnNoaWZ0KHRoaXMubm9kZS5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2MucERpc3RhbmNlKHBhdGhzWzBdLCB0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKSkgPT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgcGF0aHMudW5zaGlmdCh0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGhzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCBwYXRoLmxlbmd0aCAtIDE7IG4rKykge1xuICAgICAgICAgICAgICAgIGRpc3RhbmNlICs9IGNjLnBEaXN0YW5jZShwYXRoW25dLCBwYXRoW24gKyAxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgcyA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwYXRoc1tzXS5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gcGF0aHNbc107XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMucnVuX3N0YXR1cyA9PT0gRmlzaFJ1blN0YXR1cy5jb250cm9sKSB7XG4gICAgICAgICAgICAvL+WcqOi/kOWKqOS4reeahOivnVxuXG4gICAgICAgICAgICAvLyBjYy5sb2coJ2N1cnJfcm90YXRpb246Jyt0aGlzLm5vZGUucm90YXRpb24rJyBlbmRfcm90YXRpb246Jyt0aGlzLmVuZF9yb3RhdGlvbisnIHRoaXMuc3BlZWQ6Jyt0aGlzLnNwZWVkKTtcbiAgICAgICAgICAgIHRoaXMubm9kZS5yb3RhdGlvbiArPSB0aGlzLnR1cm5fc3BlZWQgKiB0aGlzLmNsb2Nrd2lzZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMubm9kZS5yb3RhdGlvbiA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubm9kZS5yb3RhdGlvbiA9PT0gdGhpcy5lbmRfcm90YXRpb24gfHwgdGhpcy5ub2RlLnJvdGF0aW9uIC0gMzYwID09PSB0aGlzLmVuZF9yb3RhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnN0b3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubm9kZS5yb3RhdGlvbiA8IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoMzYwICsgdGhpcy5ub2RlLnJvdGF0aW9uID09PSB0aGlzLmVuZF9yb3RhdGlvbiB8fCB0aGlzLm5vZGUucm90YXRpb24gKyAzNjAgPT09IHRoaXMuZW5kX3JvdGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuc3RvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5ub2RlLnJvdGF0aW9uID4gMzYwKSB0aGlzLm5vZGUucm90YXRpb24gPSB0aGlzLm5vZGUucm90YXRpb24gLSAzNjA7XG4gICAgICAgICAgICBpZiAodGhpcy5ub2RlLnJvdGF0aW9uIDwgLTM2MCkgdGhpcy5ub2RlLnJvdGF0aW9uID0gdGhpcy5ub2RlLnJvdGF0aW9uICsgMzYwO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNjLmxvZygnc3RhdHVzOicgKyB0aGlzLnJ1bl9zdGF0dXMpO1xuICAgICAgICBpZiAodGhpcy5ydW5fc3RhdHVzICE9IEZpc2hSdW5TdGF0dXMuY29udHJvbCkge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLm1vdmVEaXJlY3Rpb24pIHtcblxuICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmxlZnQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZS54IC09IHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnJpZ2h0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS51cDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlLnkgKz0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZG93bjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlLnkgLT0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzLm5vZGUueD0tNDAwO1xuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5ub2RlLngpID4gKGNjLndpblNpemUud2lkdGggLSAxMDApIC8gMikge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSAoY2Mud2luU2l6ZS53aWR0aCAtIDEwMCkgLyAyICogdGhpcy5ub2RlLnggLyBNYXRoLmFicyh0aGlzLm5vZGUueCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jYy5sb2codGhpcy5ub2RlLnggKyBcIiBcIiArIHRoaXMubm9kZS54KTtcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMubm9kZS55KSA+IChjYy53aW5TaXplLmhlaWdodCAtIDEwKSAvIDIpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS55ID0gKGNjLndpblNpemUuaGVpZ2h0IC0gMTAwKSAvIDIgKiB0aGlzLm5vZGUueSAvIE1hdGguYWJzKHRoaXMubm9kZS55KTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnMzlmMmJnT0k1Vk9GSzJLUkJDVEEwamInLCAnR2FtZScpO1xuLy8gU2NyaXB0XFxHYW1lLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgICBsdXJlUHJlZmFiOiBjYy5QcmVmYWIsXG4gICAgICAgIGZpc2hQcmVmYWI6IGNjLlByZWZhYixcbiAgICAgICAgLy/pnIDopoHliJ3lp4vljJbnmoRcbiAgICAgICAga25vY2s6IGNjLk5vZGUsXG4gICAgICAgIHNjb3JlOiBjYy5Ob2RlLFxuICAgICAgICB0aW1lcjogY2MuTm9kZSxcbiAgICAgICAgZWF0Q291bnQ6IGNjLk5vZGUsXG4gICAgICAgIGJvYXJkOiBjYy5Ob2RlLFxuICAgICAgICBiaWdMdXJlOiBjYy5Ob2RlLFxuICAgICAgICBzdG9uZTogY2MuTm9kZSxcbiAgICAgICAgbWVudTogY2MuTm9kZSxcbiAgICAgICAgc3RhZ2VTdHJpbmc6IGNjLk5vZGUsXG5cbiAgICAgICAgc3RhZ2U6IDEsXG4gICAgICAgIGRpc3BlcnNlRGlzdGFuY2U6IDEwMCxcblxuICAgICAgICBmaXNoOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIG90aGVyRmlzaDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBbXSxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfVxuXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBtYW5hZ2VyID0gY2MuZGlyZWN0b3IuZ2V0Q29sbGlzaW9uTWFuYWdlcigpO1xuICAgICAgICBtYW5hZ2VyLmVuYWJsZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMua25vY2suYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMua25vY2tBbmltYXRpb24gPSB0aGlzLmtub2NrLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pO1xuXG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbCA9IHRoaXMuc2NvcmUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgdGhpcy5zY29yZVNjcmlwdCA9IHRoaXMuc2NvcmUuZ2V0Q29tcG9uZW50KCdTY29yZScpO1xuICAgICAgICAvL+WPluWIsOWFs+WNoeiuvuiuoeaWh+S7ti0t5pS+5YiwbG9hZGluZ+S4rVxuICAgICAgICAvL2NjLmxvYWRlci5sb2FkUmVzKCdzdGFnZXMuanNvbicsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgICB2YXIgZGF0YSA9IGNjLmZpbmQoJ2xvYWRpbmcnKS5nZXRDb21wb25lbnQoJ0xvYWRpbmcnKS5zdGFnZXNEYXRhO1xuICAgICAgICBzZWxmLm1lbnUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5tZW51LmdldENvbXBvbmVudCgnTWVudScpLmluaXQoZGF0YSk7XG4gICAgICAgIHNlbGYuc3RhZ2VzRGF0YSA9IGRhdGE7XG4gICAgICAgIC8vc2VsZi5iaWdMdXJlLmdldENvbXBvbmVudCgnQmlnbHVyZScpLmluaXQoKTsvL2RhdGFcblxuICAgICAgICAvL30pO1xuXG4gICAgICAgIC8vY2MubG9nKCd0ZW1wOicrY2MuSW50ZXJzZWN0aW9uLmxpbmVQb2x5Z29uKGNjLnAoMCwwKSxjYy5wKDEsMSksW2NjLnAoMCwwKSxjYy5wKDAsMSksY2MucCgxLDEpLGNjLnAoMSwwKV0gKSlcblxuICAgICAgICAvL+S4jemcgOimgeiuvuWumueahOWPmOmHj1xuICAgICAgICB0aGlzLmx1cmVzID0gW107XG5cbiAgICAgICAgLy8gY2MubG9nKCdsZW5ndGg6Jyt0aGlzLmx1cmVzLmxlbmd0aCk7XG4gICAgICAgIC8vIGxldCByZXN1bHQ9c2VsZi5maW5kUGF0aF8oY2MucCgxMiw5KSwgY2MucCgxMyw5KSwgW2NjLnAoNywxMSksY2MucCgxMSwxMSksY2MucCgxMC41LDEwLjUpLGNjLnAoMTAsOSksY2MucCgxMSw3KSxjYy5wKDcsNyldLCBbY2MucCg4LDEwKSxjYy5wKDEwLDEwKSxjYy5wKDksOSksY2MucCgxMCw4KSxjYy5wKDgsOCldLCBbXSk7XG4gICAgICAgIC8vIGNjLmxvZyhyZXN1bHQpO1xuXG4gICAgICAgIC8v5aSE55CG5LiK5oql55qE5ZCE56eN5LqL5Lu277yM5L2c5Li66ZuG5Lit6LCD5bqm5aSE55CGXG5cbiAgICAgICAgdGhpcy5ub2RlLm9uKCdsdXJlX292ZXInLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGNjLmxvZyhldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5vZGUub24oJ2x1cmVfZWF0ZWQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYuc2NvcmVTY3JpcHQuZWF0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5vZGUub24oJ3Rocm93X2x1cmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciB4ID0gZXZlbnQuZ2V0VXNlckRhdGEoKTtcbiAgICAgICAgICAgIHNlbGYudGhyb3dfbHVyZSh4KTtcbiAgICAgICAgICAgIC8v5piv5Zyo6L+Z6YeM5ZGK6K+J6bG86KaB5ZCD77yM6L+Y5piv5pS+5Yiw6bG855qE6Ieq5Li7QUnkuK3vvIzorqnpsbzlj5HnjrDmnInppbVcbiAgICAgICAgICAgIC8v5Lmf5bCx5piv5pyJ5paw55qE6aW15piv5LiA5Liq5LqL5Lu277yM6Kem5Y+R5LqG6bG855qE5oCd6ICDXG4gICAgICAgICAgICBzZWxmLndhbnRFYXRUaGluaygpO1xuICAgICAgICAgICAgLy8gc2VsZi5maXNoU2NyaXB0LndhbnRFYXRUaGluayhzZWxmLmx1cmVzKTtcblxuICAgICAgICAgICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLm90aGVyRmlzaC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gICAgIHNlbGYub3RoZXJGaXNoW2ldLmdldENvbXBvbmVudCgnQ29udHJvbCcpLndhbnRFYXRUaGluayhzZWxmLmx1cmVzKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vc2VsZi5sdXJlcy5wdXNoKGx1cmUpO1xuICAgICAgICAgICAgLy/ku4DkuYjml7blgJnmlL7lm57liLDmsaDkuK3lkaLvvJ9cblxuICAgICAgICAgICAgLy/ov5nph4zopoHpgJrnn6XpsbzvvIzov5nph4zmnInppbXvvIzmnInlpJrkuKrppbXmgI7kuYjlip7vvIzopoHorrDlvZXmiYDmnInppbXvvIzkuJTppbXkvJrlj5jljJZcbiAgICAgICAgICAgIC8v5Y+m5pyJ5aSa5Liq6bG855qE5oOF5Ya1XG4gICAgICAgICAgICAvLyBzZWxmLmZpc2hTY3JpcHQubHVyZSA9IGx1cmU7XG4gICAgICAgICAgICAvLyBzZWxmLmZpc2hTY3JpcHQuZWF0QWN0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5vZGUub24oJ2x1cmVfZGVzdHJveScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgLy9jYy5sb2coJ2V2ZW50LmRldGFpbC51dWlkOicgKyBldmVudC5kZXRhaWwudXVpZCk7XG4gICAgICAgICAgICAvL2NjLmxvZyhzZWxmLmx1cmVzKTtcblxuICAgICAgICAgICAgLy/ov5nkuKrppbXooqvlkIPkuobvvIzorqnpsbzmib7kuIvkuIDkuKrvvIzmmoLml7bmsqHmnInmnIDov5HnmoTpgLvovpFcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5sdXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmx1cmVzW2ldLnV1aWQgPT0gZXZlbnQuZGV0YWlsLnV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sdXJlc1tpXS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubHVyZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNjLmxvZygnbm93IHRoZXJlIGFyZSAnICsgc2VsZi5sdXJlcy5sZW5ndGggKyAnIGx1cmVzJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvL+aXtumXtOWIsFxuICAgICAgICB0aGlzLm5vZGUub24oJ3RpbWVfdXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYuYm9hcmQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYuYm9hcmQuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgICAgICBjYy5sb2coJ3NlbGYuc3RhZ2U6JyArIHNlbGYuc3RhZ2UgKyAnIHNlbGYuc2NvcmVTY3JpcHQuZWF0Q291bnQ6JyArIHNlbGYuc2NvcmVTY3JpcHQuZWF0Q291bnQpO1xuICAgICAgICAgICAgc2VsZi5ib2FyZC5nZXRDb21wb25lbnQoJ0JvYXJkJykuaW5pdCh7XG4gICAgICAgICAgICAgICAgc3RhZ2U6IHNlbGYuc3RhZ2UsXG4gICAgICAgICAgICAgICAgc2NvcmU6IHNlbGYuc2NvcmVTY3JpcHQuZWF0Q291bnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy/muIXnkIblnLrmma9cbiAgICAgICAgICAgIHNlbGYudW5zY2hlZHVsZUFsbENhbGxiYWNrcygpOyAvL+WBnOatouaKleaUvlxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLm90aGVyRmlzaC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHNlbGYuZmlzaFBvb2wucHV0KHNlbGYub3RoZXJGaXNoW2ldKTtcbiAgICAgICAgICAgICAgICAvL3NlbGYub3RoZXJGaXNoW2ldLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9zZWxmLmZpc2hQb29sLnB1dChzZWxmLmZpc2gpO1xuICAgICAgICAgICAgc2VsZi5maXNoLmRlc3Ryb3koKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLmx1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5sdXJlc1tpXS5kZXN0cm95KCk7IC8vcHV0KHNlbGYubHVyZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5sdXJlcyA9IFtdO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8g6YCJ5oup5YWz5Y2h5LqGXG4gICAgICAgIHRoaXMubm9kZS5vbignc2VsZWN0X3N0YWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLm1lbnUuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGYuZW50ZXJTdGFnZSgpO1xuICAgICAgICAgICAgc2VsZi5maXNoU2NyaXB0ID0gc2VsZi5maXNoLmdldENvbXBvbmVudCgnQ29udHJvbCcpO1xuICAgICAgICAgICAgc2VsZi5yYW5kb21MdXJlcyhzZWxmLnN0YWdlRGF0YS50aHJvd19sdXJlLmNvdW50LCBzZWxmLnN0YWdlRGF0YS50aHJvd19sdXJlLmludGVydmFsKTtcbiAgICAgICAgICAgIC8vc2VsZi5yYW5kb21MdXJlcyg1LCAxMCk7XG5cbiAgICAgICAgICAgIC8v6YeN572u6K6h5pe25ZmoXG4gICAgICAgICAgICBzZWxmLnRpbWVyLmdldENvbXBvbmVudCgnVGltZXInKS50b3RhbHRpbWUgPSBzZWxmLnN0YWdlRGF0YS50aW1lcjtcbiAgICAgICAgICAgIHNlbGYudGltZXIuZ2V0Q29tcG9uZW50KCdUaW1lcicpLmlzR3Jvd1VwID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLnRpbWVyLmdldENvbXBvbmVudCgnVGltZXInKS5pbml0KHNlbGYuc3RhZ2VEYXRhLnRpbWVyKTtcbiAgICAgICAgICAgIC8v6YeN572u5YiG5pWwXG4gICAgICAgICAgICBzZWxmLmVhdENvdW50LmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gMDtcbiAgICAgICAgICAgIHNlbGYuc2NvcmVTY3JpcHQuZWF0Q291bnQgPSAwO1xuICAgICAgICB9KTtcbiAgICAgICAgLy/kuIvkuIDlhbNcbiAgICAgICAgdGhpcy5ub2RlLm9uKCduZXh0X3N0YWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLnN0YWdlKys7XG4gICAgICAgICAgICBzZWxmLmVudGVyU3RhZ2UoKTtcbiAgICAgICAgICAgIHNlbGYuZmlzaFNjcmlwdCA9IHNlbGYuZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKTtcbiAgICAgICAgICAgIHNlbGYucmFuZG9tTHVyZXMoc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5jb3VudCwgc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5pbnRlcnZhbCk7XG4gICAgICAgICAgICAvL3NlbGYucmFuZG9tTHVyZXMoNSwgMTApO1xuXG4gICAgICAgICAgICAvL+mHjee9ruiuoeaXtuWZqFxuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykudG90YWx0aW1lID0gc2VsZi5zdGFnZURhdGEudGltZXI7XG4gICAgICAgICAgICBzZWxmLnRpbWVyLmdldENvbXBvbmVudCgnVGltZXInKS5pc0dyb3dVcCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykuaW5pdChzZWxmLnN0YWdlRGF0YS50aW1lcik7XG4gICAgICAgICAgICAvL+mHjee9ruWIhuaVsFxuICAgICAgICAgICAgc2VsZi5lYXRDb3VudC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IDA7XG4gICAgICAgICAgICBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50ID0gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIC8v55uu5b2VXG4gICAgICAgIHRoaXMubm9kZS5vbignbWVudScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgc2VsZi5tZW51LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLm1lbnUuZ2V0Q29tcG9uZW50KCdNZW51JykuaW5pdChzZWxmLnN0YWdlc0RhdGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9yZWxvYWRcbiAgICAgICAgdGhpcy5ub2RlLm9uKCdyZWxvYWQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYuZW50ZXJTdGFnZSgpO1xuICAgICAgICAgICAgc2VsZi5maXNoU2NyaXB0ID0gc2VsZi5maXNoLmdldENvbXBvbmVudCgnQ29udHJvbCcpO1xuICAgICAgICAgICAgc2VsZi5yYW5kb21MdXJlcyhzZWxmLnN0YWdlRGF0YS50aHJvd19sdXJlLmNvdW50LCBzZWxmLnN0YWdlRGF0YS50aHJvd19sdXJlLmludGVydmFsKTtcbiAgICAgICAgICAgIC8vc2VsZi5yYW5kb21MdXJlcyg1LCAxMCk7XG5cbiAgICAgICAgICAgIC8v6YeN572u6K6h5pe25ZmoXG4gICAgICAgICAgICBzZWxmLnRpbWVyLmdldENvbXBvbmVudCgnVGltZXInKS50b3RhbHRpbWUgPSBzZWxmLnN0YWdlRGF0YS50aW1lcjtcbiAgICAgICAgICAgIHNlbGYudGltZXIuZ2V0Q29tcG9uZW50KCdUaW1lcicpLmlzR3Jvd1VwID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLnRpbWVyLmdldENvbXBvbmVudCgnVGltZXInKS5pbml0KHNlbGYuc3RhZ2VEYXRhLnRpbWVyKTtcbiAgICAgICAgICAgIC8v6YeN572u5YiG5pWwXG4gICAgICAgICAgICBzZWxmLmVhdENvdW50LmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gMDtcbiAgICAgICAgICAgIHNlbGYuc2NvcmVTY3JpcHQuZWF0Q291bnQgPSAwO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL+S4pOS4quWvueWDj+axoO+8jOS4jeS4gOWumlxuICAgICAgICB0aGlzLmx1cmVQb29sID0gbmV3IGNjLk5vZGVQb29sKCk7XG4gICAgICAgIHRoaXMuZmlzaFBvb2wgPSBuZXcgY2MuTm9kZVBvb2woKTtcbiAgICAgICAgLy8gdGhpcy5lbnRlclN0YWdlKCk7XG4gICAgICAgIC8vIHRoaXMucmFuZG9tTHVyZXMoNSwgMTApO1xuICAgICAgICAvL3RoaXMuZmlzaFNjcmlwdCA9IHRoaXMuZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKTtcblxuICAgICAgICAvLyBjYy5yZW5kZXJlckNhbnZhcy5lbmFibGVEaXJ0eVJlZ2lvbihmYWxzZSk7XG4gICAgICAgIC8vIGNjLnJlbmRlcmVyV2ViR0xcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBldmVudC50b3VjaFxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LmdldEN1cnJlbnRUYXJnZXQoKTtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0YXJnZXQuY29udmVydFRvTm9kZVNwYWNlQVIoZXZlbnQuZ2V0TG9jYXRpb24oKSk7XG4gICAgICAgICAgICBjYy5sb2coJ3RvdWNoWDonICsgcG9zLngpO1xuICAgICAgICAgICAgaWYgKGV2ZW50LmdldExvY2F0aW9uKCkueCA8IDUwIHx8IGV2ZW50LmdldExvY2F0aW9uLnggPiBjYy53aW5TaXplLndpZHRoIC0gNTApIHJldHVybjtcblxuICAgICAgICAgICAgLy/mlbLpg6jliIZcbiAgICAgICAgICAgIHNlbGYua25vY2sueCA9IHBvcy54O1xuICAgICAgICAgICAgc2VsZi5rbm9jay55ID0gcG9zLnk7XG4gICAgICAgICAgICBzZWxmLmtub2NrLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLmtub2NrQW5pbWF0aW9uLnBsYXkoKTtcblxuICAgICAgICAgICAgc2VsZi5kaXNwZXJzZUZpc2gocG9zKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvL+mpseaVo1xuICAgIGRpc3BlcnNlRmlzaDogZnVuY3Rpb24gZGlzcGVyc2VGaXNoKHBvcykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3RoZXJGaXNoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2Rpc3RhbmNlID0gY2MucERpc3RhbmNlKHBvcywgdGhpcy5vdGhlckZpc2hbaV0uZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICBpZiAoX2Rpc3RhbmNlIDwgdGhpcy5kaXNwZXJzZURpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vdGhlckZpc2hbaV0uc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm90aGVyRmlzaFtpXS5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS5zdHJhdGVneVJ1bihwb3MsIDAuMywgMC4zLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBjYy5sb2coJ2Rpc3BlcnNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRpc3RhbmNlID0gY2MucERpc3RhbmNlKHBvcywgdGhpcy5maXNoLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCB0aGlzLmRpc3BlcnNlRGlzdGFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuZmlzaC5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICAgICAgdGhpcy5maXNoLmdldENvbXBvbmVudCgnQ29udHJvbCcpLnN0cmF0ZWd5UnVuKHBvcywgMC4zLCAwLjMsIHRydWUpO1xuICAgICAgICAgICAgY2MubG9nKCdkaXNwZXJzZScpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB3YW50RWF0VGhpbms6IGZ1bmN0aW9uIHdhbnRFYXRUaGluaygpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmZpc2hTY3JpcHQud2FudEVhdFRoaW5rKHNlbGYubHVyZXMpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYub3RoZXJGaXNoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzZWxmLm90aGVyRmlzaFtpXS5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS53YW50RWF0VGhpbmsoc2VsZi5sdXJlcyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJhbmRvbUx1cmVzOiBmdW5jdGlvbiByYW5kb21MdXJlcyhjb3VudCwgaW50ZXJ2YWwpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIC8vIGZvciAodmFyIG4gPSAwOyBuIDwgVGhpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyAgICAgVGhpbmdzW2ldXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB2YXIgeCA9IC1jYy53aW5TaXplLndpZHRoIC8gMiArIDUwICsgKGNjLndpblNpemUud2lkdGggLSAxMDApICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgIHNlbGYudGhyb3dfbHVyZSh4KTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLndhbnRFYXRUaGluaygpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIHNlbGYucmFuZG9tTHVyZXMoKTtcbiAgICAgICAgICAgIC8vIOi/memHjOeahCB0aGlzIOaMh+WQkSBjb21wb25lbnRcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vIGZvciAodmFyIG4gPSAwOyBuIDwgVGhpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIFRoaW5nc1tpXVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICB2YXIgeCA9IC1jYy53aW5TaXplLndpZHRoIC8gMiArIDUwICsgKGNjLndpblNpemUud2lkdGggLSAxMDApICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICBzZWxmLnRocm93X2x1cmUoeCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYud2FudEVhdFRoaW5rKCk7XG4gICAgICAgIH0sIGludGVydmFsKTtcbiAgICB9LFxuXG4gICAgZW50ZXJTdGFnZTogZnVuY3Rpb24gZW50ZXJTdGFnZSgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL+S7juS4gOS4quaWh+S7tuS4reWPluW+l++8mlxuICAgICAgICAvLzEu5YW25a6D6bG855qE5pWw6YePXG4gICAgICAgIC8vMi7pmpznoo3nmoTkvY3nva7jgIHmlbDph49cbiAgICAgICAgLy8zLumxvOeahOWPmOmHj1xuICAgICAgICAvLzQu5aSn6aW155qE5Y+Y6YePXG4gICAgICAgIC8vNS7nrKzlh6DlhbNcbiAgICAgICAgLy9UT0RPIOWQiOW5tuaJgOaciemxvOS4uuS4gOenjVxuICAgICAgICBzZWxmLnN0YWdlU3RyaW5nLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gXCLnrKxcIiArIHNlbGYuc3RhZ2UgKyBcIuWFs1wiO1xuICAgICAgICBpZiAoc2VsZi5zdGFnZURhdGEgJiYgc2VsZi5zdGFnZURhdGEuc3RhZ2UgPT09IHNlbGYuc3RhZ2UpIHt9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLnN0YWdlc0RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5zdGFnZXNEYXRhW2ldLnN0YWdlID09PSBzZWxmLnN0YWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc3RhZ2VEYXRhID0gc2VsZi5zdGFnZXNEYXRhW2ldO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGYuc3RhZ2VEYXRhLnN0b25lKSB7XG4gICAgICAgICAgICBzZWxmLnN0b25lLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLnN0b25lLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxmLnN0YWdlRGF0YS5iaWdMdXJlKSB7XG4gICAgICAgICAgICBzZWxmLmJpZ0x1cmUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuYmlnTHVyZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuc3RhZ2VEYXRhLmZpc2guZmF2b3JpdGUgPSBmYWxzZTtcbiAgICAgICAgdmFyIG90aGVyRmlzaENvdW50ID0gc2VsZi5zdGFnZURhdGEub3RoZXJGaXNoQ291bnQ7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdGhlckZpc2hDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgb3RoZXJGaXNoID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChzZWxmLmZpc2hQb29sLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyDpgJrov4cgc2l6ZSDmjqXlj6PliKTmlq3lr7nosaHmsaDkuK3mmK/lkKbmnInnqbrpl7LnmoTlr7nosaFcbiAgICAgICAgICAgICAgICBvdGhlckZpc2ggPSBzZWxmLmZpc2hQb29sLmdldCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInnqbrpl7Llr7nosaHvvIzkuZ/lsLHmmK/lr7nosaHmsaDkuK3lpIfnlKjlr7nosaHkuI3lpJ/ml7bvvIzmiJHku6zlsLHnlKggY2MuaW5zdGFudGlhdGUg6YeN5paw5Yib5bu6XG4gICAgICAgICAgICAgICAgb3RoZXJGaXNoID0gY2MuaW5zdGFudGlhdGUoc2VsZi5maXNoUHJlZmFiKTtcbiAgICAgICAgICAgICAgICAvLyBzZWxmLmx1cmVQb29sLnB1dChsdXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNjLmxvZygnY3JlYXRlIG90aGVyRmlzaDonICsgb3RoZXJGaXNoLnV1aWQpO1xuICAgICAgICAgICAgdmFyIF9wb3MgPSB0aGlzLmdldFJhbmRvbVBvc2l0aW9uKCk7XG4gICAgICAgICAgICBvdGhlckZpc2guc2V0UG9zaXRpb24oX3Bvcyk7XG5cbiAgICAgICAgICAgIG90aGVyRmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS5pbml0KHNlbGYuc3RhZ2VEYXRhLmZpc2gpO1xuICAgICAgICAgICAgLy8ge1xuICAgICAgICAgICAgLy8gICAgIGZhdm9yaXRlOiBmYWxzZSxcbiAgICAgICAgICAgIC8vICAgICBtYXhfc2VlZDogMTVcbiAgICAgICAgICAgIC8vIH0pOyAvL1RPRE8g5Lul5ZCO57uZ5LiA5Lqb5Y+C5pWwXG5cbiAgICAgICAgICAgIG90aGVyRmlzaC5wYXJlbnQgPSBzZWxmLm5vZGU7IC8vIOWwhueUn+aIkOeahOaVjOS6uuWKoOWFpeiKgueCueagkVxuXG4gICAgICAgICAgICBzZWxmLm90aGVyRmlzaC5wdXNoKG90aGVyRmlzaCk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5zdGFnZURhdGEuZmlzaC5mYXZvcml0ZSA9IHRydWU7XG4gICAgICAgIHZhciBmaXNoID0gY2MuaW5zdGFudGlhdGUoc2VsZi5maXNoUHJlZmFiKTtcbiAgICAgICAgY2MubG9nKCdjcmVhdGUgZmF2b3JpdGUgZmlzaCA6JyArIGZpc2gudXVpZCk7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLmdldFJhbmRvbVBvc2l0aW9uKCk7XG4gICAgICAgIGZpc2guc2V0UG9zaXRpb24ocG9zKTtcblxuICAgICAgICBmaXNoLmdldENvbXBvbmVudCgnQ29udHJvbCcpLmluaXQoc2VsZi5zdGFnZURhdGEuZmlzaCk7XG4gICAgICAgIC8vIHtcbiAgICAgICAgLy8gICAgIGZhdm9yaXRlOiB0cnVlLFxuICAgICAgICAvLyAgICAgbWF4X3NlZWQ6IDE1XG4gICAgICAgIC8vIH0pOyAvL1RPRE8g5Lul5ZCO57uZ5LiA5Lqb5Y+C5pWwXG4gICAgICAgIGZpc2gucGFyZW50ID0gc2VsZi5ub2RlOyAvLyDlsIbnlJ/miJDnmoTmlYzkurrliqDlhaXoioLngrnmoJFcblxuICAgICAgICBzZWxmLmZpc2ggPSBmaXNoO1xuICAgIH0sXG4gICAgZ2V0UmFuZG9tUG9zaXRpb246IGZ1bmN0aW9uIGdldFJhbmRvbVBvc2l0aW9uKCkge1xuICAgICAgICB2YXIgeSA9IC1jYy53aW5TaXplLmhlaWdodCAvIDIgKyAoY2Mud2luU2l6ZS5oZWlnaHQgLSAxMDApICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgdmFyIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyBjYy53aW5TaXplLndpZHRoICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgcmV0dXJuIGNjLnAoeCwgeSk7XG4gICAgfSxcblxuICAgIHRocm93X2x1cmU6IGZ1bmN0aW9uIHRocm93X2x1cmUoeCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8v54K55Ye75ZCO55Sf5oiQ6aW1XG4gICAgICAgIHZhciBsdXJlID0gbnVsbDtcbiAgICAgICAgaWYgKHNlbGYubHVyZVBvb2wuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgLy8g6YCa6L+HIHNpemUg5o6l5Y+j5Yik5pat5a+56LGh5rGg5Lit5piv5ZCm5pyJ56m66Zey55qE5a+56LGhXG4gICAgICAgICAgICBsdXJlID0gc2VsZi5sdXJlUG9vbC5nZXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWmguaenOayoeacieepuumXsuWvueixoe+8jOS5n+WwseaYr+WvueixoeaxoOS4reWkh+eUqOWvueixoeS4jeWkn+aXtu+8jOaIkeS7rOWwseeUqCBjYy5pbnN0YW50aWF0ZSDph43mlrDliJvlu7pcbiAgICAgICAgICAgIGx1cmUgPSBjYy5pbnN0YW50aWF0ZShzZWxmLmx1cmVQcmVmYWIpO1xuICAgICAgICAgICAgLy8gc2VsZi5sdXJlUG9vbC5wdXQobHVyZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2MubG9nKCd0aHJvd19sdXJlJyArIGx1cmUpO1xuICAgICAgICBsdXJlLnkgPSBjYy53aW5TaXplLmhlaWdodCAvIDIgLSAxMDA7XG5cbiAgICAgICAgbHVyZS5nZXRDb21wb25lbnQoJ2x1cmUnKS5pbml0KHgpOyAvL+aOpeS4i+adpeWwseWPr+S7peiwg+eUqCBlbmVteSDouqvkuIrnmoTohJrmnKzov5vooYzliJ3lp4vljJZcbiAgICAgICAgbHVyZS5wYXJlbnQgPSBzZWxmLm5vZGU7IC8vIOWwhueUn+aIkOeahOaVjOS6uuWKoOWFpeiKgueCueagkVxuXG4gICAgICAgIHNlbGYubHVyZXMucHVzaChsdXJlKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzY5ODFkalhXblpJeXJZNnZML1V5QUI1JywgJ0tub2NrJyk7XG4vLyBTY3JpcHRcXEtub2NrLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcblxuICAgIGRlc3Rvcnk6IGZ1bmN0aW9uIGRlc3RvcnkoKSB7XG4gICAgICAgIGNjLmxvZygna25vY2sgY29tcGxldGVkJyk7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcxN2NhZEh2NEZSTlVaaWEvaWkwMzljeicsICdMb2FkaW5nJyk7XG4vLyBTY3JpcHRcXExvYWRpbmcuanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBsYWJlbDogY2MuTm9kZSxcbiAgICAgICAgZmlzaDogY2MuTm9kZVxuICAgIH0sXG5cbiAgICAvL2ludGVydmFsOiAwXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIC8vIHRoaXMuZG90Q291bnQgPSAwO1xuICAgICAgICAvLyB0aGlzLmRvdE1heENvdW50ID0gMztcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmxhYmVsLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLmxvYWRTY2VuZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgc3RhcnRMb2FkaW5nOiBmdW5jdGlvbiBzdGFydExvYWRpbmcoKSB7XG4gICAgICAgIHRoaXMubGFiZWwuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAvL3RoaXMuZG90Q291bnQgPSAwO1xuICAgICAgICB2YXIgc2l6ZSA9IGNjLnZpZXcuZ2V0VmlzaWJsZVNpemUoKTtcbiAgICAgICAgdGhpcy5ub2RlLnNldFBvc2l0aW9uKGNjLnAoc2l6ZS53aWR0aCAvIDIgLSB0aGlzLm5vZGUud2lkdGggLyAyLCBzaXplLmhlaWdodCAvIDQpKTtcbiAgICAgICAgdGhpcy5maXNoLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICAvLyB0aGlzLnNjaGVkdWxlKHRoaXMudXBkYXRlTGFiZWwsIHRoaXMuaW50ZXJ2YWwsIHRoaXMpOyAgICAgIFxuICAgIH0sXG5cbiAgICBzdG9wTG9hZGluZzogZnVuY3Rpb24gc3RvcExvYWRpbmcoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8gdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKXtcbiAgICAgICAgc2VsZi5sYWJlbC5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgLy99LDMpO1xuXG4gICAgICAgIGNjLmxvZygnc3RvcCBsb2FkaW5nJyk7XG4gICAgICAgIC8vIHRoaXMudW5zY2hlZHVsZSh0aGlzLnVwZGF0ZUxhYmVsKTtcbiAgICAgICAgLy8gdGhpcy5ub2RlLnNldFBvc2l0aW9uKGNjLnAoMjAwMCwgMjAwMCkpO1xuICAgIH1cblxufSk7XG4vLyB1cGRhdGVMYWJlbCAoKSB7XG4vLyAgICAgbGV0IGRvdHMgPSAnLicucmVwZWF0KHRoaXMuZG90Q291bnQpO1xuLy8gICAgIHRoaXMubGFiZWwuc3RyaW5nID0gJ0xvYWRpbmcnICsgZG90cztcbi8vICAgICB0aGlzLmRvdENvdW50ICs9IDE7XG4vLyAgICAgaWYgKHRoaXMuZG90Q291bnQgPiB0aGlzLmRvdE1heENvdW50KSB7XG4vLyAgICAgICAgIHRoaXMuZG90Q291bnQgPSAwO1xuLy8gICAgIH1cbi8vIH1cblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2FlMzc1RGpoYnRNTjdJRFN5NUdXbG83JywgJ01lbnUnKTtcbi8vIFNjcmlwdFxcTWVudS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgICAgIHN0YWdlUHJlZmFiOiBjYy5QcmVmYWIsXG4gICAgICAgIG1lbnVMYXlvdXQ6IGNjLk5vZGVcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHN0YWdlcykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBzZWxmLm1lbnVMYXlvdXQucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdGFnZU1lbnUgPSBjYy5pbnN0YW50aWF0ZShzZWxmLnN0YWdlUHJlZmFiKTtcbiAgICAgICAgICAgIHZhciBzdGFnZU1lbnVTY3JpcHQgPSBzdGFnZU1lbnUuZ2V0Q29tcG9uZW50KCdTdGFnZU1lbnUnKTtcbiAgICAgICAgICAgIHN0YWdlTWVudVNjcmlwdC5pbml0KHN0YWdlc1tpXSk7XG4gICAgICAgICAgICBzZWxmLm1lbnVMYXlvdXQuYWRkQ2hpbGQoc3RhZ2VNZW51KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vZGUuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgfVxuXG59KTtcbi8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4vLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4vLyB9LFxuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNTEyMDVmMUFmVkdBcit5L3NYa3E5aWgnLCAnU2NlbmVNYW5hZ2VyJyk7XG4vLyBTY3JpcHRcXFNjZW5lTWFuYWdlci5qc1xuXG52YXIgTG9hZGluZyA9IHJlcXVpcmUoJ0xvYWRpbmcnKTtcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBsb2FkaW5nOiBMb2FkaW5nXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8v5Zyod2ViR0zkuIvmnInpl67pophcbiAgICAgICAgLy9jYy52aWV3LmVuYWJsZUFudGlBbGlhcyhmYWxzZSk7XG4gICAgICAgIGNjLmdhbWUuYWRkUGVyc2lzdFJvb3ROb2RlKHRoaXMubm9kZSk7XG4gICAgICAgIC8vIHRoaXMubG9hZGluZy5zdGFydExvYWRpbmcoKTtcbiAgICAgICAgdGhpcy5sb2FkU2NlbmUoJ21haW4nKTtcbiAgICAgICAgdGhpcy5sb2FkaW5nLmxvYWRTY2VuZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShzZWxmLmN1ckxvYWRpbmdTY2VuZSk7XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAgIC8vIH0sXG4gICAgbG9hZFNjZW5lOiBmdW5jdGlvbiBsb2FkU2NlbmUoc2NlbmVOYW1lKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5sb2FkaW5nLnN0YXJ0TG9hZGluZygpO1xuICAgICAgICB0aGlzLmN1ckxvYWRpbmdTY2VuZSA9IHNjZW5lTmFtZTtcbiAgICAgICAgLy90aGlzLm9uU2NlbmVMb2FkZWQuYmluZCh0aGlzKTtcbiAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMoJ3N0YWdlcy5qc29uJywgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgICAgICAgICAgc2VsZi5sb2FkaW5nLnN0YWdlc0RhdGEgPSBkYXRhO1xuICAgICAgICAgICAgY2MuZGlyZWN0b3IucHJlbG9hZFNjZW5lKHNjZW5lTmFtZSwgc2VsZi5vblNjZW5lTG9hZGVkLmJpbmQoc2VsZikpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25TY2VuZUxvYWRlZDogZnVuY3Rpb24gb25TY2VuZUxvYWRlZChldmVudCkge1xuICAgICAgICBjYy5sb2codGhpcyk7XG4gICAgICAgIHRoaXMubG9hZGluZy5zdG9wTG9hZGluZygpO1xuXG4gICAgICAgIC8vIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSh0aGlzLmN1ckxvYWRpbmdTY2VuZSk7XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc2Y2E1N3NXOW1GQ1I2eGxCNUxHcHR1dScsICdTY29yZScpO1xuLy8gU2NyaXB0XFxTY29yZS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICAgICAgdG90YWxDb3VudDogMCxcbiAgICAgICAgZWF0Q291bnQ6IDBcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMubGFiZWwgPSB0aGlzLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgfSxcbiAgICBlYXQ6IGZ1bmN0aW9uIGVhdCgpIHtcbiAgICAgICAgdGhpcy5lYXRDb3VudCsrO1xuICAgICAgICB0aGlzLmxhYmVsLnN0cmluZyA9IHRoaXMuZWF0Q291bnQ7XG4gICAgfVxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnZWFhY2VUcW1rQkMxSzNwSitVZ2tMUDMnLCAnU3RhZ2VNZW51Jyk7XG4vLyBTY3JpcHRcXFN0YWdlTWVudS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICAgICAgc3RhcjE6IGNjLk5vZGUsXG4gICAgICAgIHN0YXIyOiBjYy5Ob2RlLFxuICAgICAgICBzdGFyMzogY2MuTm9kZSxcbiAgICAgICAgbG9jazogY2MuTm9kZSxcbiAgICAgICAgc3RhZ2VTdHJpbmc6IGNjLk5vZGVcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHN0YWdlRGF0YSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuc3RhZ2UgPSBzdGFnZURhdGEuc3RhZ2U7XG4gICAgICAgIHRoaXMuc3RhZ2VTdHJpbmcuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBcIuesrFwiICsgdGhpcy5zdGFnZSArIFwi5YWzXCI7XG4gICAgICAgIHZhciBzdGFnZVN0b3JhZ2UgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0YWdlJyArIHRoaXMuc3RhZ2UpO1xuICAgICAgICBpZiAoc3RhZ2VTdG9yYWdlKSB7XG4gICAgICAgICAgICB2YXIgc2NvcmUgPSBKU09OLnBhcnNlKHN0YWdlU3RvcmFnZSkuYmVzdFNjb3JlO1xuICAgICAgICAgICAgaWYgKHNjb3JlID49IHN0YWdlRGF0YS5zdGFyMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcjEuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcjEuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2NvcmUgPj0gc3RhZ2VEYXRhLnN0YXIyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFyMi5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFyMi5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzY29yZSA+PSBzdGFnZURhdGEuc3RhcjMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXIzLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXIzLmNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sb2NrLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGFyMS5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcjIuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICAgICAgICB0aGlzLnN0YXIzLmNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDApO1xuICAgICAgICAgICAgdGhpcy5zdGFyMS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3RhcjIuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN0YXIzLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sb2NrLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZi5zdGFnZSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5sb2NrLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zdGFyMS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zdGFyMi5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zdGFyMy5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKCFzZWxmLmxvY2suYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdF9ldmVudCA9IG5ldyBjYy5FdmVudC5FdmVudEN1c3RvbSgnc2VsZWN0X3N0YWdlJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgLy/miorpgInkuK3nmoTlhbPmlL7lh7rljrtcbiAgICAgICAgICAgICAgICBzZWxlY3RfZXZlbnQuc2V0VXNlckRhdGEoc2VsZi5zdGFnZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5ub2RlLmRpc3BhdGNoRXZlbnQoc2VsZWN0X2V2ZW50KTtcbiAgICAgICAgICAgICAgICAvL3NlbGYubm9kZS5hY3RpdmU9ZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc1YWYyOWdCaEh0TEY1Z1lhUEdGTVlDNScsICdTdG9uZScpO1xuLy8gU2NyaXB0XFxTdG9uZS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG4gICAgb25Db2xsaXNpb25FbnRlcjogZnVuY3Rpb24gb25Db2xsaXNpb25FbnRlcihvdGhlciwgc2VsZikge1xuICAgICAgICBjYy5sb2coJ3NvbWV0aGluZyBrbm9jayBzdG9uZScgKyBvdGhlci5ub2RlLmdyb3VwKTtcbiAgICAgICAgaWYgKG90aGVyLm5vZGUuZ3JvdXAgPT09ICdmaXNoRycpIHtcbiAgICAgICAgICAgIC8v56Kw5Yiw6bG8XG4gICAgICAgICAgICAvL+mxvOimgeaUueWPmOihjOWKqOi3r+e6v1xuXG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNWRkZjBLWGI4RkxkSU04ZmRmczQ4QzEnLCAnVGltZXInKTtcbi8vIFNjcmlwdFxcVGltZXIuanNcblxuLy/lj6/kuI3lj6/ku6XlgZrmiJDlhazlhbHnmoRcbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICAgICAgLy8g5aKe5Yqg6L+Y5piv5YeP5bCRXG4gICAgICAgIGlzR3Jvd1VwOiB0cnVlLFxuICAgICAgICAvLyDmmK/lkKbmmK/ml7bliIbnp5JcbiAgICAgICAgaXNDbG9jazogdHJ1ZSxcblxuICAgICAgICB0b3RhbHRpbWU6IDIwLFxuXG4gICAgICAgIGluaXRUaW1lOiAwXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB0aGlzLmxhYmVsID0gdGhpcy5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAvL3RoaXMuaW5pdCgpO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdChpbml0VGltZSkge1xuICAgICAgICB0aGlzLnVuc2NoZWR1bGVBbGxDYWxsYmFja3MoKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgdHlwZSA9IGZ1bmN0aW9uIHR5cGUobykge1xuICAgICAgICAgICAgdmFyIHMgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG4gICAgICAgICAgICByZXR1cm4gcy5tYXRjaCgvXFxbb2JqZWN0ICguKj8pXFxdLylbMV0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUoaW5pdFRpbWUpID09PSAnbnVtYmVyJykgc2VsZi5pbml0VGltZSA9IGluaXRUaW1lO1xuICAgICAgICB0aGlzLmxhYmVsLnN0cmluZyA9IHNlbGYuZm9ybWF0U2Vjb25kcyhzZWxmLmluaXRUaW1lKTtcbiAgICAgICAgLy9jYy5sb2coJ3N0YXJ0IHRpbWVyIScpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gdGhpcy5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmxhYmVsLnN0cmluZyA9IHNlbGYuZm9ybWF0U2Vjb25kcyhzZWxmLmluaXRUaW1lKTtcbiAgICAgICAgICAgIGlmIChzZWxmLmlzR3Jvd1VwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pbml0VGltZSsrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRUaW1lLS07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWxmLmluaXRUaW1lIDwgMCkge1xuICAgICAgICAgICAgICAgIC8v5ZGK6K+J5Li75o6n77yM5pe26Ze05YiwXG4gICAgICAgICAgICAgICAgc2VsZi5ub2RlLmRpc3BhdGNoRXZlbnQobmV3IGNjLkV2ZW50LkV2ZW50Q3VzdG9tKCd0aW1lX3VwJywgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgIHNlbGYudW5zY2hlZHVsZUFsbENhbGxiYWNrcygpOyAvLyhzZWxmLmNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxmLmluaXRUaW1lID4gc2VsZi50b3RhbHRpbWUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm5vZGUuZGlzcGF0Y2hFdmVudChuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oJ3RpbWVfdXAnLCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgc2VsZi51bnNjaGVkdWxlQWxsQ2FsbGJhY2tzKCk7IC8vKHNlbGYuY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxKTtcbiAgICB9LFxuICAgIGZvcm1hdFNlY29uZHM6IGZ1bmN0aW9uIGZvcm1hdFNlY29uZHModmFsdWUpIHtcblxuICAgICAgICB2YXIgdGhlVGltZSA9IHBhcnNlSW50KHZhbHVlKTsgLy8g56eSXG5cbiAgICAgICAgdmFyIHRoZVRpbWUxID0gMDsgLy8g5YiGXG5cbiAgICAgICAgdmFyIHRoZVRpbWUyID0gMDsgLy8g5bCP5pe2XG5cbiAgICAgICAgaWYgKHRoZVRpbWUgPiA2MCkge1xuXG4gICAgICAgICAgICB0aGVUaW1lMSA9IHBhcnNlSW50KHRoZVRpbWUgLyA2MCk7XG5cbiAgICAgICAgICAgIHRoZVRpbWUgPSBwYXJzZUludCh0aGVUaW1lICUgNjApO1xuXG4gICAgICAgICAgICBpZiAodGhlVGltZTEgPiA2MCkge1xuXG4gICAgICAgICAgICAgICAgdGhlVGltZTIgPSBwYXJzZUludCh0aGVUaW1lMSAvIDYwKTtcblxuICAgICAgICAgICAgICAgIHRoZVRpbWUxID0gcGFyc2VJbnQodGhlVGltZTEgJSA2MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0ID0gXCJcIiArIHBhcnNlSW50KHRoZVRpbWUpICsgXCLnp5JcIjtcblxuICAgICAgICBpZiAodGhlVGltZTEgPiAwKSB7XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IFwiXCIgKyBwYXJzZUludCh0aGVUaW1lMSkgKyBcIuWIhlwiICsgcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoZVRpbWUyID4gMCkge1xuXG4gICAgICAgICAgICByZXN1bHQgPSBcIlwiICsgcGFyc2VJbnQodGhlVGltZTIpICsgXCLlsI/ml7ZcIiArIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG59KTtcbi8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4vLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4vLyB9LFxuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnOTg2OTFkWG1wQk93cXlKOUVVUmdyQXonLCAnbHVyZScpO1xuLy8gU2NyaXB0XFxsdXJlLmpzXG5cbnZhciBHYW1lID0gcmVxdWlyZSgnR2FtZScpO1xuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmFuaW0gPSB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pO1xuICAgICAgICAvL+WQkeW6lemDqOenu+WKqFxuICAgICAgICB2YXIgdGFyZ2V0X3ggPSB0aGlzLm5vZGUueDtcbiAgICAgICAgdmFyIHRhcmdldF95ID0gLWNjLndpblNpemUuaGVpZ2h0IC8gMjtcbiAgICAgICAgLy9jYy5sb2coJ3RhcmdldF94LHRhcmdldF95OicrdGFyZ2V0X3grJywnK3RhcmdldF95KTtcbiAgICAgICAgdmFyIGRvd25TcGVlZCA9IC0zMCAtIE1hdGgucmFuZG9tKCkgKiAzMDtcbiAgICAgICAgY2MubG9nKCdkb3duc3BlZWQ9JyArIGRvd25TcGVlZCk7XG4gICAgICAgIC8v6L+Z56eN5b2i5byP5LiN5a+577yM6KaB5pS55LiA5LiL77yM5LiN6IO955So57yT5Yqo77yM5LiN54S25pyJ5pe25ZyodXBkYXRl5pe25LiN6IO95Y+R546w6L+Z5LiqTk9ERVxuICAgICAgICB2YXIgbW92ZUJ5TGVmdCA9IGNjLm1vdmVCeSgxLjUsIGNjLnAoLTQwLCBkb3duU3BlZWQpLCAxMCk7XG4gICAgICAgIHZhciBtb3ZlQnlSaWdodCA9IGNjLm1vdmVCeSgxLjUsIGNjLnAoNDAsIGRvd25TcGVlZCksIDEwKTtcblxuICAgICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKGNjLnJlcGVhdEZvcmV2ZXIoY2Muc2VxdWVuY2UobW92ZUJ5TGVmdCwgbW92ZUJ5UmlnaHQpKSk7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHgpIHtcbiAgICAgICAgdGhpcy5ub2RlLnggPSB4OyAvLy1jYy53aW5TaXplLndpZHRoLzIrIE1hdGgucmFuZG9tKCkqY2Mud2luU2l6ZS53aWR0aCA7XG4gICAgICAgIGNjLmxvZyh0aGlzLm5vZGUudXVpZCArICcgaXMgY3JlYXRlZCcpO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIGxhdGVVcGRhdGU6IGZ1bmN0aW9uIGxhdGVVcGRhdGUoZHQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAodGhpcy5ub2RlLnkgPCAtY2Mud2luU2l6ZS5oZWlnaHQgLyAyICsgMTApIHtcbiAgICAgICAgICAgIC8v5Yiw5bqV5LqGXG4gICAgICAgICAgICBjYy5sb2coJyBvdmVyICcgKyB0aGlzLm5vZGUudXVpZCArICcgdGhpcy5ub2RlLnk6JyArIHRoaXMubm9kZS55KTtcbiAgICAgICAgICAgIHNlbGYuZGV0ZXJpb3JhdGUoKTtcbiAgICAgICAgICAgIC8vIHRoaXMubm9kZS5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICAgICAgLy8gdGhpcy5hbmltLnN0b3AoKTtcbiAgICAgICAgICAgIC8vIC8v6aW15Yiw5bqV5ZCO5Y+Y5YyWXG4gICAgICAgICAgICAvLyB0aGlzLnNjaGVkdWxlT25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vICAgICBsZXQgZmluaXNoZWQgPSBjYy5jYWxsRnVuYyhmdW5jdGlvbih0YXJnZXQsIGluZCkge1xuICAgICAgICAgICAgLy8gICAgICAgICAvLyBzZWxmLm5vZGUuZGVzdHJveSgpO1xuICAgICAgICAgICAgLy8gICAgICAgICBjYy5maW5kKCdDYW52YXMnKS5lbWl0KCdsdXJlX2Rlc3RvcnknLCB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICB1dWlkOiBzZWxmLm5vZGUudXVpZFxuICAgICAgICAgICAgLy8gICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vICAgICB9LCB0aGlzLCAwKTtcbiAgICAgICAgICAgIC8vICAgICBsZXQgdGludEJ5ID0gY2MudGludFRvKDEwLCAwLCAwLCAwKTtcbiAgICAgICAgICAgIC8vICAgICBzZWxmLm5vZGUucnVuQWN0aW9uKGNjLnNlcXVlbmNlKHRpbnRCeSwgZmluaXNoZWQpKTtcblxuICAgICAgICAgICAgLy8gfSwgMSk7XG4gICAgICAgICAgICB2YXIgYyA9IGNjLmZpbmQoJ0NhbnZhcycpO1xuICAgICAgICAgICAgYy5lbWl0KCdsdXJlX292ZXInLCB7XG4gICAgICAgICAgICAgICAgbXNnOiAnSGVsbG8sIHRoaXMgaXMgQ29jb3MgQ3JlYXRvcicgKyBzZWxmLm5vZGUudXVpZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYodGhpcy5ub2RlLnk8LTMwMCAmJiB0aGlzLm5vZGUueT4tMzEwKVxuICAgICAgICAvLyAgIGNjLmxvZyh0aGlzLm5vZGUudXVpZCsnLT4nK3RoaXMubm9kZS55KTtcbiAgICAgICAgdGhpcy5ub2RlLnkgPSBjYy5jbGFtcGYodGhpcy5ub2RlLnksIC1jYy53aW5TaXplLmhlaWdodCAvIDIgKyAxMCwgY2Mud2luU2l6ZS5oZWlnaHQgLyAyIC0gMTAwKTtcbiAgICB9LFxuICAgIC8v5Y+Y6LSo6L+H56iLXG4gICAgZGV0ZXJpb3JhdGU6IGZ1bmN0aW9uIGRldGVyaW9yYXRlKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMubm9kZS5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICB0aGlzLmFuaW0uc3RvcCgpO1xuICAgICAgICAvL+mlteWIsOW6leWQjuWPmOWMllxuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZmluaXNoZWQgPSBjYy5jYWxsRnVuYyhmdW5jdGlvbiAodGFyZ2V0LCBpbmQpIHtcbiAgICAgICAgICAgICAgICAvLyBzZWxmLm5vZGUuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIGNjLmZpbmQoJ0NhbnZhcycpLmVtaXQoJ2x1cmVfZGVzdHJveScsIHtcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogc2VsZi5ub2RlLnV1aWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMsIDApO1xuICAgICAgICAgICAgdmFyIHRpbnRCeSA9IGNjLnRpbnRUbygxMCwgMCwgMCwgMCk7XG4gICAgICAgICAgICBzZWxmLm5vZGUucnVuQWN0aW9uKGNjLnNlcXVlbmNlKHRpbnRCeSwgZmluaXNoZWQpKTtcbiAgICAgICAgfSwgMSk7XG4gICAgfSxcbiAgICBvbkNvbGxpc2lvbkVudGVyOiBmdW5jdGlvbiBvbkNvbGxpc2lvbkVudGVyKG90aGVyLCBzZWxmKSB7XG5cbiAgICAgICAgaWYgKG90aGVyLm5vZGUuZ3JvdXAgPT09ICdmaXNoRycpIHtcbiAgICAgICAgICAgIGNjLmxvZygnZmlzaC5ub2RlLmdyb3VwJyArIG90aGVyLm5vZGUuZ3JvdXApO1xuICAgICAgICAgICAgLy/norDliLDpsbxcbiAgICAgICAgICAgIHRoaXMubm9kZS5zdG9wQWxsQWN0aW9ucygpO1xuXG4gICAgICAgICAgICBpZiAob3RoZXIuZ2V0Q29tcG9uZW50KCdDb250cm9sJykuZmF2b3JpdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUuZGlzcGF0Y2hFdmVudChuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oJ2x1cmVfZWF0ZWQnLCB0cnVlKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNjLmZpbmQoJ0NhbnZhcycpLmVtaXQoJ2x1cmVfZGVzdHJveScsIHtcbiAgICAgICAgICAgICAgICB1dWlkOiBzZWxmLm5vZGUudXVpZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG90aGVyLm5vZGUuZ3JvdXAgPT09ICdzdG9uZUcnKSB7XG4gICAgICAgICAgICBjYy5sb2coJ2x1cmUga25vY2sgc3RvbmUgJyArIG90aGVyLm5vZGUuZ3JvdXApO1xuICAgICAgICAgICAgLy/norDliLDpmpznoo1cbiAgICAgICAgICAgIHRoaXMuZGV0ZXJpb3JhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiXX0=
