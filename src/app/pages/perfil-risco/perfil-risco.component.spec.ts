import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PerfilRiscoComponent } from './perfil-risco.component';
import { AuthService } from '../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('PerfilRiscoComponent', () => {
  let component: PerfilRiscoComponent;
  let fixture: ComponentFixture<PerfilRiscoComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockUserProfileConservador = {
    clienteId: 1,
    nome: 'João Silva',
    email: 'joao@example.com',
    pontuacao: 25,
    perfilRisco: {
      id: 1,
      name: 'Conservador',
      description: 'Perfil conservador'
    }
  };

  const mockUserProfileModerado = {
    clienteId: 1,
    nome: 'Maria Santos',
    email: 'maria@example.com',
    pontuacao: 50,
    perfilRisco: {
      id: 2,
      name: 'Moderado',
      description: 'Perfil moderado'
    }
  };

  const mockUserProfileAgressivo = {
    clienteId: 1,
    nome: 'Pedro Costa',
    email: 'pedro@example.com',
    pontuacao: 85,
    perfilRisco: {
      id: 3,
      name: 'Agressivo',
      description: 'Perfil agressivo'
    }
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getStoredClientId',
      'getUserProfile'
    ], {
      currentUser$: of(1)
    });

    await TestBed.configureTestingModule({
      imports: [PerfilRiscoComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]),
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(PerfilRiscoComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.currentIndex).toBe(1);
      expect(component.selectedProfile).toBeNull();
      expect(component.userRiskProfileId).toBeNull();
      expect(component.clienteId).toBeNull();
      expect(component.isLoading).toBe(false);
      expect(component.userPontuacao).toBe(0);
      expect(component.displayedScore).toBe(0);
      expect(component.userName).toBe('');
    });

    it('should have 3 profiles defined', () => {
      expect(component.profiles.length).toBe(3);
      expect(component.profiles[0].title).toBe('Conservador');
      expect(component.profiles[1].title).toBe('Moderado');
      expect(component.profiles[2].title).toBe('Agressivo');
    });

    it('should load conservador profile when pontuacao <= 33', fakeAsync(() => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfileConservador));

      component.ngOnInit();
      tick();

      expect(component.userPontuacao).toBe(25);
      expect(component.currentIndex).toBe(0);
      expect(component.selectedProfile?.title).toBe('Conservador');
      expect(component.userName).toBe('João Silva');
      expect(component.isLoading).toBe(false);
    }));

    it('should load moderado profile when pontuacao between 34-66', fakeAsync(() => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfileModerado));

      component.ngOnInit();
      tick();

      expect(component.userPontuacao).toBe(50);
      expect(component.currentIndex).toBe(1);
      expect(component.selectedProfile?.title).toBe('Moderado');
      expect(component.userName).toBe('Maria Santos');
      expect(component.isLoading).toBe(false);
    }));

    it('should load agressivo profile when pontuacao > 66', fakeAsync(() => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfileAgressivo));

      component.ngOnInit();
      tick();

      expect(component.userPontuacao).toBe(85);
      expect(component.currentIndex).toBe(2);
      expect(component.selectedProfile?.title).toBe('Agressivo');
      expect(component.userName).toBe('Pedro Costa');
      expect(component.isLoading).toBe(false);
    }));

    it('should handle missing clientId', () => {
      spyOn(console, 'error');
      authService.getStoredClientId.and.returnValue(null);

      component.ngOnInit();

      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Cliente ID não encontrado');
      expect(authService.getUserProfile).not.toHaveBeenCalled();
    });

    it('should handle error loading user profile with fallback', fakeAsync(() => {
      spyOn(console, 'error');
      const error = new Error('Profile load failed');
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(throwError(() => error));

      component.ngOnInit();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.userPontuacao).toBe(50);
      expect(component.currentIndex).toBe(1);
      expect(component.selectedProfile?.title).toBe('Moderado');
      expect(console.error).toHaveBeenCalledWith('Erro ao carregar perfil do usuário:', error);
    }));

    it('should call animateScore with user pontuacao', fakeAsync(() => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfileModerado));
      spyOn(component, 'animateScore');

      component.ngOnInit();
      tick();

      expect(component.animateScore).toHaveBeenCalledWith(50);
    }));
  });

  describe('getRiskCategory', () => {
    it('should return "Conservador" for pontuacao <= 33', () => {
      component.userPontuacao = 0;
      expect(component.getRiskCategory()).toBe('Conservador');

      component.userPontuacao = 20;
      expect(component.getRiskCategory()).toBe('Conservador');

      component.userPontuacao = 33;
      expect(component.getRiskCategory()).toBe('Conservador');
    });

    it('should return "Moderado" for pontuacao between 34-66', () => {
      component.userPontuacao = 34;
      expect(component.getRiskCategory()).toBe('Moderado');

      component.userPontuacao = 50;
      expect(component.getRiskCategory()).toBe('Moderado');

      component.userPontuacao = 66;
      expect(component.getRiskCategory()).toBe('Moderado');
    });

    it('should return "Agressivo" for pontuacao > 66', () => {
      component.userPontuacao = 67;
      expect(component.getRiskCategory()).toBe('Agressivo');

      component.userPontuacao = 85;
      expect(component.getRiskCategory()).toBe('Agressivo');

      component.userPontuacao = 100;
      expect(component.getRiskCategory()).toBe('Agressivo');
    });
  });

  describe('getRiskColor', () => {
    it('should return green for conservador', () => {
      component.userPontuacao = 25;
      expect(component.getRiskColor()).toBe('#179231');
    });

    it('should return yellow for moderado', () => {
      component.userPontuacao = 50;
      expect(component.getRiskColor()).toBe('#FCBE05');
    });

    it('should return red for agressivo', () => {
      component.userPontuacao = 85;
      expect(component.getRiskColor()).toBe('#D93636');
    });

    it('should handle edge cases correctly', () => {
      component.userPontuacao = 33;
      expect(component.getRiskColor()).toBe('#179231');

      component.userPontuacao = 34;
      expect(component.getRiskColor()).toBe('#FCBE05');

      component.userPontuacao = 66;
      expect(component.getRiskColor()).toBe('#FCBE05');

      component.userPontuacao = 67;
      expect(component.getRiskColor()).toBe('#D93636');
    });
  });

  describe('getRiskIcon', () => {
    it('should return "shield" for conservador', () => {
      component.userPontuacao = 25;
      expect(component.getRiskIcon()).toBe('shield');
    });

    it('should return "balance" for moderado', () => {
      component.userPontuacao = 50;
      expect(component.getRiskIcon()).toBe('balance');
    });

    it('should return "rocket_launch" for agressivo', () => {
      component.userPontuacao = 85;
      expect(component.getRiskIcon()).toBe('rocket_launch');
    });
  });

  describe('animateScore', () => {
    it('should animate score from 0 to target value', fakeAsync(() => {
      const target = 50;
      component.animateScore(target);

      expect(component.displayedScore).toBe(0);

      tick(1000); 
      expect(component.displayedScore).toBeGreaterThan(0);
      expect(component.displayedScore).toBeLessThan(target);

      tick(1500); 
      expect(component.displayedScore).toBe(target);
    }));

    it('should reach exact target value', fakeAsync(() => {
      component.animateScore(75);
      tick(2500);
      expect(component.displayedScore).toBe(75);
    }));

    it('should animate score for low values', fakeAsync(() => {
      component.animateScore(10);
      tick(2500);
      expect(component.displayedScore).toBe(10);
    }));

    it('should animate score for high values', fakeAsync(() => {
      component.animateScore(100);
      tick(2500);
      expect(component.displayedScore).toBe(100);
    }));
  });

  describe('Profile Data', () => {
    it('should have correct conservador profile data', () => {
      const conservador = component.profiles[0];
      expect(conservador.id).toBe(1);
      expect(conservador.title).toBe('Conservador');
      expect(conservador.icon).toBe('shield');
      expect(conservador.riskLevel).toBe(2);
      expect(conservador.features.length).toBe(4);
    });

    it('should have correct moderado profile data', () => {
      const moderado = component.profiles[1];
      expect(moderado.id).toBe(2);
      expect(moderado.title).toBe('Moderado');
      expect(moderado.icon).toBe('balance');
      expect(moderado.riskLevel).toBe(3);
      expect(moderado.features.length).toBe(4);
    });

    it('should have correct agressivo profile data', () => {
      const agressivo = component.profiles[2];
      expect(agressivo.id).toBe(3);
      expect(agressivo.title).toBe('Agressivo');
      expect(agressivo.icon).toBe('rocket_launch');
      expect(agressivo.riskLevel).toBe(5);
      expect(agressivo.features.length).toBe(4);
    });

    it('should have profiles sorted by risk level', () => {
      expect(component.profiles[0].riskLevel).toBeLessThan(component.profiles[1].riskLevel);
      expect(component.profiles[1].riskLevel).toBeLessThan(component.profiles[2].riskLevel);
    });
  });

  describe('Edge Cases', () => {
    it('should handle pontuacao of 0', () => {
      component.userPontuacao = 0;
      expect(component.getRiskCategory()).toBe('Conservador');
      expect(component.getRiskColor()).toBe('#179231');
      expect(component.getRiskIcon()).toBe('shield');
    });

    it('should handle pontuacao of 100', () => {
      component.userPontuacao = 100;
      expect(component.getRiskCategory()).toBe('Agressivo');
      expect(component.getRiskColor()).toBe('#D93636');
      expect(component.getRiskIcon()).toBe('rocket_launch');
    });

    it('should handle boundary values correctly', () => {

      component.userPontuacao = 33;
      const cat33 = component.getRiskCategory();
      component.userPontuacao = 34;
      const cat34 = component.getRiskCategory();
      expect(cat33).not.toBe(cat34);

      component.userPontuacao = 66;
      const cat66 = component.getRiskCategory();
      component.userPontuacao = 67;
      const cat67 = component.getRiskCategory();
      expect(cat66).not.toBe(cat67);
    });

    it('should handle profile with missing pontuacao (defaults to 50)', fakeAsync(() => {
      const profileWithoutPontuacao = {
        ...mockUserProfileModerado,
        pontuacao: undefined as any
      };
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(profileWithoutPontuacao));

      component.ngOnInit();
      tick();

      expect(component.userPontuacao).toBe(50);
    }));
  });

  describe('Component State', () => {
    it('should update all related properties on profile load', fakeAsync(() => {
      authService.getStoredClientId.and.returnValue(1);
      authService.getUserProfile.and.returnValue(of(mockUserProfileAgressivo));

      component.ngOnInit();
      tick();

      expect(component.userRiskProfileId).toBe(3);
      expect(component.userPontuacao).toBe(85);
      expect(component.userName).toBe('Pedro Costa');
      expect(component.currentIndex).toBe(2);
      expect(component.selectedProfile).toBeTruthy();
      expect(component.isLoading).toBe(false);
    }));
  });
});
