var FishRunStatus = cc.Enum({
    stop: 0,
    control: 1,
    find: 2,
    random: 3
});
cc.Class({
    extends: cc.Component,

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
            default: null
        }
    },

    onLoad: function() {
        let self = this;
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
        this.schedule(function() {
            cc.log('fish status:' + self.run_status);
            //从停止状态 进入 自由运动
            if (self.run_status === FishRunStatus.stop) {
                //某种属性，是不是爱动 
                if (Math.random() > this.move_rate)
                    self.randomRun();
            }
        }, self.idle_time * Math.random());
    },
    init: function(properties) {
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

    destroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onKeyDown: function(event) {
        let self = this;
        let dirction_rotation = 0;
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
    countAngle: function(target, self) {
        let len_y = target.y - self.y;
        let len_x = target.x - self.x;

        let tan_yx = Math.abs(len_y) / Math.abs(len_x);
        let angle = 0;
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
    eatAction: function() {

        if (this.lure) {
            if (!this.lure.isValid) {
                this.wantEatThink();
            }
            if (this.lure == undefined || !this.lure || this.lure === null || !this.lure.isValid) {
                //在追的过程中，饵因为某种原因没了，
                this.run_status = FishRunStatus.stop;
                return;
            }

            cc.log(' want eat ' + this.lure.uuid + ' ' + this.lure.x);
            let self = this;
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
            let angle = this.countAngle(this.lure, this.node);
            //  cc.log('angle:'+angle); 

            let x_ = Math.cos(angle) * this.speed;
            let y_ = Math.sin(angle) * this.speed;
            // cc.log('x_,y_:'+x_+','+y_);

            let finished = cc.callFunc(function(target, ind) {
                //cc.log('finished');
                self.node.stopAllActions();
                // cc.log('this.lure:'+this.lure.position.x);
                if (this.lure.isValid) {
                    //如果饵还在，继续吃
                    self.eatAction();
                } else {
                    //找另一个饵
                    let canvasScript = cc.find('Canvas').getComponent('Game');
                    if (canvasScript.lures.length > 0) {
                        self.wantEatThink(canvasScript.lures);
                        // cc.log(' find '+canvasScript.lures[0].uuid);
                        // self.lure=canvasScript.lures[0];
                        // self.eatAction();
                    } else {
                        self.run_status = FishRunStatus.stop;
                    }

                }
            }, this, 0);
            //这个时间要变化 
            let distance = cc.pDistance(this.node.getPosition(), this.lure.getPosition());
            let speed = this.max_seed * 0.5;
            if (distance < 200) {
                speed = this.max_seed * 0.15;
            }
            if (distance < 80) {
                speed = this.max_seed * 0.01;
            }
            cc.log('new speed:' + speed);
            let rotateTo = cc.rotateTo(speed / 2, angle); //cc.rotateTo(0.5, angle);
            let followAction = cc.moveTo(speed, this.lure);
            this.node.stopAllActions();
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
            this.node.runAction(cc.spawn(followAction, cc.sequence(rotateTo, finished)));

            // followAction.easing(cc.easeQuarticActionIn());

            //停止之前的动作，转而执行下面的动作


            return;
        } else {
            this.run_status = FishRunStatus.stop;
            return;
        }
    },
    //任意游//也可能停下来
    randomRun: function() {
        let self = this;
        let x = -cc.winSize.width / 2 + cc.winSize.width * Math.random();
        let y = -cc.winSize.height / 2 + (cc.winSize.height - 100) * Math.random();
        let speed = this.max_seed * (Math.random() * 0.8 + 0.2);
        cc.log('fish random run ' + x + ',' + y + ' at ' + speed);
        let moveTo = cc.moveTo(speed, cc.p(x, y));

        let finished = cc.callFunc(function(target, ind) {
            self.run_status = FishRunStatus.stop;
        });
        let angle = this.countAngle(cc.p(x, y), this.node);
        cc.log('angle:' + angle);

        let rotateTo = cc.rotateTo(0.25 + Math.random() * 2, angle);
        this.run_status = FishRunStatus.random; //状态变化了
        let randomAction = cc.spawn(rotateTo, cc.sequence(moveTo, finished));
        randomAction.setTag(FishRunStatus.random);
        // cc.log(randomAction);
        this.node.runAction(randomAction);


    },
    //对所有饵进行评估，找到最想吃最近的一个
    wantEatThink: function(lures) {
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
        let distance = 9999;
        //对于距离差不多的，是不是随机处理呢？还是让两只鱼撞在一起？
        for (var i = 0; i < lures.length; i++) {
            let distance_ = cc.pDistance(this.node.getPosition(), lures[i].getPosition());
            if (distance > distance_) {
                distance = distance_;
                this.lure = lures[i];
            }
            
        }
        cc.log(' find ' + this.lure.uuid);
        this.eatAction();
    },
    //键盘控制，暂时不要了
    actionControl: function(dirction_rotation, code) {
        let x = this.node.position.x;
        let y = this.node.position.y;
        // cc.log('be x,y:' + x + ' ' + y + ' ' + code);
        let rotateTo = cc.rotateTo(0.5, dirction_rotation);
        rotateTo.easing(cc.easeElasticOut());
        let x_ = x;
        let y_ = y;
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
        let bezierTo = cc.moveTo(1.5, cc.p(x_, y_)); //,cc.p(x-30,y+20),cc.p(x-40,y)]); 
        bezierTo.easing(cc.easeElasticIn());
        // bezierTo.easing(cc.easeCubicActionIn());     //cc.bezierTo(2,[cc.p(x,y),cc.p(x+40,y+40),cc.p(x,y+80),cc.p(x-40,y+40),cc.p(x,y)]);
        this.node.runAction(cc.spawn(rotateTo, bezierTo));
    },

    countRotation: function(dirction_rotation) {
        this.run_status = FishRunStatus.control; //running
        this.start_rotation = this.node.rotation;
        this.end_rotation = dirction_rotation;
        this.clockwise = 1;
        //方向第一次计算
        let dvalue = this.end_rotation - this.start_rotation;
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

    onKeyUp: function(event) {
        if (event.keyCode === this.moveDirection) {
            this.moveDirection = null;
        }
    },

    onCollisionEnter: function(other, self) {
        if (other.node.group === 'stoneG') {
            cc.log('fish knock stone' + other.node.group);
            cc.log(other);
            //碰到鱼
            //记忆障碍
            if (this.stonePolygons === undefined) {
                let polygons = [];
                let canvas = cc.find('Canvas');
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
            let polygons = [];
            let canvas = cc.find('Canvas');
            for (var i = 0; i < other.points.length; i++) {
                polygons[i] = canvas.convertToNodeSpaceAR(other.world.points[i]);
            }
            this.pathPolygons = polygons;
        }
        if(other.node.group === 'fishG'){
            //如果是鱼与鱼相撞
            this.strategyRun(other.node,0.15,0.3,true,50);
        }

    },
    //反弹的AI逻辑
    strategyRun: function(other, tempSpeed, tempRotateSpeed, immediately,range) {
        let self = this;
        //当前是有目标的游，还是闲游
        if (self.run_status === FishRunStatus.random || self.run_status === FishRunStatus.find || self.run_status === FishRunStatus.stop) {

            // let x_range = Math.abs(cc.winSize.width / 2 - Math.abs(self.node.x));
            // let y_range = Math.abs(cc.winSize.height / 2 - Math.abs(self.node.y) - 100);
            // let x = self.node.x + x_range * Math.random();
            // let y = self.node.y + y_range * Math.random();
            let x_range  = 100 + 50 * Math.random();
            let y_range = 100 + 50 * Math.random();
            if(range){
                x_range = range*Math.random();
                y_range = range*Math.random();
            }

            let run_status_org = self.run_status;
            let x, y;
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



            let speed = this.max_seed * (Math.random() * 0.8 + 0.2);
            if (tempSpeed) speed = tempSpeed;
            let moveTo = cc.moveTo(speed, cc.p(x, y));
            //   x=50+cc.winSize.width/2*Math.random();
            //   y=50+cc.winSize.height/2*Math.random();
            // var mng = cc.director.getActionManager();
            // cc.log(mng.getActionByTag(FishRunStatus.random,this.node));
            // moveTo=cc.reverseTime(mng.getActionByTag(FishRunStatus.random,this.node));

            // let moveBy = cc.moveBy(speed, cc.p(x, y));
            let finished = cc.callFunc(function(target, ind) {
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
            cc.log('other angle:' + this.countAngle(this.node.convertToNodeSpace(cc.p(x, y)), cc.p(0, 0)) + " | " + this.countAngle(cc.p(x, y), this.node));
            let angle = this.countAngle(cc.p(x, y), this.node);
            // angle=(angle>180?540-this.node.rotation:this.node.rotation-90);
            let rotateSpeed = this.turn_speed * Math.random() + 0.2;
            if (tempRotateSpeed) rotateSpeed = tempRotateSpeed;
            let rotateTo = cc.rotateTo(rotateSpeed, angle);
            //先停下原来正在进行的动作（导致碰撞的）
            this.node.stopAllActions();
            cc.log('knock run and status:' + this.run_status + ' speed:' + speed + ' and angle:' + angle);
            //向另一个方向运动
            // self.run_status=FishRunStatus.random;
            // 
            if (immediately) this.node.stopAllActions();
            this.node.runAction(cc.spawn(rotateTo, cc.sequence(moveTo, finished)));


        }
    },
    //假设暂时只有一个障碍物
    findPath: function(startPos, targetPos, pathPolygons, stonePolygons, path) {
        if (path === undefined) path = [];
        if (!cc.Intersection.linePolygon(startPos, targetPos, stonePolygons)) {

            path.unshift(startPos);
            return path;
        }
        let tempPolygons = [];
        let tempPolygons_ = [];
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

            let pathBranch = this.findPath(tempPolygons_[i], targetPos, tempPolygons, stonePolygons, path[i]);
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
    shortPath: function(paths) {
        let s = 0;
        let maxDistance = 0;
        for (var i = 0; i < paths.length; i++) {
            let path = paths[i];
            if (path === undefined || path === null) continue;
            if (Array.isArray(path)) {
                path.unshift(this.node.getPosition());
            } else {

                if (cc.pDistance(paths[0], this.node.getPosition()) == 0) return null;
                paths.unshift(this.node.getPosition());
                return paths;
            }

            let distance = 0;
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

    update: function(dt) {
        let self = this;
        if (this.run_status === FishRunStatus.control) { //在运动中的话

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