import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';



@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private userService: UserService,
		private authService: AuthService,
	) {}

  logger = new Logger('GameGateway');
  
  @WebSocketServer() server;

  private games = new Map<string, GameService>();

  afterInit(server: any) {
    // WebSocket 서버 초기화 작업
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`${socket.id} socket connected.`);
      const uid = await this.authService.jwtVerify(socket.handshake.auth.token)
      const user = await this.userService.getUserByUid(uid);
      if (this.userService.isUserExist(user)) {
        socket.data.user = user;
      } else {
        throw new UnauthorizedException("User not found.");
      }
    } catch(e) {
      this.logger.log(`${socket.id} invalid connection. disconnect socket.`);
      socket.disconnect();
    }
  }



  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} socket disconnected`);
  }

  @SubscribeMessage('startGame')
  async startGame(client: any, payload: any) {
    const gameId = payload.gameId;
    const game = new GameService(gameId); // 새로운 게임 인스턴스 생성
    this.games.set(gameId, game); // 게임 맵에 추가

    while (game.isRunning()) {
      // 게임 로직 처리
      game.update();
      const gameState = game.getState();
      this.server.to(gameId).emit('gameState', gameState); // 게임 상태 업데이트 메시지 전송
      await new Promise(resolve => setTimeout(resolve, 1000 / 24)); // 24FPS에 맞게 대기
    }

    this.games.delete(gameId); // 게임 맵에서 제거
  }
}
