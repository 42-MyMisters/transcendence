import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/database/entity/user.entity';
import { UserService } from 'src/user/user.service';

interface MessagePayload {
  roomName: string;
  content: Message;
}

interface Message {
  username: string;
  message: string;
}

interface SocketInfo {
  socket: Socket;
  status: number;
  blockedUsers: number[];
}

interface RoomMember {
  // uid: number;
  user: User;
  nickname: string;
  userRoomStatus: string; // 'normal' | 'mute' | 'ban' | 'kick'
  userRoomPower: string; // 'owner' | 'admin' | 'member'
}
// userStatus: string; // 'offline' | 'online' | 'inGame'
// roomList?: number[];

interface RoomTitlePayload {
  // roomNumber: number;
  roomName: string;
  roomType: string;
}

interface RoomInfo {
  roomNumber: number;
  roomName: string;
  roomType: string;
  roomMembers: RoomMember[];
  roomOwner: number;
  roomAdmins: number[];
  bannedUsers?: number[];
  roomPass?: string;
}

interface RoomListPayload {
  roomName: string;
  roomType: string;
}

interface RoomPayload {
  status: string;
  reason: string;
}

interface ChatRoomUpdatePayload {
  action: string;
  roomInfo: RoomInfo;
}

// TODO : Redis?
const userRecord: Record<number, SocketInfo> = {};
const createdRooms: Record<string, User[]> = {};
const roomList: Record<number, RoomInfo> = {};

@WebSocketGateway({ namespace: 'sock', cors: { origin: '*' } })
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) { }

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
      const user = await this.userService.getUserByUid(uid);
      if (this.userService.isUserExist(user)) {
        socket.data.user = user;
        console.log(`user: ${userRecord[uid]}`)
        if (userRecord[uid] === undefined) {
          userRecord[uid] = { socket: socket, status: 1, blockedUsers: [] }
          // userRecord[uid] = { socket:socket, status: 1, blockedUsers:user.blockedUsers.map(blockedUsers => blockedUsers.targetToBlockId) }
          this.logger.log(`${socket.data.user.nickname} connected.`);
        }
      } else {
        throw new UnauthorizedException("User not found.");
      }
    } catch (e) {
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
    @MessageBody() { roomName, content }: MessagePayload,
  ) {
    socket.broadcast
      .to(roomName)
      .emit('message', content);

    return { roomName, content };
  }

  @SubscribeMessage('room-list')
  handleRoomList() {
    return Object.keys(createdRooms);
  }

  @SubscribeMessage('room-create')
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomName,
      roomType,
      roomPass,
    }: { roomName: string; roomType?: boolean; roomPass?: string },
  ) {
    console.log(`roomName: ${roomName}, roomType: ${roomType}, roomPass: ${roomPass}`);
    const exists = createdRooms[roomName];
    if (exists !== undefined) {
      console.log(`${roomName} room is already created.`);
      return { status: false, payload: `${roomName} room is already created.` };
    }

    socket.join(roomName);
    createdRooms[roomName] = [socket.data.user];
    // this.nsp.emit('create-room', roomName);
    console.log(`${roomName} room is created.`);



    return { status: true, payload: roomName };
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
    socket.broadcast
      .to(roomName)
      .emit('message', { message: `${socket.id} is left.` });
    socket.leave(roomName); // leave room

    return { success: true };
  }
}
