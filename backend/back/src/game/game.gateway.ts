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
  private readyQueue: Socket[];
  private privatePool: Map<number, Socket>;
  private gameId: number;
  private userInGame: Map<number, string>;
  constructor(
    private userService: UserService,
		private authService: AuthService,
    private gameService: GameService,
	) {
    this.gamePool = new Map<number, Socket[]>();
    this.readyQueue = [];
    this.gameId = 0;
    this.userInGame = new Map<number, string>();
    // Queue loop
    setInterval(this.gameMatchLogic.bind(this), 5000);
  }
  
  logger = new Logger('GameGateway');
  
  @WebSocketServer()
  server: Namespace;
  
  afterInit(server: any) {
    // WebSocket 서버 초기화 작업
  }

  gameMatchLogic() {
    const curTime = Date.now();
    const putUserInGamePool = (curTime: number) => {
      if (this.readyQueue.length !== 0) {
        while (this.readyQueue.length && curTime - this.readyQueue[0].data.timestamp >= 5000) {
          const sock = this.readyQueue.shift()!;
          const eloAdj = Math.trunc(sock.data.elo / 5);
          const eloList = this.gamePool.get(eloAdj);
          if (eloList !== undefined) {
            eloList.push(sock);
          } else {
            this.gamePool.set(eloAdj, [sock]);
          }
        }
        this.gamePool = new Map<number, Socket[]>(Array.from(this.gamePool).sort((a, b) => a[0] - b[0]));
      }
    }
    // console.log(`readyQueue: ${this.readyQueue}`);
    // const tmp: {elo:number, range:number}[] = [];
    for (const [elo, socketList] of this.gamePool) {
      // quick match from the same tier pool.
      while (socketList.length > 1) {
        const sockA = socketList.shift()!;
        const sockB = socketList.shift()!;
        let p1: number, p2: number;
        if (sockA.data.elo <= sockB.data.elo) {
          p1 = sockA.data.uid;
          p2 = sockB.data.uid;
        } else {
          p1 = sockB.data.uid;
          p2 = sockA.data.uid;
        }
        const gameId = (this.gameId++).toString();
        this.userInGame.set(p1, gameId).set(p2, gameId);
        // this.joinRoom(sockB!, gameId);
        // this.joinRoom(sockA!, gameId);
        
        const joinRoom = [
          sockA.join(gameId),
          sockB.join(gameId),
        ];
        Promise.all(joinRoom);
        sockA.data.room = gameId;
        sockB.data.room = gameId;
        // sockA.join(gameId);
        // sockB.join(gameId);
        console.log(`${sockA.data.uid} joined room list ${JSON.stringify(sockA.rooms)}`);
        this.gameService.createGame(gameId, this.server, p1, p2, GameType.PUBLIC);
      }
      if (socketList.length) {
        // tmp.push({elo:elo, range:Math.trunc(socketList[0].data.time / 5)});
      } else {
        this.gamePool.delete(elo);
      }
    }
    // if (tmp.length > 1) {
    //   // match making from 
    //   // tmp.sort((a, b) => a.time - b.time);
    //   for(const p of tmp) {
    //     for (let i = 1; i <= p.range; i++) {
    //       const op = tmp.find((a)=> a.elo === p.elo + i || a.elo === p.elo - i);
    //       if (op !== undefined) {
            
    //       }
    //     } 
        
    //   }
    // }
    putUserInGamePool(curTime);
    this.logger.log('game queue loop');
  }
  
  joinRoom(socket: Socket, gameId: string) {
    console.log(`${socket.id} joined ${gameId}`);
    socket.join(gameId);
    socket.data.room = gameId;
    console.log(`${socket.id} joined room list ${JSON.stringify(socket.rooms)}`);
  }
  
  // socket.handshake.auth: token(token for auth), observ(uid for observing), invite(uid for invite), type(gameType)
  // socket.data: uid(socket uid), elo(user elo score), queueStack(for matching stack)
  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      socket.data.uid = await this.authService.jwtVerify(socket.handshake.auth.token);
      if (socket.disconnected) {
        // socket disconnected before putting in gamePool.
        throw new UnauthorizedException("already disconnected.");
      }
      console.log(`socket data uid: ${socket.data.uid}`)
      if (socket.handshake.auth.invite !== undefined) {
        const host = this.privatePool[socket.handshake.auth.invite];
        if (host !== undefined) {
          const p1 = host.data.uid;
          const p2 = socket.data.uid;
          const gameId = p1.toString() + "+" + p2.toString();
          this.userInGame.set(p1, gameId).set(p2, gameId);
          this.joinRoom(host, gameId);
          this.joinRoom(socket, gameId);
          this.privatePool.delete(p1);
          this.gameService.createGame(gameId, this.server, p1, p2, GameType.PRIVATE);
        } else {
          this.privatePool.set(socket.data.uid, socket);
        }
      } else if (socket.handshake.auth.observ !== undefined) {
        const gameId = this.userInGame.get(socket.handshake.auth.data);
        if (gameId !== undefined && this.gameService.gameState(gameId) < GameStatus.FINISHED) {
          socket.emit("observer joined room");
          socket.join(gameId);
        } else {
          console.log("Already finished. Disconnect socket.");
          throw new UnauthorizedException("already finished");
        }
      } else {
        // queue match
        const uid = socket.data.uid;
        const user = await this.userService.getUserByUid(uid);
        if (socket.disconnected || user === null) {
          // socket disconnected before putting in gamePool.
          throw new UnauthorizedException("already disconnected or user not found.");
        }
        socket.data.elo = user.elo;
        const userInGame = this.userInGame.get(uid);
        if (userInGame === undefined) {
          socket.emit("isLoading", true);
          if (socket.handshake.auth.type === GameType.PRIVATE) {
            socket.emit("isPrivate", true);
          } else {
            socket.data.timestamp = Date.now();
            this.readyQueue.push(socket);
            // const eloAdj = Math.trunc(socket.data.elo / 5);
            // const eloList = this.gamePool.get(eloAdj);
            // if (eloList !== undefined) {
            //   eloList.push(socket);
            // } else {
            //   this.gamePool.set(eloAdj, [socket]);
            // }
            // this.gameQueue.push(socket.data.elo, socket);
          }
        } else {
          console.log("Reconnected.");
          socket.join(this.userInGame.get(uid)!);
        }
      }
    } catch(e) {
      this.logger.log(`${socket.data.uid} invalid connection. reason: ${e}. disconnect socket.`);
      socket.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    if (socket.data.room !== undefined) {
      // Game finished or socket disconnected while game playing(Maybe refreshed).
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame === undefined) {
        this.logger.log(`${socket.data.uid} invalid socket connection disconnected.`);
      } else if (curGame.isPlayer(socket.data.uid)) {
        curGame.playerLeft(socket.data.uid);
        this.logger.log(`${socket.data.uid} player left.`);
      } else {
        this.logger.log(`${socket.data.uid} observer left.`);
      }
    } else {
      if (socket.handshake.auth.observ !== undefined) {
        // game is already finished. disconnect observer socket.
        // nothing to handle.
      } else if (socket.handshake.auth.invite !== undefined) {
        // guest reject invite. disconnect host.
        // remove from the privatePool.
        this.privatePool.delete(socket.data.uid);
      } else {
        const queueLen = this.readyQueue.length;
        this.readyQueue = this.readyQueue.filter((sock) => {return sock !== socket});
        if (this.readyQueue.length !== queueLen) {
          // Not moved to gamePool. remove from the readyQueue.
          // Nothing to handle.
        } else {
          // Cancel game queue. Not matched.
          const eloAdj = Math.trunc(socket.data.elo / 5);
          const eloList = this.gamePool.get(eloAdj);
          if (eloList !== undefined) {
            if (eloList.length !== 1) {
              this.gamePool.set(eloAdj, eloList.filter((sock) => {return sock !== socket}));
            } else {
              this.gamePool.delete(eloAdj);
            }
          }
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
