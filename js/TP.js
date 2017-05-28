/**
 * 拓扑图组件
 * 依赖jquery , jtopo
 * @param option
 * @constructor
 * @author zhangyingwei
 */
function TP(option){
    this.option = option;
    this.nodeMap = {};
    this.childsNodeMap = {};
    this.change = false;
    this.maxNodeId = 0;
    this.el = $(option.el);
    this.width = option.width;
    this.height = option.height;
    this.background = option.background;
    this.backgroundColor = option.backgroundColor;
    this.items = option.item;
    this.resourcesPrefix = option.resourcesPrefix?option.resourcesPrefix:"./";
    this.lineFlexional = option.lineFlexional;
    this.store = {}
    this.iconMap = {"0": "./icon/fhq.png",
        "1": this.resourcesPrefix+"icon/fileserver.png",
        "2": this.resourcesPrefix+"icon/fw.png",
        "3": this.resourcesPrefix+"icon/fwq.png",
        "4": this.resourcesPrefix+"icon/fzjh.png",
        "5": this.resourcesPrefix+"icon/jhj.png",
        "6": this.resourcesPrefix+"icon/khj.png",
        "7": this.resourcesPrefix+"icon/lykzq.png",
        "8": this.resourcesPrefix+"icon/lyq.png",
        "9": this.resourcesPrefix+"icon/webfwq.png",
        "10": this.resourcesPrefix+"icon/wljhj.png",
        "11": this.resourcesPrefix+"icon/wllyq.png",
        "12": this.resourcesPrefix+"icon/wlzj.png",
        "13": this.resourcesPrefix+"icon/xnzj.png",
        "14": this.resourcesPrefix+"icon/yjfwq.png",
        "15": this.resourcesPrefix+"icon/yun.png"
    }
    this.draw();
}

/**
 * 初始化画布等对象
 */
TP.prototype.init = function(){
    var self = this;
	var width = this.width
	var height = this.height
	this.el.append("<canvas id='tp-canvas' width='"+width+"' height='"+height+"'></canvas><div id='tp-tmp'></div>")
    this.canvas = $("#tp-canvas");
    this.tmp = $("#tp-tmp");
    this.stage = new JTopo.Stage(this.canvas[0]); // 创建一个舞台对象
    this.scene = new JTopo.Scene(this.stage); // 创建一个场景对象
    this.scene.addEventListener('dbclick', function(e) {
        console.log("scene double click")
    });
    this.scene.addEventListener('click', function(e) {
        self.rightClickRemove();
        self.nodeTypeRemove();
        self.tipRemove();
        self.nodeEditRemove();
    });
    this.scene.mode = 'normal';
    if(this.background){
        this.scene.background = this.background;
    }else if(this.backgroundColor){
        this.scene.alpha = 0.3;
        this.scene.backgroundColor = this.backgroundColor;
    }
    this.initTipPanel();
    this.initRightMousePanel();
    this.initNodeTypePanel();
    this.initNodeEditPanel();
}

/**
 * 初始化tip面板
 */
TP.prototype.initTipPanel = function () {
    this.tmp.append("<div id='tp-tip'></div>")
    $("#tp-tip").css({
        width: "180px",
        "max-height": "250px",
        "overflow": "auto",
        border: "1px solid #f0f0f0",
        position: "absolute",
        display: "none",
        padding: "5px",
        margin: "5px",
        background: "#f0f0f0",
        "border-radius": "5px"
    });
}
/**
 * 初始化编辑信息面板
 */
TP.prototype.initNodeEditPanel = function () {
    this.tmp.append("<div id='tp-node-edit'></div>")
    $("#tp-node-edit").css({
        width: "500px",
        height: "300px",
        "overflow": "auto",
        border: "1px solid #f0f0f0",
        position: "absolute",
        display: "none",
        padding: "5px",
        margin: "5px",
        background: "#f0f0f0",
        "border-radius": "5px"
    });
}
/**
 * 初始化右键菜单
 */
