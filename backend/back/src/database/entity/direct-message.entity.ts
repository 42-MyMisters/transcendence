import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class DirectMessage extends BaseEntity {
    @PrimaryGeneratedColumn()
    did: number;

    @Column()
    senderId: number;

    @Column()
    receiverId: number;

    @Column({ nullable: true, type: 'varchar' })
    message: string | null;

    @CreateDateColumn()
    time: Date;

    @Column({ default: false })
    blockFromReceiver: boolean;

    @ManyToOne(() => User, (user) => user.uid)
    @JoinColumn({
        name: 'sender',
        referencedColumnName: 'uid',
    })
    sender: User;

    @ManyToOne(() => User, (user) => user.uid)
    @JoinColumn({
        name: 'receiver',
        referencedColumnName: 'uid',
    })
    receiver: User;

}
