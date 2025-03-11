import jwt from 'jsonwebtoken';
import 'dotenv/config';

class AuthService {
  async encodeToken(id: number) {
    return jwt.sign(
      { 
        id: id
      }, 
      process.env.JWT_SECRET!, 
      {
        expiresIn: process.env.JWT_EXPIRES_IN!,
        algorithm: 'HS256',
      }
    )
  }

  async decodeToken(token: string){
    return jwt.verify(token, process.env.JWT_SECRET!) as Record<string, any>; //! is non null
  }
}

export default new AuthService()
