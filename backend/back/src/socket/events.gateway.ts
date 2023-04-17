import { Logger } from '@nestjs/common';
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
  socket: string;
  status: number;
  blockedUsers: User[];
}

const userDic: Record<number, SocketInfo> = {};
let createdRooms: string[] = [];

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
      const deletedRoom = createdRooms.find(
        (createdRoom) => createdRoom === room,
      );
      if (!deletedRoom) return;

      this.nsp.emit('delete-room', deletedRoom);
      createdRooms = createdRooms.filter(
        (createdRoom) => createdRoom !== deletedRoom,
      );
    });

    this.logger.log('socket initialized');
  }


  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`${socket.id} socket connected`);
      const uid = await this.authService.jwtVerify(socket.handshake.auth.token)
      const user = this.userService.getUserById(uid);
      socket.data.user = user;
    } catch(e) {
      this.logger.log(`${socket.id} socket connected`);
      
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
    return createdRooms;
  }


  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const exists = createdRooms.find((createdRoom) => createdRoom === roomName);
    if (exists) {
      return { success: false, payload: `${roomName} room is already created.` };
    }

    socket.join(roomName);
    createdRooms.push(roomName);
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