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
},{}],"DialogData":[function(require,module,exports){
"use strict";
cc._RFpush(module, '06de47huHlDtrJChyefWhyU', 'DialogData');
// Script\DialogData.js

var DialogData = function DialogData() {
	this["in"] = null;
	this.roles = [];
	this.phrases = [];
	this.sequence = null;
	this.current = 0;
};
var TYPE = DialogData.Type = cc.Enum({
	PHRASE: 0,
	OPTION: 1
});
cc.js.mixin(DialogData.prototype, {
	start: function start() {
		this.current = this["in"];
	},

	getRole: function getRole(id) {
		return this.roles[id];
	},

	appendPhrase: function appendPhrase(role, phrase) {
		var roleid = this.roles.indexOf(role);
		if (roleid === -1) {
			roleid = this.roles.length;
			this.roles.push(role);
		}
		this.phrases.push({
			type: TYPE.PHRASE,
			role: roleid,
			phrase: phrase
		});
	},

	appendOption: function appendOption(options) {
		this.phrases.push({
			type: TYPE.OPTION,
			options: options
		});
	},

	next: function next() {
		var phrase = this.phrases[this.current];
		this.current++;
		return phrase;
	}
});

module.exports = DialogData;

cc._RFpop();
},{}],"DialogParser":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'd26e5CWYvJGeYqRBweXn0mq', 'DialogParser');
// Script\DialogParser.js

var DialogData = require('DialogData');

var DialogParser = (function () {
    var PHRASE_REG = /^#([\s\w\d]+)#(.+)$/;
    var OPTION_SEP = '|';

    return {
        parseDialog: function parseDialog(content) {
            var data = new DialogData();
            data['in'] = content['in'];

            var entries = content.entries;
            var sequence = content.sequence;
            var i, l;

            for (i in entries) {
                var entry = entries[i];
                var phrase = PHRASE_REG.exec(entry);
                if (phrase) {
                    data.appendPhrase(i, phrase[1], phrase[2]);
                    continue;
                }
                var options = entry.split(OPTION_SEP);
                if (options.length > 1) {
                    data.appendOption(options);
                    continue;
                }
            }
            data.sequence = sequence;
            return data;
        }
    };
})();

module.exports = DialogParser;

