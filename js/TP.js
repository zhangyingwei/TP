/**
 * 拓扑图组件
 * 依赖jquery
 * @param option
 * @constructor
 * @author zhangyignwei
 */
function TP(option){
    this.option = option;
    this.nodeMap = {}
    this.el = $(option.el);
    this.width = option.width;
    this.height = option.height;
    this.background = option.background;
    this.items = option.item;
    this.store = {}
    this.iconMap = {"0": "./icon/fhq.png",
        "1": "./icon/fileserver.png",
        "2": "./icon/fw.png",
        "3": "./icon/fwq.png",
        "4": "./icon/fzjh.png",
        "5": "./icon/jhj.png",
        "6": "./icon/khj.png",
        "7": "./icon/lykzq.png",
        "8": "./icon/lyq.png",
        "9": "./icon/webfwq.png",
        "10": "./icon/wljhj.png",
        "11": "./icon/wllyq.png",
        "12": "./icon/wlzj.png",
        "13": "./icon/xnzj.png",
        "14": "./icon/yjfwq.png",
        "15": "./icon/yun.png"
    }
    this.drow();
}

/**
 * 初始化画布等对象
 */
TP.prototype.init = function(){
    var self = this;
	var width = this.width
	var height = this.height
	this.el.append("<canvas id='tp-canvas' width='"+width+"' height='"+height+"'></canvas>")
    this.canvas = $("#tp-canvas");
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
    }else{
        this.scene.backgroundColor = "rgb(187, 187, 187)";
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
    this.canvas.after("<div id='tp-tip'></div>")
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
    this.canvas.after("<div id='tp-node-edit'></div>")
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
    this.canvas.after("<div id='tp-node-right-click'>"+panel+"</div>");
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
            }else if(action === "2"){
                self.currentNode.selected = true;
                self.needLine = true;
                self.beforeNode = self.currentNode
            }else if (action === "3"){
                self.nodeEdit(event);
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
    this.canvas.after("<div id='tp-node-type'>"+panel+"<div class='clear'></div></div>");
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
    node.msg = msg;
    if(danger){
        node.alarm = danger;
    }
    this.scene.add(node);
    //点击事件
    node.addEventListener('click',function(){
        self.currentNode = this;
        console.log(this)
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
    return node;
}

/**
 * 在当前节点下添加一个新的节点
 */
TP.prototype.addNode = function(img){
    var before = this.currentNode;
    var nextNode = this.createNode(before.x+100,before.y+100,img,false,{a:"ninfo"},"a")
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
    if(f){
        link = new JTopo.FoldLink(nodeFrom, nodeTo);
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

/**
 * 连接两个节点
 */
TP.prototype.addLine = function(node){
    var before = this.beforeNode;
    this.createLine(before, this.currentNode, true);
}

/**
 * 先初始化，然后在画图
 */
TP.prototype.drow = function (){
    this.init();
    var item = this.items;
    if(!item){
        return;
    }
    this.drowNext(item)
}

/**
 * 递归画所有节点
 * @param item
 * @param before
 */
TP.prototype.drowNext = function(item,before){
    for(var i = 0;i<item.length;i++){
        var it = item[i]
        var currentNode = this.createNode(it.point.x*80, it.point.y*80, it.point.img, it.danger,it.msg,it.title);
        if(before){
            this.createLine(before, currentNode, true, it.danger);
        }
        if(it.item){
            this.drowNext(it.item,currentNode);
        }
    }
}

/**
 * 展示tip
 * @param event
 * @param msg
 */
TP.prototype.tip = function(event){
    var msg = this.currentNode.msg;
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
    var msg = this.currentNode.msg;
    var title = this.currentNode.title;
    var selectOptionDefalut = [];
    var textAreaDefault = "";
    if(msg){
        for(key in msg){
            textAreaDefault += key + ":" + msg[key]+"\n";
            if(title === key){
                selectOptionDefalut.push("<option selected value='"+key+"'>"+key+"</option>")
            }else{
                selectOptionDefalut.push("<option value='"+key+"'>"+key+"</option>")
            }
        }
    }
    var container = $("#tp-node-edit");
    var editContent = "<table>";
    editContent += "<tr><td>信息</td><td><textarea name='info' rows=3 cols=20>"+textAreaDefault+"</textarea></td></tr>";
    editContent += "<tr><td></td><td class='red'>每行算作一条信息,由key:value组成 例： ip:10.0.0.0</td></tr>";
    editContent += "<tr><td>显示名称</td><td><select>"+selectOptionDefalut+"</select></td></tr>";
    editContent += "</table>";
    container.html("<div class='title'>编辑节点信息</div><div class='content'>"+editContent+"</div><div class='okBtn'><button class='saveNodeInfo'>保存</button></div>")
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

    })
    $("#tp-node-edit button").css({
        border: 0,
        padding: "5px 20px",
        background: "#607D8B",
        "font-size": "10px",
        "border-radius":"3px",
        color: "#e4e4e4"
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
 * 隐藏tip
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
    this.scene.remove(node);
}
/**
 * 删除当前选中节点
 */
TP.prototype.removeCurrentNode = function(){
    console.log(this.currentNode);
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
 * 把所有节点数据缓存为一个map，方便数据导入导出
 * 主要是导出
 */
TP.prototype.bulidNodeMap = function(){
    var option = this.option;
    var map = {};
    var item = option.item;
    function readNext(its){
        $.each(its,function(){
            map[this.id] = this;
            if(this.item){
                readNext(this.item)
            }
        })
    }
    readNext(item)
    this.nodeMap = map;
}

/**
 * 动态规划节点位置
 */
TP.prototype.bulicLocation = function(){
    var location = new Array();
    var option = this.option;
    var item = option.item;
    function readNext(its,dep){
        if(!location[dep]){
            location[dep] = new Array();
        }
        $.each(its,function(){
            if(this.item){
                readNext(this.item,dep)
            }
        })
    }
    readNext(item,0)
}