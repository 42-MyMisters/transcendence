import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';


@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // private userSocket: Map<number, Socket>
  private gameQueue: Socket[];
  private tmp: number;
  private gameId: number;
  
  constructor(
    private userService: UserService,
		private authService: AuthService,
    private gameService: GameService,
	) {
    this.gameQueue = [];
    this.tmp = 0;
    this.gameId = 0;
    // Queue loop
    setInterval(() => {
      while (this.gameQueue.length > 1) {
        const p1 = this.gameQueue.pop();
        const p2 = this.gameQueue.pop();
        if (p1 !== undefined && p2 !== undefined) {
          p1.join(this.gameId.toString());
          p2.join(this.gameId.toString());
          p1.data.rooms = p1.rooms;
          p2.data.rooms = p2.rooms;
          console.log(`${p1.id}: joined ${this.gameId.toString()}, rooms: ${[...p1.rooms]}`);
          console.log(`${p2.id}: joined ${this.gameId.toString()}, rooms: ${[...p2.rooms]}`);
          this.gameService.createGame(this.gameId.toString(), this.server, p1.id, p2.id);
          this.gameService.getGame((this.gameId++).toString())?.gameStart();
        }
      }
      this.logger.log('game queue loop');
    }, 5000)
  }

  logger = new Logger('GameGateway');
  
  @WebSocketServer()
  server: Namespace;

  afterInit(server: any) {
    // WebSocket 서버 초기화 작업
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`${socket.id} socket connected.`);
      socket.data.uid = this.tmp;
      this.tmp++;
      const uid = await this.authService.jwtVerify(socket.handshake.auth.token)
      const user = await this.userService.getUserByUid(uid);
      if (this.userService.isUserExist(user)) {
        socket.data.user = user;
      } else {
        // TODO: throw check.
        throw new UnauthorizedException("User not found.");
      }
      if (socket.handshake.auth.data === undefined) {
        this.gameQueue.push(socket);
      } else {
        // for observer
        if (this.gameService.getGame(socket.handshake.auth.data) !== undefined) {
          socket.join(socket.handshake.auth.data);
        } else {
          this.logger.log(`Invalid room number.`);
          socket.disconnect();
        }
      }
    } catch(e) {
      this.logger.log(`${socket.id} invalid connection. disconnect socket.`);
      socket.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(`${socket.id}: rooms: ${[...socket.data.rooms][1]}`);
    const cur_game = this.gameService.getGame([...socket.data.rooms][1]);
    if (cur_game === undefined) {
      this.logger.log(`${socket.id} invalid socket connection disconnected.`);
    } else if (cur_game.isPlayer(socket.id) === true) {
      cur_game.playerLeft(socket.id);
      this.logger.log(`${socket.id} player left.`);
    } else {
      this.logger.log(`${socket.id} observer left.`);
    }
  }

  @SubscribeMessage('status')
  async status(socket: Socket, payload: any) {
    console.log(socket.rooms);
    console.log(payload);
  }
  // @SubscribeMessage('startGame')
  // async startGame(client: any, payload: any) {
  //   this.gameService.createGame(payload.id);
  // }

  // @SubscribeMessage('joinGame')
  // async joinGame(client: any, payload: any) {
  //   this.gameService.getGame(payload.id);

  // }
}
