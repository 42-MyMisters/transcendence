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
    this.privatePool = new Map<number, Socket>();
    this.readyQueue = [];
    this.gameId = 0;
    this.userInGame = new Map<number, string>();
    // Queue loop
    setInterval(this.gameMatchLogic.bind(this), 2000);
  }
  
  logger = new Logger('GameGateway');
  
  @WebSocketServer()
  server: Namespace;
  
  afterInit(server: any) {
    // WebSocket 서버 초기화 작업
  }

  gameMatchLogic() {
    const curTime = Math.trunc(Date.now() / 1000);
    const putUserInGamePool = (curTime: number) => {
      while (this.readyQueue.length && curTime - this.readyQueue[0].data.timestamp >= 3) {
        const sock = this.readyQueue.shift()!;
        const eloAdj = Math.trunc(sock.data.elo / 5);
        const eloList = this.gamePool.get(eloAdj);
        if (eloList !== undefined) {
          eloList.push(sock);
        } else {
          this.gamePool.set(eloAdj, [sock]);
        }
      }
    }
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
      const tmpArray = Array.from(this.gamePool).sort((a, b) => a[0] - b[0]);
      let i = 0;
      while (i < tmpArray.length - 1) {
        const myElo = tmpArray[i][0];
        const mySocket = tmpArray[i][1][0];
        const range = Math.min(Math.trunc((curTime - mySocket.data.timestamp) / 3), 10);
        console.log(i, tmpArray);
        if (i === 0) {
          const nextElo = tmpArray[i + 1][0];
          if (myElo + range >= nextElo) {
            this.createGameFromQueue(mySocket, tmpArray[i + 1][1][0]);
            tmpArray.splice(i, 2);
            continue;
          }
        } else if (i === tmpArray.length - 2) {
          const prevElo = tmpArray[i - 1][0];
          const nextElo = tmpArray[i + 1][0];
          if (myElo - range <= prevElo) {
            this.createGameFromQueue(mySocket, tmpArray[i - 1][1][0]);
            tmpArray.splice(i - 1, 2);
            i--;
            continue;
          } else if (myElo + range >= nextElo) {
            this.createGameFromQueue(mySocket, tmpArray[i + 1][1][0]);
            tmpArray.splice(i, 2);
            continue;
          }
        } else {
          const prevElo = tmpArray[i - 1][0];
          if (myElo - range <= prevElo) {
            this.createGameFromQueue(mySocket, tmpArray[i - 1][1][0]);
            tmpArray.splice(i - 1, 2);
            i--;
            continue;
          }
        }
        i++;
      }
      this.gamePool = new Map<number, Socket[]>(tmpArray);
    }

    putUserInGamePool(curTime);
    this.logger.log('game queue loop');
  }

  private createGameFromQueue(sockA: Socket, sockB: Socket) {
    const gameId = (this.gameId++).toString();
    const gv: GameStartVar = {
      gameId,
      server: this.server,
      p1: 0,
      p2: 0,
      p1Elo: 0,
      p2Elo: 0,
      gameType: GameType.PUBLIC,
    };
    if (sockA.data.elo <= sockB.data.elo) {
      gv.p1 = sockA.data.uid;
      gv.p1Elo = sockA.data.elo;
      gv.p2 = sockB.data.uid;
      gv.p2Elo = sockB.data.elo;
    } else {
      gv.p1 = sockB.data.uid;
      gv.p1Elo = sockB.data.elo;
      gv.p2 = sockA.data.uid;
      gv.p2Elo = sockA.data.elo;
    }
    this.userInGame.set(gv.p1, gameId).set(gv.p2, gameId);
    this.joinRoom(sockB, gameId);
    this.joinRoom(sockA, gameId);
    sockA.data.room = gameId;
    sockB.data.room = gameId;
    // console.log(`${sockA.data.uid} joined room list `, sockA.rooms);
    // console.log(`${sockB.data.uid} joined room list `, sockB.rooms);
    this.gameService.createGame(gv);
  }
  
  private joinRoom(socket: Socket, gameId: string) {
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
      const invite:number = socket.handshake.auth.invite;
      const observ:number = socket.handshake.auth.observ;
      console.log(`socket data uid: ${socket.data.uid}`);
      if (invite !== undefined) {
        console.log(`private pool: ${{...this.privatePool}}`);
        if (this.privatePool.has(invite)) {
          console.log(`Invite client uid: ${socket.data.uid}`);
          const host = this.privatePool.get(invite)!;
          const p1 = host.data.uid;
          const p2 = socket.data.uid;
          const gameId = p1.toString() + "+" + p2.toString();
          const gv: GameStartVar = {
            gameId,
            server:this.server,
            p1,
            p1Elo: host.data.elo,
            p2,
            p2Elo: socket.data.elo,
            gameType: GameType.PRIVATE,
          }
          this.userInGame.set(p1, gameId).set(p2, gameId);
          this.joinRoom(host, gameId);
          this.joinRoom(socket, gameId);
          this.privatePool.delete(p1);
          this.gameService.createGame(gv);
        } else {
          console.log(`Invite host uid: ${socket.data.uid}`);
          this.privatePool.set(socket.data.uid, socket);
        }
      } else if (observ !== undefined) {
        const gameId = this.userInGame.get(observ);
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
        const gameId = this.userInGame.get(uid);
        if (gameId === undefined) {
          socket.data.timestamp = Math.trunc(Date.now() / 1000);
          this.readyQueue.push(socket);
        } else {
          console.log("Reconnected.");
          socket.join(gameId);
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
        this.userInGame.delete(socket.data.uid);
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
  status(socket: Socket, payload: any) {
    console.log(socket.rooms);
    console.log(payload);
  }

  @SubscribeMessage('upPress')
  upPress(socket: Socket) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.uid)) {
        curGame.upPress(socket.data.uid);
      }
    }
  }
  
  @SubscribeMessage('downPress')
  downPress(socket: Socket) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.uid)) {
        curGame.downPress(socket.data.uid);
      }
    }
  }
  
  @SubscribeMessage('upRelease')
  upRelease(socket: Socket) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.uid)) {
        curGame.upRelease(socket.data.uid);
      }
    }
  }
  
  @SubscribeMessage('downRelease')
  downRelease(socket: Socket) {
    if (socket.data.room) {
      const curGame = this.gameService.getGame(socket.data.room);
      if (curGame !== undefined && curGame.isPlayer(socket.data.uid)) {
        curGame.downRelease(socket.data.uid);
      }
    }
  }

  @SubscribeMessage('modeSelect')
  modeSelect(socket: Socket, mode: GameMode) {
    const curGame = this.gameService.getGame(socket.data.room);
    if (curGame !== undefined) {
      if (curGame.isP1(socket.data.uid)) {
        curGame.setMode(mode);
      }
    }
  }

  @SubscribeMessage('ping')
  pong() {
    return Date.now();
  }

}
