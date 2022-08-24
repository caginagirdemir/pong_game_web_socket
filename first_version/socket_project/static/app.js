import {drawText, drawRect, drawCircle, drawText_2} from "./intro_page.js"

var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

var x = 200;
var y = 200;
var dx = 4;
var dy = 4;
var radius = 30;

const img = new Image();
img.src = './42_istanbul_image.png';
img.onload = () => {
    c.drawImage(img, 40, 50);
}; 

function static_page() {
    c.drawImage(img, 40, 50);
    drawText("Kurtlar Konseyi", 40, 200, 'black', c, "bold 30"); drawText("Present", 270, 200, 'black', c, "30");
    drawText("Server Status:", 40, 250, 'black', c , "18");
    drawText("Connected", 170, 250, 'green', c, "18");
    drawText("Id:", 40, 300, 'black', c); drawText(socket.id, 60, 300, 'black', c);
    drawText("Game Status:", 40, 350, 'black', c);
}
drawText("Connecting...", 170, 250, 'black', c, "18");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    c.clearRect(0, 0, 600, 400);
    static_page();
    
    
    
    console.log(socket.id); // "G5p5..."
});

const net = {
    x : (600 - 2)/2,
    y : 0,
    height : 10,
    width : 2,
    color : "white"
}

const ball = {
    x : 300,
    y : 200,
    radius : 10,
    speed : 5,
    velocityX : 5,
    velocityY : 5,
    color : 'white'
}

const user = {
    x : 0,
    y : 200 - 50,
    width : 10,
    height : 100,
    color : "white",
    score : 0,
    user_side : "",
    struct_match_id : -1,
}

var game_Start_flag = 0;

canvas.addEventListener("mousemove", getMousePos);

function getMousePos(evt){
    if(game_Start_flag) {
        let rect = canvas.getBoundingClientRect();
        user.y = evt.clientY - rect.top - user.height/2;
        socket.emit('user_move', user.user_side, user.y, user.struct_match_id);
    }
}

function drawNet(){
    for(let i = 0; i <= canvas.height; i+=15){
        drawRect(net.x, net.y + i, net.width, net.height, net.color, c);
    }
}

const render = (msg) => {
    drawRect(0,0,canvas.width,canvas.height,"black",c);
    drawCircle(msg.ball_x, msg.ball_y, msg.radius, ball.color, c);
    drawRect(0, msg.user_left_y, user.width, user.height, user.color, c);
    drawRect(590, msg.user_right_y, user.width, user.height, user.color, c);
    drawText_2(msg.user_left_score.toString(),canvas.width/4,canvas.height/5, 'white',c, "75px fantasy");
    drawText_2(msg.user_right_score.toString(),3*canvas.width/4,canvas.height/5, 'white',c, "75px fantasy");
    drawNet();
    // drawCircle(10,10,10,'white',c);
    console.log(msg);
}

const init = (msg) => {
    user.struct_match_id = msg;
    socket.on("game", render);
    socket.off("status");
    socket.off("init_id");
}

socket.on('status', (status_id) => {
    if(status_id[0] == "1") {
        drawText("InQueue", 160, 350, 'black', c);
    } else if(status_id[0] == "2") 
    {
        c.clearRect(0, 0, 600, 400);
        static_page();
        drawText("directing....", 150, 350, 'black', c);
        socket.emit('room-join', "join_test");
        if(status_id[1]) {
            user.user_side = "left";
        } else {
            user.user_side = "right";
            user.x = 590;
        }
        user.struct_match_id = status_id[1];

        game_Start_flag = 1;

        socket.on("init_id", init);
    }

    
    
    // console.log(`recv: ${status}`);
});
