import { Logger, UnauthorizedException } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/database/entity/user.entity";
import { UserService } from "src/user/user.service";

interface UserInfo {
  socket: Socket;
  status: 'online' | 'offline' | 'inGame';
  blockedUsers: number[];
}

interface RoomMember {
  userRoomStatus: 'normal' | 'mute' | 'ban' | 'kick';
  userRoomPower: 'owner' | 'admin' | 'member';
}

interface RoomInfo {
  roomNumber: number;
  roomName: string;
  roomType: 'open' | 'protected' | 'private';
  roomMembers: Record<number, RoomMember>;
  roomOwner: number;
  roomAdmins: number[];
  bannedUsers: number[];
  roomPass?: string;
}

const userList: Record<number, UserInfo> = {};
const roomList: Record<number, RoomInfo> = {};

@WebSocketGateway({ namespace: "sock", cors: { origin: "*" } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  private logger = new Logger("Gateway");

  @WebSocketServer()
  nsp: Namespace;

  afterInit() {
    this.nsp.emit("room-clear");
    this.logger.log("socket initialized");
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`\n\n${socket.id} socket connected.`);
      const uid = await this.authService.jwtVerify(socket.handshake.auth.token);
      const user = await this.userService.getUserByUid(uid);
      if (this.userService.isUserExist(user)) {
        socket.data.user = user;
        console.log(`user: ${userList[uid]}`);
        if (userList[uid] === undefined) {
          userList[uid] = {
            socket: socket,
            status: 'online',
            blockedUsers: user.blockedUsers.map(blockedUsers => blockedUsers.targetToBlockId),
          };
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

  @SubscribeMessage("test")
  handleTest(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { message }: { message: string }
  ) {
    console.log(`fromClient: ${message}`);
    return { fromServer: message };
  }

  @SubscribeMessage("message")
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, content }: MessagePayload
  ) {
    socket.broadcast.to(roomName).emit("message", content);

    return { roomName, content };
  }

  @SubscribeMessage("room-list")
  handleRoomList() {
    return Object.keys(createdRooms);
  }

  @SubscribeMessage("room-create")
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomName,
      roomType,
      roomPass,
    }: { roomName: string; roomType?: boolean; roomPass?: string }
  ) {
    console.log(
      `roomName: ${roomName}, roomType: ${roomType}, roomPass: ${roomPass}`
    );
    const exists = createdRooms[roomName];
    if (exists !== undefined) {
      console.log(`${roomName} room is already created.`);
      return { status: "ko", payload: `${roomName} room is already created.` };
    }

    socket.join(roomName);
    createdRooms[roomName] = [socket.data.user];
    // this.nsp.emit('create-room', roomName);
    console.log(`${roomName} room is created.`);

    return { status: "ok", payload: roomName };
  }

  @SubscribeMessage("join-room")
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string
  ) {
    socket.join(roomName); // join room
    socket.broadcast
      .to(roomName)
      .emit("message", { message: `${socket.id} is entered.` });

    return { success: true };
  }

  @SubscribeMessage("leave-room")
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string
  ) {
    socket.broadcast
      .to(roomName)
      .emit("message", { message: `${socket.id} is left.` });
    socket.leave(roomName); // leave room

    return { success: true };
  }
}
