import { BaseEntity, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserFollowing extends BaseEntity {
  @PrimaryColumn()
  followingId: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE', eager:true })
  @JoinColumn({ name: 'followingId' })
  following: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE', eager:true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}