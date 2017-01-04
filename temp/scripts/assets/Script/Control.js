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