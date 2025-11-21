import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockLoginResponse = {
    token: 'fake-jwt-token',
    clienteId: 1
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'isAuthenticated'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideRouter([]),
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')?.value).toBe('tadeu@caixa.com');
      expect(component.loginForm.get('senha')?.value).toBe('123456');
      expect(component.loginForm.get('rememberMe')?.value).toBe(false);
    });

    it('should initialize with default state', () => {
      expect(component.showPassword).toBe(false);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('should redirect to dashboard if already authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not redirect if not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      component.ngOnInit();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should require email field', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');

      expect(emailControl?.hasError('required')).toBe(true);
      expect(emailControl?.valid).toBe(false);
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
      expect(emailControl?.valid).toBe(true);
    });

    it('should require senha field', () => {
      const senhaControl = component.loginForm.get('senha');
      senhaControl?.setValue('');

      expect(senhaControl?.hasError('required')).toBe(true);
      expect(senhaControl?.valid).toBe(false);
    });

    it('should validate senha minimum length', () => {
      const senhaControl = component.loginForm.get('senha');
      
      senhaControl?.setValue('123');
      expect(senhaControl?.hasError('minlength')).toBe(true);
      
      senhaControl?.setValue('123456');
      expect(senhaControl?.hasError('minlength')).toBe(false);
      expect(senhaControl?.valid).toBe(true);
    });

    it('should mark form as invalid when fields are empty', () => {
      component.loginForm.get('email')?.setValue('');
      component.loginForm.get('senha')?.setValue('');

      expect(component.loginForm.valid).toBe(false);
    });

    it('should mark form as valid when all fields are correct', () => {
      component.loginForm.get('email')?.setValue('user@example.com');
      component.loginForm.get('senha')?.setValue('password123');

      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('togglePassword', () => {
    it('should toggle showPassword from false to true', () => {
      component.showPassword = false;

      component.togglePassword();

      expect(component.showPassword).toBe(true);
    });

    it('should toggle showPassword from true to false', () => {
      component.showPassword = true;

      component.togglePassword();

      expect(component.showPassword).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      expect(component.showPassword).toBe(false);
      
      component.togglePassword();
      expect(component.showPassword).toBe(true);
      
      component.togglePassword();
      expect(component.showPassword).toBe(false);
      
      component.togglePassword();
      expect(component.showPassword).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.loginForm.get('email')?.setValue('');
      component.loginForm.get('senha')?.setValue('');

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid', () => {
      component.loginForm.get('email')?.setValue('');
      component.loginForm.get('senha')?.setValue('');
      spyOn(component.loginForm, 'markAllAsTouched');

      component.onSubmit();

      expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should set isLoading to true on submit', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('password');

      component.onSubmit();

      expect(component.isLoading).toBe(true);
    });

    it('should clear error message on submit', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      component.errorMessage = 'Previous error';
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('password');

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });

    it('should call authService.login with correct parameters', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      component.loginForm.get('email')?.setValue('user@example.com');
      component.loginForm.get('senha')?.setValue('mypassword');
      component.loginForm.get('rememberMe')?.setValue(true);

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith('user@example.com', 'mypassword', true);
    });

    it('should navigate to dashboard on successful login', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('password');

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle 401 error (unauthorized)', () => {
      const error = { status: 401, message: 'Unauthorized' };
      authService.login.and.returnValue(throwError(() => error));
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('wrongpassword');

      component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('E-mail ou senha incorretos. Recupere as credenciais e tente novamente.');
    });

    it('should handle 400 error (bad request)', () => {
      const error = { status: 400, message: 'Bad Request' };
      authService.login.and.returnValue(throwError(() => error));
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('password');

      component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Por favor, preencha todos os campos.');
    });

    it('should handle generic error', () => {
      const error = { status: 500, message: 'Server Error' };
      authService.login.and.returnValue(throwError(() => error));
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('password');

      component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Erro ao fazer login. Tente novamente mais tarde.');
    });

    it('should pass rememberMe as false when unchecked', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('password');
      component.loginForm.get('rememberMe')?.setValue(false);

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password', false);
    });
  });

  describe('forgotPassword', () => {
    it('should prevent default event', () => {
      const event = new Event('click');
      spyOn(event, 'preventDefault');

      component.forgotPassword(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should show alert with credentials', () => {
      spyOn(window, 'alert');
      const event = new Event('click');

      component.forgotPassword(event);

      expect(window.alert).toHaveBeenCalledWith(
        'Utilizar as seguintes credenciais:\nE-mail: tadeu@caixa.com\nSenha: 123456'
      );
    });
  });

  describe('register', () => {
    it('should prevent default event', () => {
      const event = new Event('click');
      spyOn(event, 'preventDefault');

      component.register(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should show alert about future implementation', () => {
      spyOn(window, 'alert');
      const event = new Event('click');

      component.register(event);

      expect(window.alert).toHaveBeenCalledWith('Funcionalidade de cadastro será implementada em breve.');
    });
  });

  describe('Edge Cases', () => {
    it('should handle password with minimum length', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('123456');

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith('test@example.com', '123456', false);
    });

    it('should handle false rememberMe value explicitly', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('password');
      component.loginForm.get('rememberMe')?.setValue(false);

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password', false);
    });

    it('should handle network error gracefully', () => {
      const error = { status: 0, message: 'Network Error' };
      authService.login.and.returnValue(throwError(() => error));
      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('senha')?.setValue('password');

      component.onSubmit();

      expect(component.errorMessage).toBe('Erro ao fazer login. Tente novamente mais tarde.');
    });
  });
});