TP.prototype.initRightMousePanel = function(){
    var self = this;
    var menus = [{
        name: "添加节点",
        value:0
    },{
        name: "删除节点",
        value: 1
    },{
        name: "添加连线",
        value: 2
    },{
        name: "编辑信息",
        value: 3
    },{
        name: "查看详情",
        value: 4
    }]
    var panel = "<ul>";
    $.each(menus,function () {
        panel+="<li value='"+this.value+"'>"+this.name+"</li>";
    })
    panel += "</ul>";
    this.tmp.append("<div id='tp-node-right-click'>"+panel+"</div>");
    $("#tp-node-right-click").css({
        width: "100px",
        height: "200px",
        border: "1px solid #f1f1f1",
        position: "absolute",
        display: "none",
        margin: "5px",
        background: "#f0f0f0",
        padding: 0
    })
    $("#tp-node-right-click ul").css({
        "list-style": "none",
        margin: 0,
        padding: 0,
    })
    $("#tp-node-right-click ul li").css({
        cursor:"pointer",
        style: "none",
        padding: "5px",
        "text-align": "center",
        "border-bottom":"1px solid #0f0f0f",
        "font-size": "10px"
    })
    $("#tp-node-right-click ul li").mouseover(function(){
        $(this).css({
            "background": "rgb(187, 187, 187)"
        });
    }).mouseout(function(){
        $(this).css({
            "background": "rgb(240, 240, 240)"
        });
    })
    $("#tp-node-right-click ul li").click(function(){
        if(self.currentNode){
            var action = $(this).attr("value");
            if(action==="0"){
                // self.addNode();
                self.nodeType(event)
            }else if(action==="1"){
                self.removeCurrentNode();
                self.change = true;
            }else if(action === "2"){
                self.currentNode.selected = true;
                self.needLine = true;
                self.beforeNode = self.currentNode
                self.change = true;
            }else if (action === "3"){
                self.nodeEdit(event);
                self.change = true;
            }else if (action === "4"){
                self.tip(event);
            }
        }else{
            console.log("no node select")
        }
        self.rightClickRemove();
    })
}

/**
 * 初始节点类型菜单
 */
TP.prototype.initNodeTypePanel = function(){
    var self = this;
    var menus = [{
        name: "防火墙",
        value:0
    },{
        name: "文件服务器",
        value:1
    },{
        name: "房屋",
        value:2
    },{
        name: "服务器",
        value:3
    },{
        name: "负载均衡",
        value:4
    },{
        name: "交换机",
        value:5
    },{
        name: "客户机",
        value:6
    },{
        name: "路由控制器",
        value:7
    },{
        name: "路由器",
        value:8
    },{
        name: "web服务器",
        value:9
    },{
        name: "物理交换机",
        value:10
    },{
        name: "物理路由器",
        value:11
    },{
        name: "物理主机",
        value:12
    },{
        name: "虚拟主机",
        value:13
    },{
        name: "右键服务器",
        value:14
    },{
        name: "云",
        value:15
    }]
    var panel = "<ul>";
    $.each(menus,function () {
        panel+="<li value='"+this.value+"'><img width='20' height='20' src='"+self.iconMap[this.value]+"'/>"+this.name+"</li>";
    })
    panel += "</ul>";
    this.tmp.append("<div id='tp-node-type'>"+panel+"<div class='clear'></div></div>");
    $("#tp-node-type").css({
        width: "100px",
        border: "1px solid #f1f1f1",
        position: "absolute",
        display: "none",
        margin: "5px",
        background: "#f0f0f0",
        padding: 0
    })
    $("#tp-node-type ul").css({
        "list-style": "none",
        margin: 0,
        padding: 0,
    })
    $("#tp-node-type ul li").css({
        cursor:"pointer",
        style: "none",
        padding: "5px",
        "border-bottom":"1px solid #0f0f0f",
        "font-size": "10px",
        "line-height":"20px"
    })
    $(".clear").css({
        clear:"both",
        height: 0,
        "line-height": 0,
        "font-size": 0
    })
    $("#tp-node-type ul li img").css({
        "margin-right":"4px"
    })
    $("#tp-node-type ul li").mouseover(function(){
        $(this).css({
            "background": "rgb(187, 187, 187)"
        });
    }).mouseout(function(){
        $(this).css({
            "background": "rgb(240, 240, 240)"
        });
    })
    $("#tp-node-type ul li").click(function(){
        var val = $(this).attr("value");
        var icon = self.iconMap[val];
        self.addNode(icon);
        self.nodeTypeRemove();
        self.change = true;
    })
}

