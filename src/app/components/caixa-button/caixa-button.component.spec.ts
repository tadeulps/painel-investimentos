import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaixaButtonComponent } from './caixa-button.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

describe('CaixaButtonComponent', () => {
  let component: CaixaButtonComponent;
  let fixture: ComponentFixture<CaixaButtonComponent>;
  let compiled: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaixaButtonComponent, MatIconModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CaixaButtonComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have primary variant by default', () => {
      expect(component.variant).toBe('primary');
    });

    it('should not be disabled by default', () => {
      expect(component.disabled).toBe(false);
    });

    it('should not be fullWidth by default', () => {
      expect(component.fullWidth).toBe(false);
    });

    it('should have no icon by default', () => {
      expect(component.icon).toBeUndefined();
    });
  });

  describe('Input Properties', () => {
    it('should accept primary variant', () => {
      component.variant = 'primary';
      fixture.detectChanges();
      expect(component.variant).toBe('primary');
    });

    it('should accept secondary variant', () => {
      component.variant = 'secondary';
      fixture.detectChanges();
      expect(component.variant).toBe('secondary');
    });

    it('should accept outlined variant', () => {
      component.variant = 'outlined';
      fixture.detectChanges();
      expect(component.variant).toBe('outlined');
    });

    it('should accept danger variant', () => {
      component.variant = 'danger';
      fixture.detectChanges();
      expect(component.variant).toBe('danger');
    });

    it('should accept disabled state', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(component.disabled).toBe(true);
    });

    it('should accept fullWidth property', () => {
      component.fullWidth = true;
      fixture.detectChanges();
      expect(component.fullWidth).toBe(true);
    });

    it('should accept icon property', () => {
      component.icon = 'add';
      fixture.detectChanges();
      expect(component.icon).toBe('add');
    });
  });

  describe('Click Event', () => {
    it('should emit clicked event when button is clicked', () => {
      spyOn(component.clicked, 'emit');
      
      component.onClick();
      
      expect(component.clicked.emit).toHaveBeenCalled();
    });

    it('should not emit clicked event when button is disabled', () => {
      component.disabled = true;
      spyOn(component.clicked, 'emit');
      
      component.onClick();
      
      expect(component.clicked.emit).not.toHaveBeenCalled();
    });

    it('should emit event when enabled button is clicked multiple times', () => {
      spyOn(component.clicked, 'emit');
      
      component.onClick();
      component.onClick();
      component.onClick();
      
      expect(component.clicked.emit).toHaveBeenCalledTimes(3);
    });

    it('should transition from disabled to enabled and emit event', () => {
      component.disabled = true;
      spyOn(component.clicked, 'emit');
      
      component.onClick();
      expect(component.clicked.emit).not.toHaveBeenCalled();
      
      component.disabled = false;
      component.onClick();
      expect(component.clicked.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Behavior', () => {
    it('should allow clicking when not disabled', () => {
      component.disabled = false;
      spyOn(component.clicked, 'emit');
      
      component.onClick();
      
      expect(component.clicked.emit).toHaveBeenCalled();
    });

    it('should prevent clicking when disabled', () => {
      component.disabled = true;
      spyOn(component.clicked, 'emit');
      
      component.onClick();
      
      expect(component.clicked.emit).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicks', () => {
      spyOn(component.clicked, 'emit');
      
      for (let i = 0; i < 10; i++) {
        component.onClick();
      }
      
      expect(component.clicked.emit).toHaveBeenCalledTimes(10);
    });

    it('should handle variant changes', () => {
      component.variant = 'primary';
      expect(component.variant).toBe('primary');
      
      component.variant = 'secondary';
      expect(component.variant).toBe('secondary');
      
      component.variant = 'outlined';
      expect(component.variant).toBe('outlined');
      
      component.variant = 'danger';
      expect(component.variant).toBe('danger');
    });

    it('should handle icon updates', () => {
      expect(component.icon).toBeUndefined();
      
      component.icon = 'home';
      expect(component.icon).toBe('home');
      
      component.icon = 'settings';
      expect(component.icon).toBe('settings');
    });

    it('should toggle fullWidth property', () => {
      expect(component.fullWidth).toBe(false);
      
      component.fullWidth = true;
      expect(component.fullWidth).toBe(true);
      
      component.fullWidth = false;
      expect(component.fullWidth).toBe(false);
    });

    it('should toggle disabled property', () => {
      expect(component.disabled).toBe(false);
      
      component.disabled = true;
      expect(component.disabled).toBe(true);
      
      component.disabled = false;
      expect(component.disabled).toBe(false);
    });
  });
});
