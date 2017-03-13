/**
 *如果想要再次自定义,方法如下:
 * 粒子线数量:修改制造粒子数据for循环i的最大值
 * 粒子线长度:修改drawLine方法中定义的max值
 * 建议:想要比较好的效果,记住:粒子数量越多,粒子线要越短,否则就会比较卡
 */

(function(){
    //1.创建canvas标签插入
    var body = document.getElementsByTagName('body')[0];
    var canvas = document.createElement('canvas');
    body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    //2.设置canvas标签css
    canvas.style.position = 'fixed';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.zIndex = '-1';
    //3.定义粒子数组,粒子位置的x/y,粒子运动趋势值xA/yA,随机的颜色值;
    var particleArr,x= 0,y= 0,xA= 0,yA= 0,rgb1,rgb2,rgb3;
    //4.当屏幕尺寸发生变化时,重新调整画布大小以及粒子对象数组
    function resize(){
        particleArr = [];
        canvas.width = window.innerWidth;
        //减一是为了避免鼠标从窗口下方移出时,鼠标比较慢,造成mouseout没有生效,具体原因未知.
        canvas.height = window.innerHeight-1;
        //生成粒子对象位置和移动趋势值,放进数组
        for(var i = 0;i<150 ;i++){
            rgb1 = parseInt(Math.random() * 100 + 155);
            rgb2 = parseInt(Math.random() * 100 + 155);
            rgb3 = parseInt(Math.random() * 100 + 155);
            x = Math.random()*canvas.width ;
            y = Math.random()*canvas.height ;
            //有正数也有负数,-1到1之间,不能为0;
            xA = (Math.random()-0.5)*1.5 != 0 ? (Math.random()-0.5)*1.5 : 0.5;
            yA = (Math.random()-0.5)*1.5 != 0 ? (Math.random()-0.5)*1.5 : 0.5;
            particleArr.push({x,y,xA,yA,rgb1,rgb2,rgb3});
        }
    }
    resize();
    //5.监听屏幕尺寸变化
    window.onresize = function(){
        resize();
    };
    //6.设置requestAnimationFrame
    var RAF = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
    //7监听鼠标位置
    var mouseLoc ={x:null,y:null};
    window.onmousemove = function(e){
        e = e || window.event;
        mouseLoc.x = e.clientX;
        mouseLoc.y = e.clientY;
    };
    window.onmouseout = function(){
        mouseLoc.x = null;
        mouseLoc.y = null;
    };

    //8.绘制粒子线效果
    function particleLine(){
        //8.1先清屏,然后绘制粒子线效果
        ctx.clearRect(0,0,canvas.width,canvas.height);
        //8.2调用粒子线方法,传入粒子对象数组和鼠标对象连接后的副本数组
        drawLine([mouseLoc].concat(particleArr));
        //8.3调用RAF
        RAF(particleLine);
    }
    particleLine();


    /**
     * 粒子线绘制方法,传入值为鼠标对象及粒子对象相连接后的副本数组,用concat方法
     * @param allArr [Array]
     */
    function drawLine(allArr){
        //1.定义常量: 粒子线长度最大值max,两个粒子间X方向距离disX;
        //2.定义常量: 两个粒子间Y方向距离disY,两个粒子间直线距离dis,线宽值lineW;
        var max = 90,disX = 0, disY = 0, dis = 0, lineW = 0;
        ///3.遍历粒子数组,然后用每一个粒子对象和粒子数组内其他粒子逐一进行对比距离,然后绘制粒子线
        particleArr.forEach(function(item){
            //4.调用粒子绘制方法
            particle(item);
            //5.再次循环,逐一对比
            for(var i = 0;i< allArr.length ;i++){
                //6.求出两个粒子之间的X和Y方向的距离值
                disX = item.x-allArr[i].x;
                disY = item.y-allArr[i].y;
                //7.判断,减少运算量,提高性能 :
                // 7.1循环对象是否是需要做对比的粒子本身;
                // 7.2 X 和 Y方向的距离值(用绝对值函数来取正数)是否大于粒子线长度最大值max;
                // 7.3 后两个是为了防止鼠标未进入或者移出时画的多余的线
                if(allArr[i] === item || Math.abs(disX)>max || Math.abs(disY)>max || allArr[i].x == null || allArr[i].y == null) continue;
                //8.求出两个粒子之间的直线距离
                dis = disX * disX + disY * disY;
                //9.如果距离大于设定的最大值,跳出循环,最大值自乘原因为勾股定理
                if(dis > max*max) continue;
                //10.设置线宽值,使其随距离变化,距离越近,线越粗,越远越细
                lineW = 1-dis/10000;
                //11.判断如果当前循环对象是鼠标,那么让上一个循环所做对比的粒子向鼠标点靠近,所以就有了吸附跟随效果
                if(allArr[i] === mouseLoc){
                    item.x -= max/35 *(disX>0? 1 : -1);
                    item.y -= max/35 *(disY>0? 1 : -1);
                }
                //12.绘制线段
                ctx.beginPath();
                ctx.lineWidth = lineW*0.8;
                ctx.strokeStyle = 'rgba('+item.rgb1+','+item.rgb2+','+item.rgb3+',1)';
                ctx.moveTo(item.x,item.y);
                ctx.lineTo(allArr[i].x,allArr[i].y);
                ctx.stroke();
            }
            //13.每次对比完,将该粒子删除,提高性能
            allArr.splice(allArr.indexOf(item),1);
        })
    }

    /**
     * 粒子运动方法,传入数组中的每个数据
     * @param dot [Object]
     */
    function particle(dot){
        //每次绘制的X/Y点位置加上运动趋势值
        dot.x += dot.xA;
        dot.y += dot.yA;
        //判断如果到屏幕边缘,让其反弹
        dot.xA *= dot.x >= canvas.width || dot.x <= 0 ? -1 : 1 ;
        dot.yA *= dot.y >= canvas.height || dot.y <= 0 ? -1 : 1 ;
        ctx.fillStyle = 'rgba('+dot.rgb1+','+dot.rgb2+','+dot.rgb3+',1)';
        ctx.fillRect(dot.x,dot.y,0.5,0.5)
    }
})();