/**
 * 创建节点
 * @param x
 * @param y
 * @param img
 */
TP.prototype.createNode = function (x,y,img,danger,msg,title) {
    var self = this;
    var node = new JTopo.Node();
    node.setImage(img, true);
    node.title = title;
    node.text = msg[title];
    console.log(x, y);
    node.setLocation(x, y);
    node.textOffsetY = 2;
    node.borderRadius = 10;
    node.shadow = "true";
    node.item = {};
    node.item.msg = msg;
    if(danger){
        node.alarm = danger;
    }
    this.scene.add(node);
    //点击事件
    node.addEventListener('click',function(){
        self.currentNode = this;
        if(self.needLine){
            self.addLine(this);
            self.needLine = false;
        }
    });
    //双击事件
    node.addEventListener('dbclick',function(){
        self.currentNode = this;
        self.tip(event);
    });
    //鼠标划出
    node.addEventListener('mouseout',function(){
        self.currentNode = this;
        // self.tipRemove();
    });
    //处理鼠标右击事件
    node.addEventListener('mouseup',function(){
        self.currentNode = this;
        if(event.which === 3){
            self.rightClick(event)
        }
    });
    //处理拖动事件
    node.addEventListener('mousedrag',function(){
        self.currentNode = this;
        console.log("mousedrag");
        this.item.point.x = this.x;
        this.item.point.y = this.y;
        self.change = true;
    });
    return node;
}

/**
 * 在当前节点下添加一个新的节点
 */
TP.prototype.addNode = function(img){
    var before = this.currentNode;
    var nextNode = this.createNode(before.x+100,before.y+100,img,false,{a:"ninfo"},"a")
    this.maxNodeId +=1;
    var id = this.maxNodeId;
    nextNode.item.id = id;
    nextNode.item.parent = [];
    nextNode.item.parent.push(before.item.id)
    nextNode.item.point = {};
    nextNode.item.point.img = img;
    nextNode.item.point.x = nextNode.x;
    nextNode.item.point.y = nextNode.y;
    nextNode.item.type = "";
    this.nodeMap[id] = nextNode;
    if(!this.childsNodeMap[before.item.id]){
        this.childsNodeMap[before.item.id] = new Array();
    }
    this.childsNodeMap[before.item.id].push(nextNode);
    this.createLine(before, nextNode, true, false);
}

/**
 * 连接节点 默认直 蓝 线
 * @param nodeFrom
 * @param nodeTo
 * @param f true 折线  false 直线
 * @param danger 是否危险 true 红线 false 蓝线
 * @returns {*}
 */
TP.prototype.createLine = function(nodeFrom,nodeTo,f){
    var self = this;
    var link;
    f = this.lineFlexional
    if(f){
        link = new JTopo.FlexionalLink(nodeFrom, nodeTo);
    }else{
        link = new JTopo.Link(nodeFrom, nodeTo);
    }
    link.arrowsRadius = 6; //箭头大小
    if(nodeFrom.alarm || nodeTo.alarm){
        link.strokeColor = '255,0,0';
    }

    //处理鼠标右击事件
    link.addEventListener('mouseup',function(){
        if(event.which === 3){
            self.scene.remove(this)
            nodeTo.item.parent.removeByValue(nodeFrom.item.id);
        }
    });
    //处理鼠标划过
    link.addEventListener('mouseover',function(){
        console.log("右键删除")
    });
    link.direction = 'vertical';
    this.scene.add(link);
    return link;
}

TP.prototype.effect = function (nodeF,nodeT) {
    var effect = JTopo.Effect.spring({
        grivity: 10 // 引力 (可以为负值)
    })
    // 效果作用对象(node节点以targetNode为目标，产生弹性效果)
    effect.addNode(nodeF, nodeT);
    // 播放
    effect.play();
}

/**
 * 连接两个节点
 */
TP.prototype.addLine = function(node){
    var before = this.beforeNode;
    this.currentNode.item.parent.push(before.id);
    this.createLine(before, this.currentNode, true);
}

/**
 * 先初始化，然后在画图
 */
