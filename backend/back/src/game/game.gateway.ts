import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseService } from 'src/database/database.service';
import { UserService } from 'src/user/user.service';
import { GameMode, GameStatus, GameType } from './game.enum';
import { GameService, GameStartVar } from './game.service';

export interface GameInfo {
  gameMode: GameMode,
  p1: number,
  p2: number,
}

@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readyQueue: Socket[]; // for 3 sec delay befor match.
  private gamePool: Map<number, Socket[]>; // for matchQueue.
  private privatePool: Map<number, Socket>; // for private game.
  private userInGame: Map<number, string>; // user - room name 
  private gameId: number; // game room name
  private readonly matchMakingLoopInterval: number = 2000;
  private readonly initialQueueDelay: number = 3;
  private readonly rangeExpandTime: number = 3;
  private readonly maxRange: number = 20; // maxRange +-200
  constructor(
    private readonly userService: UserService,
		private readonly authService: AuthService,
    private readonly gameService: GameService,
	) {
    this.readyQueue = [];
    this.gamePool = new Map<number, Socket[]>();
    this.privatePool = new Map<number, Socket>();
    this.userInGame = new Map<number, string>();
    this.gameId = 0;
    // Match making loop
    setInterval(this.gameMatchLogic.bind(this), this.matchMakingLoopInterval);
  }
  
  logger = new Logger('GameGateway');
  
  @WebSocketServer()
  server: Namespace;
  
  afterInit(server: any) {
    // WebSocket 서버 초기화 작업
  }

  private getTimeInSec() {
    return Math.trunc(Date.now() / 1000);
  }

  private getMatchRange(curTime: number, socket: Socket) {
    return Math.min(Math.trunc((curTime - socket.data.timestamp) / this.rangeExpandTime), this.maxRange);
  }

  private isInitialDelayFinished(curTime: number) {
    return curTime - this.readyQueue[0].data.timestamp >= this.initialQueueDelay;
  }

  private gameMatchLogic() {
    // 3 sec delay finished. move to gamePool for matchQueue.
    const putUserInGamePool = (curTime: number) => {
      while (this.readyQueue.length && this.isInitialDelayFinished(curTime)) {
        const sock = this.readyQueue.shift()!;
        const eloAdj = this.adjElo(sock.data.user.elo);
        const eloList = this.gamePool.get(eloAdj);
        if (eloList !== undefined) {
          eloList.push(sock);
        } else {
          this.gamePool.set(eloAdj, [sock]);
        }
      }
    }
    
    const curTime = this.getTimeInSec();
    for (const [elo, socketList] of this.gamePool) {
      // quick match from the same tier pool.
      while (socketList.length > 1) {
        const sockA = socketList.shift()!;
        const sockB = socketList.shift()!;
        this.createGameFromQueue(sockA, sockB);
      }      
      if (socketList.length === 0) {
        this.gamePool.delete(elo);
      }
    }
    if (this.gamePool.size !== 0) {
      const matchQueue = Array.from(this.gamePool).sort((a, b) => a[0] - b[0]);
      let i = 0;
      while (i < matchQueue.length - 1) {
        const myElo = matchQueue[i][0];
        const mySocket = matchQueue[i][1][0];
        // range will be increased.
        const range = this.getMatchRange(curTime, mySocket);
        // this.logger.log('Queue state', matchQueue);
        if (i === 0) {
          const nextElo = matchQueue[i + 1][0];
          if (myElo + range >= nextElo) {
            this.createGameFromQueue(mySocket, matchQueue[i + 1][1][0]);
            matchQueue.splice(i, 2);
            continue;
          }
        } else if (i === matchQueue.length - 2) {
          const prevElo = matchQueue[i - 1][0];
          if (myElo - range <= prevElo) {
            this.createGameFromQueue(mySocket, matchQueue[i - 1][1][0]);
            matchQueue.splice(i - 1, 2);
            i--;
            continue;
          }
        } else {
          const prevElo = matchQueue[i - 1][0];
          const nextElo = matchQueue[i + 1][0];
          if (myElo - range <= prevElo) {
            this.createGameFromQueue(mySocket, matchQueue[i - 1][1][0]);
            matchQueue.splice(i - 1, 2);
            i--;
            continue;
          } else if (myElo + range >= nextElo) {
            this.createGameFromQueue(mySocket, matchQueue[i + 1][1][0]);
            matchQueue.splice(i, 2);
            continue;
          }
        }
        i++;
      }
      this.gamePool = new Map<number, Socket[]>(matchQueue);
    }
    putUserInGamePool(curTime);
    this.logger.log('game queue loop');
  }

  private createGameFromQueue(sockA: Socket, sockB: Socket) {
    const gameId = (this.gameId++).toString();
    const gv: GameStartVar = sockA.data.user.elo <= sockB.data.user.elo ? {
      gameId,
      p1: sockA.data.user,
      p2: sockB.data.user,
      server: this.server,
      gameType: GameType.PUBLIC,
    } : {
      gameId,
      p1: sockB.data.user,
      p2: sockA.data.user,
      server: this.server,
      gameType: GameType.PUBLIC,
    };
    this.userInGame.set(gv.p1.uid, gameId).set(gv.p2.uid, gameId);
    this.joinRoom(sockB, gameId);
    this.joinRoom(sockA, gameId);
    sockA.data.room = gameId;
    sockB.data.room = gameId;
    this.gameService.createGame(gv);
  }
  
  private joinRoom(socket: Socket, gameId: string) {
    this.logger.log(`${socket.id} joined ${gameId}`);
    socket.join(gameId);
    socket.data.room = gameId;
  }
  
  private adjElo(elo: number) {
    return Math.trunc(elo / 10);
  }


  // socket.handshake.auth: token(token for auth), observ(uid for observing), invite(uid for invite), type(gameType)
  // socket.data: uid(socket uid), elo(user elo score), queueStack(for matching stack)
  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const uid = await this.authService.jwtVerify(socket.handshake.auth.token);
      const user = await this.userService.getUserByUid(uid);
      socket.data.user = user;
      if (user?.nickname[0] === '#') {
        throw new UnauthorizedException("Not valid user");
      }
      if (socket.disconnected) {
        // socket disconnected before putting in gamePool.
        throw new UnauthorizedException("already disconnected.");
      }
      const invite:number = socket.handshake.auth.invite;
      const observ:number = socket.handshake.auth.observ;
      this.logger.log(`client connected uid: ${socket.data.user.uid}`);
      if (invite !== undefined) {
        this.logger.log(`private pool: ${this.privatePool}`);
        if (this.privatePool.has(invite)) {
          const host = this.privatePool.get(invite)!;
          const p1 = host.data.user;
          const p2 = socket.data.user;
          const gameId = p1.uid.toString() + "+" + p2.uid.toString();
          const gv: GameStartVar = {
            gameId,
            server:this.server,
            p1,
            p2,
            gameType: GameType.PRIVATE,
          }
          this.userInGame.set(p1.uid, gameId).set(p2.uid, gameId);
          this.joinRoom(host, gameId);
          this.joinRoom(socket, gameId);
          this.privatePool.delete(p1.uid);
          this.gameService.createGame(gv);
        } else {
          this.privatePool.set(socket.data.user.uid, socket);
        }
      } else if (observ !== undefined) {
        const gameId = this.userInGame.get(observ);
        if (gameId !== undefined && this.gameService.gameState(gameId) < GameStatus.FINISHED) {
          const curGame = this.gameService.getGame(gameId);
          socket.data.room = gameId;
          socket.emit("observer", curGame!.gameInfo());
          socket.join(gameId);
        } else {
          console.log("Already finished. Disconnect socket.");
          throw new UnauthorizedException("already finished");
        }
      } else {
        // queue match
        if (socket.disconnected) {
          // socket disconnected before putting in gamePool.
          throw new UnauthorizedException("already disconnected or user not found.");
        }
        const uid = socket.data.user.uid;
        const gameId = this.userInGame.get(uid);
        if (gameId === undefined) {
          socket.data.timestamp = this.getTimeInSec();
          this.readyQueue.push(socket);
        } else {
          // not working
          console.log("Reconnected.");
          socket.join(gameId);
        }
      }
    } catch(e) {
      this.logger.log(`${socket.data.user.uid} invalid connection. reason: ${e}. disconnect socket.`);
      socket.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
    if (socket.data.room !== undefined) {
      // Game finished or socket disconnected while game playing(Maybe refreshed).
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame === undefined) {
        this.logger.log(`${user.uid} invalid socket connection disconnected.`);
        this.userInGame.delete(user.uid);
      } else if (curGame.isPlayer(user.uid)) {
        curGame.playerLeft(user.uid);
        this.userInGame.delete(user.uid);
        this.logger.log(`${user.uid} player left.`);
      } else {
        this.logger.log(`${user.uid} observer left.`);
      }
    } else {
      if (socket.handshake.auth.observ !== undefined) {
        // game is already finished. disconnect observer socket.
        // nothing to handle.
      } else if (socket.handshake.auth.invite !== undefined) {
        // guest reject invite. disconnect host.
        // remove from the privatePool.
        this.privatePool.delete(user.uid);
      } else {
        const queueLen = this.readyQueue.length;
        this.readyQueue = this.readyQueue.filter((sock) => {return sock !== socket});
        if (this.readyQueue.length !== queueLen) {
          // Not moved to gamePool. remove from the readyQueue.
          // Nothing to handle.
        } else {
          // Cancel game queue. Not matched.
          const eloAdj = this.adjElo(socket.data.elo);
          const eloList = this.gamePool.get(eloAdj);
          if (eloList !== undefined) {
            if (eloList.length > 1) {
              this.gamePool.set(eloAdj, eloList.filter((sock) => {return sock !== socket}));
            } else {
              this.gamePool.delete(eloAdj);
            }
          }
        }
      }
    }
    this.logger.log(`${user.uid} disconnected.`);
  }

  @SubscribeMessage('status')
  status(socket: Socket, payload: any) {
    console.log(socket.rooms);
    console.log(payload);
  }

  @SubscribeMessage('upPress')
  upPress(socket: Socket) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.user.uid)) {
        curGame.upPress(socket.data.user.uid);
      }
    }
  }
  
  @SubscribeMessage('downPress')
  downPress(socket: Socket) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.user.uid)) {
        curGame.downPress(socket.data.user.uid);
      }
    }
  }
  
  @SubscribeMessage('upRelease')
  upRelease(socket: Socket) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.user.uid)) {
        curGame.upRelease(socket.data.user.uid);
      }
    }
  }
  
  @SubscribeMessage('downRelease')
  downRelease(socket: Socket) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.user.uid)) {
        curGame.downRelease(socket.data.user.uid);
      }
    }
  }

  @SubscribeMessage('modeSelect')
  modeSelect(socket: Socket, mode: GameMode) {
    const curGame = this.gameService.getGame(socket.data.room);
    if (curGame !== undefined) {
      if (curGame.isP1(socket.data.user.uid)) {
        curGame.setMode(mode);
      }
    }
  }

  @SubscribeMessage('ping')
  pong() {
    return Date.now();
  }

}
