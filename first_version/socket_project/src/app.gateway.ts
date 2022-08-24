import { ConsoleLogger, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';



var c_id = [];

var match_id_counter = 0;

var room_user_counter = 0;

const struct_match_id = [];

var struct_id = 0;

const ball = {
  x : 300,
  y : 200,
  radius: 10,
}

const user_left = {
  x : 0,
  y : 200 - 50,
  width : 10,
  height : 100,
}

const user_right = {
  x : 590,
  y : 200 - 50,
  width : 10,
  height : 100,
}

function collision(b,p){

  // console.log("ball_Y---->" + b.y);
  // console.log("player_Y---->" + p.y);

  var _p = {
    top : 0,
    bottom : 0,
    left : 0,
    right : 0,
  };

  _p.top = p.y;
  _p.bottom = p.y + p.height;
  _p.left = p.x;
  _p.right = p.x + p.width;

  // console.log("top_p->" + _p.top + "bottom_p->" + _p.bottom + "left_p->" + _p.left + "right_p->" + _p.right);
  
  var _b = {
    top : 0,
    bottom : 0,
    left : 0,
    right : 0,
  };

  _b.top = b.y - b.radius;
  _b.bottom = b.y + b.radius;
  _b.left = b.x - b.radius;
  _b.right = b.x + b.radius;

  // console.log("top_b->" + _b.top + "bottom_b->" + _b.bottom + "left_b->" + _b.left + "right_b->" + _b.right);
  
  return _p.left < _b.right && _p.top < _b.bottom && _p.right > _b.left && _p.bottom > _b.top;
}


@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('AppGateway');
  
  afterInit(server: Server) {
    this.logger.log('Initialized!')
  }
  

  
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnect: ${client.id}`);
    for(var i = 0; i < c_id.length; i++) {
      if(c_id[i][0] == client.id) {
        clearInterval(c_id[i][2]);
        c_id.splice(i, 1);
      }
    }
    console.log(c_id);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  // queue_control = new Promise((resolve, reject) => {});
  // setTimeout(() => {resolve("foo");}, 5000);
  // this.sleep(1000).then(() => { });


  // queue_control(id) {
  //   this.wss.emit('msgToClient', "InQueue");
  //   if (c_id.length % 2 != 1) {
  //     this.wss.emit('msgToClient', "InQueue");
  //   };
  // }
  //   let x = 0;

  // this.sleep(1000).then(() => {
  // //   if (c_id.length % 2 == 1) {
  // //     this.wss.emit('msgToClient', "InQueue");
  // //   } else {
  // //     myResolve("OK");
  // //   }
  //   });
  // });


    // if (x == 0) {
    //   myResolve("OK");
    // } else {
    //   myReject("Error");
    // }
  



  // queue_control(): Promise<any> {
  //   console.log(c_id.length);
  //   return this.sleep(1000).then(() => {
  //     if (c_id.length % 2 == 1) {
  //       this.wss.emit('msgToClient', "InQueue");
  //       this.queue_control();
  //     }
  //     else {
  //       return new Promise(resolve => resolve);
  //     }
  //   });
    
  // }
  

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connect: ${client.id}`);
    
    c_id.push([client.id, 0, 0]);
    if (c_id.length % 2 == 1) {
      this.wss.to(client.id).emit('status', [1,0]);
    }
    else {
      
      console.log(c_id.length);
      this.wss.to(c_id[c_id.length-1][0]).emit('status', [2,0]);
      this.wss.to(c_id[c_id.length-2][0]).emit('status', [2,1]);
      match_id_counter++;
      console.log(c_id);
      console.log("match_id_counter---" + match_id_counter);
    }


    


    // c_id.push([client.id, 0]);
    // var intervalID: NodeJS.Timer ;
    // intervalID = setInterval(this.queue_control,1000);
    // while(c_id[0][0] = 1)
    // console.log(c_id[0][0]);


    // this.queue_control.then((ret_value) => {
    //   if(ret_value == "ok")
    //     console.log("game starting");
    // });

  }


  reset_ball(struct_id: number) {
    struct_match_id[struct_id].ball_x = 300;
    struct_match_id[struct_id].ball_y = 200;
    struct_match_id[struct_id].user_left_y = 300;
    struct_match_id[struct_id].user_left_x = 300;
    struct_match_id[struct_id].velocity_X = 5.00;
    struct_match_id[struct_id].velocity_Y = 5.00;
    struct_match_id[struct_id].speed = 5;
  }

  

  
  computationFunction = (id: string, struct_id:number) => {

    //score making
    if( struct_match_id[struct_id].ball_x  + struct_match_id[struct_id].radius < 0 ){
      struct_match_id[struct_id].user_right_score++;
      this.reset_ball(struct_id);
    }else if( struct_match_id[struct_id].ball_x  + struct_match_id[struct_id].radius > 600){
      struct_match_id[struct_id].user_left_score++;
      this.reset_ball(struct_id);
    }
    
    // console.log("velocity X--->" + struct_match_id[struct_id].velocity_X + "velocity Y--->" + struct_match_id[struct_id].velocity_Y);
    struct_match_id[struct_id].ball_x += struct_match_id[struct_id].velocity_X;
    struct_match_id[struct_id].ball_y += struct_match_id[struct_id].velocity_Y;


    //ball collision detection
    if(struct_match_id[struct_id].ball_y + struct_match_id[struct_id].radius > 400 || struct_match_id[struct_id].ball_y - struct_match_id[struct_id].radius < 0) {
      struct_match_id[struct_id].velocity_Y = -struct_match_id[struct_id].velocity_Y;
    }


    user_left.y = struct_match_id[struct_id].user_left_y;
    user_right.y = struct_match_id[struct_id].user_right_y;

    let player = (struct_match_id[struct_id].ball_x + struct_match_id[struct_id].radius < 200) ? user_left : user_right;

    ball.x = struct_match_id[struct_id].ball_x;
    ball.y = struct_match_id[struct_id].ball_y;

    // console.log(this.collision(ball, player));
    if(collision(ball, player)) {
      let collidePoint = (ball.y - (player.y + player.height/2));
      collidePoint = collidePoint / (player.height/2);
      let angleRad = (Math.PI/4) * collidePoint;
      let direction = (ball.x + struct_match_id[struct_id].radius < 300) ? 1 : -1;
      struct_match_id[struct_id].velocity_X = direction * struct_match_id[struct_id].speed * Math.cos(angleRad);
      struct_match_id[struct_id].velocity_Y = struct_match_id[struct_id].speed * Math.sin(angleRad);
      struct_match_id[struct_id].speed += 0.1;
    }


    // var random_angle = Math.floor(Math.random() * 360).toString();
    this.wss.to(id).emit('game', struct_match_id[struct_id]);
    // console.log(id);
  };

  
  @SubscribeMessage('user_move')
  userMouseMovementHandle(client: Socket, side: string): void {   //WsResponse<string>
    if(side[0] == "left")
      struct_match_id[side[2]].user_left_y = side[1];
    else if(side[0] == "right")
      struct_match_id[side[2]].user_right_y = side[1];
  }

  @SubscribeMessage('room-join')
  handleMeassage(client: Socket, text: string): void {   //WsResponse<string>

    var match_room_id = match_id_counter.toString();
    var intervalId: NodeJS.Timer;

    
    var found = c_id.find(element => element[0] == client.id);
    
    client.join(match_room_id);
    found[1] = match_id_counter;
    
    room_user_counter++;
    console.log("room_user_counter--->" + room_user_counter);
    if(room_user_counter == 2) {

      struct_match_id.push({
        ball_x:300,
        ball_y:200,
        radius: 10,
        speed: 5,
        velocity_X: 5.00,
        velocity_Y: 5.00,
        user_left_y : 200,
        user_right_y : 200,
        user_left_score : 0,
        user_right_score : 0,
      });
      console.log("struct_match_id length--->" + (struct_match_id.length-1).toString());
      
      intervalId = setInterval(this.computationFunction, 1000/24, match_room_id, struct_match_id.length-1);
      this.wss.to(match_room_id).emit('init_id', struct_match_id.length-1);
      var found = c_id.find(element => element[0] == client.id);
      found[2] = intervalId;

      found = c_id.find(element => element[1] == match_id_counter);
      found[2] = intervalId;

      room_user_counter = 0;

      // console.log(c_id);
    }
    
    
    

    console.log(text);

    
    

    // setInterval(function() {
    //   this.wss.to("1").emit('msgToClient', "test1");
    // },1000);

    // this.logger.log(`message receieved: ${text}`)
    // this.wss.emit('msgToClient', `yourid: ${client.id}`);
    // var i = 0;
    
    }


  }
