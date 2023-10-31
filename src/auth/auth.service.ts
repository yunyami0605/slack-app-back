import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtToken } from './interface/token.interface';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(signupDto: SignupDto) {
    /**
     *@todo 추후 round env로 적용
     */
    const round = 5;

    const hashedPassword = await bcrypt.hash(signupDto.password, round);
    // $2a$05$uo7bf0NF/di6a4nJFP67tO/yH.W1rGS0NrY8qIriVuJ1tX2c3tRAG
    // 2a: 암호화 방식, 05: 버전 정보, uo7bf0NF: 알고리즘 정보,
    // di6a4nJFP67tO: 해쉬 솔트, yH.W1rGS0NrY8qIriVuJ1tX2c3tRAG: 비밀번호
    const result = await this.prisma.user.create({
      data: {
        ...signupDto,
        password: hashedPassword,
      },
    });

    const tokens = await this.createToken(result);

    this.prisma.user.update({
      where: {
        id: result.id,
      },
      data: tokens.refresh,
    });

    return tokens;
  }

  async createToken(user: Pick<User, 'id'>): Promise<JwtToken> {
    const payload = {
      sub: user.id,
    };
    /**
     *@todo 추후 env 적용
     */
    const salt = 'test';
    const expire = '30d';

    return {
      access: this.jwtService.sign(payload, {
        secret: salt,
        expiresIn: expire,
      }),
      refresh: this.jwtService.sign(payload, {
        secret: salt,
        expiresIn: expire,
      }),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDto.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) throw new NotFoundException('계정 정보를 찾을 수 없습니다');

    const isAuth = await bcrypt.compare(loginDto.password, user.password);

    if (!isAuth) throw new UnauthorizedException('비밀번호를 확인해주세요.');

    const token = await this.createToken(user);

    this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: token.refresh,
      },
    });

    return token;
  }
}
