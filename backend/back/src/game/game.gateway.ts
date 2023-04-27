import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { GameService } from './game.service';


@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // private userSocket: Map<number, Socket>
  private gameQueue: Socket[];
  private tmp: number;
  private gameId: number;
  constructor(
    // private userService: UserService,
		private authService: AuthService,
    private gameService: GameService,
    // private gameQueue: Map<number, number[]>,
	) {
    // this.gameQueue = new Map<number, number[]>()
    this.gameQueue = [];
    this.tmp = 0;
    this.gameId = 0;
    setInterval(() => {
      while (this.gameQueue.length > 1) {
        const p1 = this.gameQueue.pop();
        const p2 = this.gameQueue.pop();
        if (p1 !== undefined && p2 !== undefined) {
          this.gameService.createGame(this.gameId++, p1, p2);
          this.gameService.getGame(this.gameId - 1)?.gameStart();
          // const p1 = userSocket.get(p1uid);
          // const p2 = userSocket.get(p2uid);
          // if (p1 !== undefined && p2 !== undefined) {
          // }
        }
      }
      this.logger.log('game loop');
    }, 5000)
  }

  logger = new Logger('GameGateway');
  
  @WebSocketServer() server;

  afterInit(server: any) {
    // WebSocket 서버 초기화 작업
  }


  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`${socket.id} socket connected.`);
      socket.data.uid = this.tmp;
      this.tmp++;
      // const uid = await this.authService.jwtVerify(socket.handshake.auth.token)
      // const user = await this.userService.getUserByUid(uid);
      // if (this.userService.isUserExist(user)) {
      //   socket.data.user = user;
      // } else {
      //   throw new UnauthorizedException("User not found.");
      // }
      this.gameQueue.push(socket);
    } catch(e) {
      this.logger.log(`${socket.id} invalid connection. disconnect socket.`);
      socket.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} socket disconnected`);
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
