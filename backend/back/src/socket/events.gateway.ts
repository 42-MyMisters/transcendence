import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

interface MessagePayload {
  roomName: string;
  message: string;
}

class SocketInfo {
  socket: Socket;
  status: number;
  blockedUsers: number[];
}

const userRecord: Record<number, SocketInfo> = {};
const createdRooms: Record<string, User[]> = {};

@WebSocketGateway({ namespace: 'sock', cors: { origin: '*' } })
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {
	}
  private logger = new Logger('Gateway');

  @WebSocketServer()
  nsp: Namespace;
  
  afterInit() {
    this.nsp.adapter.on('delete-room', (room) => {
      const deletedRoom = Object.keys(createdRooms).find(
        (createdRoom) => createdRoom === room,
      );
      if (!deletedRoom) return;


      this.nsp.emit('delete-room', deletedRoom);
      if (createdRooms[deletedRoom] !== undefined) {
        delete createdRooms[deletedRoom];
      }
    });

    this.logger.log('socket initialized');
  }


  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`${socket.id} socket connected.`);
      const uid = await this.authService.jwtVerify(socket.handshake.auth.token)
      const user = await this.userService.getUserById(uid);
      if (this.userService.isUserExist(user)) {
        socket.data.user = user;
        if (userRecord[uid] === undefined) {
          userRecord[uid] = { socket:socket, status: 1, blockedUsers:user.blockedUsers.map(blockedUsers => blockedUsers.targetToBlockId) }
        } else {
          this.logger.log(`${socket.id} already connected user. disconnect socket.`);
          socket.disconnect();
        }
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

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, message }: MessagePayload,
  ) {
    socket.broadcast
      .to(roomName)
      .emit('message', { username: socket.id, message });


    return { username: socket.id, message };
  }

  @SubscribeMessage('room-list')
  handleRoomList() {
    return Object.keys(createdRooms);
  }

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const exists = createdRooms[roomName];
    if (exists !== undefined) {
      return { success: false, payload: `${roomName} room is already created.` };
    }

    socket.join(roomName);
    createdRooms[roomName] = [socket.data.user];
    this.nsp.emit('create-room', roomName);

    return { success: true, payload: roomName };
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    socket.join(roomName); // join room
    socket.broadcast
      .to(roomName)
      .emit('message', { message: `${socket.id} is entered.` });

    return { success: true };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    socket.leave(roomName); // leave room
    socket.broadcast
      .to(roomName)
      .emit('message', { message: `${socket.id} is left.` });

    return { success: true };
  }
}