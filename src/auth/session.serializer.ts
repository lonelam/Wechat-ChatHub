import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/chatdb/entities/user.entity';
import { UserService } from 'src/chatdb/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }
  serializeUser(
    user: User,
    done: (err: Error | null, userDto?: { id: number }) => void,
  ): any {
    done(null, { id: user.id });
  }

  deserializeUser(
    userDto: { id: number },
    done: (err: Error | null, user?: any) => void,
  ): any {
    if (!userDto) {
      return done(new Error('User object is empty'));
    }
    this.userService
      .findUserById(userDto.id)
      .then((user) => {
        if (!user) {
          return done(new Error('User not found'));
        }
        done(null, user);
      })
      .catch((err) => {
        done(err);
      });
  }
}
