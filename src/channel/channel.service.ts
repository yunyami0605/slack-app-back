import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChannelService {
  constructor(private readonly prisma: PrismaService) {}

  create({ name, userId }: CreateChannelDto) {
    return this.prisma.channel.create({
      data: {
        name,
        members: {
          connect: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  findAll() {
    return this.prisma.channel.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.channel.findUnique({
      where: { id },
    });
  }

  update(id: number, updateChannelDto: UpdateChannelDto) {
    return this.prisma.channel.update({
      data: updateChannelDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.channel.delete({ where: { id } });
  }
}
