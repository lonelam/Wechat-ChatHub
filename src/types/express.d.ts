declare namespace Express {
  interface User {
    id: number;
    username: string;
    password: string;
    roles: UserRole[];
  }
  interface Request {
    user: User;
  }
}
