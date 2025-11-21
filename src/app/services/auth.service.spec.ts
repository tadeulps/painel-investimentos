import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoginResponse, UserProfile } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize currentUser$ as null when no stored clientId', () => {
      let currentUser: number | null = -1;
      service.currentUser$.subscribe(user => currentUser = user);
      expect(currentUser).toBeNull();
    });

    it('should initialize with stored clientId from localStorage', () => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('clientId', '123');
      
      const httpClient = TestBed.inject(HttpClient);
      const newService = new AuthService(httpClient, router);
      
      let currentUser: number | null = -1;
      newService.currentUser$.subscribe(user => currentUser = user);
      expect(currentUser).toEqual(123);
    });
  });

  describe('login', () => {
    const mockLoginResponse: LoginResponse = {
      token: 'mock-token-123',
      clienteId: 456
    };

    it('should send POST request to login endpoint', () => {
      service.login('test@example.com', 'password123', false).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/autenticacao/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@example.com', senha: 'password123' });
      req.flush(mockLoginResponse);
    });

    it('should store token in sessionStorage when rememberMe is false', () => {
      service.login('test@example.com', 'password', false).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/autenticacao/login`);
      req.flush(mockLoginResponse);

      expect(sessionStorage.getItem('authToken')).toBe('mock-token-123');
      expect(sessionStorage.getItem('clientId')).toBe('456');
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('clientId')).toBeNull();
    });

    it('should store token in localStorage when rememberMe is true', () => {
      service.login('test@example.com', 'password', true).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/autenticacao/login`);
      req.flush(mockLoginResponse);

      expect(localStorage.getItem('authToken')).toBe('mock-token-123');
      expect(localStorage.getItem('clientId')).toBe('456');
      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('clientId')).toBeNull();
    });

    it('should update currentUser$ with clientId', (done) => {
      service.login('test@example.com', 'password', false).subscribe(() => {
        service.currentUser$.subscribe(userId => {
          if (userId !== null) {
            expect(userId).toBe(456);
            done();
          }
        });
      });

      const req = httpMock.expectOne(`${apiUrl}/autenticacao/login`);
      req.flush(mockLoginResponse);
    });

    it('should handle login error', () => {
      service.login('wrong@example.com', 'wrongpass', false).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/autenticacao/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'token1');
      localStorage.setItem('clientId', '123');
      sessionStorage.setItem('authToken', 'token2');
      sessionStorage.setItem('clientId', '456');
    });

    it('should clear localStorage auth data', () => {
      service.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('clientId')).toBeNull();
    });

    it('should clear sessionStorage auth data', () => {
      service.logout();

      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('clientId')).toBeNull();
    });

    it('should set currentUser$ to null', (done) => {
      service.logout();

      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should navigate to /login', () => {
      service.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getStoredToken', () => {
    it('should return token from localStorage if available', () => {
      localStorage.setItem('authToken', 'local-token');

      expect(service.getStoredToken()).toBe('local-token');
    });

    it('should return token from sessionStorage if localStorage is empty', () => {
      sessionStorage.setItem('authToken', 'session-token');

      expect(service.getStoredToken()).toBe('session-token');
    });

    it('should prioritize localStorage over sessionStorage', () => {
      localStorage.setItem('authToken', 'local-token');
      sessionStorage.setItem('authToken', 'session-token');

      expect(service.getStoredToken()).toBe('local-token');
    });

    it('should return null when no token is stored', () => {
      expect(service.getStoredToken()).toBeNull();
    });
  });

  describe('getStoredClientId', () => {
    it('should return clientId from localStorage', () => {
      localStorage.setItem('clientId', '789');

      expect(service.getStoredClientId()).toBe(789);
    });

    it('should return clientId from sessionStorage', () => {
      sessionStorage.setItem('clientId', '456');

      expect(service.getStoredClientId()).toBe(456);
    });

    it('should prioritize localStorage over sessionStorage', () => {
      localStorage.setItem('clientId', '111');
      sessionStorage.setItem('clientId', '222');

      expect(service.getStoredClientId()).toBe(111);
    });

    it('should return null when no clientId is stored', () => {
      expect(service.getStoredClientId()).toBeNull();
    });

    it('should parse clientId as integer', () => {
      localStorage.setItem('clientId', '999');

      const result = service.getStoredClientId();
      expect(result).toBe(999);
      expect(typeof result).toBe('number');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists in localStorage', () => {
      localStorage.setItem('authToken', 'token');

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return true when token exists in sessionStorage', () => {
      sessionStorage.setItem('authToken', 'token');

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getUserProfile', () => {
    const mockUserProfile: UserProfile = {
      clienteId: 1,
      nome: 'John Doe',
      email: 'john@example.com',
      pontuacao: 75,
      perfilRisco: {
        id: 2,
        name: 'Moderado',
        description: 'Perfil moderado'
      }
    };

    it('should send GET request to profile endpoint', () => {
      service.getUserProfile(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/perfil-risco/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserProfile);
    });

    it('should return user profile data', () => {
      service.getUserProfile(1).subscribe(profile => {
        expect(profile).toEqual(mockUserProfile);
      });

      const req = httpMock.expectOne(`${apiUrl}/perfil-risco/1`);
      req.flush(mockUserProfile);
    });

    it('should handle different clientIds', () => {
      service.getUserProfile(999).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/perfil-risco/999`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserProfile);
    });
  });

  describe('updateRiskProfile', () => {
    it('should send POST request to update risk profile', () => {
      service.updateRiskProfile(1, 3).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/perfil-risco`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ clienteId: 1, riskProfileId: 3 });
      req.flush({ success: true });
    });

    it('should handle successful update', () => {
      service.updateRiskProfile(5, 2).subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/perfil-risco`);
      req.flush({ success: true });
    });
  });
});