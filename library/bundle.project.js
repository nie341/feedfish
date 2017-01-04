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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L0NvY29zQ3JlYXRvci9yZXNvdXJjZXMvYXBwLmFzYXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImFzc2V0cy9TY3JpcHQvQmlnbHVyZS5qcyIsImFzc2V0cy9TY3JpcHQvQm9hcmQuanMiLCJhc3NldHMvU2NyaXB0L0NhbWVyYS5qcyIsImFzc2V0cy9TY3JpcHQvQ29udHJvbC5qcyIsImFzc2V0cy9TY3JpcHQvR2FtZS5qcyIsImFzc2V0cy9TY3JpcHQvS25vY2suanMiLCJhc3NldHMvU2NyaXB0L0xvYWRpbmcuanMiLCJhc3NldHMvU2NyaXB0L01lbnUuanMiLCJhc3NldHMvU2NyaXB0L1NjZW5lTWFuYWdlci5qcyIsImFzc2V0cy9TY3JpcHQvU2NvcmUuanMiLCJhc3NldHMvU2NyaXB0L1N0YWdlTWVudS5qcyIsImFzc2V0cy9TY3JpcHQvU3RvbmUuanMiLCJhc3NldHMvU2NyaXB0L1RpbWVyLmpzIiwiYXNzZXRzL1NjcmlwdC9sdXJlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnY2ZkMGVRbmtWbEpvNmNUSU14cE1BV0MnLCAnQmlnbHVyZScpO1xuLy8gU2NyaXB0XFxCaWdsdXJlLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgc3BlZWQ6IDEsXG4gICAgICAgIGx1cmVQZXI6IDEsXG4gICAgICAgIGludGVydmFsOiA1XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8v6KGM5Li677yaMS7lvIDlp4vml7blh7rnjrDlnKjmqKrovbTnmoTmn5DkuKrngrlcbiAgICAgICAgLy8yLuWQkeS4gOS4quaWueW8j+enu+WKqO+8jOenu+WKqOW9ouW8j+WPr+iDveaYr+maj+acuueahFxuICAgICAgICAvLzMu5LiN5Lya56e75Ye65bGP5bmVXG4gICAgICAgIC8vNC7ngrnlh7vlkI7vvIzmlL7kuIvkuIDvvIjlpJrvvInkuKrppbXvvIznhLblkI7ov5nkuKrlpKfppbXmtojlpLFcbiAgICAgICAgLy81LuW9k+S4gOWumuaXtumXtOmXtOmalOWQjuWGjeWHuueOsO+8iOaaguWumu+8iVxuICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSAxO1xuICAgICAgICB0aGlzLnRocm93Q291bnQgPSAwO1xuXG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKHNlbGYubm9kZS5vcGFjaXR5ID09PSAyNTUpIHtcbiAgICAgICAgICAgICAgICBjYy5sb2coJ3Rocm93X2x1cmUnKTtcbiAgICAgICAgICAgICAgICAvL+WPkeWHuuS6i+S7tlxuICAgICAgICAgICAgICAgIHZhciBldmVudEN1c3RvbSA9IG5ldyBjYy5FdmVudC5FdmVudEN1c3RvbSgndGhyb3dfbHVyZScsIHRydWUpO1xuICAgICAgICAgICAgICAgIGV2ZW50Q3VzdG9tLnNldFVzZXJEYXRhKHNlbGYubm9kZS54KTtcbiAgICAgICAgICAgICAgICBzZWxmLm5vZGUuZGlzcGF0Y2hFdmVudChldmVudEN1c3RvbSk7XG4gICAgICAgICAgICAgICAgLy/orqHph49cbiAgICAgICAgICAgICAgICBzZWxmLnRocm93Q291bnQrKztcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi50aHJvd0NvdW50ID09PSBzZWxmLmx1cmVQZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5ub2RlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRocm93Q291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAvL+S4i+asoeWHuueOsOaXtumXtFxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNjaGVkdWxlT25jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubm9kZS5vcGFjaXR5ID0gMjU1O1xuICAgICAgICAgICAgICAgICAgICB9LCBzZWxmLmludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgdmFyIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyA1MCArIChjYy53aW5TaXplLndpZHRoIC0gNTApICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgdGhpcy5ub2RlLnggPSB4O1xuICAgIH0sXG5cbiAgICBzdHJhdGVneVJ1bjogZnVuY3Rpb24gc3RyYXRlZ3lSdW4oKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5ub2RlLnggKyB0aGlzLnNwZWVkICogdGhpcy5tb3ZlRGlyZWN0aW9uO1xuXG4gICAgICAgIGlmICh4ID4gY2Mud2luU2l6ZS53aWR0aCAvIDIgLSA1MCkge1xuXG4gICAgICAgICAgICB4ID0gY2Mud2luU2l6ZS53aWR0aCAvIDIgLSA1MDtcbiAgICAgICAgICAgIHRoaXMubW92ZURpcmVjdGlvbiA9IC10aGlzLm1vdmVEaXJlY3Rpb247XG4gICAgICAgICAgICBjYy5sb2coJ3R1cm4gbGVmdCBhbmQgeDonICsgeCArICcgbW92ZURpcmVjdGlvbjonICsgdGhpcy5tb3ZlRGlyZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoeCA8IC1jYy53aW5TaXplLndpZHRoIC8gMiArIDUwKSB7XG5cbiAgICAgICAgICAgIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyA1MDtcbiAgICAgICAgICAgIHRoaXMubW92ZURpcmVjdGlvbiA9IC10aGlzLm1vdmVEaXJlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub2RlLnggPSB4O1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgICAgIHRoaXMuc3RyYXRlZ3lSdW4oKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2IyM2E0MUUvT2hCWUxKRVREUWZ0TmlRJywgJ0JvYXJkJyk7XG4vLyBTY3JpcHRcXEJvYXJkLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBzdGFyMTogY2MuTm9kZSxcbiAgICAgICAgc3RhcjI6IGNjLk5vZGUsXG4gICAgICAgIHN0YXIzOiBjYy5Ob2RlLFxuICAgICAgICBzdGFnZVN0cmluZzogY2MuTm9kZSxcbiAgICAgICAgc3RhZ2VTY29yZTogY2MuTm9kZSxcbiAgICAgICAgc3RhZ2VCZXN0U2NvcmU6IGNjLk5vZGVcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHJlc3VsdCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vcmVzdWx0LnRpbWVcbiAgICAgICAgLy9yZXN1bHQuZWF0bHVyZUNvdW50XG4gICAgICAgIC8vcmVzdWx0LnN0YWdlXG4gICAgICAgIHZhciBzdGFnZSA9IHJlc3VsdC5zdGFnZTtcbiAgICAgICAgc2VsZi5zdGFnZSA9IHN0YWdlO1xuICAgICAgICBzZWxmLnN0YWdlU3RyaW5nLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gXCLnrKxcIiArIHN0YWdlICsgXCLlhbNcIjtcbiAgICAgICAgc2VsZi5jdXJyU3RhZ2UgPSByZXN1bHQ7XG4gICAgICAgIHNlbGYuc3RhZ2VTY29yZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IHJlc3VsdC5zY29yZTtcbiAgICAgICAgc2VsZi5nZXRTdGFycyhyZXN1bHQuc2NvcmUpO1xuICAgICAgICB2YXIgc3RhZ2VzdHJpbmcgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0YWdlJyArIHN0YWdlKTtcbiAgICAgICAgaWYgKCFzdGFnZXN0cmluZykge1xuICAgICAgICAgICAgdmFyIHN0YWdlU3RvcmFnZSA9IEpTT04ucGFyc2Uoc3RhZ2VzdHJpbmcpO1xuXG4gICAgICAgICAgICBzZWxmLnN0YWdlQmVzdFNjb3JlLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gc3RhZ2VTdG9yYWdlLmJlc3RTY29yZTtcbiAgICAgICAgICAgIHNlbGYuYmVzdFNjb3JlID0gc3RhZ2VTdG9yYWdlLmJlc3RTY29yZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuYmVzdFNjb3JlID0gMDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0U3RhcnM6IGZ1bmN0aW9uIGdldFN0YXJzKHNjb3JlKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHN0YWdlc0RhdGEgPSBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoJ0dhbWUnKS5zdGFnZXNEYXRhO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWdlc0RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzdGFnZXNEYXRhW2ldLnN0YWdlID09PSBzZWxmLnN0YWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNjb3JlID49IHN0YWdlc0RhdGFbaV0uc3RhcjEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFyMS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXIxLmNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPj0gc3RhZ2VzRGF0YVtpXS5zdGFyMikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXIyLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcjIuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA+PSBzdGFnZXNEYXRhW2ldLnN0YXIzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcjMuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFyMy5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8v5LiL5LiA5YWzXG4gICAgY29tbWFuZDogZnVuY3Rpb24gY29tbWFuZChldmVudCwgY3VzdG9tRXZlbnREYXRhKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zYXZlRGF0YSgpO1xuICAgICAgICBjYy5sb2coY3VzdG9tRXZlbnREYXRhKTtcbiAgICAgICAgc2VsZi5ub2RlLmRpc3BhdGNoRXZlbnQobmV3IGNjLkV2ZW50LkV2ZW50Q3VzdG9tKGN1c3RvbUV2ZW50RGF0YSwgdHJ1ZSkpO1xuICAgICAgICBzZWxmLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyBtZW51OiBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIC8vICAgICBzZWxmLnNhdmVEYXRhKCk7XG4gICAgLy8gICAgIHNlbGYubm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBjYy5FdmVudC5FdmVudEN1c3RvbSgnbWVudScsIHRydWUpKTtcbiAgICAvLyAgICAgc2VsZi5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgIC8vIH0sXG4gICAgc2F2ZURhdGE6IGZ1bmN0aW9uIHNhdmVEYXRhKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8v5L+d5a2Y5pys5YWz5pWw5o2uXG4gICAgICAgIGlmIChzZWxmLmN1cnJTdGFnZS5zY29yZSA+IHNlbGYuYmVzdFNjb3JlKSB7XG4gICAgICAgICAgICBzZWxmLmJlc3RTY29yZSA9IHNlbGYuY3VyclN0YWdlLnNjb3JlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdGFnZUpzb24gPSB7XG4gICAgICAgICAgICBiZXN0U2NvcmU6IHNlbGYuYmVzdFNjb3JlXG4gICAgICAgIH07XG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3RhZ2UnICsgc2VsZi5zdGFnZSwgSlNPTi5zdHJpbmdpZnkoc3RhZ2VKc29uKSk7XG4gICAgfSxcbiAgICAvLyByZWxvYWQ6ZnVuY3Rpb24oKXtcbiAgICAvLyAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIC8vICAgICBzZWxmLnNhdmVEYXRhKCk7XG4gICAgLy8gICAgIHNlbGYubm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBjYy5FdmVudC5FdmVudEN1c3RvbSgncmVsb2FkJywgdHJ1ZSkpO1xuICAgIC8vICAgICBzZWxmLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgLy8gfSxcbiAgICAvL+aaguaXtueugOWNleiuoeeul++8jOWPqueul+acquiiq+WQg+WIsOeahOmlteaVsFxuICAgIGNvdW50U3RhcjogZnVuY3Rpb24gY291bnRTdGFyKGVhdEx1cmVDb3VudCwgdGhyb3dMdXJlQ291bnQpIHtcbiAgICAgICAgdmFyIHNjb3JlID0gdGhyb3dMdXJlQ291bnQgLSBlYXRMdXJlQ291bnQ7XG4gICAgICAgIGlmIChzY29yZSA9PT0gMCkge31cbiAgICAgICAgaWYgKHNjb3JlID4gMCAmJiBzY29yZSA8PSAzKSB7fVxuICAgICAgICBpZiAoc2NvcmUgPiAzKSB7fVxuICAgICAgICAvL+acgOWQjuWIqeeUqGdhbWXnmoTlip/og73or7vlj5Zsb2NhbHN0b3JhZ2Xkv53lrZjnu5PmnpxcbiAgICB9XG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc1MzcxZXVTR3Q5SFo1NjdrS3d4b1ZCNycsICdDYW1lcmEnKTtcbi8vIFNjcmlwdFxcQ2FtZXJhLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgIFwiZGVmYXVsdFwiOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICAgXCJkZWZhdWx0XCI6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHZhciB3aW5TaXplID0gY2Mud2luU2l6ZTtcbiAgICAgICAgdGhpcy5zY3JlZW5NaWRkbGUgPSBjYy52Mih3aW5TaXplLndpZHRoIC8gMiwgd2luU2l6ZS5oZWlnaHQgLyAyKTtcblxuICAgICAgICB0aGlzLmJvdW5kaW5nQm94ID0gY2MucmVjdCgwLCAwLCB0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLm1pbnggPSAtKHRoaXMuYm91bmRpbmdCb3gueE1heCAtIHdpblNpemUud2lkdGgpO1xuICAgICAgICB0aGlzLm1heHggPSB0aGlzLmJvdW5kaW5nQm94LnhNaW47XG4gICAgICAgIHRoaXMubWlueSA9IC0odGhpcy5ib3VuZGluZ0JveC55TWF4IC0gd2luU2l6ZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLm1heHkgPSB0aGlzLmJvdW5kaW5nQm94LnlNaW47XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMubm9kZS5jb252ZXJ0VG9Xb3JsZFNwYWNlQVIoY2MuVmVjMi5aRVJPKTtcbiAgICAgICAgdmFyIHRhcmdldFBvcyA9IHRoaXMudGFyZ2V0LmNvbnZlcnRUb1dvcmxkU3BhY2VBUihjYy5WZWMyLlpFUk8pO1xuICAgICAgICB2YXIgZGlmID0gcG9zLnN1Yih0YXJnZXRQb3MpO1xuXG4gICAgICAgIHZhciBkZXN0ID0gZGlmLmFkZCh0aGlzLnNjcmVlbk1pZGRsZSk7XG5cbiAgICAgICAgZGVzdC54ID0gY2MuY2xhbXBmKGRlc3QueCwgdGhpcy5taW54LCB0aGlzLm1heHgpO1xuICAgICAgICBkZXN0LnkgPSBjYy5jbGFtcGYoZGVzdC55LCB0aGlzLm1pbnksIHRoaXMubWF4eSk7XG5cbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uID0gdGhpcy5ub2RlLnBhcmVudC5jb252ZXJ0VG9Ob2RlU3BhY2VBUihkZXN0KTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzRiZjRlNnc0eXBOd0tOZG1sWEdZQUplJywgJ0NvbnRyb2wnKTtcbi8vIFNjcmlwdFxcQ29udHJvbC5qc1xuXG52YXIgRmlzaFJ1blN0YXR1cyA9IGNjLkVudW0oe1xuICAgIHN0b3A6IDAsXG4gICAgY29udHJvbDogMSxcbiAgICBmaW5kOiAyLFxuICAgIHJhbmRvbTogM1xufSk7XG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8v6L+Q6KGM5oCn77yMMH4x5LmL6Ze077yM6LaK5bCP6LaK54ix5YqoXG4gICAgICAgIG1vdmVfcmF0ZTogMC40LFxuICAgICAgICBtYXhfc2VlZDogMTAsXG4gICAgICAgIHNwZWVkOiAxMCxcbiAgICAgICAgdHVybl9zcGVlZDogNSxcbiAgICAgICAgaWRsZV90aW1lOiA1LFxuICAgICAgICBmYXZvcml0ZTogZmFsc2UsXG4gICAgICAgIHN0YXI6IGNjLk5vZGUsXG4gICAgICAgIGx1cmU6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGUsXG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnN0b3A7XG4gICAgICAgIC8qICAgXG4gICAgICAgIOmxvOeahOeJueaAp++8mlxuICAgICAgICAxLuiHquW3sea4uO+8jOS8muWBnOS4gOS8muWEv++8jOWGjea4uFxuICAgICAgICAyLuS8muaJvuemu+iHquW3seacgOi/keeahOmltVxuICAgICAgICAzLumlteeahOWHuueOsOS8muiuqemxvOWQkeWFtua4uOi/kVxuICAgICAgICAqL1xuICAgICAgICAvLyBhZGQga2V5IGRvd24gYW5kIGtleSB1cCBldmVudFxuXG4gICAgICAgIGNjLnN5c3RlbUV2ZW50Lm9uKGNjLlN5c3RlbUV2ZW50LkV2ZW50VHlwZS5LRVlfRE9XTiwgdGhpcy5vbktleURvd24sIHRoaXMpO1xuICAgICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX1VQLCB0aGlzLm9uS2V5VXAsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuYW5pbSA9IHRoaXMuZ2V0Q29tcG9uZW50KGNjLkFuaW1hdGlvbik7XG4gICAgICAgIHRoaXMubW92ZURpcmVjdGlvbiA9IG51bGw7XG4gICAgICAgIHRoaXMuc3ByaXRlID0gdGhpcy5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcblxuICAgICAgICAvL+avjzXnp5Lmg7PkuIDkuIvvvIzmmK/kuI3mmK/opoHmuLhcbiAgICAgICAgdGhpcy5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYy5sb2coJ2Zpc2ggc3RhdHVzOicgKyBzZWxmLnJ1bl9zdGF0dXMpO1xuICAgICAgICAgICAgLy/ku47lgZzmraLnirbmgIEg6L+b5YWlIOiHqueUsei/kOWKqFxuICAgICAgICAgICAgaWYgKHNlbGYucnVuX3N0YXR1cyA9PT0gRmlzaFJ1blN0YXR1cy5zdG9wKSB7XG4gICAgICAgICAgICAgICAgLy/mn5Dnp43lsZ7mgKfvvIzmmK/kuI3mmK/niLHliqhcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IHRoaXMubW92ZV9yYXRlKSBzZWxmLnJhbmRvbVJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBzZWxmLmlkbGVfdGltZSAqIE1hdGgucmFuZG9tKCkpO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdChwcm9wZXJ0aWVzKSB7XG4gICAgICAgIC8v5ZCI5bm25LiA5Lqb5bGe5oCnIG1peGluP1xuICAgICAgICBjYy5sb2codGhpcyk7XG4gICAgICAgIGNjLmpzLm1peGluKHRoaXMsIHByb3BlcnRpZXMpO1xuICAgICAgICAvL3RoaXMuZmF2b3JpdGU9cHJvcGVydGllcy5mYXZvcml0ZTtcblxuICAgICAgICBpZiAoIXRoaXMuZmF2b3JpdGUpIHtcbiAgICAgICAgICAgIHRoaXMuc3Rhci5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjYy5sb2coJ3RoaXMubm9kZS5wYXJlbnQnKTtcbiAgICAgICAgY2MubG9nKHRoaXMubm9kZS5wYXJlbnQpO1xuICAgICAgICAvLyBjYy5sb2codGhpcyk7XG4gICAgfSxcblxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIGNjLnN5c3RlbUV2ZW50Lm9mZihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX0RPV04sIHRoaXMub25LZXlEb3duLCB0aGlzKTtcbiAgICAgICAgY2Muc3lzdGVtRXZlbnQub2ZmKGNjLlN5c3RlbUV2ZW50LkV2ZW50VHlwZS5LRVlfVVAsIHRoaXMub25LZXlVcCwgdGhpcyk7XG4gICAgfSxcblxuICAgIG9uS2V5RG93bjogZnVuY3Rpb24gb25LZXlEb3duKGV2ZW50KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGRpcmN0aW9uX3JvdGF0aW9uID0gMDtcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgIT09IHRoaXMubW92ZURpcmVjdGlvbikge1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkubGVmdDpcblxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmNvdW50Um90YXRpb24oMjcwKTtcbiAgICAgICAgICAgICAgICAgICAgZGlyY3Rpb25fcm90YXRpb24gPSAyNzA7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkucmlnaHQ6XG5cbiAgICAgICAgICAgICAgICAgICAgZGlyY3Rpb25fcm90YXRpb24gPSA5MDtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS51cDpcblxuICAgICAgICAgICAgICAgICAgICBkaXJjdGlvbl9yb3RhdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuYW5pbS5wbGF5KCdmaXNoX3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmRvd246XG4gICAgICAgICAgICAgICAgICAgIGRpcmN0aW9uX3JvdGF0aW9uID0gMTgwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5zcGFjZTpcbiAgICAgICAgICAgICAgICAgICAgLy8gY2MubG9nKCdkZCcrdGhpcy5sdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lYXRBY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYy5sb2coJ3RoaXMubW92ZURpcmVjdGlvbjonICsgdGhpcy5tb3ZlRGlyZWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uQ29udHJvbChkaXJjdGlvbl9yb3RhdGlvbiwgZXZlbnQua2V5Q29kZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3RoaXMuY291bnRSb3RhdGlvbihkaXJjdGlvbl9yb3RhdGlvbik7XG4gICAgICAgIHRoaXMubW92ZURpcmVjdGlvbiA9IGV2ZW50LmtleUNvZGU7XG4gICAgfSxcbiAgICBjb3VudEFuZ2xlOiBmdW5jdGlvbiBjb3VudEFuZ2xlKHRhcmdldCwgc2VsZikge1xuICAgICAgICB2YXIgbGVuX3kgPSB0YXJnZXQueSAtIHNlbGYueTtcbiAgICAgICAgdmFyIGxlbl94ID0gdGFyZ2V0LnggLSBzZWxmLng7XG5cbiAgICAgICAgdmFyIHRhbl95eCA9IE1hdGguYWJzKGxlbl95KSAvIE1hdGguYWJzKGxlbl94KTtcbiAgICAgICAgdmFyIGFuZ2xlID0gMDtcbiAgICAgICAgaWYgKGxlbl95ID4gMCAmJiBsZW5feCA8IDApIHtcbiAgICAgICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuKHRhbl95eCkgKiAxODAgLyBNYXRoLlBJIC0gOTA7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuX3kgPiAwICYmIGxlbl94ID4gMCkge1xuICAgICAgICAgICAgYW5nbGUgPSA5MCAtIE1hdGguYXRhbih0YW5feXgpICogMTgwIC8gTWF0aC5QSTtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5feSA8IDAgJiYgbGVuX3ggPCAwKSB7XG4gICAgICAgICAgICBhbmdsZSA9IC1NYXRoLmF0YW4odGFuX3l4KSAqIDE4MCAvIE1hdGguUEkgLSA5MDtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5feSA8IDAgJiYgbGVuX3ggPiAwKSB7XG4gICAgICAgICAgICBhbmdsZSA9IE1hdGguYXRhbih0YW5feXgpICogMTgwIC8gTWF0aC5QSSArIDkwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbmdsZTtcbiAgICB9LFxuICAgIGVhdEFjdGlvbjogZnVuY3Rpb24gZWF0QWN0aW9uKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0aGlzLmx1cmUpIHtcbiAgICAgICAgICAgIHZhciBfcmV0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLmx1cmUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy53YW50RWF0VGhpbmsoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmx1cmUgPT0gdW5kZWZpbmVkIHx8ICFfdGhpcy5sdXJlIHx8IF90aGlzLmx1cmUgPT09IG51bGwgfHwgIV90aGlzLmx1cmUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAvL+WcqOi/veeahOi/h+eoi+S4re+8jOmlteWboOS4uuafkOenjeWOn+WboOayoeS6hu+8jFxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5zdG9wO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdjogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2MubG9nKCcgd2FudCBlYXQgJyArIF90aGlzLmx1cmUudXVpZCArICcgJyArIF90aGlzLmx1cmUueCk7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSBfdGhpcztcbiAgICAgICAgICAgICAgICAvLyBsZXQgbGVuX3kgPSB0aGlzLmx1cmUueSAtIHRoaXMubm9kZS55O1xuICAgICAgICAgICAgICAgIC8vIGxldCBsZW5feCA9IHRoaXMubHVyZS54IC0gdGhpcy5ub2RlLng7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgdGFuX3l4ID0gTWF0aC5hYnMobGVuX3kpIC8gTWF0aC5hYnMobGVuX3gpO1xuICAgICAgICAgICAgICAgIC8vIGxldCBhbmdsZSA9IDA7XG4gICAgICAgICAgICAgICAgLy8gaWYgKGxlbl95ID4gMCAmJiBsZW5feCA8IDApIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgYW5nbGUgPSBNYXRoLmF0YW4odGFuX3l4KSAqIDE4MCAvIE1hdGguUEkgLSA5MDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKGxlbl95ID4gMCAmJiBsZW5feCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgYW5nbGUgPSA5MCAtIE1hdGguYXRhbih0YW5feXgpICogMTgwIC8gTWF0aC5QSTtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKGxlbl95IDwgMCAmJiBsZW5feCA8IDApIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgYW5nbGUgPSAtTWF0aC5hdGFuKHRhbl95eCkgKiAxODAgLyBNYXRoLlBJIC0gOTA7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChsZW5feSA8IDAgJiYgbGVuX3ggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGFuZ2xlID0gTWF0aC5hdGFuKHRhbl95eCkgKiAxODAgLyBNYXRoLlBJICsgOTA7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIHZhciBhbmdsZSA9IF90aGlzLmNvdW50QW5nbGUoX3RoaXMubHVyZSwgX3RoaXMubm9kZSk7XG4gICAgICAgICAgICAgICAgLy8gIGNjLmxvZygnYW5nbGU6JythbmdsZSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgeF8gPSBNYXRoLmNvcyhhbmdsZSkgKiBfdGhpcy5zcGVlZDtcbiAgICAgICAgICAgICAgICB2YXIgeV8gPSBNYXRoLnNpbihhbmdsZSkgKiBfdGhpcy5zcGVlZDtcbiAgICAgICAgICAgICAgICAvLyBjYy5sb2coJ3hfLHlfOicreF8rJywnK3lfKTtcblxuICAgICAgICAgICAgICAgIHZhciBmaW5pc2hlZCA9IGNjLmNhbGxGdW5jKGZ1bmN0aW9uICh0YXJnZXQsIGluZCkge1xuICAgICAgICAgICAgICAgICAgICAvL2NjLmxvZygnZmluaXNoZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNjLmxvZygndGhpcy5sdXJlOicrdGhpcy5sdXJlLnBvc2l0aW9uLngpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5sdXJlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v5aaC5p6c6aW16L+Y5Zyo77yM57un57ut5ZCDXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVhdEFjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/mib7lj6bkuIDkuKrppbVcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYW52YXNTY3JpcHQgPSBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoJ0dhbWUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYW52YXNTY3JpcHQubHVyZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYud2FudEVhdFRoaW5rKGNhbnZhc1NjcmlwdC5sdXJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2MubG9nKCcgZmluZCAnK2NhbnZhc1NjcmlwdC5sdXJlc1swXS51dWlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZWxmLmx1cmU9Y2FudmFzU2NyaXB0Lmx1cmVzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbGYuZWF0QWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnN0b3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgX3RoaXMsIDApO1xuICAgICAgICAgICAgICAgIC8v6L+Z5Liq5pe26Ze06KaB5Y+Y5YyWXG4gICAgICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gY2MucERpc3RhbmNlKF90aGlzLm5vZGUuZ2V0UG9zaXRpb24oKSwgX3RoaXMubHVyZS5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgICAgICB2YXIgc3BlZWQgPSBfdGhpcy5tYXhfc2VlZCAqIDAuNTtcbiAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3BlZWQgPSBfdGhpcy5tYXhfc2VlZCAqIDAuMTU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IDgwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwZWVkID0gX3RoaXMubWF4X3NlZWQgKiAwLjAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYy5sb2coJ25ldyBzcGVlZDonICsgc3BlZWQpO1xuICAgICAgICAgICAgICAgIHZhciByb3RhdGVUbyA9IGNjLnJvdGF0ZVRvKHNwZWVkIC8gMiwgYW5nbGUpOyAvL2NjLnJvdGF0ZVRvKDAuNSwgYW5nbGUpO1xuICAgICAgICAgICAgICAgIHZhciBmb2xsb3dBY3Rpb24gPSBjYy5tb3ZlVG8oc3BlZWQsIF90aGlzLmx1cmUpO1xuICAgICAgICAgICAgICAgIF90aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAvL+WtpuS5oOeahOi/h+eoi++8jOW9k+aSnuWIsOWQju+8jOiusOW9leS6humanOeije+8jOWGjeaAneiAg+aXtuimgeiAg+iZkemanOeijVxuICAgICAgICAgICAgICAgIC8vIGlmIChzZWxmLnBhdGhQb2x5Z29ucykge1xuICAgICAgICAgICAgICAgIC8vICAgICBsZXQgcGF0aHMgPSBzZWxmLmZpbmRQYXRoKHNlbGYubm9kZS5nZXRQb3NpdGlvbigpLCBzZWxmLmx1cmUuZ2V0UG9zaXRpb24oKSwgc2VsZi5wYXRoUG9seWdvbnMsIHNlbGYuc3RvbmVQb2x5Z29ucywgW10pO1xuICAgICAgICAgICAgICAgIC8vICAgICBsZXQgcGF0aCA9IHNlbGYuc2hvcnRQYXRoKHBhdGhzKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCB8fCBwYXRoID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjYy5sb2coJ2RpcmVjdCBwYXRoJyk7XG5cbiAgICAgICAgICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNjLmxvZyhwYXRocyk7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjYy5sb2coJ2ZpbmQgcGF0aCB3aXRoIHN0b25lICcpO1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY2MubG9nKHBhdGgpO1xuXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBmb2xsb3dBY3Rpb24gPSBjYy5jYXJkaW5hbFNwbGluZVRvKHNwZWVkLFtjYy5wKC0yMDIsMCksY2MucCgwLDApXSwwKTsvL2NjLmNhcmRpbmFsU3BsaW5lVG8oc3BlZWQsIHBhdGgsIDApOyAvL3RlbnNpb27ntKflvKDluqbvvIzopoHogIPph4/kuIDkuItcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHJvdGF0ZVRvID0gY2Mucm90YXRlVG8oc3BlZWQgLCBhbmdsZSk7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKGNjLnNwYXduKGZvbGxvd0FjdGlvbiwgY2Muc2VxdWVuY2Uocm90YXRlVG8sIGZpbmlzaGVkKSkpO1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIF90aGlzLm5vZGUucnVuQWN0aW9uKGNjLnNwYXduKGZvbGxvd0FjdGlvbiwgY2Muc2VxdWVuY2Uocm90YXRlVG8sIGZpbmlzaGVkKSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gZm9sbG93QWN0aW9uLmVhc2luZyhjYy5lYXNlUXVhcnRpY0FjdGlvbkluKCkpO1xuXG4gICAgICAgICAgICAgICAgLy/lgZzmraLkuYvliY3nmoTliqjkvZzvvIzovazogIzmiafooYzkuIvpnaLnmoTliqjkvZxcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHY6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIF9yZXQgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldC52O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5zdG9wO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvL+S7u+aEj+a4uC8v5Lmf5Y+v6IO95YGc5LiL5p2lXG4gICAgcmFuZG9tUnVuOiBmdW5jdGlvbiByYW5kb21SdW4oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyBjYy53aW5TaXplLndpZHRoICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgdmFyIHkgPSAtY2Mud2luU2l6ZS5oZWlnaHQgLyAyICsgKGNjLndpblNpemUuaGVpZ2h0IC0gMTAwKSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHZhciBzcGVlZCA9IHRoaXMubWF4X3NlZWQgKiAoTWF0aC5yYW5kb20oKSAqIDAuOCArIDAuMik7XG4gICAgICAgIGNjLmxvZygnZmlzaCByYW5kb20gcnVuICcgKyB4ICsgJywnICsgeSArICcgYXQgJyArIHNwZWVkKTtcbiAgICAgICAgdmFyIG1vdmVUbyA9IGNjLm1vdmVUbyhzcGVlZCwgY2MucCh4LCB5KSk7XG5cbiAgICAgICAgdmFyIGZpbmlzaGVkID0gY2MuY2FsbEZ1bmMoZnVuY3Rpb24gKHRhcmdldCwgaW5kKSB7XG4gICAgICAgICAgICBzZWxmLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnN0b3A7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYW5nbGUgPSB0aGlzLmNvdW50QW5nbGUoY2MucCh4LCB5KSwgdGhpcy5ub2RlKTtcbiAgICAgICAgY2MubG9nKCdhbmdsZTonICsgYW5nbGUpO1xuXG4gICAgICAgIHZhciByb3RhdGVUbyA9IGNjLnJvdGF0ZVRvKDAuMjUgKyBNYXRoLnJhbmRvbSgpICogMiwgYW5nbGUpO1xuICAgICAgICB0aGlzLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnJhbmRvbTsgLy/nirbmgIHlj5jljJbkuoZcbiAgICAgICAgdmFyIHJhbmRvbUFjdGlvbiA9IGNjLnNwYXduKHJvdGF0ZVRvLCBjYy5zZXF1ZW5jZShtb3ZlVG8sIGZpbmlzaGVkKSk7XG4gICAgICAgIHJhbmRvbUFjdGlvbi5zZXRUYWcoRmlzaFJ1blN0YXR1cy5yYW5kb20pO1xuICAgICAgICAvLyBjYy5sb2cocmFuZG9tQWN0aW9uKTtcbiAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbihyYW5kb21BY3Rpb24pO1xuICAgIH0sXG4gICAgLy/lr7nmiYDmnInppbXov5vooYzor4TkvLDvvIzmib7liLDmnIDmg7PlkIPmnIDov5HnmoTkuIDkuKpcbiAgICB3YW50RWF0VGhpbms6IGZ1bmN0aW9uIHdhbnRFYXRUaGluayhsdXJlcykge1xuICAgICAgICBpZiAobHVyZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGx1cmVzID0gY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KCdHYW1lJykubHVyZXM7IC8vbm9kZVxuICAgICAgICAgICAgY2MubG9nKCdmaW5kIGx1cmVzIGZyb20gY2FudmFzJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2MubG9nKCdsdXJlczonKTtcbiAgICAgICAgY2MubG9nKGx1cmVzKTtcbiAgICAgICAgaWYgKCFsdXJlcykge1xuICAgICAgICAgICAgY2MubG9nKCd1bmRlZmluZWQgbHVyZXMnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobHVyZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5maW5kOyAvL2ZpbmQgbHVyZVxuICAgICAgICB9XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IDk5OTk7XG4gICAgICAgIC8v5a+55LqO6Led56a75beu5LiN5aSa55qE77yM5piv5LiN5piv6ZqP5py65aSE55CG5ZGi77yf6L+Y5piv6K6p5Lik5Y+q6bG85pKe5Zyo5LiA6LW377yfXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBkaXN0YW5jZV8gPSBjYy5wRGlzdGFuY2UodGhpcy5ub2RlLmdldFBvc2l0aW9uKCksIGx1cmVzW2ldLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gZGlzdGFuY2VfKSB7XG4gICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZV87XG4gICAgICAgICAgICAgICAgdGhpcy5sdXJlID0gbHVyZXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2MubG9nKCcgZmluZCAnICsgdGhpcy5sdXJlLnV1aWQpO1xuICAgICAgICB0aGlzLmVhdEFjdGlvbigpO1xuICAgIH0sXG4gICAgLy/plK7nm5jmjqfliLbvvIzmmoLml7bkuI3opoHkuoZcbiAgICBhY3Rpb25Db250cm9sOiBmdW5jdGlvbiBhY3Rpb25Db250cm9sKGRpcmN0aW9uX3JvdGF0aW9uLCBjb2RlKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5ub2RlLnBvc2l0aW9uLng7XG4gICAgICAgIHZhciB5ID0gdGhpcy5ub2RlLnBvc2l0aW9uLnk7XG4gICAgICAgIC8vIGNjLmxvZygnYmUgeCx5OicgKyB4ICsgJyAnICsgeSArICcgJyArIGNvZGUpO1xuICAgICAgICB2YXIgcm90YXRlVG8gPSBjYy5yb3RhdGVUbygwLjUsIGRpcmN0aW9uX3JvdGF0aW9uKTtcbiAgICAgICAgcm90YXRlVG8uZWFzaW5nKGNjLmVhc2VFbGFzdGljT3V0KCkpO1xuICAgICAgICB2YXIgeF8gPSB4O1xuICAgICAgICB2YXIgeV8gPSB5O1xuICAgICAgICBzd2l0Y2ggKGNvZGUpIHtcblxuICAgICAgICAgICAgY2FzZSBjYy5LRVkubGVmdDpcbiAgICAgICAgICAgICAgICB4XyA9IHggLSAxMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY2MuS0VZLnJpZ2h0OlxuICAgICAgICAgICAgICAgIHhfID0geCArIDEwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjYy5LRVkudXA6XG4gICAgICAgICAgICAgICAgeV8gPSB5ICsgMTA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjLktFWS5kb3duOlxuICAgICAgICAgICAgICAgIHlfID0geSAtIDEwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vY2MubG9nKHhfICsgJyA6ICcgKyB5Xyk7XG4gICAgICAgIHZhciBiZXppZXJUbyA9IGNjLm1vdmVUbygxLjUsIGNjLnAoeF8sIHlfKSk7IC8vLGNjLnAoeC0zMCx5KzIwKSxjYy5wKHgtNDAseSldKTtcbiAgICAgICAgYmV6aWVyVG8uZWFzaW5nKGNjLmVhc2VFbGFzdGljSW4oKSk7XG4gICAgICAgIC8vIGJlemllclRvLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25JbigpKTsgICAgIC8vY2MuYmV6aWVyVG8oMixbY2MucCh4LHkpLGNjLnAoeCs0MCx5KzQwKSxjYy5wKHgseSs4MCksY2MucCh4LTQwLHkrNDApLGNjLnAoeCx5KV0pO1xuICAgICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKGNjLnNwYXduKHJvdGF0ZVRvLCBiZXppZXJUbykpO1xuICAgIH0sXG5cbiAgICBjb3VudFJvdGF0aW9uOiBmdW5jdGlvbiBjb3VudFJvdGF0aW9uKGRpcmN0aW9uX3JvdGF0aW9uKSB7XG4gICAgICAgIHRoaXMucnVuX3N0YXR1cyA9IEZpc2hSdW5TdGF0dXMuY29udHJvbDsgLy9ydW5uaW5nXG4gICAgICAgIHRoaXMuc3RhcnRfcm90YXRpb24gPSB0aGlzLm5vZGUucm90YXRpb247XG4gICAgICAgIHRoaXMuZW5kX3JvdGF0aW9uID0gZGlyY3Rpb25fcm90YXRpb247XG4gICAgICAgIHRoaXMuY2xvY2t3aXNlID0gMTtcbiAgICAgICAgLy/mlrnlkJHnrKzkuIDmrKHorqHnrpdcbiAgICAgICAgdmFyIGR2YWx1ZSA9IHRoaXMuZW5kX3JvdGF0aW9uIC0gdGhpcy5zdGFydF9yb3RhdGlvbjtcbiAgICAgICAgaWYgKGR2YWx1ZSA9PT0gMCB8fCBkdmFsdWUgPT09IDM2MCkgdGhpcy5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5zdG9wO1xuICAgICAgICBpZiAoZHZhbHVlIDwgMCkgdGhpcy5jbG9ja3dpc2UgPSAtdGhpcy5jbG9ja3dpc2U7XG4gICAgICAgIC8v6KaB6L2s55qE6KeS5bqmXG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLmVuZF9yb3RhdGlvbiAtIHRoaXMuc3RhcnRfcm90YXRpb24pID4gMTgwKSB7XG4gICAgICAgICAgICB0aGlzLnR1cm5fcm90YXRpb24gPSAzNjAgLSBNYXRoLmFicyh0aGlzLmVuZF9yb3RhdGlvbiAtIHRoaXMuc3RhcnRfcm90YXRpb24pO1xuICAgICAgICAgICAgLy/mlrnlkJHnrKzkuozmrKHorqHnrpdcbiAgICAgICAgICAgIHRoaXMuY2xvY2t3aXNlID0gLXRoaXMuY2xvY2t3aXNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50dXJuX3JvdGF0aW9uID0gTWF0aC5hYnModGhpcy5lbmRfcm90YXRpb24gLSB0aGlzLnN0YXJ0X3JvdGF0aW9uKTsgLy/opoHovaznmoTop5LluqZcbiAgICAgICAgfVxuICAgICAgICAvLyAgIGNjLmxvZyh0aGlzLnR1cm5fcm90YXRpb24pO1xuICAgICAgICAvLyAgIGNjLmxvZyh0aGlzLmNsb2Nrd2lzZSk7XG4gICAgICAgIC8vICAgY2MubG9nKHRoaXMubm9kZS5yb3RhdGlvbik7XG4gICAgICAgIC8vY2MubG9nKGNvbnZlcnRUb1dvcmxkU3BhY2VBUiB0aGlzLm5vZGUucG9zaXRpb24pO1xuICAgIH0sXG5cbiAgICBvbktleVVwOiBmdW5jdGlvbiBvbktleVVwKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSB0aGlzLm1vdmVEaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMubW92ZURpcmVjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25Db2xsaXNpb25FbnRlcjogZnVuY3Rpb24gb25Db2xsaXNpb25FbnRlcihvdGhlciwgc2VsZikge1xuICAgICAgICBpZiAob3RoZXIubm9kZS5ncm91cCA9PT0gJ3N0b25lRycpIHtcbiAgICAgICAgICAgIGNjLmxvZygnZmlzaCBrbm9jayBzdG9uZScgKyBvdGhlci5ub2RlLmdyb3VwKTtcbiAgICAgICAgICAgIGNjLmxvZyhvdGhlcik7XG4gICAgICAgICAgICAvL+eisOWIsOmxvFxuICAgICAgICAgICAgLy/orrDlv4bpmpznoo1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0b25lUG9seWdvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhciBwb2x5Z29ucyA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBjYW52YXMgPSBjYy5maW5kKCdDYW52YXMnKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG90aGVyLnBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBwb2x5Z29uc1tpXSA9IGNhbnZhcy5jb252ZXJ0VG9Ob2RlU3BhY2VBUihvdGhlci53b3JsZC5wb2ludHNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0b25lUG9seWdvbnMgPSBwb2x5Z29ucztcbiAgICAgICAgICAgICAgICBjYy5sb2coJ21lbW8gdGhlIHN0b25lUG9seWdvbnMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v6bG86KaB5pS55Y+Y6KGM5Yqo6Lev57q/XG4gICAgICAgICAgICB0aGlzLnN0cmF0ZWd5UnVuKG90aGVyLm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdGhlci5ub2RlLmdyb3VwID09PSAncGF0aEcnICYmIHRoaXMucGF0aFBvbHlnb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNjLmxvZygnbWVtbyB0aGUgcGF0aFBvbHlnb25zJyk7XG4gICAgICAgICAgICB2YXIgcG9seWdvbnMgPSBbXTtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjYy5maW5kKCdDYW52YXMnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3RoZXIucG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcG9seWdvbnNbaV0gPSBjYW52YXMuY29udmVydFRvTm9kZVNwYWNlQVIob3RoZXIud29ybGQucG9pbnRzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucGF0aFBvbHlnb25zID0gcG9seWdvbnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG90aGVyLm5vZGUuZ3JvdXAgPT09ICdmaXNoRycpIHtcbiAgICAgICAgICAgIC8v5aaC5p6c5piv6bG85LiO6bG855u45pKeXG4gICAgICAgICAgICB0aGlzLnN0cmF0ZWd5UnVuKG90aGVyLm5vZGUsIDAuMTUsIDAuMywgdHJ1ZSwgNTApO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvL+WPjeW8ueeahEFJ6YC76L6RXG4gICAgc3RyYXRlZ3lSdW46IGZ1bmN0aW9uIHN0cmF0ZWd5UnVuKG90aGVyLCB0ZW1wU3BlZWQsIHRlbXBSb3RhdGVTcGVlZCwgaW1tZWRpYXRlbHksIHJhbmdlKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy/lvZPliY3mmK/mnInnm67moIfnmoTmuLjvvIzov5jmmK/pl7LmuLhcbiAgICAgICAgaWYgKHNlbGYucnVuX3N0YXR1cyA9PT0gRmlzaFJ1blN0YXR1cy5yYW5kb20gfHwgc2VsZi5ydW5fc3RhdHVzID09PSBGaXNoUnVuU3RhdHVzLmZpbmQgfHwgc2VsZi5ydW5fc3RhdHVzID09PSBGaXNoUnVuU3RhdHVzLnN0b3ApIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgeF9yYW5nZSA9IE1hdGguYWJzKGNjLndpblNpemUud2lkdGggLyAyIC0gTWF0aC5hYnMoc2VsZi5ub2RlLngpKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgeV9yYW5nZSA9IE1hdGguYWJzKGNjLndpblNpemUuaGVpZ2h0IC8gMiAtIE1hdGguYWJzKHNlbGYubm9kZS55KSAtIDEwMCk7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHggPSBzZWxmLm5vZGUueCArIHhfcmFuZ2UgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIC8vIGxldCB5ID0gc2VsZi5ub2RlLnkgKyB5X3JhbmdlICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICB2YXIgeF9yYW5nZSA9IDEwMCArIDUwICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICB2YXIgeV9yYW5nZSA9IDEwMCArIDUwICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgeF9yYW5nZSA9IHJhbmdlICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICAgICAgeV9yYW5nZSA9IHJhbmdlICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcnVuX3N0YXR1c19vcmcgPSBzZWxmLnJ1bl9zdGF0dXM7XG4gICAgICAgICAgICAgICAgdmFyIHggPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKG90aGVyLnggPj0gc2VsZi5ub2RlLngpIHtcblxuICAgICAgICAgICAgICAgICAgICB4ID0gc2VsZi5ub2RlLnggLSB4X3JhbmdlOyAvLy1jYy53aW5TaXplLndpZHRoIC8gMiArIHhfcmFuZ2UgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gc2VsZi5ub2RlLnggKyB4X3JhbmdlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG90aGVyLnkgPj0gc2VsZi5ub2RlLnkpIHtcbiAgICAgICAgICAgICAgICAgICAgeSA9IHNlbGYubm9kZS55IC0geV9yYW5nZTsgLy8tY2Mud2luU2l6ZS5oZWlnaHQgLyAyICsgeV9yYW5nZSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSBzZWxmLm5vZGUueSArIHlfcmFuZ2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNjLmxvZygnYWZ0ZXIga25vY2sgdGhlbiB3YW50ICcgKyB4ICsgJywnICsgeSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgc3BlZWQgPSBfdGhpczIubWF4X3NlZWQgKiAoTWF0aC5yYW5kb20oKSAqIDAuOCArIDAuMik7XG4gICAgICAgICAgICAgICAgaWYgKHRlbXBTcGVlZCkgc3BlZWQgPSB0ZW1wU3BlZWQ7XG4gICAgICAgICAgICAgICAgdmFyIG1vdmVUbyA9IGNjLm1vdmVUbyhzcGVlZCwgY2MucCh4LCB5KSk7XG4gICAgICAgICAgICAgICAgLy8gICB4PTUwK2NjLndpblNpemUud2lkdGgvMipNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIC8vICAgeT01MCtjYy53aW5TaXplLmhlaWdodC8yKk1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgLy8gdmFyIG1uZyA9IGNjLmRpcmVjdG9yLmdldEFjdGlvbk1hbmFnZXIoKTtcbiAgICAgICAgICAgICAgICAvLyBjYy5sb2cobW5nLmdldEFjdGlvbkJ5VGFnKEZpc2hSdW5TdGF0dXMucmFuZG9tLHRoaXMubm9kZSkpO1xuICAgICAgICAgICAgICAgIC8vIG1vdmVUbz1jYy5yZXZlcnNlVGltZShtbmcuZ2V0QWN0aW9uQnlUYWcoRmlzaFJ1blN0YXR1cy5yYW5kb20sdGhpcy5ub2RlKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgbW92ZUJ5ID0gY2MubW92ZUJ5KHNwZWVkLCBjYy5wKHgsIHkpKTtcbiAgICAgICAgICAgICAgICB2YXIgZmluaXNoZWQgPSBjYy5jYWxsRnVuYyhmdW5jdGlvbiAodGFyZ2V0LCBpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bl9zdGF0dXNfb3JnID09PSBGaXNoUnVuU3RhdHVzLnJhbmRvbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5zdG9wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChydW5fc3RhdHVzX29yZyA9PT0gRmlzaFJ1blN0YXR1cy5maW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJ1bl9zdGF0dXMgPSBydW5fc3RhdHVzX29yZztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v6aW15rKh5pyJ5Lii77yM6L+Y5oOz552AXG4gICAgICAgICAgICAgICAgICAgICAgICAvLy8v6amx5pWj5a6M5LqG77yM5bqU6K+l6YeN5paw5om+55uu5qCHXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLndhbnRFYXRUaGluayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2VsZi5lYXRBY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNjLmxvZygnb3RoZXIgYW5nbGU6JyArIF90aGlzMi5jb3VudEFuZ2xlKF90aGlzMi5ub2RlLmNvbnZlcnRUb05vZGVTcGFjZShjYy5wKHgsIHkpKSwgY2MucCgwLCAwKSkgKyBcIiB8IFwiICsgX3RoaXMyLmNvdW50QW5nbGUoY2MucCh4LCB5KSwgX3RoaXMyLm5vZGUpKTtcbiAgICAgICAgICAgICAgICB2YXIgYW5nbGUgPSBfdGhpczIuY291bnRBbmdsZShjYy5wKHgsIHkpLCBfdGhpczIubm9kZSk7XG4gICAgICAgICAgICAgICAgLy8gYW5nbGU9KGFuZ2xlPjE4MD81NDAtdGhpcy5ub2RlLnJvdGF0aW9uOnRoaXMubm9kZS5yb3RhdGlvbi05MCk7XG4gICAgICAgICAgICAgICAgdmFyIHJvdGF0ZVNwZWVkID0gX3RoaXMyLnR1cm5fc3BlZWQgKiBNYXRoLnJhbmRvbSgpICsgMC4yO1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wUm90YXRlU3BlZWQpIHJvdGF0ZVNwZWVkID0gdGVtcFJvdGF0ZVNwZWVkO1xuICAgICAgICAgICAgICAgIHZhciByb3RhdGVUbyA9IGNjLnJvdGF0ZVRvKHJvdGF0ZVNwZWVkLCBhbmdsZSk7XG4gICAgICAgICAgICAgICAgLy/lhYjlgZzkuIvljp/mnaXmraPlnKjov5vooYznmoTliqjkvZzvvIjlr7zoh7TnorDmkp7nmoTvvIlcbiAgICAgICAgICAgICAgICBfdGhpczIubm9kZS5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIGNjLmxvZygna25vY2sgcnVuIGFuZCBzdGF0dXM6JyArIF90aGlzMi5ydW5fc3RhdHVzICsgJyBzcGVlZDonICsgc3BlZWQgKyAnIGFuZCBhbmdsZTonICsgYW5nbGUpO1xuICAgICAgICAgICAgICAgIC8v5ZCR5Y+m5LiA5Liq5pa55ZCR6L+Q5YqoXG4gICAgICAgICAgICAgICAgLy8gc2VsZi5ydW5fc3RhdHVzPUZpc2hSdW5TdGF0dXMucmFuZG9tO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgaWYgKGltbWVkaWF0ZWx5KSBfdGhpczIubm9kZS5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIF90aGlzMi5ub2RlLnJ1bkFjdGlvbihjYy5zcGF3bihyb3RhdGVUbywgY2Muc2VxdWVuY2UobW92ZVRvLCBmaW5pc2hlZCkpKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8v5YGH6K6+5pqC5pe25Y+q5pyJ5LiA5Liq6Zqc56KN54mpXG4gICAgZmluZFBhdGg6IGZ1bmN0aW9uIGZpbmRQYXRoKHN0YXJ0UG9zLCB0YXJnZXRQb3MsIHBhdGhQb2x5Z29ucywgc3RvbmVQb2x5Z29ucywgcGF0aCkge1xuICAgICAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSBwYXRoID0gW107XG4gICAgICAgIGlmICghY2MuSW50ZXJzZWN0aW9uLmxpbmVQb2x5Z29uKHN0YXJ0UG9zLCB0YXJnZXRQb3MsIHN0b25lUG9seWdvbnMpKSB7XG5cbiAgICAgICAgICAgIHBhdGgudW5zaGlmdChzdGFydFBvcyk7XG4gICAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGVtcFBvbHlnb25zID0gW107XG4gICAgICAgIHZhciB0ZW1wUG9seWdvbnNfID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aFBvbHlnb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoY2MuSW50ZXJzZWN0aW9uLmxpbmVQb2x5Z29uKHN0YXJ0UG9zLCBwYXRoUG9seWdvbnNbaV0sIHN0b25lUG9seWdvbnMpKSB7XG4gICAgICAgICAgICAgICAgdGVtcFBvbHlnb25zLnB1c2gocGF0aFBvbHlnb25zW2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVtcFBvbHlnb25zXy5wdXNoKHBhdGhQb2x5Z29uc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYodGVtcFBvbHlnb25zXy5sZW5ndGg+MSl7XG4gICAgICAgIC8vbGV0IGxlbj1wYXRoLmxlbmd0aDtcbiAgICAgICAgLy8gaWYgKHRlbXBQb2x5Z29uc18ubGVuZ3RoID09PSAwKSB7XG5cbiAgICAgICAgLy8gfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRlbXBQb2x5Z29uc18ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwYXRoID09PSB1bmRlZmluZWQpIHBhdGggPSBbXTtcblxuICAgICAgICAgICAgdmFyIHBhdGhCcmFuY2ggPSB0aGlzLmZpbmRQYXRoKHRlbXBQb2x5Z29uc19baV0sIHRhcmdldFBvcywgdGVtcFBvbHlnb25zLCBzdG9uZVBvbHlnb25zLCBwYXRoW2ldKTtcbiAgICAgICAgICAgIGlmIChwYXRoQnJhbmNoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vY2MubG9nKHBhdGgpO1xuICAgICAgICAgICAgICAgIHBhdGhCcmFuY2ggPSBudWxsO1xuICAgICAgICAgICAgICAgIC8vcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXRoQnJhbmNoWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCBwYXRoQnJhbmNoLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aEJyYW5jaFtuXS5wdXNoKHRhcmdldFBvcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gcGF0aEJyYW5jaDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhCcmFuY2gudW5zaGlmdChzdGFydFBvcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoW2ldID0gcGF0aEJyYW5jaDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9wYXRoLmNvbmNhdChwYXRoLHBhdGhCcmFuY2gpO1xuICAgICAgICAgICAgLy9wYXRoW2xlbiArIGldID0gdGhpcy5maW5kUGF0aF8odGVtcFBvbHlnb25zX1tpXSx0YXJnZXRQb3MsdGVtcFBvbHlnb25zLHN0b25lUG9seWdvbnMscGF0aFtpXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGF0aDtcbiAgICB9LFxuICAgIHNob3J0UGF0aDogZnVuY3Rpb24gc2hvcnRQYXRoKHBhdGhzKSB7XG4gICAgICAgIHZhciBzID0gMDtcbiAgICAgICAgdmFyIG1heERpc3RhbmNlID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBhdGggPSBwYXRoc1tpXTtcbiAgICAgICAgICAgIGlmIChwYXRoID09PSB1bmRlZmluZWQgfHwgcGF0aCA9PT0gbnVsbCkgY29udGludWU7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXRoKSkge1xuICAgICAgICAgICAgICAgIHBhdGgudW5zaGlmdCh0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgaWYgKGNjLnBEaXN0YW5jZShwYXRoc1swXSwgdGhpcy5ub2RlLmdldFBvc2l0aW9uKCkpID09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIHBhdGhzLnVuc2hpZnQodGhpcy5ub2RlLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRocztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgcGF0aC5sZW5ndGggLSAxOyBuKyspIHtcbiAgICAgICAgICAgICAgICBkaXN0YW5jZSArPSBjYy5wRGlzdGFuY2UocGF0aFtuXSwgcGF0aFtuICsgMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgIHMgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcGF0aHNbc10uc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHBhdGhzW3NdO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLnJ1bl9zdGF0dXMgPT09IEZpc2hSdW5TdGF0dXMuY29udHJvbCkge1xuICAgICAgICAgICAgLy/lnKjov5DliqjkuK3nmoTor51cblxuICAgICAgICAgICAgLy8gY2MubG9nKCdjdXJyX3JvdGF0aW9uOicrdGhpcy5ub2RlLnJvdGF0aW9uKycgZW5kX3JvdGF0aW9uOicrdGhpcy5lbmRfcm90YXRpb24rJyB0aGlzLnNwZWVkOicrdGhpcy5zcGVlZCk7XG4gICAgICAgICAgICB0aGlzLm5vZGUucm90YXRpb24gKz0gdGhpcy50dXJuX3NwZWVkICogdGhpcy5jbG9ja3dpc2U7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGUucm90YXRpb24gPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5vZGUucm90YXRpb24gPT09IHRoaXMuZW5kX3JvdGF0aW9uIHx8IHRoaXMubm9kZS5yb3RhdGlvbiAtIDM2MCA9PT0gdGhpcy5lbmRfcm90YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ydW5fc3RhdHVzID0gRmlzaFJ1blN0YXR1cy5zdG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGUucm90YXRpb24gPCAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKDM2MCArIHRoaXMubm9kZS5yb3RhdGlvbiA9PT0gdGhpcy5lbmRfcm90YXRpb24gfHwgdGhpcy5ub2RlLnJvdGF0aW9uICsgMzYwID09PSB0aGlzLmVuZF9yb3RhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bl9zdGF0dXMgPSBGaXNoUnVuU3RhdHVzLnN0b3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubm9kZS5yb3RhdGlvbiA+IDM2MCkgdGhpcy5ub2RlLnJvdGF0aW9uID0gdGhpcy5ub2RlLnJvdGF0aW9uIC0gMzYwO1xuICAgICAgICAgICAgaWYgKHRoaXMubm9kZS5yb3RhdGlvbiA8IC0zNjApIHRoaXMubm9kZS5yb3RhdGlvbiA9IHRoaXMubm9kZS5yb3RhdGlvbiArIDM2MDtcbiAgICAgICAgfVxuICAgICAgICAvLyBjYy5sb2coJ3N0YXR1czonICsgdGhpcy5ydW5fc3RhdHVzKTtcbiAgICAgICAgaWYgKHRoaXMucnVuX3N0YXR1cyAhPSBGaXNoUnVuU3RhdHVzLmNvbnRyb2wpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5tb3ZlRGlyZWN0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5sZWZ0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGUueCAtPSB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5yaWdodDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlLnggKz0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkudXA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZS55ICs9IHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmRvd246XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZS55IC09IHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcy5ub2RlLng9LTQwMDtcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMubm9kZS54KSA+IChjYy53aW5TaXplLndpZHRoIC0gMTAwKSAvIDIpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gKGNjLndpblNpemUud2lkdGggLSAxMDApIC8gMiAqIHRoaXMubm9kZS54IC8gTWF0aC5hYnModGhpcy5ub2RlLngpO1xuICAgICAgICB9XG4gICAgICAgIC8vY2MubG9nKHRoaXMubm9kZS54ICsgXCIgXCIgKyB0aGlzLm5vZGUueCk7XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLm5vZGUueSkgPiAoY2Mud2luU2l6ZS5oZWlnaHQgLSAxMCkgLyAyKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUueSA9IChjYy53aW5TaXplLmhlaWdodCAtIDEwMCkgLyAyICogdGhpcy5ub2RlLnkgLyBNYXRoLmFicyh0aGlzLm5vZGUueSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzM5ZjJiZ09JNVZPRksyS1JCQ1RBMGpiJywgJ0dhbWUnKTtcbi8vIFNjcmlwdFxcR2FtZS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgICAgbHVyZVByZWZhYjogY2MuUHJlZmFiLFxuICAgICAgICBmaXNoUHJlZmFiOiBjYy5QcmVmYWIsXG4gICAgICAgIC8v6ZyA6KaB5Yid5aeL5YyW55qEXG4gICAgICAgIGtub2NrOiBjYy5Ob2RlLFxuICAgICAgICBzY29yZTogY2MuTm9kZSxcbiAgICAgICAgdGltZXI6IGNjLk5vZGUsXG4gICAgICAgIGVhdENvdW50OiBjYy5Ob2RlLFxuICAgICAgICBib2FyZDogY2MuTm9kZSxcbiAgICAgICAgYmlnTHVyZTogY2MuTm9kZSxcbiAgICAgICAgc3RvbmU6IGNjLk5vZGUsXG4gICAgICAgIG1lbnU6IGNjLk5vZGUsXG4gICAgICAgIHN0YWdlU3RyaW5nOiBjYy5Ob2RlLFxuXG4gICAgICAgIHN0YWdlOiAxLFxuICAgICAgICBkaXNwZXJzZURpc3RhbmNlOiAxMDAsXG5cbiAgICAgICAgZmlzaDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBvdGhlckZpc2g6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogW10sXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH1cblxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbWFuYWdlciA9IGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKTtcbiAgICAgICAgbWFuYWdlci5lbmFibGVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmtub2NrLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmtub2NrQW5pbWF0aW9uID0gdGhpcy5rbm9jay5nZXRDb21wb25lbnQoY2MuQW5pbWF0aW9uKTtcblxuICAgICAgICB0aGlzLnNjb3JlTGFiZWwgPSB0aGlzLnNjb3JlLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHRoaXMuc2NvcmVTY3JpcHQgPSB0aGlzLnNjb3JlLmdldENvbXBvbmVudCgnU2NvcmUnKTtcbiAgICAgICAgLy/lj5bliLDlhbPljaHorr7orqHmlofku7YtLeaUvuWIsGxvYWRpbmfkuK1cbiAgICAgICAgLy9jYy5sb2FkZXIubG9hZFJlcygnc3RhZ2VzLmpzb24nLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBjYy5maW5kKCdsb2FkaW5nJykuZ2V0Q29tcG9uZW50KCdMb2FkaW5nJykuc3RhZ2VzRGF0YTtcbiAgICAgICAgc2VsZi5tZW51LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHNlbGYubWVudS5nZXRDb21wb25lbnQoJ01lbnUnKS5pbml0KGRhdGEpO1xuICAgICAgICBzZWxmLnN0YWdlc0RhdGEgPSBkYXRhO1xuICAgICAgICAvL3NlbGYuYmlnTHVyZS5nZXRDb21wb25lbnQoJ0JpZ2x1cmUnKS5pbml0KCk7Ly9kYXRhXG5cbiAgICAgICAgLy99KTtcblxuICAgICAgICAvL2NjLmxvZygndGVtcDonK2NjLkludGVyc2VjdGlvbi5saW5lUG9seWdvbihjYy5wKDAsMCksY2MucCgxLDEpLFtjYy5wKDAsMCksY2MucCgwLDEpLGNjLnAoMSwxKSxjYy5wKDEsMCldICkpXG5cbiAgICAgICAgLy/kuI3pnIDopoHorr7lrprnmoTlj5jph49cbiAgICAgICAgdGhpcy5sdXJlcyA9IFtdO1xuXG4gICAgICAgIC8vIGNjLmxvZygnbGVuZ3RoOicrdGhpcy5sdXJlcy5sZW5ndGgpO1xuICAgICAgICAvLyBsZXQgcmVzdWx0PXNlbGYuZmluZFBhdGhfKGNjLnAoMTIsOSksIGNjLnAoMTMsOSksIFtjYy5wKDcsMTEpLGNjLnAoMTEsMTEpLGNjLnAoMTAuNSwxMC41KSxjYy5wKDEwLDkpLGNjLnAoMTEsNyksY2MucCg3LDcpXSwgW2NjLnAoOCwxMCksY2MucCgxMCwxMCksY2MucCg5LDkpLGNjLnAoMTAsOCksY2MucCg4LDgpXSwgW10pO1xuICAgICAgICAvLyBjYy5sb2cocmVzdWx0KTtcblxuICAgICAgICAvL+WkhOeQhuS4iuaKpeeahOWQhOenjeS6i+S7tu+8jOS9nOS4uumbhuS4reiwg+W6puWkhOeQhlxuXG4gICAgICAgIHRoaXMubm9kZS5vbignbHVyZV9vdmVyJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBjYy5sb2coZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKCdsdXJlX2VhdGVkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLnNjb3JlU2NyaXB0LmVhdCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKCd0aHJvd19sdXJlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgeCA9IGV2ZW50LmdldFVzZXJEYXRhKCk7XG4gICAgICAgICAgICBzZWxmLnRocm93X2x1cmUoeCk7XG4gICAgICAgICAgICAvL+aYr+WcqOi/memHjOWRiuiviemxvOimgeWQg++8jOi/mOaYr+aUvuWIsOmxvOeahOiHquS4u0FJ5Lit77yM6K6p6bG85Y+R546w5pyJ6aW1XG4gICAgICAgICAgICAvL+S5n+WwseaYr+acieaWsOeahOmlteaYr+S4gOS4quS6i+S7tu+8jOinpuWPkeS6humxvOeahOaAneiAg1xuICAgICAgICAgICAgc2VsZi53YW50RWF0VGhpbmsoKTtcbiAgICAgICAgICAgIC8vIHNlbGYuZmlzaFNjcmlwdC53YW50RWF0VGhpbmsoc2VsZi5sdXJlcyk7XG5cbiAgICAgICAgICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5vdGhlckZpc2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIC8vICAgICBzZWxmLm90aGVyRmlzaFtpXS5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS53YW50RWF0VGhpbmsoc2VsZi5sdXJlcyk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvL3NlbGYubHVyZXMucHVzaChsdXJlKTtcbiAgICAgICAgICAgIC8v5LuA5LmI5pe25YCZ5pS+5Zue5Yiw5rGg5Lit5ZGi77yfXG5cbiAgICAgICAgICAgIC8v6L+Z6YeM6KaB6YCa55+l6bG877yM6L+Z6YeM5pyJ6aW177yM5pyJ5aSa5Liq6aW15oCO5LmI5Yqe77yM6KaB6K6w5b2V5omA5pyJ6aW177yM5LiU6aW15Lya5Y+Y5YyWXG4gICAgICAgICAgICAvL+WPpuacieWkmuS4qumxvOeahOaDheWGtVxuICAgICAgICAgICAgLy8gc2VsZi5maXNoU2NyaXB0Lmx1cmUgPSBsdXJlO1xuICAgICAgICAgICAgLy8gc2VsZi5maXNoU2NyaXB0LmVhdEFjdGlvbigpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKCdsdXJlX2Rlc3Ryb3knLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIC8vY2MubG9nKCdldmVudC5kZXRhaWwudXVpZDonICsgZXZlbnQuZGV0YWlsLnV1aWQpO1xuICAgICAgICAgICAgLy9jYy5sb2coc2VsZi5sdXJlcyk7XG5cbiAgICAgICAgICAgIC8v6L+Z5Liq6aW16KKr5ZCD5LqG77yM6K6p6bG85om+5LiL5LiA5Liq77yM5pqC5pe25rKh5pyJ5pyA6L+R55qE6YC76L6RXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYubHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5sdXJlc1tpXS51dWlkID09IGV2ZW50LmRldGFpbC51dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubHVyZXNbaV0uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmx1cmVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYy5sb2coJ25vdyB0aGVyZSBhcmUgJyArIHNlbGYubHVyZXMubGVuZ3RoICsgJyBsdXJlcycpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy/ml7bpl7TliLBcbiAgICAgICAgdGhpcy5ub2RlLm9uKCd0aW1lX3VwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLmJvYXJkLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLmJvYXJkLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICAgICAgY2MubG9nKCdzZWxmLnN0YWdlOicgKyBzZWxmLnN0YWdlICsgJyBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50OicgKyBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50KTtcbiAgICAgICAgICAgIHNlbGYuYm9hcmQuZ2V0Q29tcG9uZW50KCdCb2FyZCcpLmluaXQoe1xuICAgICAgICAgICAgICAgIHN0YWdlOiBzZWxmLnN0YWdlLFxuICAgICAgICAgICAgICAgIHNjb3JlOiBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8v5riF55CG5Zy65pmvXG4gICAgICAgICAgICBzZWxmLnVuc2NoZWR1bGVBbGxDYWxsYmFja3MoKTsgLy/lgZzmraLmipXmlL5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5vdGhlckZpc2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpc2hQb29sLnB1dChzZWxmLm90aGVyRmlzaFtpXSk7XG4gICAgICAgICAgICAgICAgLy9zZWxmLm90aGVyRmlzaFtpXS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vc2VsZi5maXNoUG9vbC5wdXQoc2VsZi5maXNoKTtcbiAgICAgICAgICAgIHNlbGYuZmlzaC5kZXN0cm95KCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5sdXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHNlbGYubHVyZXNbaV0uZGVzdHJveSgpOyAvL3B1dChzZWxmLmx1cmVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYubHVyZXMgPSBbXTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIOmAieaLqeWFs+WNoeS6hlxuICAgICAgICB0aGlzLm5vZGUub24oJ3NlbGVjdF9zdGFnZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgc2VsZi5tZW51LmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxmLmVudGVyU3RhZ2UoKTtcbiAgICAgICAgICAgIHNlbGYuZmlzaFNjcmlwdCA9IHNlbGYuZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKTtcbiAgICAgICAgICAgIHNlbGYucmFuZG9tTHVyZXMoc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5jb3VudCwgc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5pbnRlcnZhbCk7XG4gICAgICAgICAgICAvL3NlbGYucmFuZG9tTHVyZXMoNSwgMTApO1xuXG4gICAgICAgICAgICAvL+mHjee9ruiuoeaXtuWZqFxuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykudG90YWx0aW1lID0gc2VsZi5zdGFnZURhdGEudGltZXI7XG4gICAgICAgICAgICBzZWxmLnRpbWVyLmdldENvbXBvbmVudCgnVGltZXInKS5pc0dyb3dVcCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykuaW5pdChzZWxmLnN0YWdlRGF0YS50aW1lcik7XG4gICAgICAgICAgICAvL+mHjee9ruWIhuaVsFxuICAgICAgICAgICAgc2VsZi5lYXRDb3VudC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IDA7XG4gICAgICAgICAgICBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50ID0gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIC8v5LiL5LiA5YWzXG4gICAgICAgIHRoaXMubm9kZS5vbignbmV4dF9zdGFnZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgc2VsZi5zdGFnZSsrO1xuICAgICAgICAgICAgc2VsZi5lbnRlclN0YWdlKCk7XG4gICAgICAgICAgICBzZWxmLmZpc2hTY3JpcHQgPSBzZWxmLmZpc2guZ2V0Q29tcG9uZW50KCdDb250cm9sJyk7XG4gICAgICAgICAgICBzZWxmLnJhbmRvbUx1cmVzKHNlbGYuc3RhZ2VEYXRhLnRocm93X2x1cmUuY291bnQsIHNlbGYuc3RhZ2VEYXRhLnRocm93X2x1cmUuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgLy9zZWxmLnJhbmRvbUx1cmVzKDUsIDEwKTtcblxuICAgICAgICAgICAgLy/ph43nva7orqHml7blmahcbiAgICAgICAgICAgIHNlbGYudGltZXIuZ2V0Q29tcG9uZW50KCdUaW1lcicpLnRvdGFsdGltZSA9IHNlbGYuc3RhZ2VEYXRhLnRpbWVyO1xuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykuaXNHcm93VXAgPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYudGltZXIuZ2V0Q29tcG9uZW50KCdUaW1lcicpLmluaXQoc2VsZi5zdGFnZURhdGEudGltZXIpO1xuICAgICAgICAgICAgLy/ph43nva7liIbmlbBcbiAgICAgICAgICAgIHNlbGYuZWF0Q291bnQuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSAwO1xuICAgICAgICAgICAgc2VsZi5zY29yZVNjcmlwdC5lYXRDb3VudCA9IDA7XG4gICAgICAgIH0pO1xuICAgICAgICAvL+ebruW9lVxuICAgICAgICB0aGlzLm5vZGUub24oJ21lbnUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYubWVudS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5tZW51LmdldENvbXBvbmVudCgnTWVudScpLmluaXQoc2VsZi5zdGFnZXNEYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vcmVsb2FkXG4gICAgICAgIHRoaXMubm9kZS5vbigncmVsb2FkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLmVudGVyU3RhZ2UoKTtcbiAgICAgICAgICAgIHNlbGYuZmlzaFNjcmlwdCA9IHNlbGYuZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKTtcbiAgICAgICAgICAgIHNlbGYucmFuZG9tTHVyZXMoc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5jb3VudCwgc2VsZi5zdGFnZURhdGEudGhyb3dfbHVyZS5pbnRlcnZhbCk7XG4gICAgICAgICAgICAvL3NlbGYucmFuZG9tTHVyZXMoNSwgMTApO1xuXG4gICAgICAgICAgICAvL+mHjee9ruiuoeaXtuWZqFxuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykudG90YWx0aW1lID0gc2VsZi5zdGFnZURhdGEudGltZXI7XG4gICAgICAgICAgICBzZWxmLnRpbWVyLmdldENvbXBvbmVudCgnVGltZXInKS5pc0dyb3dVcCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi50aW1lci5nZXRDb21wb25lbnQoJ1RpbWVyJykuaW5pdChzZWxmLnN0YWdlRGF0YS50aW1lcik7XG4gICAgICAgICAgICAvL+mHjee9ruWIhuaVsFxuICAgICAgICAgICAgc2VsZi5lYXRDb3VudC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IDA7XG4gICAgICAgICAgICBzZWxmLnNjb3JlU2NyaXB0LmVhdENvdW50ID0gMDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy/kuKTkuKrlr7nlg4/msaDvvIzkuI3kuIDlrppcbiAgICAgICAgdGhpcy5sdXJlUG9vbCA9IG5ldyBjYy5Ob2RlUG9vbCgpO1xuICAgICAgICB0aGlzLmZpc2hQb29sID0gbmV3IGNjLk5vZGVQb29sKCk7XG4gICAgICAgIC8vIHRoaXMuZW50ZXJTdGFnZSgpO1xuICAgICAgICAvLyB0aGlzLnJhbmRvbUx1cmVzKDUsIDEwKTtcbiAgICAgICAgLy90aGlzLmZpc2hTY3JpcHQgPSB0aGlzLmZpc2guZ2V0Q29tcG9uZW50KCdDb250cm9sJyk7XG5cbiAgICAgICAgLy8gY2MucmVuZGVyZXJDYW52YXMuZW5hYmxlRGlydHlSZWdpb24oZmFsc2UpO1xuICAgICAgICAvLyBjYy5yZW5kZXJlcldlYkdMXG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgLy8gZXZlbnQudG91Y2hcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBldmVudC5nZXRDdXJyZW50VGFyZ2V0KCk7XG4gICAgICAgICAgICB2YXIgcG9zID0gdGFyZ2V0LmNvbnZlcnRUb05vZGVTcGFjZUFSKGV2ZW50LmdldExvY2F0aW9uKCkpO1xuICAgICAgICAgICAgY2MubG9nKCd0b3VjaFg6JyArIHBvcy54KTtcbiAgICAgICAgICAgIGlmIChldmVudC5nZXRMb2NhdGlvbigpLnggPCA1MCB8fCBldmVudC5nZXRMb2NhdGlvbi54ID4gY2Mud2luU2l6ZS53aWR0aCAtIDUwKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8v5pWy6YOo5YiGXG4gICAgICAgICAgICBzZWxmLmtub2NrLnggPSBwb3MueDtcbiAgICAgICAgICAgIHNlbGYua25vY2sueSA9IHBvcy55O1xuICAgICAgICAgICAgc2VsZi5rbm9jay5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5rbm9ja0FuaW1hdGlvbi5wbGF5KCk7XG5cbiAgICAgICAgICAgIHNlbGYuZGlzcGVyc2VGaXNoKHBvcyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy/pqbHmlaNcbiAgICBkaXNwZXJzZUZpc2g6IGZ1bmN0aW9uIGRpc3BlcnNlRmlzaChwb3MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm90aGVyRmlzaC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIF9kaXN0YW5jZSA9IGNjLnBEaXN0YW5jZShwb3MsIHRoaXMub3RoZXJGaXNoW2ldLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgaWYgKF9kaXN0YW5jZSA8IHRoaXMuZGlzcGVyc2VEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3RoZXJGaXNoW2ldLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vdGhlckZpc2hbaV0uZ2V0Q29tcG9uZW50KCdDb250cm9sJykuc3RyYXRlZ3lSdW4ocG9zLCAwLjMsIDAuMywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgY2MubG9nKCdkaXNwZXJzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IGNjLnBEaXN0YW5jZShwb3MsIHRoaXMuZmlzaC5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgdGhpcy5kaXNwZXJzZURpc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLmZpc2guc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS5zdHJhdGVneVJ1bihwb3MsIDAuMywgMC4zLCB0cnVlKTtcbiAgICAgICAgICAgIGNjLmxvZygnZGlzcGVyc2UnKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgd2FudEVhdFRoaW5rOiBmdW5jdGlvbiB3YW50RWF0VGhpbmsoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5maXNoU2NyaXB0LndhbnRFYXRUaGluayhzZWxmLmx1cmVzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLm90aGVyRmlzaC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5vdGhlckZpc2hbaV0uZ2V0Q29tcG9uZW50KCdDb250cm9sJykud2FudEVhdFRoaW5rKHNlbGYubHVyZXMpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByYW5kb21MdXJlczogZnVuY3Rpb24gcmFuZG9tTHVyZXMoY291bnQsIGludGVydmFsKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBmb3IgKHZhciBuID0gMDsgbiA8IFRoaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gICAgIFRoaW5nc1tpXVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgdmFyIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyA1MCArIChjYy53aW5TaXplLndpZHRoIC0gMTAwKSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICBzZWxmLnRocm93X2x1cmUoeCk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi53YW50RWF0VGhpbmsoKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBzZWxmLnJhbmRvbUx1cmVzKCk7XG4gICAgICAgICAgICAvLyDov5nph4znmoQgdGhpcyDmjIflkJEgY29tcG9uZW50XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgKHZhciBuID0gMDsgbiA8IFRoaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vICAgICBUaGluZ3NbaV1cbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgdmFyIHggPSAtY2Mud2luU2l6ZS53aWR0aCAvIDIgKyA1MCArIChjYy53aW5TaXplLndpZHRoIC0gMTAwKSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgc2VsZi50aHJvd19sdXJlKHgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLndhbnRFYXRUaGluaygpO1xuICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgfSxcblxuICAgIGVudGVyU3RhZ2U6IGZ1bmN0aW9uIGVudGVyU3RhZ2UoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy/ku47kuIDkuKrmlofku7bkuK3lj5blvpfvvJpcbiAgICAgICAgLy8xLuWFtuWug+mxvOeahOaVsOmHj1xuICAgICAgICAvLzIu6Zqc56KN55qE5L2N572u44CB5pWw6YePXG4gICAgICAgIC8vMy7psbznmoTlj5jph49cbiAgICAgICAgLy80LuWkp+mlteeahOWPmOmHj1xuICAgICAgICAvLzUu56ys5Yeg5YWzXG4gICAgICAgIC8vVE9ETyDlkIjlubbmiYDmnInpsbzkuLrkuIDnp41cbiAgICAgICAgc2VsZi5zdGFnZVN0cmluZy5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IFwi56ysXCIgKyBzZWxmLnN0YWdlICsgXCLlhbNcIjtcbiAgICAgICAgaWYgKHNlbGYuc3RhZ2VEYXRhICYmIHNlbGYuc3RhZ2VEYXRhLnN0YWdlID09PSBzZWxmLnN0YWdlKSB7fSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5zdGFnZXNEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuc3RhZ2VzRGF0YVtpXS5zdGFnZSA9PT0gc2VsZi5zdGFnZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YWdlRGF0YSA9IHNlbGYuc3RhZ2VzRGF0YVtpXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxmLnN0YWdlRGF0YS5zdG9uZSkge1xuICAgICAgICAgICAgc2VsZi5zdG9uZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5zdG9uZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZi5zdGFnZURhdGEuYmlnTHVyZSkge1xuICAgICAgICAgICAgc2VsZi5iaWdMdXJlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmJpZ0x1cmUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLnN0YWdlRGF0YS5maXNoLmZhdm9yaXRlID0gZmFsc2U7XG4gICAgICAgIHZhciBvdGhlckZpc2hDb3VudCA9IHNlbGYuc3RhZ2VEYXRhLm90aGVyRmlzaENvdW50O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3RoZXJGaXNoQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgdmFyIG90aGVyRmlzaCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoc2VsZi5maXNoUG9vbC5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8g6YCa6L+HIHNpemUg5o6l5Y+j5Yik5pat5a+56LGh5rGg5Lit5piv5ZCm5pyJ56m66Zey55qE5a+56LGhXG4gICAgICAgICAgICAgICAgb3RoZXJGaXNoID0gc2VsZi5maXNoUG9vbC5nZXQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5rKh5pyJ56m66Zey5a+56LGh77yM5Lmf5bCx5piv5a+56LGh5rGg5Lit5aSH55So5a+56LGh5LiN5aSf5pe277yM5oiR5Lus5bCx55SoIGNjLmluc3RhbnRpYXRlIOmHjeaWsOWIm+W7ulxuICAgICAgICAgICAgICAgIG90aGVyRmlzaCA9IGNjLmluc3RhbnRpYXRlKHNlbGYuZmlzaFByZWZhYik7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5sdXJlUG9vbC5wdXQobHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYy5sb2coJ2NyZWF0ZSBvdGhlckZpc2g6JyArIG90aGVyRmlzaC51dWlkKTtcbiAgICAgICAgICAgIHZhciBfcG9zID0gdGhpcy5nZXRSYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICAgICAgb3RoZXJGaXNoLnNldFBvc2l0aW9uKF9wb3MpO1xuXG4gICAgICAgICAgICBvdGhlckZpc2guZ2V0Q29tcG9uZW50KCdDb250cm9sJykuaW5pdChzZWxmLnN0YWdlRGF0YS5maXNoKTtcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICBmYXZvcml0ZTogZmFsc2UsXG4gICAgICAgICAgICAvLyAgICAgbWF4X3NlZWQ6IDE1XG4gICAgICAgICAgICAvLyB9KTsgLy9UT0RPIOS7peWQjue7meS4gOS6m+WPguaVsFxuXG4gICAgICAgICAgICBvdGhlckZpc2gucGFyZW50ID0gc2VsZi5ub2RlOyAvLyDlsIbnlJ/miJDnmoTmlYzkurrliqDlhaXoioLngrnmoJFcblxuICAgICAgICAgICAgc2VsZi5vdGhlckZpc2gucHVzaChvdGhlckZpc2gpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuc3RhZ2VEYXRhLmZpc2guZmF2b3JpdGUgPSB0cnVlO1xuICAgICAgICB2YXIgZmlzaCA9IGNjLmluc3RhbnRpYXRlKHNlbGYuZmlzaFByZWZhYik7XG4gICAgICAgIGNjLmxvZygnY3JlYXRlIGZhdm9yaXRlIGZpc2ggOicgKyBmaXNoLnV1aWQpO1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5nZXRSYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICBmaXNoLnNldFBvc2l0aW9uKHBvcyk7XG5cbiAgICAgICAgZmlzaC5nZXRDb21wb25lbnQoJ0NvbnRyb2wnKS5pbml0KHNlbGYuc3RhZ2VEYXRhLmZpc2gpO1xuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICBmYXZvcml0ZTogdHJ1ZSxcbiAgICAgICAgLy8gICAgIG1heF9zZWVkOiAxNVxuICAgICAgICAvLyB9KTsgLy9UT0RPIOS7peWQjue7meS4gOS6m+WPguaVsFxuICAgICAgICBmaXNoLnBhcmVudCA9IHNlbGYubm9kZTsgLy8g5bCG55Sf5oiQ55qE5pWM5Lq65Yqg5YWl6IqC54K55qCRXG5cbiAgICAgICAgc2VsZi5maXNoID0gZmlzaDtcbiAgICB9LFxuICAgIGdldFJhbmRvbVBvc2l0aW9uOiBmdW5jdGlvbiBnZXRSYW5kb21Qb3NpdGlvbigpIHtcbiAgICAgICAgdmFyIHkgPSAtY2Mud2luU2l6ZS5oZWlnaHQgLyAyICsgKGNjLndpblNpemUuaGVpZ2h0IC0gMTAwKSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHZhciB4ID0gLWNjLndpblNpemUud2lkdGggLyAyICsgY2Mud2luU2l6ZS53aWR0aCAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHJldHVybiBjYy5wKHgsIHkpO1xuICAgIH0sXG5cbiAgICB0aHJvd19sdXJlOiBmdW5jdGlvbiB0aHJvd19sdXJlKHgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL+eCueWHu+WQjueUn+aIkOmltVxuICAgICAgICB2YXIgbHVyZSA9IG51bGw7XG4gICAgICAgIGlmIChzZWxmLmx1cmVQb29sLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgIC8vIOmAmui/hyBzaXplIOaOpeWPo+WIpOaWreWvueixoeaxoOS4reaYr+WQpuacieepuumXsueahOWvueixoVxuICAgICAgICAgICAgbHVyZSA9IHNlbGYubHVyZVBvb2wuZ2V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInnqbrpl7Llr7nosaHvvIzkuZ/lsLHmmK/lr7nosaHmsaDkuK3lpIfnlKjlr7nosaHkuI3lpJ/ml7bvvIzmiJHku6zlsLHnlKggY2MuaW5zdGFudGlhdGUg6YeN5paw5Yib5bu6XG4gICAgICAgICAgICBsdXJlID0gY2MuaW5zdGFudGlhdGUoc2VsZi5sdXJlUHJlZmFiKTtcbiAgICAgICAgICAgIC8vIHNlbGYubHVyZVBvb2wucHV0KGx1cmUpO1xuICAgICAgICB9XG4gICAgICAgIGNjLmxvZygndGhyb3dfbHVyZScgKyBsdXJlKTtcbiAgICAgICAgbHVyZS55ID0gY2Mud2luU2l6ZS5oZWlnaHQgLyAyIC0gMTAwO1xuXG4gICAgICAgIGx1cmUuZ2V0Q29tcG9uZW50KCdsdXJlJykuaW5pdCh4KTsgLy/mjqXkuIvmnaXlsLHlj6/ku6XosIPnlKggZW5lbXkg6Lqr5LiK55qE6ISa5pys6L+b6KGM5Yid5aeL5YyWXG4gICAgICAgIGx1cmUucGFyZW50ID0gc2VsZi5ub2RlOyAvLyDlsIbnlJ/miJDnmoTmlYzkurrliqDlhaXoioLngrnmoJFcblxuICAgICAgICBzZWxmLmx1cmVzLnB1c2gobHVyZSk7XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc2OTgxZGpYV25aSXlyWTZ2TC9VeUFCNScsICdLbm9jaycpO1xuLy8gU2NyaXB0XFxLbm9jay5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG5cbiAgICBkZXN0b3J5OiBmdW5jdGlvbiBkZXN0b3J5KCkge1xuICAgICAgICBjYy5sb2coJ2tub2NrIGNvbXBsZXRlZCcpO1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnMTdjYWRIdjRGUk5VWmlhL2lpMDM5Y3onLCAnTG9hZGluZycpO1xuLy8gU2NyaXB0XFxMb2FkaW5nLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbGFiZWw6IGNjLk5vZGUsXG4gICAgICAgIGZpc2g6IGNjLk5vZGVcbiAgICB9LFxuXG4gICAgLy9pbnRlcnZhbDogMFxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICAvLyB0aGlzLmRvdENvdW50ID0gMDtcbiAgICAgICAgLy8gdGhpcy5kb3RNYXhDb3VudCA9IDM7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5sYWJlbC5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgc2VsZi5sb2FkU2NlbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIHN0YXJ0TG9hZGluZzogZnVuY3Rpb24gc3RhcnRMb2FkaW5nKCkge1xuICAgICAgICB0aGlzLmxhYmVsLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgLy90aGlzLmRvdENvdW50ID0gMDtcbiAgICAgICAgdmFyIHNpemUgPSBjYy52aWV3LmdldFZpc2libGVTaXplKCk7XG4gICAgICAgIHRoaXMubm9kZS5zZXRQb3NpdGlvbihjYy5wKHNpemUud2lkdGggLyAyIC0gdGhpcy5ub2RlLndpZHRoIC8gMiwgc2l6ZS5oZWlnaHQgLyA0KSk7XG4gICAgICAgIHRoaXMuZmlzaC5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgLy8gdGhpcy5zY2hlZHVsZSh0aGlzLnVwZGF0ZUxhYmVsLCB0aGlzLmludGVydmFsLCB0aGlzKTsgICAgICBcbiAgICB9LFxuXG4gICAgc3RvcExvYWRpbmc6IGZ1bmN0aW9uIHN0b3BMb2FkaW5nKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCl7XG4gICAgICAgIHNlbGYubGFiZWwuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIC8vfSwzKTtcblxuICAgICAgICBjYy5sb2coJ3N0b3AgbG9hZGluZycpO1xuICAgICAgICAvLyB0aGlzLnVuc2NoZWR1bGUodGhpcy51cGRhdGVMYWJlbCk7XG4gICAgICAgIC8vIHRoaXMubm9kZS5zZXRQb3NpdGlvbihjYy5wKDIwMDAsIDIwMDApKTtcbiAgICB9XG5cbn0pO1xuLy8gdXBkYXRlTGFiZWwgKCkge1xuLy8gICAgIGxldCBkb3RzID0gJy4nLnJlcGVhdCh0aGlzLmRvdENvdW50KTtcbi8vICAgICB0aGlzLmxhYmVsLnN0cmluZyA9ICdMb2FkaW5nJyArIGRvdHM7XG4vLyAgICAgdGhpcy5kb3RDb3VudCArPSAxO1xuLy8gICAgIGlmICh0aGlzLmRvdENvdW50ID4gdGhpcy5kb3RNYXhDb3VudCkge1xuLy8gICAgICAgICB0aGlzLmRvdENvdW50ID0gMDtcbi8vICAgICB9XG4vLyB9XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdhZTM3NURqaGJ0TU43SURTeTVHV2xvNycsICdNZW51Jyk7XG4vLyBTY3JpcHRcXE1lbnUuanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgICAgICBzdGFnZVByZWZhYjogY2MuUHJlZmFiLFxuICAgICAgICBtZW51TGF5b3V0OiBjYy5Ob2RlXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdChzdGFnZXMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5tZW51TGF5b3V0LnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc3RhZ2VNZW51ID0gY2MuaW5zdGFudGlhdGUoc2VsZi5zdGFnZVByZWZhYik7XG4gICAgICAgICAgICB2YXIgc3RhZ2VNZW51U2NyaXB0ID0gc3RhZ2VNZW51LmdldENvbXBvbmVudCgnU3RhZ2VNZW51Jyk7XG4gICAgICAgICAgICBzdGFnZU1lbnVTY3JpcHQuaW5pdChzdGFnZXNbaV0pO1xuICAgICAgICAgICAgc2VsZi5tZW51TGF5b3V0LmFkZENoaWxkKHN0YWdlTWVudSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub2RlLnNldFBvc2l0aW9uKDAsIDApO1xuICAgIH1cblxufSk7XG4vLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuLy8gfSxcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzUxMjA1ZjFBZlZHQXIreS9zWGtxOWloJywgJ1NjZW5lTWFuYWdlcicpO1xuLy8gU2NyaXB0XFxTY2VuZU1hbmFnZXIuanNcblxudmFyIExvYWRpbmcgPSByZXF1aXJlKCdMb2FkaW5nJyk7XG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbG9hZGluZzogTG9hZGluZ1xuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL+WcqHdlYkdM5LiL5pyJ6Zeu6aKYXG4gICAgICAgIC8vY2Mudmlldy5lbmFibGVBbnRpQWxpYXMoZmFsc2UpO1xuICAgICAgICBjYy5nYW1lLmFkZFBlcnNpc3RSb290Tm9kZSh0aGlzLm5vZGUpO1xuICAgICAgICAvLyB0aGlzLmxvYWRpbmcuc3RhcnRMb2FkaW5nKCk7XG4gICAgICAgIHRoaXMubG9hZFNjZW5lKCdtYWluJyk7XG4gICAgICAgIHRoaXMubG9hZGluZy5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoc2VsZi5jdXJMb2FkaW5nU2NlbmUpO1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxuICAgIGxvYWRTY2VuZTogZnVuY3Rpb24gbG9hZFNjZW5lKHNjZW5lTmFtZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMubG9hZGluZy5zdGFydExvYWRpbmcoKTtcbiAgICAgICAgdGhpcy5jdXJMb2FkaW5nU2NlbmUgPSBzY2VuZU5hbWU7XG4gICAgICAgIC8vdGhpcy5vblNjZW5lTG9hZGVkLmJpbmQodGhpcyk7XG4gICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKCdzdGFnZXMuanNvbicsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYubG9hZGluZy5zdGFnZXNEYXRhID0gZGF0YTtcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLnByZWxvYWRTY2VuZShzY2VuZU5hbWUsIHNlbGYub25TY2VuZUxvYWRlZC5iaW5kKHNlbGYpKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uU2NlbmVMb2FkZWQ6IGZ1bmN0aW9uIG9uU2NlbmVMb2FkZWQoZXZlbnQpIHtcbiAgICAgICAgY2MubG9nKHRoaXMpO1xuICAgICAgICB0aGlzLmxvYWRpbmcuc3RvcExvYWRpbmcoKTtcblxuICAgICAgICAvLyBjYy5kaXJlY3Rvci5sb2FkU2NlbmUodGhpcy5jdXJMb2FkaW5nU2NlbmUpO1xuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNmNhNTdzVzltRkNSNnhsQjVMR3B0dXUnLCAnU2NvcmUnKTtcbi8vIFNjcmlwdFxcU2NvcmUuanNcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgICAgIHRvdGFsQ291bnQ6IDAsXG4gICAgICAgIGVhdENvdW50OiAwXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB0aGlzLmxhYmVsID0gdGhpcy5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgIH0sXG4gICAgZWF0OiBmdW5jdGlvbiBlYXQoKSB7XG4gICAgICAgIHRoaXMuZWF0Q291bnQrKztcbiAgICAgICAgdGhpcy5sYWJlbC5zdHJpbmcgPSB0aGlzLmVhdENvdW50O1xuICAgIH1cblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAgIC8vIH0sXG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2VhYWNlVHFta0JDMUszcEorVWdrTFAzJywgJ1N0YWdlTWVudScpO1xuLy8gU2NyaXB0XFxTdGFnZU1lbnUuanNcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgICAgIHN0YXIxOiBjYy5Ob2RlLFxuICAgICAgICBzdGFyMjogY2MuTm9kZSxcbiAgICAgICAgc3RhcjM6IGNjLk5vZGUsXG4gICAgICAgIGxvY2s6IGNjLk5vZGUsXG4gICAgICAgIHN0YWdlU3RyaW5nOiBjYy5Ob2RlXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdChzdGFnZURhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLnN0YWdlID0gc3RhZ2VEYXRhLnN0YWdlO1xuICAgICAgICB0aGlzLnN0YWdlU3RyaW5nLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gXCLnrKxcIiArIHRoaXMuc3RhZ2UgKyBcIuWFs1wiO1xuICAgICAgICB2YXIgc3RhZ2VTdG9yYWdlID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzdGFnZScgKyB0aGlzLnN0YWdlKTtcbiAgICAgICAgaWYgKHN0YWdlU3RvcmFnZSkge1xuICAgICAgICAgICAgdmFyIHNjb3JlID0gSlNPTi5wYXJzZShzdGFnZVN0b3JhZ2UpLmJlc3RTY29yZTtcbiAgICAgICAgICAgIGlmIChzY29yZSA+PSBzdGFnZURhdGEuc3RhcjEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXIxLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXIxLmNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNjb3JlID49IHN0YWdlRGF0YS5zdGFyMikge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcjIuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcjIuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2NvcmUgPj0gc3RhZ2VEYXRhLnN0YXIzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFyMy5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFyMy5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubG9jay5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcjEuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICAgICAgICB0aGlzLnN0YXIyLmNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDApO1xuICAgICAgICAgICAgdGhpcy5zdGFyMy5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcjEuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN0YXIyLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zdGFyMy5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubG9jay5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYuc3RhZ2UgPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMubG9jay5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3RhcjEuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3RhcjIuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3RhcjMuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5sb2NrLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHZhciBzZWxlY3RfZXZlbnQgPSBuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oJ3NlbGVjdF9zdGFnZScsIHRydWUpO1xuICAgICAgICAgICAgICAgIC8v5oqK6YCJ5Lit55qE5YWz5pS+5Ye65Y67XG4gICAgICAgICAgICAgICAgc2VsZWN0X2V2ZW50LnNldFVzZXJEYXRhKHNlbGYuc3RhZ2UpO1xuICAgICAgICAgICAgICAgIHNlbGYubm9kZS5kaXNwYXRjaEV2ZW50KHNlbGVjdF9ldmVudCk7XG4gICAgICAgICAgICAgICAgLy9zZWxmLm5vZGUuYWN0aXZlPWZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNWFmMjlnQmhIdExGNWdZYVBHRk1ZQzUnLCAnU3RvbmUnKTtcbi8vIFNjcmlwdFxcU3RvbmUuanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHt9LFxuICAgIG9uQ29sbGlzaW9uRW50ZXI6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uRW50ZXIob3RoZXIsIHNlbGYpIHtcbiAgICAgICAgY2MubG9nKCdzb21ldGhpbmcga25vY2sgc3RvbmUnICsgb3RoZXIubm9kZS5ncm91cCk7XG4gICAgICAgIGlmIChvdGhlci5ub2RlLmdyb3VwID09PSAnZmlzaEcnKSB7XG4gICAgICAgICAgICAvL+eisOWIsOmxvFxuICAgICAgICAgICAgLy/psbzopoHmlLnlj5jooYzliqjot6/nur9cblxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAgIC8vIH0sXG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzVkZGYwS1hiOEZMZElNOGZkZnM0OEMxJywgJ1RpbWVyJyk7XG4vLyBTY3JpcHRcXFRpbWVyLmpzXG5cbi8v5Y+v5LiN5Y+v5Lul5YGa5oiQ5YWs5YWx55qEXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgICAgIC8vIOWinuWKoOi/mOaYr+WHj+WwkVxuICAgICAgICBpc0dyb3dVcDogdHJ1ZSxcbiAgICAgICAgLy8g5piv5ZCm5piv5pe25YiG56eSXG4gICAgICAgIGlzQ2xvY2s6IHRydWUsXG5cbiAgICAgICAgdG90YWx0aW1lOiAyMCxcblxuICAgICAgICBpbml0VGltZTogMFxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5sYWJlbCA9IHRoaXMuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgLy90aGlzLmluaXQoKTtcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoaW5pdFRpbWUpIHtcbiAgICAgICAgdGhpcy51bnNjaGVkdWxlQWxsQ2FsbGJhY2tzKCk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHR5cGUgPSBmdW5jdGlvbiB0eXBlKG8pIHtcbiAgICAgICAgICAgIHZhciBzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xuICAgICAgICAgICAgcmV0dXJuIHMubWF0Y2goL1xcW29iamVjdCAoLio/KVxcXS8pWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlKGluaXRUaW1lKSA9PT0gJ251bWJlcicpIHNlbGYuaW5pdFRpbWUgPSBpbml0VGltZTtcbiAgICAgICAgdGhpcy5sYWJlbC5zdHJpbmcgPSBzZWxmLmZvcm1hdFNlY29uZHMoc2VsZi5pbml0VGltZSk7XG4gICAgICAgIC8vY2MubG9nKCdzdGFydCB0aW1lciEnKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IHRoaXMuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5sYWJlbC5zdHJpbmcgPSBzZWxmLmZvcm1hdFNlY29uZHMoc2VsZi5pbml0VGltZSk7XG4gICAgICAgICAgICBpZiAoc2VsZi5pc0dyb3dVcCkge1xuICAgICAgICAgICAgICAgIHNlbGYuaW5pdFRpbWUrKztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pbml0VGltZS0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2VsZi5pbml0VGltZSA8IDApIHtcbiAgICAgICAgICAgICAgICAvL+WRiuivieS4u+aOp++8jOaXtumXtOWIsFxuICAgICAgICAgICAgICAgIHNlbGYubm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBjYy5FdmVudC5FdmVudEN1c3RvbSgndGltZV91cCcsIHRydWUpKTtcbiAgICAgICAgICAgICAgICBzZWxmLnVuc2NoZWR1bGVBbGxDYWxsYmFja3MoKTsgLy8oc2VsZi5jYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VsZi5pbml0VGltZSA+IHNlbGYudG90YWx0aW1lKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5ub2RlLmRpc3BhdGNoRXZlbnQobmV3IGNjLkV2ZW50LkV2ZW50Q3VzdG9tKCd0aW1lX3VwJywgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgIHNlbGYudW5zY2hlZHVsZUFsbENhbGxiYWNrcygpOyAvLyhzZWxmLmNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMSk7XG4gICAgfSxcbiAgICBmb3JtYXRTZWNvbmRzOiBmdW5jdGlvbiBmb3JtYXRTZWNvbmRzKHZhbHVlKSB7XG5cbiAgICAgICAgdmFyIHRoZVRpbWUgPSBwYXJzZUludCh2YWx1ZSk7IC8vIOenklxuXG4gICAgICAgIHZhciB0aGVUaW1lMSA9IDA7IC8vIOWIhlxuXG4gICAgICAgIHZhciB0aGVUaW1lMiA9IDA7IC8vIOWwj+aXtlxuXG4gICAgICAgIGlmICh0aGVUaW1lID4gNjApIHtcblxuICAgICAgICAgICAgdGhlVGltZTEgPSBwYXJzZUludCh0aGVUaW1lIC8gNjApO1xuXG4gICAgICAgICAgICB0aGVUaW1lID0gcGFyc2VJbnQodGhlVGltZSAlIDYwKTtcblxuICAgICAgICAgICAgaWYgKHRoZVRpbWUxID4gNjApIHtcblxuICAgICAgICAgICAgICAgIHRoZVRpbWUyID0gcGFyc2VJbnQodGhlVGltZTEgLyA2MCk7XG5cbiAgICAgICAgICAgICAgICB0aGVUaW1lMSA9IHBhcnNlSW50KHRoZVRpbWUxICUgNjApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCIgKyBwYXJzZUludCh0aGVUaW1lKSArIFwi56eSXCI7XG5cbiAgICAgICAgaWYgKHRoZVRpbWUxID4gMCkge1xuXG4gICAgICAgICAgICByZXN1bHQgPSBcIlwiICsgcGFyc2VJbnQodGhlVGltZTEpICsgXCLliIZcIiArIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVUaW1lMiA+IDApIHtcblxuICAgICAgICAgICAgcmVzdWx0ID0gXCJcIiArIHBhcnNlSW50KHRoZVRpbWUyKSArIFwi5bCP5pe2XCIgKyByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxufSk7XG4vLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuLy8gfSxcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzk4NjkxZFhtcEJPd3F5SjlFVVJnckF6JywgJ2x1cmUnKTtcbi8vIFNjcmlwdFxcbHVyZS5qc1xuXG52YXIgR2FtZSA9IHJlcXVpcmUoJ0dhbWUnKTtcbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5hbmltID0gdGhpcy5nZXRDb21wb25lbnQoY2MuQW5pbWF0aW9uKTtcbiAgICAgICAgLy/lkJHlupXpg6jnp7vliqhcbiAgICAgICAgdmFyIHRhcmdldF94ID0gdGhpcy5ub2RlLng7XG4gICAgICAgIHZhciB0YXJnZXRfeSA9IC1jYy53aW5TaXplLmhlaWdodCAvIDI7XG4gICAgICAgIC8vY2MubG9nKCd0YXJnZXRfeCx0YXJnZXRfeTonK3RhcmdldF94KycsJyt0YXJnZXRfeSk7XG4gICAgICAgIHZhciBkb3duU3BlZWQgPSAtMzAgLSBNYXRoLnJhbmRvbSgpICogMzA7XG4gICAgICAgIGNjLmxvZygnZG93bnNwZWVkPScgKyBkb3duU3BlZWQpO1xuICAgICAgICAvL+i/meenjeW9ouW8j+S4jeWvue+8jOimgeaUueS4gOS4i++8jOS4jeiDveeUqOe8k+WKqO+8jOS4jeeEtuacieaXtuWcqHVwZGF0ZeaXtuS4jeiDveWPkeeOsOi/meS4qk5PREVcbiAgICAgICAgdmFyIG1vdmVCeUxlZnQgPSBjYy5tb3ZlQnkoMS41LCBjYy5wKC00MCwgZG93blNwZWVkKSwgMTApO1xuICAgICAgICB2YXIgbW92ZUJ5UmlnaHQgPSBjYy5tb3ZlQnkoMS41LCBjYy5wKDQwLCBkb3duU3BlZWQpLCAxMCk7XG5cbiAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbihjYy5yZXBlYXRGb3JldmVyKGNjLnNlcXVlbmNlKG1vdmVCeUxlZnQsIG1vdmVCeVJpZ2h0KSkpO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCh4KSB7XG4gICAgICAgIHRoaXMubm9kZS54ID0geDsgLy8tY2Mud2luU2l6ZS53aWR0aC8yKyBNYXRoLnJhbmRvbSgpKmNjLndpblNpemUud2lkdGggO1xuICAgICAgICBjYy5sb2codGhpcy5ub2RlLnV1aWQgKyAnIGlzIGNyZWF0ZWQnKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICBsYXRlVXBkYXRlOiBmdW5jdGlvbiBsYXRlVXBkYXRlKGR0KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMubm9kZS55IDwgLWNjLndpblNpemUuaGVpZ2h0IC8gMiArIDEwKSB7XG4gICAgICAgICAgICAvL+WIsOW6leS6hlxuICAgICAgICAgICAgY2MubG9nKCcgb3ZlciAnICsgdGhpcy5ub2RlLnV1aWQgKyAnIHRoaXMubm9kZS55OicgKyB0aGlzLm5vZGUueSk7XG4gICAgICAgICAgICBzZWxmLmRldGVyaW9yYXRlKCk7XG4gICAgICAgICAgICAvLyB0aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuYW5pbS5zdG9wKCk7XG4gICAgICAgICAgICAvLyAvL+mlteWIsOW6leWQjuWPmOWMllxuICAgICAgICAgICAgLy8gdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyAgICAgbGV0IGZpbmlzaGVkID0gY2MuY2FsbEZ1bmMoZnVuY3Rpb24odGFyZ2V0LCBpbmQpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgLy8gc2VsZi5ub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgY2MuZmluZCgnQ2FudmFzJykuZW1pdCgnbHVyZV9kZXN0b3J5Jywge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgdXVpZDogc2VsZi5ub2RlLnV1aWRcbiAgICAgICAgICAgIC8vICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyAgICAgfSwgdGhpcywgMCk7XG4gICAgICAgICAgICAvLyAgICAgbGV0IHRpbnRCeSA9IGNjLnRpbnRUbygxMCwgMCwgMCwgMCk7XG4gICAgICAgICAgICAvLyAgICAgc2VsZi5ub2RlLnJ1bkFjdGlvbihjYy5zZXF1ZW5jZSh0aW50QnksIGZpbmlzaGVkKSk7XG5cbiAgICAgICAgICAgIC8vIH0sIDEpO1xuICAgICAgICAgICAgdmFyIGMgPSBjYy5maW5kKCdDYW52YXMnKTtcbiAgICAgICAgICAgIGMuZW1pdCgnbHVyZV9vdmVyJywge1xuICAgICAgICAgICAgICAgIG1zZzogJ0hlbGxvLCB0aGlzIGlzIENvY29zIENyZWF0b3InICsgc2VsZi5ub2RlLnV1aWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmKHRoaXMubm9kZS55PC0zMDAgJiYgdGhpcy5ub2RlLnk+LTMxMClcbiAgICAgICAgLy8gICBjYy5sb2codGhpcy5ub2RlLnV1aWQrJy0+Jyt0aGlzLm5vZGUueSk7XG4gICAgICAgIHRoaXMubm9kZS55ID0gY2MuY2xhbXBmKHRoaXMubm9kZS55LCAtY2Mud2luU2l6ZS5oZWlnaHQgLyAyICsgMTAsIGNjLndpblNpemUuaGVpZ2h0IC8gMiAtIDEwMCk7XG4gICAgfSxcbiAgICAvL+WPmOi0qOi/h+eoi1xuICAgIGRldGVyaW9yYXRlOiBmdW5jdGlvbiBkZXRlcmlvcmF0ZSgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgdGhpcy5hbmltLnN0b3AoKTtcbiAgICAgICAgLy/ppbXliLDlupXlkI7lj5jljJZcbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGZpbmlzaGVkID0gY2MuY2FsbEZ1bmMoZnVuY3Rpb24gKHRhcmdldCwgaW5kKSB7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5ub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICBjYy5maW5kKCdDYW52YXMnKS5lbWl0KCdsdXJlX2Rlc3Ryb3knLCB7XG4gICAgICAgICAgICAgICAgICAgIHV1aWQ6IHNlbGYubm9kZS51dWlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzLCAwKTtcbiAgICAgICAgICAgIHZhciB0aW50QnkgPSBjYy50aW50VG8oMTAsIDAsIDAsIDApO1xuICAgICAgICAgICAgc2VsZi5ub2RlLnJ1bkFjdGlvbihjYy5zZXF1ZW5jZSh0aW50QnksIGZpbmlzaGVkKSk7XG4gICAgICAgIH0sIDEpO1xuICAgIH0sXG4gICAgb25Db2xsaXNpb25FbnRlcjogZnVuY3Rpb24gb25Db2xsaXNpb25FbnRlcihvdGhlciwgc2VsZikge1xuXG4gICAgICAgIGlmIChvdGhlci5ub2RlLmdyb3VwID09PSAnZmlzaEcnKSB7XG4gICAgICAgICAgICBjYy5sb2coJ2Zpc2gubm9kZS5ncm91cCcgKyBvdGhlci5ub2RlLmdyb3VwKTtcbiAgICAgICAgICAgIC8v56Kw5Yiw6bG8XG4gICAgICAgICAgICB0aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcblxuICAgICAgICAgICAgaWYgKG90aGVyLmdldENvbXBvbmVudCgnQ29udHJvbCcpLmZhdm9yaXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLmRpc3BhdGNoRXZlbnQobmV3IGNjLkV2ZW50LkV2ZW50Q3VzdG9tKCdsdXJlX2VhdGVkJywgdHJ1ZSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYy5maW5kKCdDYW52YXMnKS5lbWl0KCdsdXJlX2Rlc3Ryb3knLCB7XG4gICAgICAgICAgICAgICAgdXVpZDogc2VsZi5ub2RlLnV1aWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdGhlci5ub2RlLmdyb3VwID09PSAnc3RvbmVHJykge1xuICAgICAgICAgICAgY2MubG9nKCdsdXJlIGtub2NrIHN0b25lICcgKyBvdGhlci5ub2RlLmdyb3VwKTtcbiAgICAgICAgICAgIC8v56Kw5Yiw6Zqc56KNXG4gICAgICAgICAgICB0aGlzLmRldGVyaW9yYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7Il19
