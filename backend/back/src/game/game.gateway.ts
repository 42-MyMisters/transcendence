import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GameType } from './game.enum';
import { GameService } from './game.service';


@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // private userSocket: Map<number, Socket>
  private gameQueue: Socket[];
  private gameId: number;
  private userInGame: Map<number, string>;
  constructor(
    private userService: UserService,
		private authService: AuthService,
    private gameService: GameService,
	) {
    this.gameQueue = [];
    this.gameId = 0;
    // Queue loop
    setInterval(() => {
      while (this.gameQueue.length > 1) {
        const p1 = this.gameQueue.pop();
        const p2 = this.gameQueue.pop();
        if (p1 !== undefined && p2 !== undefined) {
          const gameId = this.gameId.toString();
          this.gameId++;
          p1.join(gameId);
          p2.join(gameId);
          p1.data.room = gameId;
          p2.data.room = gameId;
          this.server.to(gameId).emit('join-game', {p1: p1.data.uid, p2: p2.data.uid});
          console.log(`${p1.id}: joined ${gameId}, rooms: ${[...p1.rooms]}`);
          console.log(`${p2.id}: joined ${gameId}, rooms: ${[...p2.rooms]}`);
          this.gameService.publicGame(gameId, this.server, p1.data.uid, p2.data.uid);
          this.gameService.getGame(gameId)?.gameStart();
          // this.gameService.gameStart(gameId);
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
      socket.data.uid = await this.authService.jwtVerify(socket.handshake.auth.token);
      // socket.data.elo = await this.userService.getUserByUid(socket.data.uid);
      if (socket.handshake.auth.data === undefined) {
        if (socket.handshake.auth.type === GameType.PRIVATE) {
          socket.emit("isLoading", true);
        } else {
          this.gameQueue.push(socket);
          socket.emit("isQueue", true);
        }
        // this.userInGame.add(socket.data.uid);
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
      this.logger.log(`${socket.data.uid} invalid connection. disconnect socket.`);
      socket.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    if (socket.data.room !== undefined) {
      const cur_game = this.gameService.getGame(socket.data.room);
      if (cur_game === undefined) {
        this.logger.log(`${socket.data.uid} invalid socket connection disconnected.`);
      } else if (cur_game.isPlayer(socket.data.uid)) {
        cur_game.playerLeft(socket.data.uid);
        this.logger.log(`${socket.data.uid} player left.`);
      } else {
        this.logger.log(`${socket.data.uid} observer left.`);
      }
    }
    // if (socket.data.uid) {
    //   this.userInGame.delete(socket.data.uid);
    // }
    this.logger.log(`${socket.data.uid} join game failed.`);
  }

  @SubscribeMessage('status')
  async status(socket: Socket, payload: any) {
    console.log(socket.rooms);
    console.log(payload);
  }

  @SubscribeMessage('upPress')
  async upPress(socket: Socket, payload: any) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.uid)) {
        curGame.upPress(socket.data.uid);
      }
    }
  }
  
  @SubscribeMessage('downPress')
  async downPress(socket: Socket, payload: any) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.uid)) {
        curGame.downPress(socket.data.uid);
      }
    }
  }
  
  @SubscribeMessage('upRelease')
  async upRelease(socket: Socket, payload: any) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.uid)) {
        curGame.upRelease(socket.data.uid);
      }
    }
  }
  
  @SubscribeMessage('downRelease')
  async downRelease(socket: Socket, payload: any) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.uid)) {
        curGame.downRelease(socket.data.uid);
      }
    }
  }

  @SubscribeMessage('inviteGame')
  async inviteGame(socket: Socket, payload: any) {
    this.gameService.getGame(payload.id);
  }

  @SubscribeMessage('ping')
  async pong(socket: Socket, payload: any) {
    return true;
  }


}
