import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthEntity } from './entity/auth.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockResponse = () => {
    const res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            userSignUp: jest.fn(),
            verifyEmail: jest.fn(),
            removeRefreshToken: jest.fn(),
            refresh: jest.fn(),
            requestPasswordReset: jest.fn(),
            confirmPasswordReset: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'NODE_ENV') return 'test';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return auth payload on login', async () => {
    const payload = {
      accessToken: 'access',
      refreshToken: 'refresh',
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as AuthEntity;

    authService.login.mockResolvedValue(payload);

    const res = mockResponse();
    const req = { user: { id: '1' } };

    await controller.login(
      { email: 'test@example.com', password: 'password' },
      req as any,
      res as any,
    );

    expect(authService.login).toHaveBeenCalledWith(req.user);
    expect(res.cookie).toHaveBeenCalledWith(
      'ACCESS_TOKEN',
      payload.accessToken,
      expect.any(Object),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'REFRESH_TOKEN',
      payload.refreshToken,
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(payload);
  });
});