cc._RFpop();
},{"DialogData":"DialogData"}],"Dialog":[function(require,module,exports){
"use strict";
cc._RFpush(module, '212e4Qa1uVMm7oth4zyXzbK', 'Dialog');
// Script\Dialog.js

var DialogParser = require("DialogParser");
var DialogData = require("DialogData");

cc.Class({
    "extends": cc.Component,

    properties: {
        optionPrefab: cc.Prefab,
        phraseLabel: cc.Label,
        optionPanel: cc.Node
    },

    // use this for initialization
    onLoad: function onLoad() {
        var self = this;
        cc.loader.loadRes("dialogs/lileihanmeimei", function (error, content) {
            if (error) {
                cc.log(error);
            } else {
                self.dialog = DialogParser.parseDialog(content);
                self.dialog.start();
                self.stepDialog();
            }
        });

        this.node.on('touchend', function () {
            this.stepDialog();
        }, this);
    },

    stepDialog: function stepDialog() {
        if (!this.dialog) return;

        this.optionPanel.active = false;
        var curr = this.dialog.next();
        switch (curr.type) {
            case DialogData.Type.PHRASE:
                var role = this.dialog.getRole(curr.role);
                this.phraseLabel.string = role + ": " + curr.phrase;
                break;
            case DialogData.Type.OPTION:
                this.optionPanel.removeAllChildren();
                this.optionPanel.active = true;
                var options = curr.options;
                for (var i = 0, l = options.length; i < l; ++i) {
                    // TODO: need use option object pool
                    var option = cc.instantiate(this.optionPrefab);
                    // TODO: Add component to option prefab
                    option.children[0].getComponent(cc.Label).string = options[i];
                    this.optionPanel.addChild(option);
                }
                break;
        }
    }
});

cc._RFpop();
},{"DialogData":"DialogData","DialogParser":"DialogParser"}],"Game":[function(require,module,exports){
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
        cc.view.enableAntiAlias(false);
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
},{"Game":"Game"}]},{},["DialogData","Loading","Dialog","Game","Control","SceneManager","Camera","Stone","Timer","Knock","Score","lure","Menu","Board","Biglure","DialogParser","StageMenu"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L0NvY29zQ3JlYXRvci9yZXNvdXJjZXMvYXBwLmFzYXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImFzc2V0cy9TY3JpcHQvQmlnbHVyZS5qcyIsImFzc2V0cy9TY3JpcHQvQm9hcmQuanMiLCJhc3NldHMvU2NyaXB0L0NhbWVyYS5qcyIsImFzc2V0cy9TY3JpcHQvQ29udHJvbC5qcyIsImFzc2V0cy9TY3JpcHQvRGlhbG9nRGF0YS5qcyIsImFzc2V0cy9TY3JpcHQvRGlhbG9nUGFyc2VyLmpzIiwiYXNzZXRzL1NjcmlwdC9EaWFsb2cuanMiLCJhc3NldHMvU2NyaXB0L0dhbWUuanMiLCJhc3NldHMvU2NyaXB0L0tub2NrLmpzIiwiYXNzZXRzL1NjcmlwdC9Mb2FkaW5nLmpzIiwiYXNzZXRzL1NjcmlwdC9NZW51LmpzIiwiYXNzZXRzL1NjcmlwdC9TY2VuZU1hbmFnZXIuanMiLCJhc3NldHMvU2NyaXB0L1Njb3JlLmpzIiwiYXNzZXRzL1NjcmlwdC9TdGFnZU1lbnUuanMiLCJhc3NldHMvU2NyaXB0L1N0b25lLmpzIiwiYXNzZXRzL1NjcmlwdC9UaW1lci5qcyIsImFzc2V0cy9TY3JpcHQvbHVyZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2NmZDBlUW5rVmxKbzZjVElNeHBNQVdDJywgJ0JpZ2x1cmUnKTtcbi8vIFNjcmlwdFxcQmlnbHVyZS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHNwZWVkOiAxLFxuICAgICAgICBsdXJlUGVyOiAxLFxuICAgICAgICBpbnRlcnZhbDogNVxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL+ihjOS4uu+8mjEu5byA5aeL5pe25Ye6546w5Zyo5qiq6L2055qE5p+Q5Liq54K5XG4gICAgICAgIC8vMi7lkJHkuIDkuKrmlrnlvI/np7vliqjvvIznp7vliqjlvaLlvI/lj6/og73mmK/pmo/mnLrnmoRcbiAgICAgICAgLy8zLuS4jeS8muenu+WHuuWxj+W5lVxuICAgICAgICAvLzQu54K55Ye75ZCO77yM5pS+5LiL5LiA77yI5aSa77yJ5Liq6aW177yM54S25ZCO6L+Z5Liq5aSn6aW15raI5aSxXG4gICAgICAgIC8vNS7lvZPkuIDlrprml7bpl7Tpl7TpmpTlkI7lho3lh7rnjrDvvIjmmoLlrprvvIlcbiAgICAgICAgdGhpcy5tb3ZlRGlyZWN0aW9uID0gMTtcbiAgICAgICAgdGhpcy50aHJvd0NvdW50ID0gMDtcblxuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLm5vZGUub3BhY2l0eSA9PT0gMjU1KSB7XG4gICAgICAgICAgICAgICAgY2MubG9nKCd0aHJvd19sdXJlJyk7XG4gICAgICAgICAgICAgICAgLy/lj5Hlh7rkuovku7ZcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRDdXN0b20gPSBuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oJ3Rocm93X2x1cmUnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBldmVudEN1c3RvbS5zZXRVc2VyRGF0YShzZWxmLm5vZGUueCk7XG4gICAgICAgICAgICAgICAgc2VsZi5ub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnRDdXN0b20pO1xuICAgICAgICAgICAgICAgIC8v6K6h6YePXG4gICAgICAgICAgICAgICAgc2VsZi50aHJvd0NvdW50Kys7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYudGhyb3dDb3VudCA9PT0gc2VsZi5sdXJlUGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubm9kZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aHJvd0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgLy/kuIvmrKHlh7rnjrDml7bpl7RcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zY2hlZHVsZU9uY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pbml0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm5vZGUub3BhY2l0eSA9IDI1NTtcbiAgICAgICAgICAgICAgICAgICAgfSwgc2VsZi5pbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIHZhciB4ID0gLWNjLndpblNpemUud2lkdGggLyAyICsgNTAgKyAoY2Mud2luU2l6ZS53aWR0aCAtIDUwKSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHRoaXMubm9kZS54ID0geDtcbiAgICB9LFxuXG4gICAgc3RyYXRlZ3lSdW46IGZ1bmN0aW9uIHN0cmF0ZWd5UnVuKCkge1xuICAgICAgICB2YXIgeCA9IHRoaXMubm9kZS54ICsgdGhpcy5zcGVlZCAqIHRoaXMubW92ZURpcmVjdGlvbjtcblxuICAgICAgICBpZiAoeCA+IGNjLndpblNpemUud2lkdGggLyAyIC0gNTApIHtcblxuICAgICAgICAgICAgeCA9IGNjLndpblNpemUud2lkdGggLyAyIC0gNTA7XG4gICAgICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSAtdGhpcy5tb3ZlRGlyZWN0aW9uO1xuICAgICAgICAgICAgY2MubG9nKCd0dXJuIGxlZnQgYW5kIHg6JyArIHggKyAnIG1vdmVEaXJlY3Rpb246JyArIHRoaXMubW92ZURpcmVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHggPCAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyA1MCkge1xuXG4gICAgICAgICAgICB4ID0gLWNjLndpblNpemUud2lkdGggLyAyICsgNTA7XG4gICAgICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSAtdGhpcy5tb3ZlRGlyZWN0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubm9kZS54ID0geDtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICB0aGlzLnN0cmF0ZWd5UnVuKCk7XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdiMjNhNDFFL09oQllMSkVURFFmdE5pUScsICdCb2FyZCcpO1xuLy8gU2NyaXB0XFxCb2FyZC5qc1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgc3RhcjE6IGNjLk5vZGUsXG4gICAgICAgIHN0YXIyOiBjYy5Ob2RlLFxuICAgICAgICBzdGFyMzogY2MuTm9kZSxcbiAgICAgICAgc3RhZ2VTdHJpbmc6IGNjLk5vZGUsXG4gICAgICAgIHN0YWdlU2NvcmU6IGNjLk5vZGUsXG4gICAgICAgIHN0YWdlQmVzdFNjb3JlOiBjYy5Ob2RlXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdChyZXN1bHQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL3Jlc3VsdC50aW1lXG4gICAgICAgIC8vcmVzdWx0LmVhdGx1cmVDb3VudFxuICAgICAgICAvL3Jlc3VsdC5zdGFnZVxuICAgICAgICB2YXIgc3RhZ2UgPSByZXN1bHQuc3RhZ2U7XG4gICAgICAgIHNlbGYuc3RhZ2UgPSBzdGFnZTtcbiAgICAgICAgc2VsZi5zdGFnZVN0cmluZy5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IFwi56ysXCIgKyBzdGFnZSArIFwi5YWzXCI7XG4gICAgICAgIHNlbGYuY3VyclN0YWdlID0gcmVzdWx0O1xuICAgICAgICBzZWxmLnN0YWdlU2NvcmUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSByZXN1bHQuc2NvcmU7XG4gICAgICAgIHNlbGYuZ2V0U3RhcnMocmVzdWx0LnNjb3JlKTtcbiAgICAgICAgdmFyIHN0YWdlc3RyaW5nID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzdGFnZScgKyBzdGFnZSk7XG4gICAgICAgIGlmICghc3RhZ2VzdHJpbmcpIHtcbiAgICAgICAgICAgIHZhciBzdGFnZVN0b3JhZ2UgPSBKU09OLnBhcnNlKHN0YWdlc3RyaW5nKTtcblxuICAgICAgICAgICAgc2VsZi5zdGFnZUJlc3RTY29yZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IHN0YWdlU3RvcmFnZS5iZXN0U2NvcmU7XG4gICAgICAgICAgICBzZWxmLmJlc3RTY29yZSA9IHN0YWdlU3RvcmFnZS5iZXN0U2NvcmU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmJlc3RTY29yZSA9IDA7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldFN0YXJzOiBmdW5jdGlvbiBnZXRTdGFycyhzY29yZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzdGFnZXNEYXRhID0gY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KCdHYW1lJykuc3RhZ2VzRGF0YTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFnZXNEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoc3RhZ2VzRGF0YVtpXS5zdGFnZSA9PT0gc2VsZi5zdGFnZSkge1xuICAgICAgICAgICAgICAgIGlmIChzY29yZSA+PSBzdGFnZXNEYXRhW2ldLnN0YXIxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcjEuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFyMS5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNjb3JlID49IHN0YWdlc0RhdGFbaV0uc3RhcjIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFyMi5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXIyLmNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPj0gc3RhZ2VzRGF0YVtpXS5zdGFyMykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXIzLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcjMuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvL+S4i+S4gOWFs1xuICAgIGNvbW1hbmQ6IGZ1bmN0aW9uIGNvbW1hbmQoZXZlbnQsIGN1c3RvbUV2ZW50RGF0YSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuc2F2ZURhdGEoKTtcbiAgICAgICAgY2MubG9nKGN1c3RvbUV2ZW50RGF0YSk7XG4gICAgICAgIHNlbGYubm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBjYy5FdmVudC5FdmVudEN1c3RvbShjdXN0b21FdmVudERhdGEsIHRydWUpKTtcbiAgICAgICAgc2VsZi5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8gbWVudTogZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAvLyAgICAgc2VsZi5zYXZlRGF0YSgpO1xuICAgIC8vICAgICBzZWxmLm5vZGUuZGlzcGF0Y2hFdmVudChuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oJ21lbnUnLCB0cnVlKSk7XG4gICAgLy8gICAgIHNlbGYubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAvLyB9LFxuICAgIHNhdmVEYXRhOiBmdW5jdGlvbiBzYXZlRGF0YSgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL+S/neWtmOacrOWFs+aVsOaNrlxuICAgICAgICBpZiAoc2VsZi5jdXJyU3RhZ2Uuc2NvcmUgPiBzZWxmLmJlc3RTY29yZSkge1xuICAgICAgICAgICAgc2VsZi5iZXN0U2NvcmUgPSBzZWxmLmN1cnJTdGFnZS5zY29yZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RhZ2VKc29uID0ge1xuICAgICAgICAgICAgYmVzdFNjb3JlOiBzZWxmLmJlc3RTY29yZVxuICAgICAgICB9O1xuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0YWdlJyArIHNlbGYuc3RhZ2UsIEpTT04uc3RyaW5naWZ5KHN0YWdlSnNvbikpO1xuICAgIH0sXG4gICAgLy8gcmVsb2FkOmZ1bmN0aW9uKCl7XG4gICAgLy8gICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAvLyAgICAgc2VsZi5zYXZlRGF0YSgpO1xuICAgIC8vICAgICBzZWxmLm5vZGUuZGlzcGF0Y2hFdmVudChuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oJ3JlbG9hZCcsIHRydWUpKTtcbiAgICAvLyAgICAgc2VsZi5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgIC8vIH0sXG4gICAgLy/mmoLml7bnroDljZXorqHnrpfvvIzlj6rnrpfmnKrooqvlkIPliLDnmoTppbXmlbBcbiAgICBjb3VudFN0YXI6IGZ1bmN0aW9uIGNvdW50U3RhcihlYXRMdXJlQ291bnQsIHRocm93THVyZUNvdW50KSB7XG4gICAgICAgIHZhciBzY29yZSA9IHRocm93THVyZUNvdW50IC0gZWF0THVyZUNvdW50O1xuICAgICAgICBpZiAoc2NvcmUgPT09IDApIHt9XG4gICAgICAgIGlmIChzY29yZSA+IDAgJiYgc2NvcmUgPD0gMykge31cbiAgICAgICAgaWYgKHNjb3JlID4gMykge31cbiAgICAgICAgLy/mnIDlkI7liKnnlKhnYW1l55qE5Yqf6IO96K+75Y+WbG9jYWxzdG9yYWdl5L+d5a2Y57uT5p6cXG4gICAgfVxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNTM3MWV1U0d0OUhaNTY3a0t3eG9WQjcnLCAnQ2FtZXJhJyk7XG4vLyBTY3JpcHRcXENhbWVyYS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICBcImRlZmF1bHRcIjogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcblxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAgIFwiZGVmYXVsdFwiOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB2YXIgd2luU2l6ZSA9IGNjLndpblNpemU7XG4gICAgICAgIHRoaXMuc2NyZWVuTWlkZGxlID0gY2MudjIod2luU2l6ZS53aWR0aCAvIDIsIHdpblNpemUuaGVpZ2h0IC8gMik7XG5cbiAgICAgICAgdGhpcy5ib3VuZGluZ0JveCA9IGNjLnJlY3QoMCwgMCwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5taW54ID0gLSh0aGlzLmJvdW5kaW5nQm94LnhNYXggLSB3aW5TaXplLndpZHRoKTtcbiAgICAgICAgdGhpcy5tYXh4ID0gdGhpcy5ib3VuZGluZ0JveC54TWluO1xuICAgICAgICB0aGlzLm1pbnkgPSAtKHRoaXMuYm91bmRpbmdCb3gueU1heCAtIHdpblNpemUuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5tYXh5ID0gdGhpcy5ib3VuZGluZ0JveC55TWluO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLm5vZGUuY29udmVydFRvV29ybGRTcGFjZUFSKGNjLlZlYzIuWkVSTyk7XG4gICAgICAgIHZhciB0YXJnZXRQb3MgPSB0aGlzLnRhcmdldC5jb252ZXJ0VG9Xb3JsZFNwYWNlQVIoY2MuVmVjMi5aRVJPKTtcbiAgICAgICAgdmFyIGRpZiA9IHBvcy5zdWIodGFyZ2V0UG9zKTtcblxuICAgICAgICB2YXIgZGVzdCA9IGRpZi5hZGQodGhpcy5zY3JlZW5NaWRkbGUpO1xuXG4gICAgICAgIGRlc3QueCA9IGNjLmNsYW1wZihkZXN0LngsIHRoaXMubWlueCwgdGhpcy5tYXh4KTtcbiAgICAgICAgZGVzdC55ID0gY2MuY2xhbXBmKGRlc3QueSwgdGhpcy5taW55LCB0aGlzLm1heHkpO1xuXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbiA9IHRoaXMubm9kZS5wYXJlbnQuY29udmVydFRvTm9kZVNwYWNlQVIoZGVzdCk7XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc0YmY0ZTZ3NHlwTndLTmRtbFhHWUFKZScsICdDb250cm9sJyk7XG4vLyBTY3JpcHRcXENvbnRyb2wuanNcblxudmFyIEZpc2hSdW5TdGF0dXMgPSBjYy5FbnVtKHtcbiAgICBzdG9wOiAwLFxuICAgIGNvbnRyb2w6IDEsXG4gICAgZmluZDogMixcbiAgICByYW5kb206IDNcbn0pO1xuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvL+i/kOihjOaAp++8jDB+MeS5i+mXtO+8jOi2iuWwj+i2iueIseWKqFxuICAgICAgICBtb3ZlX3JhdGU6IDAuNCxcbiAgICAgICAgbWF4X3NlZWQ6IDEwLFxuICAgICAgICBzcGVlZDogMTAsXG4gICAgICAgIHR1cm5fc3BlZWQ6IDUsXG4gICAgICAgIGlkbGVfdGltZTogNSxcbiAgICAgICAgZmF2b3JpdGU6IGZhbHNlLFxuICAgICAgICBzdGFyOiBjYy5Ob2RlLFxuICAgICAgICBsdXJlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlLFxuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5zdG9wO1xuICAgICAgICAvKiAgIFxuICAgICAgICDpsbznmoTnibnmgKfvvJpcbiAgICAgICAgMS7oh6rlt7HmuLjvvIzkvJrlgZzkuIDkvJrlhL/vvIzlho3muLhcbiAgICAgICAgMi7kvJrmib7nprvoh6rlt7HmnIDov5HnmoTppbVcbiAgICAgICAgMy7ppbXnmoTlh7rnjrDkvJrorqnpsbzlkJHlhbbmuLjov5FcbiAgICAgICAgKi9cbiAgICAgICAgLy8gYWRkIGtleSBkb3duIGFuZCBrZXkgdXAgZXZlbnRcblxuICAgICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX0RPV04sIHRoaXMub25LZXlEb3duLCB0aGlzKTtcbiAgICAgICAgY2Muc3lzdGVtRXZlbnQub24oY2MuU3lzdGVtRXZlbnQuRXZlbnRUeXBlLktFWV9VUCwgdGhpcy5vbktleVVwLCB0aGlzKTtcblxuICAgICAgICB0aGlzLmFuaW0gPSB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pO1xuICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSBudWxsO1xuICAgICAgICB0aGlzLnNwcml0ZSA9IHRoaXMuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG5cbiAgICAgICAgLy/mr48156eS5oOz5LiA5LiL77yM5piv5LiN5piv6KaB5ri4XG4gICAgICAgIHRoaXMuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2MubG9nKCdmaXNoIHN0YXR1czonICsgc2VsZi5ydW5fc3RhdHVzKTtcbiAgICAgICAgICAgIC8v5LuO5YGc5q2i54q25oCBIOi/m+WFpSDoh6rnlLHov5DliqhcbiAgICAgICAgICAgIGlmIChzZWxmLnJ1bl9zdGF0dXMgPT09IEZpc2hSdW5TdGF0dXMuc3RvcCkge1xuICAgICAgICAgICAgICAgIC8v5p+Q56eN5bGe5oCn77yM5piv5LiN5piv54ix5YqoXG4gICAgICAgICAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiB0aGlzLm1vdmVfcmF0ZSkgc2VsZi5yYW5kb21SdW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgc2VsZi5pZGxlX3RpbWUgKiBNYXRoLnJhbmRvbSgpKTtcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQocHJvcGVydGllcykge1xuICAgICAgICAvL+WQiOW5tuS4gOS6m+WxnuaApyBtaXhpbj9cbiAgICAgICAgY2MubG9nKHRoaXMpO1xuICAgICAgICBjYy5qcy5taXhpbih0aGlzLCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgLy90aGlzLmZhdm9yaXRlPXByb3BlcnRpZXMuZmF2b3JpdGU7XG5cbiAgICAgICAgaWYgKCF0aGlzLmZhdm9yaXRlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXIuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY2MubG9nKCd0aGlzLm5vZGUucGFyZW50Jyk7XG4gICAgICAgIGNjLmxvZyh0aGlzLm5vZGUucGFyZW50KTtcbiAgICAgICAgLy8gY2MubG9nKHRoaXMpO1xuICAgIH0sXG5cbiAgICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICBjYy5zeXN0ZW1FdmVudC5vZmYoY2MuU3lzdGVtRXZlbnQuRXZlbnRUeXBlLktFWV9ET1dOLCB0aGlzLm9uS2V5RG93biwgdGhpcyk7XG4gICAgICAgIGNjLnN5c3RlbUV2ZW50Lm9mZihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX1VQLCB0aGlzLm9uS2V5VXAsIHRoaXMpO1xuICAgIH0sXG5cbiAgICBvbktleURvd246IGZ1bmN0aW9uIG9uS2V5RG93bihldmVudCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBkaXJjdGlvbl9yb3RhdGlvbiA9IDA7XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlICE9PSB0aGlzLm1vdmVEaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmxlZnQ6XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5jb3VudFJvdGF0aW9uKDI3MCk7XG4gICAgICAgICAgICAgICAgICAgIGRpcmN0aW9uX3JvdGF0aW9uID0gMjcwO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnJpZ2h0OlxuXG4gICAgICAgICAgICAgICAgICAgIGRpcmN0aW9uX3JvdGF0aW9uID0gOTA7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkudXA6XG5cbiAgICAgICAgICAgICAgICAgICAgZGlyY3Rpb25fcm90YXRpb24gPSAwO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmFuaW0ucGxheSgnZmlzaF91cCcpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5kb3duOlxuICAgICAgICAgICAgICAgICAgICBkaXJjdGlvbl9yb3RhdGlvbiA9IDE4MDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuc3BhY2U6XG4gICAgICAgICAgICAgICAgICAgIC8vIGNjLmxvZygnZGQnK3RoaXMubHVyZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWF0QWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2MubG9nKCd0aGlzLm1vdmVEaXJlY3Rpb246JyArIHRoaXMubW92ZURpcmVjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbkNvbnRyb2woZGlyY3Rpb25fcm90YXRpb24sIGV2ZW50LmtleUNvZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy90aGlzLmNvdW50Um90YXRpb24oZGlyY3Rpb25fcm90YXRpb24pO1xuICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSBldmVudC5rZXlDb2RlO1xuICAgIH0sXG4gICAgY291bnRBbmdsZTogZnVuY3Rpb24gY291bnRBbmdsZSh0YXJnZXQsIHNlbGYpIHtcbiAgICAgICAgdmFyIGxlbl95ID0gdGFyZ2V0LnkgLSBzZWxmLnk7XG4gICAgICAgIHZhciBsZW5feCA9IHRhcmdldC54IC0gc2VsZi54O1xuXG4gICAgICAgIHZhciB0YW5feXggPSBNYXRoLmFicyhsZW5feSkgLyBNYXRoLmFicyhsZW5feCk7XG4gICAgICAgIHZhciBhbmdsZSA9IDA7XG4gICAgICAgIGlmIChsZW5feSA+IDAgJiYgbGVuX3ggPCAwKSB7XG4gICAgICAgICAgICBhbmdsZSA9IE1hdGguYXRhbih0YW5feXgpICogMTgwIC8gTWF0aC5QSSAtIDkwO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbl95ID4gMCAmJiBsZW5feCA+IDApIHtcbiAgICAgICAgICAgIGFuZ2xlID0gOTAgLSBNYXRoLmF0YW4odGFuX3l4KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuX3kgPCAwICYmIGxlbl94IDwgMCkge1xuICAgICAgICAgICAgYW5nbGUgPSAtTWF0aC5hdGFuKHRhbl95eCkgKiAxODAgLyBNYXRoLlBJIC0gOTA7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuX3kgPCAwICYmIGxlbl94ID4gMCkge1xuICAgICAgICAgICAgYW5nbGUgPSBNYXRoLmF0YW4odGFuX3l4KSAqIDE4MCAvIE1hdGguUEkgKyA5MDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYW5nbGU7XG4gICAgfSxcbiAgICBlYXRBY3Rpb246IGZ1bmN0aW9uIGVhdEFjdGlvbigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBpZiAodGhpcy5sdXJlKSB7XG4gICAgICAgICAgICB2YXIgX3JldCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5sdXJlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMud2FudEVhdFRoaW5rKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5sdXJlID09IHVuZGVmaW5lZCB8fCAhX3RoaXMubHVyZSB8fCBfdGhpcy5sdXJlID09PSBudWxsIHx8ICFfdGhpcy5sdXJlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/lnKjov73nmoTov4fnqIvkuK3vvIzppbXlm6DkuLrmn5Dnp43ljp/lm6DmsqHkuobvvIxcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuc3RvcDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHY6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNjLmxvZygnIHdhbnQgZWF0ICcgKyBfdGhpcy5sdXJlLnV1aWQgKyAnICcgKyBfdGhpcy5sdXJlLngpO1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gX3RoaXM7XG4gICAgICAgICAgICAgICAgLy8gbGV0IGxlbl95ID0gdGhpcy5sdXJlLnkgLSB0aGlzLm5vZGUueTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgbGVuX3ggPSB0aGlzLmx1cmUueCAtIHRoaXMubm9kZS54O1xuXG4gICAgICAgICAgICAgICAgLy8gbGV0IHRhbl95eCA9IE1hdGguYWJzKGxlbl95KSAvIE1hdGguYWJzKGxlbl94KTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgYW5nbGUgPSAwO1xuICAgICAgICAgICAgICAgIC8vIGlmIChsZW5feSA+IDAgJiYgbGVuX3ggPCAwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGFuZ2xlID0gTWF0aC5hdGFuKHRhbl95eCkgKiAxODAgLyBNYXRoLlBJIC0gOTA7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChsZW5feSA+IDAgJiYgbGVuX3ggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGFuZ2xlID0gOTAgLSBNYXRoLmF0YW4odGFuX3l4KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChsZW5feSA8IDAgJiYgbGVuX3ggPCAwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGFuZ2xlID0gLU1hdGguYXRhbih0YW5feXgpICogMTgwIC8gTWF0aC5QSSAtIDkwO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAobGVuX3kgPCAwICYmIGxlbl94ID4gMCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBhbmdsZSA9IE1hdGguYXRhbih0YW5feXgpICogMTgwIC8gTWF0aC5QSSArIDkwO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICB2YXIgYW5nbGUgPSBfdGhpcy5jb3VudEFuZ2xlKF90aGlzLmx1cmUsIF90aGlzLm5vZGUpO1xuICAgICAgICAgICAgICAgIC8vICBjYy5sb2coJ2FuZ2xlOicrYW5nbGUpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHhfID0gTWF0aC5jb3MoYW5nbGUpICogX3RoaXMuc3BlZWQ7XG4gICAgICAgICAgICAgICAgdmFyIHlfID0gTWF0aC5zaW4oYW5nbGUpICogX3RoaXMuc3BlZWQ7XG4gICAgICAgICAgICAgICAgLy8gY2MubG9nKCd4Xyx5XzonK3hfKycsJyt5Xyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmluaXNoZWQgPSBjYy5jYWxsRnVuYyhmdW5jdGlvbiAodGFyZ2V0LCBpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jYy5sb2coJ2ZpbmlzaGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubm9kZS5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICAvLyBjYy5sb2coJ3RoaXMubHVyZTonK3RoaXMubHVyZS5wb3NpdGlvbi54KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubHVyZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL+WmguaenOmltei/mOWcqO+8jOe7p+e7reWQg1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lYXRBY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v5om+5Y+m5LiA5Liq6aW1XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2FudmFzU2NyaXB0ID0gY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KCdHYW1lJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FudmFzU2NyaXB0Lmx1cmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLndhbnRFYXRUaGluayhjYW52YXNTY3JpcHQubHVyZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNjLmxvZygnIGZpbmQgJytjYW52YXNTY3JpcHQubHVyZXNbMF0udXVpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VsZi5sdXJlPWNhbnZhc1NjcmlwdC5sdXJlc1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZWxmLmVhdEFjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5zdG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIF90aGlzLCAwKTtcbiAgICAgICAgICAgICAgICAvL+i/meS4quaXtumXtOimgeWPmOWMllxuICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IGNjLnBEaXN0YW5jZShfdGhpcy5ub2RlLmdldFBvc2l0aW9uKCksIF90aGlzLmx1cmUuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICAgICAgdmFyIHNwZWVkID0gX3RoaXMubWF4X3NlZWQgKiAwLjU7XG4gICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwZWVkID0gX3RoaXMubWF4X3NlZWQgKiAwLjE1O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCA4MCkge1xuICAgICAgICAgICAgICAgICAgICBzcGVlZCA9IF90aGlzLm1heF9zZWVkICogMC4wMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2MubG9nKCduZXcgc3BlZWQ6JyArIHNwZWVkKTtcbiAgICAgICAgICAgICAgICB2YXIgcm90YXRlVG8gPSBjYy5yb3RhdGVUbyhzcGVlZCAvIDIsIGFuZ2xlKTsgLy9jYy5yb3RhdGVUbygwLjUsIGFuZ2xlKTtcbiAgICAgICAgICAgICAgICB2YXIgZm9sbG93QWN0aW9uID0gY2MubW92ZVRvKHNwZWVkLCBfdGhpcy5sdXJlKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgLy/lrabkuaDnmoTov4fnqIvvvIzlvZPmkp7liLDlkI7vvIzorrDlvZXkuobpmpznoo3vvIzlho3mgJ3ogIPml7bopoHogIPomZHpmpznoo1cbiAgICAgICAgICAgICAgICAvLyBpZiAoc2VsZi5wYXRoUG9seWdvbnMpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgbGV0IHBhdGhzID0gc2VsZi5maW5kUGF0aChzZWxmLm5vZGUuZ2V0UG9zaXRpb24oKSwgc2VsZi5sdXJlLmdldFBvc2l0aW9uKCksIHNlbGYucGF0aFBvbHlnb25zLCBzZWxmLnN0b25lUG9seWdvbnMsIFtdKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgbGV0IHBhdGggPSBzZWxmLnNob3J0UGF0aChwYXRocyk7XG4gICAgICAgICAgICAgICAgLy8gICAgIGlmIChwYXRoID09PSB1bmRlZmluZWQgfHwgcGF0aCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY2MubG9nKCdkaXJlY3QgcGF0aCcpO1xuXG4gICAgICAgICAgICAgICAgLy8gICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjYy5sb2cocGF0aHMpO1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY2MubG9nKCdmaW5kIHBhdGggd2l0aCBzdG9uZSAnKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNjLmxvZyhwYXRoKTtcblxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZm9sbG93QWN0aW9uID0gY2MuY2FyZGluYWxTcGxpbmVUbyhzcGVlZCxbY2MucCgtMjAyLDApLGNjLnAoMCwwKV0sMCk7Ly9jYy5jYXJkaW5hbFNwbGluZVRvKHNwZWVkLCBwYXRoLCAwKTsgLy90ZW5zaW9u57Sn5byg5bqm77yM6KaB6ICD6YeP5LiA5LiLXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICByb3RhdGVUbyA9IGNjLnJvdGF0ZVRvKHNwZWVkICwgYW5nbGUpO1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbihjYy5zcGF3bihmb2xsb3dBY3Rpb24sIGNjLnNlcXVlbmNlKHJvdGF0ZVRvLCBmaW5pc2hlZCkpKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBfdGhpcy5ub2RlLnJ1bkFjdGlvbihjYy5zcGF3bihmb2xsb3dBY3Rpb24sIGNjLnNlcXVlbmNlKHJvdGF0ZVRvLCBmaW5pc2hlZCkpKTtcblxuICAgICAgICAgICAgICAgIC8vIGZvbGxvd0FjdGlvbi5lYXNpbmcoY2MuZWFzZVF1YXJ0aWNBY3Rpb25JbigpKTtcblxuICAgICAgICAgICAgICAgIC8v5YGc5q2i5LmL5YmN55qE5Yqo5L2c77yM6L2s6ICM5omn6KGM5LiL6Z2i55qE5Yqo5L2cXG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB2OiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfcmV0ID09PSAnb2JqZWN0JykgcmV0dXJuIF9yZXQudjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuc3RvcDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/ku7vmhI/muLgvL+S5n+WPr+iDveWBnOS4i+adpVxuICAgIHJhbmRvbVJ1bjogZnVuY3Rpb24gcmFuZG9tUnVuKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciB4ID0gLWNjLndpblNpemUud2lkdGggLyAyICsgY2Mud2luU2l6ZS53aWR0aCAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHZhciB5ID0gLWNjLndpblNpemUuaGVpZ2h0IC8gMiArIChjYy53aW5TaXplLmhlaWdodCAtIDEwMCkgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICB2YXIgc3BlZWQgPSB0aGlzLm1heF9zZWVkICogKE1hdGgucmFuZG9tKCkgKiAwLjggKyAwLjIpO1xuICAgICAgICBjYy5sb2coJ2Zpc2ggcmFuZG9tIHJ1biAnICsgeCArICcsJyArIHkgKyAnIGF0ICcgKyBzcGVlZCk7XG4gICAgICAgIHZhciBtb3ZlVG8gPSBjYy5tb3ZlVG8oc3BlZWQsIGNjLnAoeCwgeSkpO1xuXG4gICAgICAgIHZhciBmaW5pc2hlZCA9IGNjLmNhbGxGdW5jKGZ1bmN0aW9uICh0YXJnZXQsIGluZCkge1xuICAgICAgICAgICAgc2VsZi5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5zdG9wO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGFuZ2xlID0gdGhpcy5jb3VudEFuZ2xlKGNjLnAoeCwgeSksIHRoaXMubm9kZSk7XG4gICAgICAgIGNjLmxvZygnYW5nbGU6JyArIGFuZ2xlKTtcblxuICAgICAgICB2YXIgcm90YXRlVG8gPSBjYy5yb3RhdGVUbygwLjI1ICsgTWF0aC5yYW5kb20oKSAqIDIsIGFuZ2xlKTtcbiAgICAgICAgdGhpcy5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5yYW5kb207IC8v54q25oCB5Y+Y5YyW5LqGXG4gICAgICAgIHZhciByYW5kb21BY3Rpb24gPSBjYy5zcGF3bihyb3RhdGVUbywgY2Muc2VxdWVuY2UobW92ZVRvLCBmaW5pc2hlZCkpO1xuICAgICAgICByYW5kb21BY3Rpb24uc2V0VGFnKEZpc2hSdW5TdGF0dXMucmFuZG9tKTtcbiAgICAgICAgLy8gY2MubG9nKHJhbmRvbUFjdGlvbik7XG4gICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24ocmFuZG9tQWN0aW9uKTtcbiAgICB9LFxuICAgIC8v5a+55omA5pyJ6aW16L+b6KGM6K+E5Lyw77yM5om+5Yiw5pyA5oOz5ZCD5pyA6L+R55qE5LiA5LiqXG4gICAgd2FudEVhdFRoaW5rOiBmdW5jdGlvbiB3YW50RWF0VGhpbmsobHVyZXMpIHtcbiAgICAgICAgaWYgKGx1cmVzID09PSBudWxsKSB7XG4gICAgICAgICAgICBsdXJlcyA9IGNjLmZpbmQoJ0NhbnZhcycpLmdldENvbXBvbmVudCgnR2FtZScpLmx1cmVzOyAvL25vZGVcbiAgICAgICAgICAgIGNjLmxvZygnZmluZCBsdXJlcyBmcm9tIGNhbnZhcycpO1xuICAgICAgICB9XG4gICAgICAgIGNjLmxvZygnbHVyZXM6Jyk7XG4gICAgICAgIGNjLmxvZyhsdXJlcyk7XG4gICAgICAgIGlmICghbHVyZXMpIHtcbiAgICAgICAgICAgIGNjLmxvZygndW5kZWZpbmVkIGx1cmVzJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGx1cmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuZmluZDsgLy9maW5kIGx1cmVcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGlzdGFuY2UgPSA5OTk5O1xuICAgICAgICAvL+WvueS6jui3neemu+W3ruS4jeWkmueahO+8jOaYr+S4jeaYr+maj+acuuWkhOeQhuWRou+8n+i/mOaYr+iuqeS4pOWPqumxvOaSnuWcqOS4gOi1t++8n1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGx1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGlzdGFuY2VfID0gY2MucERpc3RhbmNlKHRoaXMubm9kZS5nZXRQb3NpdGlvbigpLCBsdXJlc1tpXS5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+IGRpc3RhbmNlXykge1xuICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2VfO1xuICAgICAgICAgICAgICAgIHRoaXMubHVyZSA9IGx1cmVzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNjLmxvZygnIGZpbmQgJyArIHRoaXMubHVyZS51dWlkKTtcbiAgICAgICAgdGhpcy5lYXRBY3Rpb24oKTtcbiAgICB9LFxuICAgIC8v6ZSu55uY5o6n5Yi277yM5pqC5pe25LiN6KaB5LqGXG4gICAgYWN0aW9uQ29udHJvbDogZnVuY3Rpb24gYWN0aW9uQ29udHJvbChkaXJjdGlvbl9yb3RhdGlvbiwgY29kZSkge1xuICAgICAgICB2YXIgeCA9IHRoaXMubm9kZS5wb3NpdGlvbi54O1xuICAgICAgICB2YXIgeSA9IHRoaXMubm9kZS5wb3NpdGlvbi55O1xuICAgICAgICAvLyBjYy5sb2coJ2JlIHgseTonICsgeCArICcgJyArIHkgKyAnICcgKyBjb2RlKTtcbiAgICAgICAgdmFyIHJvdGF0ZVRvID0gY2Mucm90YXRlVG8oMC41LCBkaXJjdGlvbl9yb3RhdGlvbik7XG4gICAgICAgIHJvdGF0ZVRvLmVhc2luZyhjYy5lYXNlRWxhc3RpY091dCgpKTtcbiAgICAgICAgdmFyIHhfID0geDtcbiAgICAgICAgdmFyIHlfID0geTtcbiAgICAgICAgc3dpdGNoIChjb2RlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgY2MuS0VZLmxlZnQ6XG4gICAgICAgICAgICAgICAgeF8gPSB4IC0gMTA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjLktFWS5yaWdodDpcbiAgICAgICAgICAgICAgICB4XyA9IHggKyAxMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY2MuS0VZLnVwOlxuICAgICAgICAgICAgICAgIHlfID0geSArIDEwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjYy5LRVkuZG93bjpcbiAgICAgICAgICAgICAgICB5XyA9IHkgLSAxMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvL2NjLmxvZyh4XyArICcgOiAnICsgeV8pO1xuICAgICAgICB2YXIgYmV6aWVyVG8gPSBjYy5tb3ZlVG8oMS41LCBjYy5wKHhfLCB5XykpOyAvLyxjYy5wKHgtMzAseSsyMCksY2MucCh4LTQwLHkpXSk7XG4gICAgICAgIGJlemllclRvLmVhc2luZyhjYy5lYXNlRWxhc3RpY0luKCkpO1xuICAgICAgICAvLyBiZXppZXJUby5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uSW4oKSk7ICAgICAvL2NjLmJlemllclRvKDIsW2NjLnAoeCx5KSxjYy5wKHgrNDAseSs0MCksY2MucCh4LHkrODApLGNjLnAoeC00MCx5KzQwKSxjYy5wKHgseSldKTtcbiAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbihjYy5zcGF3bihyb3RhdGVUbywgYmV6aWVyVG8pKTtcbiAgICB9LFxuXG4gICAgY291bnRSb3RhdGlvbjogZnVuY3Rpb24gY291bnRSb3RhdGlvbihkaXJjdGlvbl9yb3RhdGlvbikge1xuICAgICAgICB0aGlzLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLmNvbnRyb2w7IC8vcnVubmluZ1xuICAgICAgICB0aGlzLnN0YXJ0X3JvdGF0aW9uID0gdGhpcy5ub2RlLnJvdGF0aW9uO1xuICAgICAgICB0aGlzLmVuZF9yb3RhdGlvbiA9IGRpcmN0aW9uX3JvdGF0aW9uO1xuICAgICAgICB0aGlzLmNsb2Nrd2lzZSA9IDE7XG4gICAgICAgIC8v5pa55ZCR56ys5LiA5qyh6K6h566XXG4gICAgICAgIHZhciBkdmFsdWUgPSB0aGlzLmVuZF9yb3RhdGlvbiAtIHRoaXMuc3RhcnRfcm90YXRpb247XG4gICAgICAgIGlmIChkdmFsdWUgPT09IDAgfHwgZHZhbHVlID09PSAzNjApIHRoaXMucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuc3RvcDtcbiAgICAgICAgaWYgKGR2YWx1ZSA8IDApIHRoaXMuY2xvY2t3aXNlID0gLXRoaXMuY2xvY2t3aXNlO1xuICAgICAgICAvL+imgei9rOeahOinkuW6plxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5lbmRfcm90YXRpb24gLSB0aGlzLnN0YXJ0X3JvdGF0aW9uKSA+IDE4MCkge1xuICAgICAgICAgICAgdGhpcy50dXJuX3JvdGF0aW9uID0gMzYwIC0gTWF0aC5hYnModGhpcy5lbmRfcm90YXRpb24gLSB0aGlzLnN0YXJ0X3JvdGF0aW9uKTtcbiAgICAgICAgICAgIC8v5pa55ZCR56ys5LqM5qyh6K6h566XXG4gICAgICAgICAgICB0aGlzLmNsb2Nrd2lzZSA9IC10aGlzLmNsb2Nrd2lzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHVybl9yb3RhdGlvbiA9IE1hdGguYWJzKHRoaXMuZW5kX3JvdGF0aW9uIC0gdGhpcy5zdGFydF9yb3RhdGlvbik7IC8v6KaB6L2s55qE6KeS5bqmXG4gICAgICAgIH1cbiAgICAgICAgLy8gICBjYy5sb2codGhpcy50dXJuX3JvdGF0aW9uKTtcbiAgICAgICAgLy8gICBjYy5sb2codGhpcy5jbG9ja3dpc2UpO1xuICAgICAgICAvLyAgIGNjLmxvZyh0aGlzLm5vZGUucm90YXRpb24pO1xuICAgICAgICAvL2NjLmxvZyhjb252ZXJ0VG9Xb3JsZFNwYWNlQVIgdGhpcy5ub2RlLnBvc2l0aW9uKTtcbiAgICB9LFxuXG4gICAgb25LZXlVcDogZnVuY3Rpb24gb25LZXlVcChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gdGhpcy5tb3ZlRGlyZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uQ29sbGlzaW9uRW50ZXI6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uRW50ZXIob3RoZXIsIHNlbGYpIHtcbiAgICAgICAgaWYgKG90aGVyLm5vZGUuZ3JvdXAgPT09ICdzdG9uZUcnKSB7XG4gICAgICAgICAgICBjYy5sb2coJ2Zpc2gga25vY2sgc3RvbmUnICsgb3RoZXIubm9kZS5ncm91cCk7XG4gICAgICAgICAgICBjYy5sb2cob3RoZXIpO1xuICAgICAgICAgICAgLy/norDliLDpsbxcbiAgICAgICAgICAgIC8v6K6w5b+G6Zqc56KNXG4gICAgICAgICAgICBpZiAodGhpcy5zdG9uZVBvbHlnb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcG9seWdvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICB2YXIgY2FudmFzID0gY2MuZmluZCgnQ2FudmFzJyk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdGhlci5wb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnNbaV0gPSBjYW52YXMuY29udmVydFRvTm9kZVNwYWNlQVIob3RoZXIud29ybGQucG9pbnRzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9uZVBvbHlnb25zID0gcG9seWdvbnM7XG4gICAgICAgICAgICAgICAgY2MubG9nKCdtZW1vIHRoZSBzdG9uZVBvbHlnb25zJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL+mxvOimgeaUueWPmOihjOWKqOi3r+e6v1xuICAgICAgICAgICAgdGhpcy5zdHJhdGVneVJ1bihvdGhlci5ub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3RoZXIubm9kZS5ncm91cCA9PT0gJ3BhdGhHJyAmJiB0aGlzLnBhdGhQb2x5Z29ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjYy5sb2coJ21lbW8gdGhlIHBhdGhQb2x5Z29ucycpO1xuICAgICAgICAgICAgdmFyIHBvbHlnb25zID0gW107XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY2MuZmluZCgnQ2FudmFzJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG90aGVyLnBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBvbHlnb25zW2ldID0gY2FudmFzLmNvbnZlcnRUb05vZGVTcGFjZUFSKG90aGVyLndvcmxkLnBvaW50c1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnBhdGhQb2x5Z29ucyA9IHBvbHlnb25zO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdGhlci5ub2RlLmdyb3VwID09PSAnZmlzaEcnKSB7XG4gICAgICAgICAgICAvL+WmguaenOaYr+mxvOS4jumxvOebuOaSnlxuICAgICAgICAgICAgdGhpcy5zdHJhdGVneVJ1bihvdGhlci5ub2RlLCAwLjE1LCAwLjMsIHRydWUsIDUwKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/lj43lvLnnmoRBSemAu+i+kVxuICAgIHN0cmF0ZWd5UnVuOiBmdW5jdGlvbiBzdHJhdGVneVJ1bihvdGhlciwgdGVtcFNwZWVkLCB0ZW1wUm90YXRlU3BlZWQsIGltbWVkaWF0ZWx5LCByYW5nZSkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8v5b2T5YmN5piv5pyJ55uu5qCH55qE5ri477yM6L+Y5piv6Zey5ri4XG4gICAgICAgIGlmIChzZWxmLnJ1bl9zdGF0dXMgPT09IEZpc2hSdW5TdGF0dXMucmFuZG9tIHx8IHNlbGYucnVuX3N0YXR1cyA9PT0gRmlzaFJ1blN0YXR1cy5maW5kIHx8IHNlbGYucnVuX3N0YXR1cyA9PT0gRmlzaFJ1blN0YXR1cy5zdG9wKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgLy8gbGV0IHhfcmFuZ2UgPSBNYXRoLmFicyhjYy53aW5TaXplLndpZHRoIC8gMiAtIE1hdGguYWJzKHNlbGYubm9kZS54KSk7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHlfcmFuZ2UgPSBNYXRoLmFicyhjYy53aW5TaXplLmhlaWdodCAvIDIgLSBNYXRoLmFicyhzZWxmLm5vZGUueSkgLSAxMDApO1xuICAgICAgICAgICAgICAgIC8vIGxldCB4ID0gc2VsZi5ub2RlLnggKyB4X3JhbmdlICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgeSA9IHNlbGYubm9kZS55ICsgeV9yYW5nZSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgdmFyIHhfcmFuZ2UgPSAxMDAgKyA1MCAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgdmFyIHlfcmFuZ2UgPSAxMDAgKyA1MCAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHhfcmFuZ2UgPSByYW5nZSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgICAgIHlfcmFuZ2UgPSByYW5nZSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJ1bl9zdGF0dXNfb3JnID0gc2VsZi5ydW5fc3RhdHVzO1xuICAgICAgICAgICAgICAgIHZhciB4ID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICB5ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChvdGhlci54ID49IHNlbGYubm9kZS54KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgeCA9IHNlbGYubm9kZS54IC0geF9yYW5nZTsgLy8tY2Mud2luU2l6ZS53aWR0aCAvIDIgKyB4X3JhbmdlICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IHNlbGYubm9kZS54ICsgeF9yYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvdGhlci55ID49IHNlbGYubm9kZS55KSB7XG4gICAgICAgICAgICAgICAgICAgIHkgPSBzZWxmLm5vZGUueSAtIHlfcmFuZ2U7IC8vLWNjLndpblNpemUuaGVpZ2h0IC8gMiArIHlfcmFuZ2UgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5ID0gc2VsZi5ub2RlLnkgKyB5X3JhbmdlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYy5sb2coJ2FmdGVyIGtub2NrIHRoZW4gd2FudCAnICsgeCArICcsJyArIHkpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHNwZWVkID0gX3RoaXMyLm1heF9zZWVkICogKE1hdGgucmFuZG9tKCkgKiAwLjggKyAwLjIpO1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wU3BlZWQpIHNwZWVkID0gdGVtcFNwZWVkO1xuICAgICAgICAgICAgICAgIHZhciBtb3ZlVG8gPSBjYy5tb3ZlVG8oc3BlZWQsIGNjLnAoeCwgeSkpO1xuICAgICAgICAgICAgICAgIC8vICAgeD01MCtjYy53aW5TaXplLndpZHRoLzIqTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICAvLyAgIHk9NTArY2Mud2luU2l6ZS5oZWlnaHQvMipNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIC8vIHZhciBtbmcgPSBjYy5kaXJlY3Rvci5nZXRBY3Rpb25NYW5hZ2VyKCk7XG4gICAgICAgICAgICAgICAgLy8gY2MubG9nKG1uZy5nZXRBY3Rpb25CeVRhZyhGaXNoUnVuU3RhdHVzLnJhbmRvbSx0aGlzLm5vZGUpKTtcbiAgICAgICAgICAgICAgICAvLyBtb3ZlVG89Y2MucmV2ZXJzZVRpbWUobW5nLmdldEFjdGlvbkJ5VGFnKEZpc2hSdW5TdGF0dXMucmFuZG9tLHRoaXMubm9kZSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGV0IG1vdmVCeSA9IGNjLm1vdmVCeShzcGVlZCwgY2MucCh4LCB5KSk7XG4gICAgICAgICAgICAgICAgdmFyIGZpbmlzaGVkID0gY2MuY2FsbEZ1bmMoZnVuY3Rpb24gKHRhcmdldCwgaW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChydW5fc3RhdHVzX29yZyA9PT0gRmlzaFJ1blN0YXR1cy5yYW5kb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuc3RvcDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocnVuX3N0YXR1c19vcmcgPT09IEZpc2hSdW5TdGF0dXMuZmluZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5ydW5fc3RhdHVzID0gcnVuX3N0YXR1c19vcmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL+mlteayoeacieS4ou+8jOi/mOaDs+edgFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8vL+mpseaVo+WujOS6hu+8jOW6lOivpemHjeaWsOaJvuebruagh1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi53YW50RWF0VGhpbmsobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NlbGYuZWF0QWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjYy5sb2coJ290aGVyIGFuZ2xlOicgKyBfdGhpczIuY291bnRBbmdsZShfdGhpczIubm9kZS5jb252ZXJ0VG9Ob2RlU3BhY2UoY2MucCh4LCB5KSksIGNjLnAoMCwgMCkpICsgXCIgfCBcIiArIF90aGlzMi5jb3VudEFuZ2xlKGNjLnAoeCwgeSksIF90aGlzMi5ub2RlKSk7XG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gX3RoaXMyLmNvdW50QW5nbGUoY2MucCh4LCB5KSwgX3RoaXMyLm5vZGUpO1xuICAgICAgICAgICAgICAgIC8vIGFuZ2xlPShhbmdsZT4xODA/NTQwLXRoaXMubm9kZS5yb3RhdGlvbjp0aGlzLm5vZGUucm90YXRpb24tOTApO1xuICAgICAgICAgICAgICAgIHZhciByb3RhdGVTcGVlZCA9IF90aGlzMi50dXJuX3NwZWVkICogTWF0aC5yYW5kb20oKSArIDAuMjtcbiAgICAgICAgICAgICAgICBpZiAodGVtcFJvdGF0ZVNwZWVkKSByb3RhdGVTcGVlZCA9IHRlbXBSb3RhdGVTcGVlZDtcbiAgICAgICAgICAgICAgICB2YXIgcm90YXRlVG8gPSBjYy5yb3RhdGVUbyhyb3RhdGVTcGVlZCwgYW5nbGUpO1xuICAgICAgICAgICAgICAgIC8v5YWI5YGc5LiL5Y6f5p2l5q2j5Zyo6L+b6KGM55qE5Yqo5L2c77yI5a+86Ie056Kw5pKe55qE77yJXG4gICAgICAgICAgICAgICAgX3RoaXMyLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICBjYy5sb2coJ2tub2NrIHJ1biBhbmQgc3RhdHVzOicgKyBfdGhpczIucnVuX3N0YXR1cyArICcgc3BlZWQ6JyArIHNwZWVkICsgJyBhbmQgYW5nbGU6JyArIGFuZ2xlKTtcbiAgICAgICAgICAgICAgICAvL+WQkeWPpuS4gOS4quaWueWQkei/kOWKqFxuICAgICAgICAgICAgICAgIC8vIHNlbGYucnVuX3N0YXR1cz1GaXNoUnVuU3RhdHVzLnJhbmRvbTtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGlmIChpbW1lZGlhdGVseSkgX3RoaXMyLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICBfdGhpczIubm9kZS5ydW5BY3Rpb24oY2Muc3Bhd24ocm90YXRlVG8sIGNjLnNlcXVlbmNlKG1vdmVUbywgZmluaXNoZWQpKSk7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvL+WBh+iuvuaaguaXtuWPquacieS4gOS4qumanOeijeeJqVxuICAgIGZpbmRQYXRoOiBmdW5jdGlvbiBmaW5kUGF0aChzdGFydFBvcywgdGFyZ2V0UG9zLCBwYXRoUG9seWdvbnMsIHN0b25lUG9seWdvbnMsIHBhdGgpIHtcbiAgICAgICAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCkgcGF0aCA9IFtdO1xuICAgICAgICBpZiAoIWNjLkludGVyc2VjdGlvbi5saW5lUG9seWdvbihzdGFydFBvcywgdGFyZ2V0UG9zLCBzdG9uZVBvbHlnb25zKSkge1xuXG4gICAgICAgICAgICBwYXRoLnVuc2hpZnQoc3RhcnRQb3MpO1xuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRlbXBQb2x5Z29ucyA9IFtdO1xuICAgICAgICB2YXIgdGVtcFBvbHlnb25zXyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhQb2x5Z29ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNjLkludGVyc2VjdGlvbi5saW5lUG9seWdvbihzdGFydFBvcywgcGF0aFBvbHlnb25zW2ldLCBzdG9uZVBvbHlnb25zKSkge1xuICAgICAgICAgICAgICAgIHRlbXBQb2x5Z29ucy5wdXNoKHBhdGhQb2x5Z29uc1tpXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBQb2x5Z29uc18ucHVzaChwYXRoUG9seWdvbnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGlmKHRlbXBQb2x5Z29uc18ubGVuZ3RoPjEpe1xuICAgICAgICAvL2xldCBsZW49cGF0aC5sZW5ndGg7XG4gICAgICAgIC8vIGlmICh0ZW1wUG9seWdvbnNfLmxlbmd0aCA9PT0gMCkge1xuXG4gICAgICAgIC8vIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZW1wUG9seWdvbnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSBwYXRoID0gW107XG5cbiAgICAgICAgICAgIHZhciBwYXRoQnJhbmNoID0gdGhpcy5maW5kUGF0aCh0ZW1wUG9seWdvbnNfW2ldLCB0YXJnZXRQb3MsIHRlbXBQb2x5Z29ucywgc3RvbmVQb2x5Z29ucywgcGF0aFtpXSk7XG4gICAgICAgICAgICBpZiAocGF0aEJyYW5jaC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvL2NjLmxvZyhwYXRoKTtcbiAgICAgICAgICAgICAgICBwYXRoQnJhbmNoID0gbnVsbDtcbiAgICAgICAgICAgICAgICAvL3JldHVybiBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGF0aEJyYW5jaFswXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgcGF0aEJyYW5jaC5sZW5ndGg7IG4rKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhCcmFuY2hbbl0ucHVzaCh0YXJnZXRQb3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IHBhdGhCcmFuY2g7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoQnJhbmNoLnVuc2hpZnQoc3RhcnRQb3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFtpXSA9IHBhdGhCcmFuY2g7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vcGF0aC5jb25jYXQocGF0aCxwYXRoQnJhbmNoKTtcbiAgICAgICAgICAgIC8vcGF0aFtsZW4gKyBpXSA9IHRoaXMuZmluZFBhdGhfKHRlbXBQb2x5Z29uc19baV0sdGFyZ2V0UG9zLHRlbXBQb2x5Z29ucyxzdG9uZVBvbHlnb25zLHBhdGhbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfSxcbiAgICBzaG9ydFBhdGg6IGZ1bmN0aW9uIHNob3J0UGF0aChwYXRocykge1xuICAgICAgICB2YXIgcyA9IDA7XG4gICAgICAgIHZhciBtYXhEaXN0YW5jZSA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwYXRoID0gcGF0aHNbaV07XG4gICAgICAgICAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkIHx8IHBhdGggPT09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGF0aCkpIHtcbiAgICAgICAgICAgICAgICBwYXRoLnVuc2hpZnQodGhpcy5ub2RlLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmIChjYy5wRGlzdGFuY2UocGF0aHNbMF0sIHRoaXMubm9kZS5nZXRQb3NpdGlvbigpKSA9PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICBwYXRocy51bnNoaWZ0KHRoaXMubm9kZS5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHBhdGgubGVuZ3RoIC0gMTsgbisrKSB7XG4gICAgICAgICAgICAgICAgZGlzdGFuY2UgKz0gY2MucERpc3RhbmNlKHBhdGhbbl0sIHBhdGhbbiArIDFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICBzID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGhzW3NdLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBwYXRoc1tzXTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAodGhpcy5ydW5fc3RhdHVzID09PSBGaXNoUnVuU3RhdHVzLmNvbnRyb2wpIHtcbiAgICAgICAgICAgIC8v5Zyo6L+Q5Yqo5Lit55qE6K+dXG5cbiAgICAgICAgICAgIC8vIGNjLmxvZygnY3Vycl9yb3RhdGlvbjonK3RoaXMubm9kZS5yb3RhdGlvbisnIGVuZF9yb3RhdGlvbjonK3RoaXMuZW5kX3JvdGF0aW9uKycgdGhpcy5zcGVlZDonK3RoaXMuc3BlZWQpO1xuICAgICAgICAgICAgdGhpcy5ub2RlLnJvdGF0aW9uICs9IHRoaXMudHVybl9zcGVlZCAqIHRoaXMuY2xvY2t3aXNlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5ub2RlLnJvdGF0aW9uID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ub2RlLnJvdGF0aW9uID09PSB0aGlzLmVuZF9yb3RhdGlvbiB8fCB0aGlzLm5vZGUucm90YXRpb24gLSAzNjAgPT09IHRoaXMuZW5kX3JvdGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuc3RvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5ub2RlLnJvdGF0aW9uIDwgMCkge1xuICAgICAgICAgICAgICAgIGlmICgzNjAgKyB0aGlzLm5vZGUucm90YXRpb24gPT09IHRoaXMuZW5kX3JvdGF0aW9uIHx8IHRoaXMubm9kZS5yb3RhdGlvbiArIDM2MCA9PT0gdGhpcy5lbmRfcm90YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5zdG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGUucm90YXRpb24gPiAzNjApIHRoaXMubm9kZS5yb3RhdGlvbiA9IHRoaXMubm9kZS5yb3RhdGlvbiAtIDM2MDtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGUucm90YXRpb24gPCAtMzYwKSB0aGlzLm5vZGUucm90YXRpb24gPSB0aGlzLm5vZGUucm90YXRpb24gKyAzNjA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2MubG9nKCdzdGF0dXM6JyArIHRoaXMucnVuX3N0YXR1cyk7XG4gICAgICAgIGlmICh0aGlzLnJ1bl9zdGF0dXMgIT0gRmlzaFJ1blN0YXR1cy5jb250cm9sKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMubW92ZURpcmVjdGlvbikge1xuXG4gICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkubGVmdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlLnggLT0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkucmlnaHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZS54ICs9IHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnVwOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGUueSArPSB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5kb3duOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGUueSAtPSB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoaXMubm9kZS54PS00MDA7XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLm5vZGUueCkgPiAoY2Mud2luU2l6ZS53aWR0aCAtIDEwMCkgLyAyKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IChjYy53aW5TaXplLndpZHRoIC0gMTAwKSAvIDIgKiB0aGlzLm5vZGUueCAvIE1hdGguYWJzKHRoaXMubm9kZS54KTtcbiAgICAgICAgfVxuICAgICAgICAvL2NjLmxvZyh0aGlzLm5vZGUueCArIFwiIFwiICsgdGhpcy5ub2RlLngpO1xuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5ub2RlLnkpID4gKGNjLndpblNpemUuaGVpZ2h0IC0gMTApIC8gMikge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnkgPSAoY2Mud2luU2l6ZS5oZWlnaHQgLSAxMDApIC8gMiAqIHRoaXMubm9kZS55IC8gTWF0aC5hYnModGhpcy5ub2RlLnkpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcwNmRlNDdodUhsRHRySkNoeWVmV2h5VScsICdEaWFsb2dEYXRhJyk7XG4vLyBTY3JpcHRcXERpYWxvZ0RhdGEuanNcblxudmFyIERpYWxvZ0RhdGEgPSBmdW5jdGlvbiBEaWFsb2dEYXRhKCkge1xuXHR0aGlzW1wiaW5cIl0gPSBudWxsO1xuXHR0aGlzLnJvbGVzID0gW107XG5cdHRoaXMucGhyYXNlcyA9IFtdO1xuXHR0aGlzLnNlcXVlbmNlID0gbnVsbDtcblx0dGhpcy5jdXJyZW50ID0gMDtcbn07XG52YXIgVFlQRSA9IERpYWxvZ0RhdGEuVHlwZSA9IGNjLkVudW0oe1xuXHRQSFJBU0U6IDAsXG5cdE9QVElPTjogMVxufSk7XG5jYy5qcy5taXhpbihEaWFsb2dEYXRhLnByb3RvdHlwZSwge1xuXHRzdGFydDogZnVuY3Rpb24gc3RhcnQoKSB7XG5cdFx0dGhpcy5jdXJyZW50ID0gdGhpc1tcImluXCJdO1xuXHR9LFxuXG5cdGdldFJvbGU6IGZ1bmN0aW9uIGdldFJvbGUoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5yb2xlc1tpZF07XG5cdH0sXG5cblx0YXBwZW5kUGhyYXNlOiBmdW5jdGlvbiBhcHBlbmRQaHJhc2Uocm9sZSwgcGhyYXNlKSB7XG5cdFx0dmFyIHJvbGVpZCA9IHRoaXMucm9sZXMuaW5kZXhPZihyb2xlKTtcblx0XHRpZiAocm9sZWlkID09PSAtMSkge1xuXHRcdFx0cm9sZWlkID0gdGhpcy5yb2xlcy5sZW5ndGg7XG5cdFx0XHR0aGlzLnJvbGVzLnB1c2gocm9sZSk7XG5cdFx0fVxuXHRcdHRoaXMucGhyYXNlcy5wdXNoKHtcblx0XHRcdHR5cGU6IFRZUEUuUEhSQVNFLFxuXHRcdFx0cm9sZTogcm9sZWlkLFxuXHRcdFx0cGhyYXNlOiBwaHJhc2Vcblx0XHR9KTtcblx0fSxcblxuXHRhcHBlbmRPcHRpb246IGZ1bmN0aW9uIGFwcGVuZE9wdGlvbihvcHRpb25zKSB7XG5cdFx0dGhpcy5waHJhc2VzLnB1c2goe1xuXHRcdFx0dHlwZTogVFlQRS5PUFRJT04sXG5cdFx0XHRvcHRpb25zOiBvcHRpb25zXG5cdFx0fSk7XG5cdH0sXG5cblx0bmV4dDogZnVuY3Rpb24gbmV4dCgpIHtcblx0XHR2YXIgcGhyYXNlID0gdGhpcy5waHJhc2VzW3RoaXMuY3VycmVudF07XG5cdFx0dGhpcy5jdXJyZW50Kys7XG5cdFx0cmV0dXJuIHBocmFzZTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGlhbG9nRGF0YTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2QyNmU1Q1dZdkpHZVlxUkJ3ZVhuMG1xJywgJ0RpYWxvZ1BhcnNlcicpO1xuLy8gU2NyaXB0XFxEaWFsb2dQYXJzZXIuanNcblxudmFyIERpYWxvZ0RhdGEgPSByZXF1aXJlKCdEaWFsb2dEYXRhJyk7XG5cbnZhciBEaWFsb2dQYXJzZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBQSFJBU0VfUkVHID0gL14jKFtcXHNcXHdcXGRdKykjKC4rKSQvO1xuICAgIHZhciBPUFRJT05fU0VQID0gJ3wnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFyc2VEaWFsb2c6IGZ1bmN0aW9uIHBhcnNlRGlhbG9nKGNvbnRlbnQpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IERpYWxvZ0RhdGEoKTtcbiAgICAgICAgICAgIGRhdGFbJ2luJ10gPSBjb250ZW50WydpbiddO1xuXG4gICAgICAgICAgICB2YXIgZW50cmllcyA9IGNvbnRlbnQuZW50cmllcztcbiAgICAgICAgICAgIHZhciBzZXF1ZW5jZSA9IGNvbnRlbnQuc2VxdWVuY2U7XG4gICAgICAgICAgICB2YXIgaSwgbDtcblxuICAgICAgICAgICAgZm9yIChpIGluIGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBwaHJhc2UgPSBQSFJBU0VfUkVHLmV4ZWMoZW50cnkpO1xuICAgICAgICAgICAgICAgIGlmIChwaHJhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5hcHBlbmRQaHJhc2UoaSwgcGhyYXNlWzFdLCBwaHJhc2VbMl0pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBlbnRyeS5zcGxpdChPUFRJT05fU0VQKTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuYXBwZW5kT3B0aW9uKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhLnNlcXVlbmNlID0gc2VxdWVuY2U7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWxvZ1BhcnNlcjtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzIxMmU0UWExdVZNbTdvdGg0enlYemJLJywgJ0RpYWxvZycpO1xuLy8gU2NyaXB0XFxEaWFsb2cuanNcblxudmFyIERpYWxvZ1BhcnNlciA9IHJlcXVpcmUoXCJEaWFsb2dQYXJzZXJcIik7XG52YXIgRGlhbG9nRGF0YSA9IHJlcXVpcmUoXCJEaWFsb2dEYXRhXCIpO1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgb3B0aW9uUHJlZmFiOiBjYy5QcmVmYWIsXG4gICAgICAgIHBocmFzZUxhYmVsOiBjYy5MYWJlbCxcbiAgICAgICAgb3B0aW9uUGFuZWw6IGNjLk5vZGVcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMoXCJkaWFsb2dzL2xpbGVpaGFubWVpbWVpXCIsIGZ1bmN0aW9uIChlcnJvciwgY29udGVudCkge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY2MubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kaWFsb2cgPSBEaWFsb2dQYXJzZXIucGFyc2VEaWFsb2coY29udGVudCk7XG4gICAgICAgICAgICAgICAgc2VsZi5kaWFsb2cuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBzZWxmLnN0ZXBEaWFsb2coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ub2RlLm9uKCd0b3VjaGVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc3RlcERpYWxvZygpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgc3RlcERpYWxvZzogZnVuY3Rpb24gc3RlcERpYWxvZygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRpYWxvZykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMub3B0aW9uUGFuZWwuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHZhciBjdXJyID0gdGhpcy5kaWFsb2cubmV4dCgpO1xuICAgICAgICBzd2l0Y2ggKGN1cnIudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBEaWFsb2dEYXRhLlR5cGUuUEhSQVNFOlxuICAgICAgICAgICAgICAgIHZhciByb2xlID0gdGhpcy5kaWFsb2cuZ2V0Um9sZShjdXJyLnJvbGUpO1xuICAgICAgICAgICAgICAgIHRoaXMucGhyYXNlTGFiZWwuc3RyaW5nID0gcm9sZSArIFwiOiBcIiArIGN1cnIucGhyYXNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEaWFsb2dEYXRhLlR5cGUuT1BUSU9OOlxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uUGFuZWwucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvblBhbmVsLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBjdXJyLm9wdGlvbnM7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvcHRpb25zLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBuZWVkIHVzZSBvcHRpb24gb2JqZWN0IHBvb2xcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IGNjLmluc3RhbnRpYXRlKHRoaXMub3B0aW9uUHJlZmFiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogQWRkIGNvbXBvbmVudCB0byBvcHRpb24gcHJlZmFiXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5jaGlsZHJlblswXS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IG9wdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uUGFuZWwuYWRkQ2hpbGQob3B0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzM5ZjJiZ09JNVZPRksyS1JCQ1RBMGpiJywgJ0dhbWUnKTtcbi8vIFNjcmlwdFxcR2FtZS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgICAgbHVyZVByZWZhYjogY2MuUHJlZmFiLFxuICAgICAgICBmaXNoUHJlZmFiOiBjYy5QcmVmYWIsXG4gICAgICAgIC8v6ZyA6KaB5Yid5aeL5YyW55qEXG4gICAgICAgIGtub2NrOiBjYy5Ob2RlLFxuICAgICAgICBzY29yZTogY2MuTm9kZSxcbiAgICAgICAgdGltZXI6IGNjLk5vZGUsXG4gICAgICAgIGVhdENvdW50OiBjYy5Ob2RlLFxuICAgICAgICBib2FyZDogY2MuTm9kZSxcbiAgICAgICAgYmlnTHVyZTogY2MuTm9kZSxcbiAgICAgICAgc3RvbmU6IGNjLk5vZGUsXG4gICAgICAgIG1lbnU6IGNjLk5vZGUsXG4gICAgICAgIHN0YWdlU3RyaW5nOiBjYy5Ob2RlLFxuXG4gICAgICAgIHN0YWdlOiAxLFxuICAgICAgICBkaXNwZXJzZURpc3RhbmNlOiAxMDAsXG5cbiAgICAgICAgZmlzaDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBvdGhlckZpc2g6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogW10sXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH1cblxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbWFuYWdlciA9IGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKTtcbiAgICAgICAgbWFuYWdlci5lbmFibGVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmtub2NrLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmtub2NrQW5pbWF0aW9uID0gdGhpcy5rbm9jay5nZXRDb21wb25lbnQoY2MuQW5pbWF0aW9uKTtcblxuICAgICAgICB0aGlzLnNjb3JlTGFiZWwgPSB0aGlzLnNjb3JlLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHRoaXMuc2NvcmVTY3JpcHQgPSB0aGlzLnNjb3JlLmdldENvbXBvbmVudCgnU2NvcmUnKTtcbiAgICAgICAgLy/lj5bliLDlhbPljaHorr7orqHmlofku7YtLeaUvuWIsGxvYWRpbmfkuK1cbiAgICAgICAgLy9jYy5sb2FkZXIubG9hZFJlcygnc3RhZ2VzLmpzb24nLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBjYy5maW5kKCdsb2FkaW5nJykuZ2V0Q29tcG9uZW50KCdMb2FkaW5nJykuc3RhZ2VzRGF0YTtcbiAgICAgICAgc2VsZi5tZW51LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHNlbGYubWVudS5nZXRDb21wb25lbnQoJ01lbnUnKS5pbml0KGRhdGEpO1xuICAgICAgICBzZWxmLnN0YWdlc0RhdGEgPSBkYXRhO1xuICAgICAgICAvL3NlbGYuYmlnTHVyZS5nZXRDb21wb25lbnQoJ0JpZ2x1cmUnKS5pbml0KCk7Ly9kYXRhXG5cbiAgICAgICAgLy99KTtcblxuICAgICAgICAvL2NjLmxvZygndGVtcDonK2NjLkludGVyc2VjdGlvbi5saW5lUG9seWdvbihjYy5wKDAsMCksY2MucCgxLDEpLFtjYy5wKDAsMCksY2MucCgwLDEpLGNjLnAoMSwxKSxjYy5wKDEsMCldICkpXG5cbiAgICAgICAgLy/kuI3pnIDopoHorr7lrprnmoTlj5jph49cbiAgICAgICAgdGhpcy5sdXJlcyA9IFtdO1xuXG4gICAgICAgIC8vIGNjLmxvZygnbGVuZ3RoOicrdGhpcy5sdXJlcy5sZW5ndGgpO1xuICAgICAgICAvLyBsZXQgcmVzdWx0PXNlbGYuZmluZFBhdGhfKGNjLnAoMTIsOSksIGNjLnAoMTMsOSksIFtjYy5wKDcsMTEpLGNjLnAoMTEsMTEpLGNjLnAoMTAuNSwxMC41KSxjYy5wKDEwLDkpLGNjLnAoMTEsNyksY2MucCg3LDcpXSwgW2NjLnAoOCwxMCksY2MucCgxMCwxMCksY2MucCg5LDkpLGNjLnAoMTAsOCksY2MucCg4LDgpXSwgW10pO1xuICAgICAgICAvLyBjYy5sb2cocmVzdWx0KTtcblxuICAgICAgICAvL+WkhOeQhuS4iuaKpeeahOWQhOenjeS6i+S7tu+8jOS9nOS4uumbhuS4reiwg+W6puWkhOeQhlxuXG4gICAgICAgIHRoaXMubm9kZS5vbignbHVyZV9vdmVyJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBjYy5sb2coZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKCdsdXJlX2VhdGVkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLnNjb3JlU2NyaXB0LmVhdCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKCd0aHJvd19sdXJlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgeCA9IGV2ZW50LmdldFVzZXJEYXRhKCk7XG4gICAgICAgICAgICBzZWxmLnRocm93X2x1cmUoeCk7XG4gICAgICAgICAgICAvL+aYr+WcqOi/memHjOWRiuiviemxvOimgeWQg++8jOi/mOaYr+aUvuWIsOmxvOeahOiHquS4u0FJ5Lit77yM6K6p6bG85Y+R546w5pyJ6aW1XG4gICAgICAgICAgICAvL+S5n+WwseaYr+acieaWsOeahOmlteaYr+S4gOS4quS6i+S7tu+8jOinpuWPkeS6humxvOeahOaAneiAg1xuICAgICAgICAgICAgc2VsZi53YW50RWF0VGhpbmsoKTtcbiAgICAgICAgICAgIC8vIHNlbGYuZmlzaFNjcmlwdC53YW50RWF0VGhpbmsoc2VsZi5sdXJlcyk7XG5cbiAgICAgICAgICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5vdGhlckZpc2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIC8vICAgICBzZWxmLm90aGVyRmlzaFtpXS5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS53YW50RWF0VGhpbmsoc2VsZi5sdXJlcyk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvL3NlbGYubHVyZXMucHVzaChsdXJlKTtcbiAgICAgICAgICAgIC8v5LuA5LmI5pe25YCZ5pS+5Zue5Yiw5rGg5Lit5ZGi77yfXG5cbiAgICAgICAgICAgIC8v6L+Z6YeM6KaB6YCa55+l6bG877yM6L+Z6YeM5pyJ6aW177yM5pyJ5aSa5Liq6aW15oCO5LmI5Yqe77yM6KaB6K6w5b2V5omA5pyJ6aW177yM5LiU6aW15Lya5Y+Y5YyWXG4gICAgICAgICAgICAvL+WPpuacieWkmuS4qumxvOeahOaDheWGtVxuICAgICAgICAgICAgLy8gc2VsZi5maXNoU2NyaXB0Lmx1cmUgPSBsdXJlO1xuICAgICAgICAgICAgLy8gc2VsZi5maXNoU2NyaXB0LmVhdEFjdGlvbigpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKCdsdXJlX2Rlc3Ryb3knLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIC8vY2MubG9nKCdldmVudC5kZXRhaWwudXVpZDonICsgZXZlbnQuZGV0YWlsLnV1aWQpO1xuICAgICAgICAgICAgLy9jYy5sb2coc2VsZi5sdXJlcyk7XG5cbiAgICAgICAgICAgIC8v6L+Z5Liq6aW16KKr5ZCD5LqG77yM6K6p6bG85om+5LiL5LiA5Liq77yM5pqC5pe25rKh5pyJ5pyA6L+R55qE6YC76L6RXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYubHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5sdXJlc1tpXS51dWlkID09IGV2ZW50LmRldGFpbC51dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubHVyZXNbaV0uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmx1cmVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYy5sb2coJ25vdyB0aGVyZSBhcmUgJyArIHNlbGYubHVyZXMubGVuZ3RoICsgJyBsdXJlcycpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy/ml7bpl7TliLBcbiAgICAgICAgdGhpcy5ub2RlLm9uKCd0aW1lX3VwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLmJvYXJkLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLmJvYXJkLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICAgICAgY2MubG9nKCdzZWxmLnN0YWdlOicgKyBzZWxmLnN0YWdlICsgJyBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50OicgKyBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50KTtcbiAgICAgICAgICAgIHNlbGYuYm9hcmQuZ2V0Q29tcG9uZW50KCdCb2FyZCcpLmluaXQoe1xuICAgICAgICAgICAgICAgIHN0YWdlOiBzZWxmLnN0YWdlLFxuICAgICAgICAgICAgICAgIHNjb3JlOiBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8v5riF55CG5Zy65pmvXG4gICAgICAgICAgICBzZWxmLnVuc2NoZWR1bGVBbGxDYWxsYmFja3MoKTsgLy/lgZzmraLmipXmlL5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5vdGhlckZpc2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpc2hQb29sLnB1dChzZWxmLm90aGVyRmlzaFtpXSk7XG4gICAgICAgICAgICAgICAgLy9zZWxmLm90aGVyRmlzaFtpXS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vc2VsZi5maXNoUG9vbC5wdXQoc2VsZi5maXNoKTtcbiAgICAgICAgICAgIHNlbGYuZmlzaC5kZXN0cm95KCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5sdXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHNlbGYubHVyZXNbaV0uZGVzdHJveSgpOyAvL3B1dChzZWxmLmx1cmVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYubHVyZXMgPSBbXTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIOmAieaLqeWFs+WNoeS6hlxuICAgICAgICB0aGlzLm5vZGUub24oJ3NlbGVjdF9zdGFnZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgc2VsZi5tZW51LmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxmLmVudGVyU3RhZ2UoKTtcbiAgICAgICAgICAgIHNlbGYuZmlzaFNjcmlwdCA9IHNlbGYuZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKTtcbiAgICAgICAgICAgIHNlbGYucmFuZG9tTHVyZXMoc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5jb3VudCwgc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5pbnRlcnZhbCk7XG4gICAgICAgICAgICAvL3NlbGYucmFuZG9tTHVyZXMoNSwgMTApO1xuXG4gICAgICAgICAgICAvL+mHjee9ruiuoeaXtuWZqFxuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykudG90YWx0aW1lID0gc2VsZi5zdGFnZURhdGEudGltZXI7XG4gICAgICAgICAgICBzZWxmLnRpbWVyLmdldENvbXBvbmVudCgnVGltZXInKS5pc0dyb3dVcCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykuaW5pdChzZWxmLnN0YWdlRGF0YS50aW1lcik7XG4gICAgICAgICAgICAvL+mHjee9ruWIhuaVsFxuICAgICAgICAgICAgc2VsZi5lYXRDb3VudC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IDA7XG4gICAgICAgICAgICBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50ID0gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIC8v5LiL5LiA5YWzXG4gICAgICAgIHRoaXMubm9kZS5vbignbmV4dF9zdGFnZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgc2VsZi5zdGFnZSsrO1xuICAgICAgICAgICAgc2VsZi5lbnRlclN0YWdlKCk7XG4gICAgICAgICAgICBzZWxmLmZpc2hTY3JpcHQgPSBzZWxmLmZpc2guZ2V0Q29tcG9uZW50KCdDb250cm9sJyk7XG4gICAgICAgICAgICBzZWxmLnJhbmRvbUx1cmVzKHNlbGYuc3RhZ2VEYXRhLnRocm93X2x1cmUuY291bnQsIHNlbGYuc3RhZ2VEYXRhLnRocm93X2x1cmUuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgLy9zZWxmLnJhbmRvbUx1cmVzKDUsIDEwKTtcblxuICAgICAgICAgICAgLy/ph43nva7orqHml7blmahcbiAgICAgICAgICAgIHNlbGYudGltZXIuZ2V0Q29tcG9uZW50KCdUaW1lcicpLnRvdGFsdGltZSA9IHNlbGYuc3RhZ2VEYXRhLnRpbWVyO1xuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykuaXNHcm93VXAgPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYudGltZXIuZ2V0Q29tcG9uZW50KCdUaW1lcicpLmluaXQoc2VsZi5zdGFnZURhdGEudGltZXIpO1xuICAgICAgICAgICAgLy/ph43nva7liIbmlbBcbiAgICAgICAgICAgIHNlbGYuZWF0Q291bnQuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSAwO1xuICAgICAgICAgICAgc2VsZi5zY29yZVNjcmlwdC5lYXRDb3VudCA9IDA7XG4gICAgICAgIH0pO1xuICAgICAgICAvL+ebruW9lVxuICAgICAgICB0aGlzLm5vZGUub24oJ21lbnUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYubWVudS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5tZW51LmdldENvbXBvbmVudCgnTWVudScpLmluaXQoc2VsZi5zdGFnZXNEYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vcmVsb2FkXG4gICAgICAgIHRoaXMubm9kZS5vbigncmVsb2FkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLmVudGVyU3RhZ2UoKTtcbiAgICAgICAgICAgIHNlbGYuZmlzaFNjcmlwdCA9IHNlbGYuZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKTtcbiAgICAgICAgICAgIHNlbGYucmFuZG9tTHVyZXMoc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5jb3VudCwgc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5pbnRlcnZhbCk7XG4gICAgICAgICAgICAvL3NlbGYucmFuZG9tTHVyZXMoNSwgMTApO1xuXG4gICAgICAgICAgICAvL+mHjee9ruiuoeaXtuWZqFxuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykudG90YWx0aW1lID0gc2VsZi5zdGFnZURhdGEudGltZXI7XG4gICAgICAgICAgICBzZWxmLnRpbWVyLmdldENvbXBvbmVudCgnVGltZXInKS5pc0dyb3dVcCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykuaW5pdChzZWxmLnN0YWdlRGF0YS50aW1lcik7XG4gICAgICAgICAgICAvL+mHjee9ruWIhuaVsFxuICAgICAgICAgICAgc2VsZi5lYXRDb3VudC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IDA7XG4gICAgICAgICAgICBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50ID0gMDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy/kuKTkuKrlr7nlg4/msaDvvIzkuI3kuIDlrppcbiAgICAgICAgdGhpcy5sdXJlUG9vbCA9IG5ldyBjYy5Ob2RlUG9vbCgpO1xuICAgICAgICB0aGlzLmZpc2hQb29sID0gbmV3IGNjLk5vZGVQb29sKCk7XG4gICAgICAgIC8vIHRoaXMuZW50ZXJTdGFnZSgpO1xuICAgICAgICAvLyB0aGlzLnJhbmRvbUx1cmVzKDUsIDEwKTtcbiAgICAgICAgLy90aGlzLmZpc2hTY3JpcHQgPSB0aGlzLmZpc2guZ2V0Q29tcG9uZW50KCdDb250cm9sJyk7XG5cbiAgICAgICAgLy8gY2MucmVuZGVyZXJDYW52YXMuZW5hYmxlRGlydHlSZWdpb24oZmFsc2UpO1xuICAgICAgICAvLyBjYy5yZW5kZXJlcldlYkdMXG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgLy8gZXZlbnQudG91Y2hcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBldmVudC5nZXRDdXJyZW50VGFyZ2V0KCk7XG4gICAgICAgICAgICB2YXIgcG9zID0gdGFyZ2V0LmNvbnZlcnRUb05vZGVTcGFjZUFSKGV2ZW50LmdldExvY2F0aW9uKCkpO1xuICAgICAgICAgICAgY2MubG9nKCd0b3VjaFg6JyArIHBvcy54KTtcbiAgICAgICAgICAgIGlmIChldmVudC5nZXRMb2NhdGlvbigpLnggPCA1MCB8fCBldmVudC5nZXRMb2NhdGlvbi54ID4gY2Mud2luU2l6ZS53aWR0aCAtIDUwKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8v5pWy6YOo5YiGXG4gICAgICAgICAgICBzZWxmLmtub2NrLnggPSBwb3MueDtcbiAgICAgICAgICAgIHNlbGYua25vY2sueSA9IHBvcy55O1xuICAgICAgICAgICAgc2VsZi5rbm9jay5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5rbm9ja0FuaW1hdGlvbi5wbGF5KCk7XG5cbiAgICAgICAgICAgIHNlbGYuZGlzcGVyc2VGaXNoKHBvcyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy/pqbHmlaNcbiAgICBkaXNwZXJzZUZpc2g6IGZ1bmN0aW9uIGRpc3BlcnNlRmlzaChwb3MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm90aGVyRmlzaC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIF9kaXN0YW5jZSA9IGNjLnBEaXN0YW5jZShwb3MsIHRoaXMub3RoZXJGaXNoW2ldLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgaWYgKF9kaXN0YW5jZSA8IHRoaXMuZGlzcGVyc2VEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3RoZXJGaXNoW2ldLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vdGhlckZpc2hbaV0uZ2V0Q29tcG9uZW50KCdDb250cm9sJykuc3RyYXRlZ3lSdW4ocG9zLCAwLjMsIDAuMywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgY2MubG9nKCdkaXNwZXJzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IGNjLnBEaXN0YW5jZShwb3MsIHRoaXMuZmlzaC5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgdGhpcy5kaXNwZXJzZURpc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLmZpc2guc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS5zdHJhdGVneVJ1bihwb3MsIDAuMywgMC4zLCB0cnVlKTtcbiAgICAgICAgICAgIGNjLmxvZygnZGlzcGVyc2UnKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgd2FudEVhdFRoaW5rOiBmdW5jdGlvbiB3YW50RWF0VGhpbmsoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5maXNoU2NyaXB0LndhbnRFYXRUaGluayhzZWxmLmx1cmVzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLm90aGVyRmlzaC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5vdGhlckZpc2hbaV0uZ2V0Q29tcG9uZW50KCdDb250cm9sJykud2FudEVhdFRoaW5rKHNlbGYubHVyZXMpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByYW5kb21MdXJlczogZnVuY3Rpb24gcmFuZG9tTHVyZXMoY291bnQsIGludGVydmFsKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBmb3IgKHZhciBuID0gMDsgbiA8IFRoaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gICAgIFRoaW5nc1tpXVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgdmFyIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyA1MCArIChjYy53aW5TaXplLndpZHRoIC0gMTAwKSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICBzZWxmLnRocm93X2x1cmUoeCk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi53YW50RWF0VGhpbmsoKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBzZWxmLnJhbmRvbUx1cmVzKCk7XG4gICAgICAgICAgICAvLyDov5nph4znmoQgdGhpcyDmjIflkJEgY29tcG9uZW50XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgKHZhciBuID0gMDsgbiA8IFRoaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vICAgICBUaGluZ3NbaV1cbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgdmFyIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyA1MCArIChjYy53aW5TaXplLndpZHRoIC0gMTAwKSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgc2VsZi50aHJvd19sdXJlKHgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLndhbnRFYXRUaGluaygpO1xuICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgfSxcblxuICAgIGVudGVyU3RhZ2U6IGZ1bmN0aW9uIGVudGVyU3RhZ2UoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy/ku47kuIDkuKrmlofku7bkuK3lj5blvpfvvJpcbiAgICAgICAgLy8xLuWFtuWug+mxvOeahOaVsOmHj1xuICAgICAgICAvLzIu6Zqc56KN55qE5L2N572u44CB5pWw6YePXG4gICAgICAgIC8vMy7psbznmoTlj5jph49cbiAgICAgICAgLy80LuWkp+mlteeahOWPmOmHj1xuICAgICAgICAvLzUu56ys5Yeg5YWzXG4gICAgICAgIC8vVE9ETyDlkIjlubbmiYDmnInpsbzkuLrkuIDnp41cbiAgICAgICAgc2VsZi5zdGFnZVN0cmluZy5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IFwi56ysXCIgKyBzZWxmLnN0YWdlICsgXCLlhbNcIjtcbiAgICAgICAgaWYgKHNlbGYuc3RhZ2VEYXRhICYmIHNlbGYuc3RhZ2VEYXRhLnN0YWdlID09PSBzZWxmLnN0YWdlKSB7fSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5zdGFnZXNEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuc3RhZ2VzRGF0YVtpXS5zdGFnZSA9PT0gc2VsZi5zdGFnZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YWdlRGF0YSA9IHNlbGYuc3RhZ2VzRGF0YVtpXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxmLnN0YWdlRGF0YS5zdG9uZSkge1xuICAgICAgICAgICAgc2VsZi5zdG9uZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5zdG9uZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZi5zdGFnZURhdGEuYmlnTHVyZSkge1xuICAgICAgICAgICAgc2VsZi5iaWdMdXJlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmJpZ0x1cmUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLnN0YWdlRGF0YS5maXNoLmZhdm9yaXRlID0gZmFsc2U7XG4gICAgICAgIHZhciBvdGhlckZpc2hDb3VudCA9IHNlbGYuc3RhZ2VEYXRhLm90aGVyRmlzaENvdW50O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3RoZXJGaXNoQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgdmFyIG90aGVyRmlzaCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoc2VsZi5maXNoUG9vbC5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8g6YCa6L+HIHNpemUg5o6l5Y+j5Yik5pat5a+56LGh5rGg5Lit5piv5ZCm5pyJ56m66Zey55qE5a+56LGhXG4gICAgICAgICAgICAgICAgb3RoZXJGaXNoID0gc2VsZi5maXNoUG9vbC5nZXQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5rKh5pyJ56m66Zey5a+56LGh77yM5Lmf5bCx5piv5a+56LGh5rGg5Lit5aSH55So5a+56LGh5LiN5aSf5pe277yM5oiR5Lus5bCx55SoIGNjLmluc3RhbnRpYXRlIOmHjeaWsOWIm+W7ulxuICAgICAgICAgICAgICAgIG90aGVyRmlzaCA9IGNjLmluc3RhbnRpYXRlKHNlbGYuZmlzaFByZWZhYik7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5sdXJlUG9vbC5wdXQobHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYy5sb2coJ2NyZWF0ZSBvdGhlckZpc2g6JyArIG90aGVyRmlzaC51dWlkKTtcbiAgICAgICAgICAgIHZhciBfcG9zID0gdGhpcy5nZXRSYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICAgICAgb3RoZXJGaXNoLnNldFBvc2l0aW9uKF9wb3MpO1xuXG4gICAgICAgICAgICBvdGhlckZpc2guZ2V0Q29tcG9uZW50KCdDb250cm9sJykuaW5pdChzZWxmLnN0YWdlRGF0YS5maXNoKTtcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICBmYXZvcml0ZTogZmFsc2UsXG4gICAgICAgICAgICAvLyAgICAgbWF4X3NlZWQ6IDE1XG4gICAgICAgICAgICAvLyB9KTsgLy9UT0RPIOS7peWQjue7meS4gOS6m+WPguaVsFxuXG4gICAgICAgICAgICBvdGhlckZpc2gucGFyZW50ID0gc2VsZi5ub2RlOyAvLyDlsIbnlJ/miJDnmoTmlYzkurrliqDlhaXoioLngrnmoJFcblxuICAgICAgICAgICAgc2VsZi5vdGhlckZpc2gucHVzaChvdGhlckZpc2gpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuc3RhZ2VEYXRhLmZpc2guZmF2b3JpdGUgPSB0cnVlO1xuICAgICAgICB2YXIgZmlzaCA9IGNjLmluc3RhbnRpYXRlKHNlbGYuZmlzaFByZWZhYik7XG4gICAgICAgIGNjLmxvZygnY3JlYXRlIGZhdm9yaXRlIGZpc2ggOicgKyBmaXNoLnV1aWQpO1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5nZXRSYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICBmaXNoLnNldFBvc2l0aW9uKHBvcyk7XG5cbiAgICAgICAgZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS5pbml0KHNlbGYuc3RhZ2VEYXRhLmZpc2gpO1xuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICBmYXZvcml0ZTogdHJ1ZSxcbiAgICAgICAgLy8gICAgIG1heF9zZWVkOiAxNVxuICAgICAgICAvLyB9KTsgLy9UT0RPIOS7peWQjue7meS4gOS6m+WPguaVsFxuICAgICAgICBmaXNoLnBhcmVudCA9IHNlbGYubm9kZTsgLy8g5bCG55Sf5oiQ55qE5pWM5Lq65Yqg5YWl6IqC54K55qCRXG5cbiAgICAgICAgc2VsZi5maXNoID0gZmlzaDtcbiAgICB9LFxuICAgIGdldFJhbmRvbVBvc2l0aW9uOiBmdW5jdGlvbiBnZXRSYW5kb21Qb3NpdGlvbigpIHtcbiAgICAgICAgdmFyIHkgPSAtY2Mud2luU2l6ZS5oZWlnaHQgLyAyICsgKGNjLndpblNpemUuaGVpZ2h0IC0gMTAwKSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHZhciB4ID0gLWNjLndpblNpemUud2lkdGggLyAyICsgY2Mud2luU2l6ZS53aWR0aCAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHJldHVybiBjYy5wKHgsIHkpO1xuICAgIH0sXG5cbiAgICB0aHJvd19sdXJlOiBmdW5jdGlvbiB0aHJvd19sdXJlKHgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL+eCueWHu+WQjueUn+aIkOmltVxuICAgICAgICB2YXIgbHVyZSA9IG51bGw7XG4gICAgICAgIGlmIChzZWxmLmx1cmVQb29sLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgIC8vIOmAmui/hyBzaXplIOaOpeWPo+WIpOaWreWvueixoeaxoOS4reaYr+WQpuacieepuumXsueahOWvueixoVxuICAgICAgICAgICAgbHVyZSA9IHNlbGYubHVyZVBvb2wuZ2V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInnqbrpl7Llr7nosaHvvIzkuZ/lsLHmmK/lr7nosaHmsaDkuK3lpIfnlKjlr7nosaHkuI3lpJ/ml7bvvIzmiJHku6zlsLHnlKggY2MuaW5zdGFudGlhdGUg6YeN5paw5Yib5bu6XG4gICAgICAgICAgICBsdXJlID0gY2MuaW5zdGFudGlhdGUoc2VsZi5sdXJlUHJlZmFiKTtcbiAgICAgICAgICAgIC8vIHNlbGYubHVyZVBvb2wucHV0KGx1cmUpO1xuICAgICAgICB9XG4gICAgICAgIGNjLmxvZygndGhyb3dfbHVyZScgKyBsdXJlKTtcbiAgICAgICAgbHVyZS55ID0gY2Mud2luU2l6ZS5oZWlnaHQgLyAyIC0gMTAwO1xuXG4gICAgICAgIGx1cmUuZ2V0Q29tcG9uZW50KCdsdXJlJykuaW5pdCh4KTsgLy/mjqXkuIvmnaXlsLHlj6/ku6XosIPnlKggZW5lbXkg6Lqr5LiK55qE6ISa5pys6L+b6KGM5Yid5aeL5YyWXG4gICAgICAgIGx1cmUucGFyZW50ID0gc2VsZi5ub2RlOyAvLyDlsIbnlJ/miJDnmoTmlYzkurrliqDlhaXoioLngrnmoJFcblxuICAgICAgICBzZWxmLmx1cmVzLnB1c2gobHVyZSk7XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc2OTgxZGpYV25aSXlyWTZ2TC9VeUFCNScsICdLbm9jaycpO1xuLy8gU2NyaXB0XFxLbm9jay5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG5cbiAgICBkZXN0b3J5OiBmdW5jdGlvbiBkZXN0b3J5KCkge1xuICAgICAgICBjYy5sb2coJ2tub2NrIGNvbXBsZXRlZCcpO1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnMTdjYWRIdjRGUk5VWmlhL2lpMDM5Y3onLCAnTG9hZGluZycpO1xuLy8gU2NyaXB0XFxMb2FkaW5nLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbGFiZWw6IGNjLk5vZGUsXG4gICAgICAgIGZpc2g6IGNjLk5vZGVcbiAgICB9LFxuXG4gICAgLy9pbnRlcnZhbDogMFxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICAvLyB0aGlzLmRvdENvdW50ID0gMDtcbiAgICAgICAgLy8gdGhpcy5kb3RNYXhDb3VudCA9IDM7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5sYWJlbC5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgc2VsZi5sb2FkU2NlbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIHN0YXJ0TG9hZGluZzogZnVuY3Rpb24gc3RhcnRMb2FkaW5nKCkge1xuICAgICAgICB0aGlzLmxhYmVsLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgLy90aGlzLmRvdENvdW50ID0gMDtcbiAgICAgICAgdmFyIHNpemUgPSBjYy52aWV3LmdldFZpc2libGVTaXplKCk7XG4gICAgICAgIHRoaXMubm9kZS5zZXRQb3NpdGlvbihjYy5wKHNpemUud2lkdGggLyAyIC0gdGhpcy5ub2RlLndpZHRoIC8gMiwgc2l6ZS5oZWlnaHQgLyA0KSk7XG4gICAgICAgIHRoaXMuZmlzaC5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgLy8gdGhpcy5zY2hlZHVsZSh0aGlzLnVwZGF0ZUxhYmVsLCB0aGlzLmludGVydmFsLCB0aGlzKTsgICAgICBcbiAgICB9LFxuXG4gICAgc3RvcExvYWRpbmc6IGZ1bmN0aW9uIHN0b3BMb2FkaW5nKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCl7XG4gICAgICAgIHNlbGYubGFiZWwuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIC8vfSwzKTtcblxuICAgICAgICBjYy5sb2coJ3N0b3AgbG9hZGluZycpO1xuICAgICAgICAvLyB0aGlzLnVuc2NoZWR1bGUodGhpcy51cGRhdGVMYWJlbCk7XG4gICAgICAgIC8vIHRoaXMubm9kZS5zZXRQb3NpdGlvbihjYy5wKDIwMDAsIDIwMDApKTtcbiAgICB9XG5cbn0pO1xuLy8gdXBkYXRlTGFiZWwgKCkge1xuLy8gICAgIGxldCBkb3RzID0gJy4nLnJlcGVhdCh0aGlzLmRvdENvdW50KTtcbi8vICAgICB0aGlzLmxhYmVsLnN0cmluZyA9ICdMb2FkaW5nJyArIGRvdHM7XG4vLyAgICAgdGhpcy5kb3RDb3VudCArPSAxO1xuLy8gICAgIGlmICh0aGlzLmRvdENvdW50ID4gdGhpcy5kb3RNYXhDb3VudCkge1xuLy8gICAgICAgICB0aGlzLmRvdENvdW50ID0gMDtcbi8vICAgICB9XG4vLyB9XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdhZTM3NURqaGJ0TU43SURTeTVHV2xvNycsICdNZW51Jyk7XG4vLyBTY3JpcHRcXE1lbnUuanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgICAgICBzdGFnZVByZWZhYjogY2MuUHJlZmFiLFxuICAgICAgICBtZW51TGF5b3V0OiBjYy5Ob2RlXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdChzdGFnZXMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5tZW51TGF5b3V0LnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc3RhZ2VNZW51ID0gY2MuaW5zdGFudGlhdGUoc2VsZi5zdGFnZVByZWZhYik7XG4gICAgICAgICAgICB2YXIgc3RhZ2VNZW51U2NyaXB0ID0gc3RhZ2VNZW51LmdldENvbXBvbmVudCgnU3RhZ2VNZW51Jyk7XG4gICAgICAgICAgICBzdGFnZU1lbnVTY3JpcHQuaW5pdChzdGFnZXNbaV0pO1xuICAgICAgICAgICAgc2VsZi5tZW51TGF5b3V0LmFkZENoaWxkKHN0YWdlTWVudSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub2RlLnNldFBvc2l0aW9uKDAsIDApO1xuICAgIH1cblxufSk7XG4vLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuLy8gfSxcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzUxMjA1ZjFBZlZHQXIreS9zWGtxOWloJywgJ1NjZW5lTWFuYWdlcicpO1xuLy8gU2NyaXB0XFxTY2VuZU1hbmFnZXIuanNcblxudmFyIExvYWRpbmcgPSByZXF1aXJlKCdMb2FkaW5nJyk7XG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbG9hZGluZzogTG9hZGluZ1xuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL+WcqHdlYkdM5LiL5pyJ6Zeu6aKYXG4gICAgICAgIGNjLnZpZXcuZW5hYmxlQW50aUFsaWFzKGZhbHNlKTtcbiAgICAgICAgY2MuZ2FtZS5hZGRQZXJzaXN0Um9vdE5vZGUodGhpcy5ub2RlKTtcbiAgICAgICAgLy8gdGhpcy5sb2FkaW5nLnN0YXJ0TG9hZGluZygpO1xuICAgICAgICB0aGlzLmxvYWRTY2VuZSgnbWFpbicpO1xuICAgICAgICB0aGlzLmxvYWRpbmcubG9hZFNjZW5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKHNlbGYuY3VyTG9hZGluZ1NjZW5lKTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbiAgICBsb2FkU2NlbmU6IGZ1bmN0aW9uIGxvYWRTY2VuZShzY2VuZU5hbWUpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmxvYWRpbmcuc3RhcnRMb2FkaW5nKCk7XG4gICAgICAgIHRoaXMuY3VyTG9hZGluZ1NjZW5lID0gc2NlbmVOYW1lO1xuICAgICAgICAvL3RoaXMub25TY2VuZUxvYWRlZC5iaW5kKHRoaXMpO1xuICAgICAgICBjYy5sb2FkZXIubG9hZFJlcygnc3RhZ2VzLmpzb24nLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLmxvYWRpbmcuc3RhZ2VzRGF0YSA9IGRhdGE7XG4gICAgICAgICAgICBjYy5kaXJlY3Rvci5wcmVsb2FkU2NlbmUoc2NlbmVOYW1lLCBzZWxmLm9uU2NlbmVMb2FkZWQuYmluZChzZWxmKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblNjZW5lTG9hZGVkOiBmdW5jdGlvbiBvblNjZW5lTG9hZGVkKGV2ZW50KSB7XG4gICAgICAgIGNjLmxvZyh0aGlzKTtcbiAgICAgICAgdGhpcy5sb2FkaW5nLnN0b3BMb2FkaW5nKCk7XG5cbiAgICAgICAgLy8gY2MuZGlyZWN0b3IubG9hZFNjZW5lKHRoaXMuY3VyTG9hZGluZ1NjZW5lKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzZjYTU3c1c5bUZDUjZ4bEI1TEdwdHV1JywgJ1Njb3JlJyk7XG4vLyBTY3JpcHRcXFNjb3JlLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgICAgICB0b3RhbENvdW50OiAwLFxuICAgICAgICBlYXRDb3VudDogMFxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5sYWJlbCA9IHRoaXMuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICB9LFxuICAgIGVhdDogZnVuY3Rpb24gZWF0KCkge1xuICAgICAgICB0aGlzLmVhdENvdW50Kys7XG4gICAgICAgIHRoaXMubGFiZWwuc3RyaW5nID0gdGhpcy5lYXRDb3VudDtcbiAgICB9XG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdlYWFjZVRxbWtCQzFLM3BKK1Vna0xQMycsICdTdGFnZU1lbnUnKTtcbi8vIFNjcmlwdFxcU3RhZ2VNZW51LmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgICAgICBzdGFyMTogY2MuTm9kZSxcbiAgICAgICAgc3RhcjI6IGNjLk5vZGUsXG4gICAgICAgIHN0YXIzOiBjYy5Ob2RlLFxuICAgICAgICBsb2NrOiBjYy5Ob2RlLFxuICAgICAgICBzdGFnZVN0cmluZzogY2MuTm9kZVxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHt9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoc3RhZ2VEYXRhKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5zdGFnZSA9IHN0YWdlRGF0YS5zdGFnZTtcbiAgICAgICAgdGhpcy5zdGFnZVN0cmluZy5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IFwi56ysXCIgKyB0aGlzLnN0YWdlICsgXCLlhbNcIjtcbiAgICAgICAgdmFyIHN0YWdlU3RvcmFnZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RhZ2UnICsgdGhpcy5zdGFnZSk7XG4gICAgICAgIGlmIChzdGFnZVN0b3JhZ2UpIHtcbiAgICAgICAgICAgIHZhciBzY29yZSA9IEpTT04ucGFyc2Uoc3RhZ2VTdG9yYWdlKS5iZXN0U2NvcmU7XG4gICAgICAgICAgICBpZiAoc2NvcmUgPj0gc3RhZ2VEYXRhLnN0YXIxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFyMS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFyMS5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzY29yZSA+PSBzdGFnZURhdGEuc3RhcjIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXIyLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXIyLmNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNjb3JlID49IHN0YWdlRGF0YS5zdGFyMykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcjMuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcjMuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxvY2suYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXIxLmNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDApO1xuICAgICAgICAgICAgdGhpcy5zdGFyMi5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcjMuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICAgICAgICB0aGlzLnN0YXIxLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zdGFyMi5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3RhcjMuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmxvY2suYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLnN0YWdlID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLmxvY2suYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN0YXIxLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YXIyLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YXIzLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoIXNlbGYubG9jay5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZWN0X2V2ZW50ID0gbmV3IGNjLkV2ZW50LkV2ZW50Q3VzdG9tKCdzZWxlY3Rfc3RhZ2UnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvL+aKiumAieS4reeahOWFs+aUvuWHuuWOu1xuICAgICAgICAgICAgICAgIHNlbGVjdF9ldmVudC5zZXRVc2VyRGF0YShzZWxmLnN0YWdlKTtcbiAgICAgICAgICAgICAgICBzZWxmLm5vZGUuZGlzcGF0Y2hFdmVudChzZWxlY3RfZXZlbnQpO1xuICAgICAgICAgICAgICAgIC8vc2VsZi5ub2RlLmFjdGl2ZT1mYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAgIC8vIH0sXG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzVhZjI5Z0JoSHRMRjVnWWFQR0ZNWUM1JywgJ1N0b25lJyk7XG4vLyBTY3JpcHRcXFN0b25lLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcbiAgICBvbkNvbGxpc2lvbkVudGVyOiBmdW5jdGlvbiBvbkNvbGxpc2lvbkVudGVyKG90aGVyLCBzZWxmKSB7XG4gICAgICAgIGNjLmxvZygnc29tZXRoaW5nIGtub2NrIHN0b25lJyArIG90aGVyLm5vZGUuZ3JvdXApO1xuICAgICAgICBpZiAob3RoZXIubm9kZS5ncm91cCA9PT0gJ2Zpc2hHJykge1xuICAgICAgICAgICAgLy/norDliLDpsbxcbiAgICAgICAgICAgIC8v6bG86KaB5pS55Y+Y6KGM5Yqo6Lev57q/XG5cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc1ZGRmMEtYYjhGTGRJTThmZGZzNDhDMScsICdUaW1lcicpO1xuLy8gU2NyaXB0XFxUaW1lci5qc1xuXG4vL+WPr+S4jeWPr+S7peWBmuaIkOWFrOWFseeahFxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgICAgICAvLyDlop7liqDov5jmmK/lh4/lsJFcbiAgICAgICAgaXNHcm93VXA6IHRydWUsXG4gICAgICAgIC8vIOaYr+WQpuaYr+aXtuWIhuenklxuICAgICAgICBpc0Nsb2NrOiB0cnVlLFxuXG4gICAgICAgIHRvdGFsdGltZTogMjAsXG5cbiAgICAgICAgaW5pdFRpbWU6IDBcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMubGFiZWwgPSB0aGlzLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIC8vdGhpcy5pbml0KCk7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KGluaXRUaW1lKSB7XG4gICAgICAgIHRoaXMudW5zY2hlZHVsZUFsbENhbGxiYWNrcygpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciB0eXBlID0gZnVuY3Rpb24gdHlwZShvKSB7XG4gICAgICAgICAgICB2YXIgcyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbiAgICAgICAgICAgIHJldHVybiBzLm1hdGNoKC9cXFtvYmplY3QgKC4qPylcXF0vKVsxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZShpbml0VGltZSkgPT09ICdudW1iZXInKSBzZWxmLmluaXRUaW1lID0gaW5pdFRpbWU7XG4gICAgICAgIHRoaXMubGFiZWwuc3RyaW5nID0gc2VsZi5mb3JtYXRTZWNvbmRzKHNlbGYuaW5pdFRpbWUpO1xuICAgICAgICAvL2NjLmxvZygnc3RhcnQgdGltZXIhJyk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSB0aGlzLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYubGFiZWwuc3RyaW5nID0gc2VsZi5mb3JtYXRTZWNvbmRzKHNlbGYuaW5pdFRpbWUpO1xuICAgICAgICAgICAgaWYgKHNlbGYuaXNHcm93VXApIHtcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRUaW1lKys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuaW5pdFRpbWUtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlbGYuaW5pdFRpbWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgLy/lkYror4nkuLvmjqfvvIzml7bpl7TliLBcbiAgICAgICAgICAgICAgICBzZWxmLm5vZGUuZGlzcGF0Y2hFdmVudChuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oJ3RpbWVfdXAnLCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgc2VsZi51bnNjaGVkdWxlQWxsQ2FsbGJhY2tzKCk7IC8vKHNlbGYuY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYuaW5pdFRpbWUgPiBzZWxmLnRvdGFsdGltZSkge1xuICAgICAgICAgICAgICAgIHNlbGYubm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBjYy5FdmVudC5FdmVudEN1c3RvbSgndGltZV91cCcsIHRydWUpKTtcbiAgICAgICAgICAgICAgICBzZWxmLnVuc2NoZWR1bGVBbGxDYWxsYmFja3MoKTsgLy8oc2VsZi5jYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEpO1xuICAgIH0sXG4gICAgZm9ybWF0U2Vjb25kczogZnVuY3Rpb24gZm9ybWF0U2Vjb25kcyh2YWx1ZSkge1xuXG4gICAgICAgIHZhciB0aGVUaW1lID0gcGFyc2VJbnQodmFsdWUpOyAvLyDnp5JcblxuICAgICAgICB2YXIgdGhlVGltZTEgPSAwOyAvLyDliIZcblxuICAgICAgICB2YXIgdGhlVGltZTIgPSAwOyAvLyDlsI/ml7ZcblxuICAgICAgICBpZiAodGhlVGltZSA+IDYwKSB7XG5cbiAgICAgICAgICAgIHRoZVRpbWUxID0gcGFyc2VJbnQodGhlVGltZSAvIDYwKTtcblxuICAgICAgICAgICAgdGhlVGltZSA9IHBhcnNlSW50KHRoZVRpbWUgJSA2MCk7XG5cbiAgICAgICAgICAgIGlmICh0aGVUaW1lMSA+IDYwKSB7XG5cbiAgICAgICAgICAgICAgICB0aGVUaW1lMiA9IHBhcnNlSW50KHRoZVRpbWUxIC8gNjApO1xuXG4gICAgICAgICAgICAgICAgdGhlVGltZTEgPSBwYXJzZUludCh0aGVUaW1lMSAlIDYwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHQgPSBcIlwiICsgcGFyc2VJbnQodGhlVGltZSkgKyBcIuenklwiO1xuXG4gICAgICAgIGlmICh0aGVUaW1lMSA+IDApIHtcblxuICAgICAgICAgICAgcmVzdWx0ID0gXCJcIiArIHBhcnNlSW50KHRoZVRpbWUxKSArIFwi5YiGXCIgKyByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhlVGltZTIgPiAwKSB7XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IFwiXCIgKyBwYXJzZUludCh0aGVUaW1lMikgKyBcIuWwj+aXtlwiICsgcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc5ODY5MWRYbXBCT3dxeUo5RVVSZ3JBeicsICdsdXJlJyk7XG4vLyBTY3JpcHRcXGx1cmUuanNcblxudmFyIEdhbWUgPSByZXF1aXJlKCdHYW1lJyk7XG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuYW5pbSA9IHRoaXMuZ2V0Q29tcG9uZW50KGNjLkFuaW1hdGlvbik7XG4gICAgICAgIC8v5ZCR5bqV6YOo56e75YqoXG4gICAgICAgIHZhciB0YXJnZXRfeCA9IHRoaXMubm9kZS54O1xuICAgICAgICB2YXIgdGFyZ2V0X3kgPSAtY2Mud2luU2l6ZS5oZWlnaHQgLyAyO1xuICAgICAgICAvL2NjLmxvZygndGFyZ2V0X3gsdGFyZ2V0X3k6Jyt0YXJnZXRfeCsnLCcrdGFyZ2V0X3kpO1xuICAgICAgICB2YXIgZG93blNwZWVkID0gLTMwIC0gTWF0aC5yYW5kb20oKSAqIDMwO1xuICAgICAgICBjYy5sb2coJ2Rvd25zcGVlZD0nICsgZG93blNwZWVkKTtcbiAgICAgICAgLy/ov5nnp43lvaLlvI/kuI3lr7nvvIzopoHmlLnkuIDkuIvvvIzkuI3og73nlKjnvJPliqjvvIzkuI3nhLbmnInml7blnKh1cGRhdGXml7bkuI3og73lj5HnjrDov5nkuKpOT0RFXG4gICAgICAgIHZhciBtb3ZlQnlMZWZ0ID0gY2MubW92ZUJ5KDEuNSwgY2MucCgtNDAsIGRvd25TcGVlZCksIDEwKTtcbiAgICAgICAgdmFyIG1vdmVCeVJpZ2h0ID0gY2MubW92ZUJ5KDEuNSwgY2MucCg0MCwgZG93blNwZWVkKSwgMTApO1xuXG4gICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24oY2MucmVwZWF0Rm9yZXZlcihjYy5zZXF1ZW5jZShtb3ZlQnlMZWZ0LCBtb3ZlQnlSaWdodCkpKTtcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoeCkge1xuICAgICAgICB0aGlzLm5vZGUueCA9IHg7IC8vLWNjLndpblNpemUud2lkdGgvMisgTWF0aC5yYW5kb20oKSpjYy53aW5TaXplLndpZHRoIDtcbiAgICAgICAgY2MubG9nKHRoaXMubm9kZS51dWlkICsgJyBpcyBjcmVhdGVkJyk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgbGF0ZVVwZGF0ZTogZnVuY3Rpb24gbGF0ZVVwZGF0ZShkdCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLm5vZGUueSA8IC1jYy53aW5TaXplLmhlaWdodCAvIDIgKyAxMCkge1xuICAgICAgICAgICAgLy/liLDlupXkuoZcbiAgICAgICAgICAgIGNjLmxvZygnIG92ZXIgJyArIHRoaXMubm9kZS51dWlkICsgJyB0aGlzLm5vZGUueTonICsgdGhpcy5ub2RlLnkpO1xuICAgICAgICAgICAgc2VsZi5kZXRlcmlvcmF0ZSgpO1xuICAgICAgICAgICAgLy8gdGhpcy5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgICAgICAvLyB0aGlzLmFuaW0uc3RvcCgpO1xuICAgICAgICAgICAgLy8gLy/ppbXliLDlupXlkI7lj5jljJZcbiAgICAgICAgICAgIC8vIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gICAgIGxldCBmaW5pc2hlZCA9IGNjLmNhbGxGdW5jKGZ1bmN0aW9uKHRhcmdldCwgaW5kKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIC8vIHNlbGYubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAvLyAgICAgICAgIGNjLmZpbmQoJ0NhbnZhcycpLmVtaXQoJ2x1cmVfZGVzdG9yeScsIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIHV1aWQ6IHNlbGYubm9kZS51dWlkXG4gICAgICAgICAgICAvLyAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gICAgIH0sIHRoaXMsIDApO1xuICAgICAgICAgICAgLy8gICAgIGxldCB0aW50QnkgPSBjYy50aW50VG8oMTAsIDAsIDAsIDApO1xuICAgICAgICAgICAgLy8gICAgIHNlbGYubm9kZS5ydW5BY3Rpb24oY2Muc2VxdWVuY2UodGludEJ5LCBmaW5pc2hlZCkpO1xuXG4gICAgICAgICAgICAvLyB9LCAxKTtcbiAgICAgICAgICAgIHZhciBjID0gY2MuZmluZCgnQ2FudmFzJyk7XG4gICAgICAgICAgICBjLmVtaXQoJ2x1cmVfb3ZlcicsIHtcbiAgICAgICAgICAgICAgICBtc2c6ICdIZWxsbywgdGhpcyBpcyBDb2NvcyBDcmVhdG9yJyArIHNlbGYubm9kZS51dWlkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZih0aGlzLm5vZGUueTwtMzAwICYmIHRoaXMubm9kZS55Pi0zMTApXG4gICAgICAgIC8vICAgY2MubG9nKHRoaXMubm9kZS51dWlkKyctPicrdGhpcy5ub2RlLnkpO1xuICAgICAgICB0aGlzLm5vZGUueSA9IGNjLmNsYW1wZih0aGlzLm5vZGUueSwgLWNjLndpblNpemUuaGVpZ2h0IC8gMiArIDEwLCBjYy53aW5TaXplLmhlaWdodCAvIDIgLSAxMDApO1xuICAgIH0sXG4gICAgLy/lj5jotKjov4fnqItcbiAgICBkZXRlcmlvcmF0ZTogZnVuY3Rpb24gZGV0ZXJpb3JhdGUoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgIHRoaXMuYW5pbS5zdG9wKCk7XG4gICAgICAgIC8v6aW15Yiw5bqV5ZCO5Y+Y5YyWXG4gICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBmaW5pc2hlZCA9IGNjLmNhbGxGdW5jKGZ1bmN0aW9uICh0YXJnZXQsIGluZCkge1xuICAgICAgICAgICAgICAgIC8vIHNlbGYubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgY2MuZmluZCgnQ2FudmFzJykuZW1pdCgnbHVyZV9kZXN0cm95Jywge1xuICAgICAgICAgICAgICAgICAgICB1dWlkOiBzZWxmLm5vZGUudXVpZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdGhpcywgMCk7XG4gICAgICAgICAgICB2YXIgdGludEJ5ID0gY2MudGludFRvKDEwLCAwLCAwLCAwKTtcbiAgICAgICAgICAgIHNlbGYubm9kZS5ydW5BY3Rpb24oY2Muc2VxdWVuY2UodGludEJ5LCBmaW5pc2hlZCkpO1xuICAgICAgICB9LCAxKTtcbiAgICB9LFxuICAgIG9uQ29sbGlzaW9uRW50ZXI6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uRW50ZXIob3RoZXIsIHNlbGYpIHtcblxuICAgICAgICBpZiAob3RoZXIubm9kZS5ncm91cCA9PT0gJ2Zpc2hHJykge1xuICAgICAgICAgICAgY2MubG9nKCdmaXNoLm5vZGUuZ3JvdXAnICsgb3RoZXIubm9kZS5ncm91cCk7XG4gICAgICAgICAgICAvL+eisOWIsOmxvFxuICAgICAgICAgICAgdGhpcy5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG5cbiAgICAgICAgICAgIGlmIChvdGhlci5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS5mYXZvcml0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBjYy5FdmVudC5FdmVudEN1c3RvbSgnbHVyZV9lYXRlZCcsIHRydWUpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2MuZmluZCgnQ2FudmFzJykuZW1pdCgnbHVyZV9kZXN0cm95Jywge1xuICAgICAgICAgICAgICAgIHV1aWQ6IHNlbGYubm9kZS51dWlkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3RoZXIubm9kZS5ncm91cCA9PT0gJ3N0b25lRycpIHtcbiAgICAgICAgICAgIGNjLmxvZygnbHVyZSBrbm9jayBzdG9uZSAnICsgb3RoZXIubm9kZS5ncm91cCk7XG4gICAgICAgICAgICAvL+eisOWIsOmanOeijVxuICAgICAgICAgICAgdGhpcy5kZXRlcmlvcmF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyJdfQ==