TP.prototype.draw = function (){
    this.init();
    var item = this.items;
    if(!item){
        return;
    }
    this.drawNextNodes(item);
    this.drawLines();
}

/**
 * 循环画所有节点
 * @param item
 */
TP.prototype.drawNextNodes = function(item){
    var self = this;
    for(var i = 0;i<item.length;i++){
        var it = item[i];
        var currentNode = this.createNode(it.point.x, it.point.y, it.point.img, it.danger,it.msg,it.title);
        currentNode.item = it;
        self.nodeMap[it.id] = currentNode;
        if(self.maxNodeId<it.id){
            self.maxNodeId = it.id;
        }
    }
}

/**
 * 连接所有节点
 */
TP.prototype.drawLines = function(){
    var self = this;
    var nodes = this.nodeMap;
    for(key in nodes){
        var node = nodes[key];
        if(node.item.parent){
            $.each(node.item.parent,function(){
                var f = false;
                var before = self.nodeMap[this];
                if(node.item.danger|| before.item.danger){

                }
                self.createLine(before, node, true);

                if(!self.childsNodeMap[this]){
                    self.childsNodeMap[this] = new Array();
                }
                self.childsNodeMap[this].push(node);
            });
        }
    }
}

/**
 * 展示tip
 * @param event
 * @param msg
 */
TP.prototype.tip = function(event){
    var msg = this.currentNode.item.msg;
    var container = $("#tp-tip");
    var content = "<ul><li class='node-info'>节点信息</li>"
    for( key in msg){
        content+="<li>"+key+" : "+msg[key]+"</li>"
    }
    content += "</ul>";
    container.html(content)
    $("#tp-tip ul").css({
        "list-style": "none",
        "text-align": "left",
        margin: 0,
        padding: "0px 10px 30px 10px",
        "font-size": "14px"
    })
    $("#tp-tip .node-info").css({
        "text-align": "center",
        "line-height": "30px"
    })
    $("#tp-tip ul li").css({
        padding: "2px",
        "border-bottom": "1px solid #c5c5c5"
    })
    $("#tp-tip").css({
        top: event.pageY-100,
        left: event.pageX+10,
        padding: '0 10px',
    }).show();
}

/**
 * 隐藏tip
 */
TP.prototype.tipRemove = function(){
    var container = $("#tp-tip");
    container.html("")
    $("#tp-tip").hide();
}
/**
 * 展示编辑节点面板
 * @param event
 * @param msg
 */
