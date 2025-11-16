import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { VerificationCodesService } from './verification-codes.service';
import { MailService } from 'src/mail/mail.service';

const userFactory = () => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed-password',
  refreshToken: null,
  emailVerifiedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let verificationCodesService: {
    createCode: jest.Mock;
    verifyCode: jest.Mock;
  };
  const mailService = {
    queueVerificationEmail: jest.fn(),
    queuePasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
        }),
      ],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateRefreshToken: jest.fn(),
            markEmailVerified: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'JWT_SECRET':
                  return 'test-secret';
                case 'JWT_ACCESS_EXPIRES_IN':
                  return '60s';
                case 'JWT_REFRESH_EXPIRES_IN':
                  return '7d';
                default:
                  return undefined;
              }
            }),
          },
        },
        {
          provide: VerificationCodesService,
          useValue: {
            createCode: jest.fn(),
            verifyCode: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: mailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    verificationCodesService = module.get(VerificationCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validates user credentials', async () => {
    const password = 'password123';
    const hashed = await bcrypt.hash(password, 10);
    const user = { ...userFactory(), password: hashed };
    usersService.findByEmail.mockResolvedValue(user as any);

    const result = await service.validateUser(user.email, password);
    expect(result).toEqual(user);
  });

  it('throws when refresh token missing', async () => {
    await expect(service.refresh()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('refreshes tokens when refresh token is valid', async () => {
    const user = userFactory();
    const tokens = await service.generateTokens(user as any);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);

    usersService.findOne.mockResolvedValue({
      ...user,
      refreshToken: hashedRefresh,
    } as any);

    usersService.updateRefreshToken.mockResolvedValue(undefined);

    const result = await service.refresh(tokens.refreshToken);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toEqual(user.email);
    expect(usersService.updateRefreshToken).toHaveBeenCalled();
  });
});
