import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from '../entities/friend.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
  ) {}

  async getOrCreateFriendByFriendId(
    friendId: string,
    friendName: string,
    friendGender: number,
    friendAlias: string,
    friendAvatarUrl: string,
  ) {
    const friend = await this.friendRepository.findOne({
      where: {
        wechatId: friendId,
      },
    });
    if (friend) {
      if (
        friend.name !== friendName ||
        friend.gender !== friendGender ||
        friend.alias !== friendAlias ||
        friend.avatarUrl !== friendAvatarUrl
      ) {
        friend.name = friendName;
        friend.gender = friendGender;
        friend.alias = friendAlias;
        friend.avatarUrl = friendAvatarUrl;
        return this.friendRepository.save(friend);
      }
      return friend;
    }
    return this.friendRepository.save({
      wechatId: friendId,
      name: friendName,
      gender: friendGender,
      alias: friendAlias,
      avatarUrl: friendAvatarUrl,
    });
  }
}
