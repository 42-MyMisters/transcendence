import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GameStatus, GameType } from './game.enum';
import { GameService } from './game.service';


@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // private userSocket: Map<number, Socket>
  private gamePool: Map<number, Socket[]>;
  private gameId: number;
  private userInGame: Map<number, string>;
  constructor(
    private userService: UserService,
		private authService: AuthService,
    private gameService: GameService,
	) {
    this.gamePool = new Map<number, Socket[]>();
    this.gameId = 0;
    // Queue loop
    setInterval(this.gameMatchLogic.bind(this), 3000);
  }
  
  gameMatchLogic() {
    // while (this.gamePool.length > 1) {
    //   const p1 = this.gamePool.pop();
    //   const p2 = this.gamePool.pop();
    //   if (p1 !== undefined && p2 !== undefined) {
    //     const gameId = this.gameId.toString();
    //     this.gameId++;
    //     p1.join(gameId);
    //     p2.join(gameId);
    //     p1.data.room = gameId;
    //     p2.data.room = gameId;
    //     this.server.to(gameId).emit('join-game', {p1: p1.data.uid, p2: p2.data.uid});
    //     console.log(`${p1.id}: joined ${gameId}, rooms: ${[...p1.rooms]}`);
    //     console.log(`${p2.id}: joined ${gameId}, rooms: ${[...p2.rooms]}`);
    //     this.gameService.publicGame(gameId, this.server, p1.data.uid, p2.data.uid);
    //     this.gameService.getGame(gameId)?.gameStart();
    //     // this.server.to(gameId).emit("gameStart", true);
    //     // this.gameService.gameStart(gameId);
    //   }
    // }
    const gameId = this.gameId.toString();
    this.gameId++;
    this.logger.log('game queue loop');
  }
  
  logger = new Logger('GameGateway');
  
  @WebSocketServer()
  server: Namespace;
  
  afterInit(server: any) {
    // WebSocket 서버 초기화 작업
  }

  // socket.handshake.auth: token(token for auth), data(uid for observing), type(gameType)
  // socket.data: uid(socket uid), elo(user elo score), queueStack(for matching stack)
  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      socket.data.uid = await this.authService.jwtVerify(socket.handshake.auth.token);
      const user = await this.userService.getUserByUid(socket.data.uid);
      if (!socket.connected) {
        throw new UnauthorizedException("already disconnected.");
      }
      socket.data.elo = user!.elo;
      const userInGame = this.userInGame.get(socket.data.uid);
      if (userInGame === undefined) {
        if (socket.handshake.auth.data === undefined) {
          socket.emit("isLoading", true);
          if (socket.handshake.auth.type === GameType.PRIVATE) {
            socket.emit("isPrivate", true);
          } else {
            socket.data.queueStack = 0;
            const eloList = this.gamePool.get(socket.data.elo);
            if (eloList !== undefined) {
              eloList.push(socket);
            } else {
              this.gamePool.set(socket.data.elo, [socket]);
            }
            // this.gameQueue.push(socket.data.elo, socket);
          }
        } else { // for observer
          const gameId = this.userInGame.get(socket.handshake.auth.data);
          // observer join
          if (gameId !== undefined && this.gameService.gameState(gameId) < GameStatus.FINISHED) {
            socket.emit("observer");
            socket.join(gameId);
          } else {
            console.log("Already finished. Disconnect socket.");
            throw new UnauthorizedException("already finished");
          }
        }
      } else {
        console.log("Reconnected.");
        socket.join(userInGame);
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
    } else {
      const eloList = this.gamePool.get(socket.data.elo);
      if (eloList !== undefined) {
        if (eloList.length !== 1) {
          this.gamePool.set(socket.data.elo, eloList.filter((sock) => {return sock !== socket}));
        } else {
          this.gamePool.delete(socket.data.elo);
        }
      } else {
        // already matched?
        const game = this.userInGame.get(socket.data.uid);
        if (game !== undefined) {
          this.logger.log('already matched');
        } else {
          this.logger.log('invalid user access');
        }         
      }
    }
    this.logger.log(`${socket.data.uid} disconnected.`);
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

  @SubscribeMessage('modeSelect')
  async modeSelect(socket: Socket, payload: any) {

    this.gameService.getGame(payload.id);
  }

  @SubscribeMessage('ping')
  async pong() {
    return Date.now();
  }


}
