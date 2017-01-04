cc.Class({
    extends: cc.Component,

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
            default: null,
            type: cc.Node
        },
        otherFish: {
            default: [],
            type: cc.Node
        },

 
    },


    // use this for initialization
    onLoad: function() {
        let self = this;
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this.knock.active = false;
        this.knockAnimation = this.knock.getComponent(cc.Animation);

        this.scoreLabel = this.score.getComponent(cc.Label);
        this.scoreScript = this.score.getComponent('Score');
        //取到关卡设计文件--放到loading中
        //cc.loader.loadRes('stages.json', function(err, data) {
        let data = cc.find('loading').getComponent('Loading').stagesData;
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



        this.node.on('lure_over', function(event) {
            cc.log(event);
        });
        this.node.on('lure_eated', function(event) {
            self.scoreScript.eat();
        });
        this.node.on('throw_lure', function(event) {
            let x = event.getUserData();
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
        this.node.on('lure_destroy', function(event) {
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
        this.node.on('time_up', function(event) {
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
        this.node.on('select_stage', function(event) {
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
        this.node.on('next_stage', function(event) {
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
        this.node.on('menu', function(event) {
            self.menu.active = true;
            self.menu.getComponent('Menu').init(self.stagesData);
        });
        //reload
        this.node.on('reload', function(event) {
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
        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            // event.touch
            let target = event.getCurrentTarget();
            let pos = target.convertToNodeSpaceAR(event.getLocation());
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
    disperseFish: function(pos) {
        for (var i = 0; i < this.otherFish.length; i++) {
            let distance = cc.pDistance(pos, this.otherFish[i].getPosition());
            if (distance < this.disperseDistance) {
                this.otherFish[i].stopAllActions();
                this.otherFish[i].getComponent('Control').strategyRun(pos, 0.3, 0.3, true);
                cc.log('disperse');
            }

        }
        let distance = cc.pDistance(pos, this.fish.getPosition());
        if (distance < this.disperseDistance) {
            this.fish.stopAllActions();
            this.fish.getComponent('Control').strategyRun(pos, 0.3, 0.3, true);
            cc.log('disperse');
        }

    },
    wantEatThink: function() {
        let self = this;
        self.fishScript.wantEatThink(self.lures);
        for (var i = 0; i < self.otherFish.length; i++) {
            self.otherFish[i].getComponent('Control').wantEatThink(self.lures);
        }
    },
    randomLures: function(count, interval) {
        let self = this;
        for (var i = 0; i < count; i++) {
            // for (var n = 0; n < Things.length; i++) {
            //     Things[i]
            // }
            let x = -cc.winSize.width / 2 + 50 + (cc.winSize.width - 100) * Math.random();
            self.throw_lure(x);
        }
        self.wantEatThink();
        this.schedule(function() {
            // self.randomLures();
            // 这里的 this 指向 component
            for (var i = 0; i < count; i++) {
                // for (var n = 0; n < Things.length; i++) {
                //     Things[i]
                // }
                let x = -cc.winSize.width / 2 + 50 + (cc.winSize.width - 100) * Math.random();
                self.throw_lure(x);
            }

            self.wantEatThink();
        }, interval);



    },

    enterStage: function() {
        let self = this;
        //从一个文件中取得：
        //1.其它鱼的数量
        //2.障碍的位置、数量
        //3.鱼的变量
        //4.大饵的变量
        //5.第几关
        //TODO 合并所有鱼为一种
        self.stageString.getComponent(cc.Label).string = "第" + self.stage + "关";
        if (self.stageData && self.stageData.stage === self.stage) {

        } else {
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
        let otherFishCount = self.stageData.otherFishCount;

        for (var i = 0; i < otherFishCount; i++) {
            let otherFish = null;
            if (self.fishPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
                otherFish = self.fishPool.get();
            } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
                otherFish = cc.instantiate(self.fishPrefab);
                // self.lurePool.put(lure);
            }
            cc.log('create otherFish:' + otherFish.uuid);
            let pos = this.getRandomPosition();
            otherFish.setPosition(pos);

            otherFish.getComponent('Control').init(self.stageData.fish);
            // {
            //     favorite: false,
            //     max_seed: 15
            // }); //TODO 以后给一些参数


            otherFish.parent = self.node; // 将生成的敌人加入节点树

            self.otherFish.push(otherFish);
        }
        self.stageData.fish.favorite = true;
        let fish = cc.instantiate(self.fishPrefab);
        cc.log('create favorite fish :' + fish.uuid);
        let pos = this.getRandomPosition();
        fish.setPosition(pos);

        fish.getComponent('Control').init(self.stageData.fish);
        // {
        //     favorite: true,
        //     max_seed: 15
        // }); //TODO 以后给一些参数
        fish.parent = self.node; // 将生成的敌人加入节点树

        self.fish = fish;

    },
    getRandomPosition: function() {
        let y = -cc.winSize.height / 2 + (cc.winSize.height - 100) * Math.random();
        let x = -cc.winSize.width / 2 + cc.winSize.width * Math.random();
        return cc.p(x, y);
    },


    throw_lure: function(x) {
        let self = this;
        //点击后生成饵
        let lure = null;
        if (self.lurePool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            lure = self.lurePool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            lure = cc.instantiate(self.lurePrefab);
            // self.lurePool.put(lure);
        }
        cc.log('throw_lure' + lure);
        lure.y = cc.winSize.height / 2 - 100;

        lure.getComponent('lure').init(x); //接下来就可以调用 enemy 身上的脚本进行初始化
        lure.parent = self.node; // 将生成的敌人加入节点树

        self.lures.push(lure);

    },
});