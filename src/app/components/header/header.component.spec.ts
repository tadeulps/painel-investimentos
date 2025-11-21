import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject(null);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'logout'
    ]);
    authServiceSpy.currentUser$ = currentUserSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([
          { path: 'dashboard', component: HeaderComponent },
          { path: 'perfil-risco', component: HeaderComponent },
          { path: 'produtos', component: HeaderComponent },
          { path: 'simulacao', component: HeaderComponent },
          { path: 'login', component: HeaderComponent }
        ])
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with logged out state when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      
      fixture.detectChanges();
      
      expect(component.isLoggedIn).toBe(false);
      expect(authService.isAuthenticated).toHaveBeenCalled();
    });

    it('should initialize with logged in state when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      currentUserSubject.next({ id: 1, nome: 'Test User' });
      
      fixture.detectChanges();
      
      expect(component.isLoggedIn).toBe(true);
      expect(authService.isAuthenticated).toHaveBeenCalled();
    });

    it('should subscribe to currentUser$ on init', () => {
      authService.isAuthenticated.and.returnValue(false);
      
      fixture.detectChanges();
      
      expect(component.isLoggedIn).toBe(false);
      
      currentUserSubject.next({ id: 1, email: 'test@test.com' });
      
      expect(component.isLoggedIn).toBe(true);
    });
  });

  describe('Authentication Status', () => {
    it('should update isLoggedIn when user logs in', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      expect(component.isLoggedIn).toBe(false);
      
      currentUserSubject.next({ id: 1, email: 'user@example.com' });
      
      expect(component.isLoggedIn).toBe(true);
    });

    it('should update isLoggedIn when user logs out', () => {
      authService.isAuthenticated.and.returnValue(true);
      currentUserSubject.next({ id: 1, email: 'user@example.com' });
      fixture.detectChanges();
      
      expect(component.isLoggedIn).toBe(true);
      
      currentUserSubject.next(null);
      
      expect(component.isLoggedIn).toBe(false);
    });

    it('should handle multiple authentication state changes', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      expect(component.isLoggedIn).toBe(false);
      
      currentUserSubject.next({ id: 1, email: 'user1@example.com' });
      expect(component.isLoggedIn).toBe(true);
      
      currentUserSubject.next(null);
      expect(component.isLoggedIn).toBe(false);
      
      currentUserSubject.next({ id: 2, email: 'user2@example.com' });
      expect(component.isLoggedIn).toBe(true);
    });
  });

  describe('Logout Functionality', () => {
    it('should call authService.logout when onLogout is called', () => {
      component.onLogout();
      
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should call logout only once per call', () => {
      component.onLogout();
      
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple logout calls', () => {
      component.onLogout();
      component.onLogout();
      component.onLogout();
      
      expect(authService.logout).toHaveBeenCalledTimes(3);
    });
  });

  describe('User State Management', () => {
    it('should treat null user as logged out', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      currentUserSubject.next(null);
      
      expect(component.isLoggedIn).toBe(false);
    });

    it('should treat undefined user as logged out', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      currentUserSubject.next(undefined);
      
      expect(component.isLoggedIn).toBe(false);
    });

    it('should treat any truthy user object as logged in', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      currentUserSubject.next({ id: 1 });
      expect(component.isLoggedIn).toBe(true);
      
      currentUserSubject.next({ email: 'test@test.com' });
      expect(component.isLoggedIn).toBe(true);
    });

    it('should handle empty user object as logged in', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      currentUserSubject.next({});
      
      expect(component.isLoggedIn).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should start logged in and handle logout', () => {
      authService.isAuthenticated.and.returnValue(true);
      currentUserSubject.next({ id: 1, email: 'user@example.com' });
      fixture.detectChanges();
      
      expect(component.isLoggedIn).toBe(true);
      
      component.onLogout();
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should start logged out and not have logout called initially', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      expect(component.isLoggedIn).toBe(false);
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should handle rapid login/logout cycles', () => {
      authService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      
      for (let i = 0; i < 5; i++) {
        currentUserSubject.next({ id: i });
        expect(component.isLoggedIn).toBe(true);
        
        currentUserSubject.next(null);
        expect(component.isLoggedIn).toBe(false);
      }
    });
  });
});