TP.prototype.nodeEdit = function(event){
    var self = this;
    var msg = this.currentNode.item.msg;
    var title = this.currentNode.item.title;
    var selectOptionDefalut = [];
    var textAreaDefault = "";
    if(msg){
        for(key in msg){
            if(key&&msg[key]){
                textAreaDefault += key + ":" + msg[key]+"\n";
                if(title === key){
                    selectOptionDefalut.push("<option selected value='"+key+"'>"+key+"</option>")
                }else{
                    selectOptionDefalut.push("<option value='"+key+"'>"+key+"</option>")
                }
            }
        }
    }
    var container = $("#tp-node-edit");
    var editContent = "<table>";
    editContent += "<tr><td>信息</td><td><textarea name='info' rows=3 cols=20>"+textAreaDefault+"</textarea></td></tr>";
    editContent += "<tr><td></td><td class='red'>每行算作一条信息,由key:value组成 例： ip:10.0.0.0</td></tr>";
    editContent += "<tr><td>显示名称</td><td><select>"+selectOptionDefalut+"</select></td></tr>";
    editContent += "</table>";
    container.html("<div class='title'>编辑节点信息</div><div class='content'>"+editContent+"</div><div class='okBtn'><button class='saveNodeInfo'>保存</button><button class='closeNodeInfo'>关闭</button></div>")
    $("#tp-node-edit .title").css({
        "text-align": "center",
        "font-size": "14px",
        "height": "40px",
        padding: "10px"
    })
    $("#tp-node-edit .content").css({

    })
    $("#tp-node-edit .content").css({
        "font-size": "10px"
    })
    $("#tp-node-edit .content select").css({
        width:"100px"
    })
    $("#tp-node-edit .content textarea").css({
        "width": "400px",
        "height": "100px"
    }).blur(function(){
        var jsonVal = {};
        var selectOption = [];
        var val = $(this).val();
        var valueLines = val.split("\n");
        $.each(valueLines,function(){
            var line = this.split(":");
            selectOption.push("<option value='"+line[0]+"'>"+line[0]+"</option>")
            jsonVal[line[0]] = line[1];
        })
        $("#tp-node-edit .content select").html(selectOption);
    })
    $("#tp-node-edit .content .red").css({
        color: "red",
        "font-size": "10px"
    })
    $("#tp-node-edit .okBtn").css({
        padding: "10px",
        position:"absolute",
        right:0,
        bottom:0
    })
    $("#tp-node-edit .okBtn .saveNodeInfo").click(function(){
        console.log("save")
        var info = $("#tp-node-edit .content textarea").val();
        var title = $("#tp-node-edit .content select").val();
        var infoJson = {};
        $.each(info.split("\n"),function(){
            if(this&&this.length>0){
                var kv = this.split(":");
                infoJson[kv[0]] = kv[1];
            }
        })
        if(infoJson && title && infoJson[title]){
            self.currentNode.item.msg = infoJson;
            self.currentNode.item.title = title;
            self.currentNode.text = infoJson[title];
            self.nodeEditRemove();
        }else{
            alert("保存信息错误");
        }
        self.change = true;
    })
    $("#tp-node-edit .okBtn .closeNodeInfo").click(function(){
        self.nodeEditRemove();
    })
    $("#tp-node-edit button").css({
        border: 0,
        padding: "5px 20px",
        background: "#607D8B",
        "font-size": "10px",
        "border-radius":"3px",
        color: "#e4e4e4",
        "margin-right": "5px"
    });
    $("#tp-node-edit button").mouseover(function(){
        $(this).css({
            "background": "#795548",
            cursor: "pointer"
        });
    }).mouseout(function(){
        $(this).css({
            "background": "#607D8B"
        });
    })
    $("#tp-node-edit").css({
        top: self.height/2-150,
        left: self.width/2-250,
        padding: '0 10px',
    }).show();
}

/**
 * 隐藏节点编辑面板
 */
TP.prototype.nodeEditRemove = function(){
    var container = $("#tp-node-edit");
    container.html("");
    container.hide();
}

/**
 * 删除一个节点
 */
TP.prototype.removeNode = function(node){
    var self = this;
    this.scene.remove(node);
    delete this.nodeMap[node.item.id];
    $.each(self.childsNodeMap[node.item.id],function(){
        this.item.parent.removeByValue(node.item.id);
    })
}
/**
 * 删除当前选中节点
 */
TP.prototype.removeCurrentNode = function(){
    this.removeNode(this.currentNode)
}

/**
 * 展示右键菜单
 * @param event
 * @param msg
 */
TP.prototype.rightClick = function(event){
    $("#tp-node-right-click").css({
        top: event.pageY,
        left: event.pageX,
    }).show();
}

/**
 * 隐藏右键菜单
 * @param event
 * @param msg
 */
TP.prototype.rightClickRemove = function(){
    $("#tp-node-right-click").hide();
}

/**
 * 展示节点类型菜单
 * @param event
 * @param msg
 */
TP.prototype.nodeType = function(event){
    $("#tp-node-type").css({
        top: 10,
        left: this.canvas.width()/2-100,
    }).show();
}

/**
 * 隐藏节点类型菜单
 * @param event
 * @param msg
 */
TP.prototype.nodeTypeRemove = function(){
    $("#tp-node-type").hide();
}

/**
 * 改变画布大小
 * @param width
 * @param height
 */
TP.prototype.reSize = function(width,height){
    this.width = width;
    this.height = height;
    this.option.width = width;
    this.option.height = height;
    this.destory();
    this.draw();
}

/**
 * 销毁画布
 */
TP.prototype.destory = function(){
    $("#tp-canvas").remove()
    $("#tp-tmp").remove()
}

/**
 * 导出数据
 */
TP.prototype.export = function(){
    var data = [];
    for(key in this.nodeMap){
        data.push(this.nodeMap[key].item)
    }
    this.change = false;
    return data;
}
Array.prototype.removeByValue = function(val) {
    for(var i=0; i<this.length; i++) {
        if(this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
}