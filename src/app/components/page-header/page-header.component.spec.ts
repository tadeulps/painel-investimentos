import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;
  let compiled: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have empty title by default', () => {
      expect(component.title).toBe('');
    });

    it('should have empty subtitle by default', () => {
      expect(component.subtitle).toBe('');
    });
  });

  describe('Input Properties', () => {
    it('should accept and display title input', () => {
      component.title = 'Test Title';
      fixture.detectChanges();

      const titleElement = compiled.query(By.css('h1'));
      expect(titleElement.nativeElement.textContent).toBe('Test Title');
    });

    it('should accept and display subtitle input', () => {
      component.subtitle = 'Test Subtitle';
      fixture.detectChanges();

      const subtitleElement = compiled.query(By.css('.subtitle'));
      expect(subtitleElement.nativeElement.textContent).toBe('Test Subtitle');
    });

    it('should update title dynamically', () => {
      component.title = 'Initial Title';
      fixture.detectChanges();
      let titleElement = compiled.query(By.css('h1'));
      expect(titleElement.nativeElement.textContent).toBe('Initial Title');

      component.title = 'Updated Title';
      fixture.detectChanges();
      titleElement = compiled.query(By.css('h1'));
      expect(titleElement.nativeElement.textContent).toBe('Updated Title');
    });

    it('should update subtitle dynamically', () => {
      component.subtitle = 'Initial Subtitle';
      fixture.detectChanges();
      let subtitleElement = compiled.query(By.css('.subtitle'));
      expect(subtitleElement.nativeElement.textContent).toBe('Initial Subtitle');

      component.subtitle = 'Updated Subtitle';
      fixture.detectChanges();
      subtitleElement = compiled.query(By.css('.subtitle'));
      expect(subtitleElement.nativeElement.textContent).toBe('Updated Subtitle');
    });
  });

  describe('Template Rendering', () => {
    it('should render page-header container', () => {
      const headerContainer = compiled.query(By.css('.page-header'));
      expect(headerContainer).toBeTruthy();
    });

    it('should render h1 element', () => {
      const h1Element = compiled.query(By.css('h1'));
      expect(h1Element).toBeTruthy();
    });

    it('should render subtitle paragraph with correct class', () => {
      const subtitleElement = compiled.query(By.css('p.subtitle'));
      expect(subtitleElement).toBeTruthy();
    });

    it('should display empty strings when no inputs provided', () => {
      const titleElement = compiled.query(By.css('h1'));
      const subtitleElement = compiled.query(By.css('.subtitle'));
      
      expect(titleElement.nativeElement.textContent).toBe('');
      expect(subtitleElement.nativeElement.textContent).toBe('');
    });

    it('should handle long title text', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines in the UI';
      component.title = longTitle;
      fixture.detectChanges();

      const titleElement = compiled.query(By.css('h1'));
      expect(titleElement.nativeElement.textContent).toBe(longTitle);
    });

    it('should handle long subtitle text', () => {
      const longSubtitle = 'This is a very long subtitle that provides detailed information about the current page and might wrap to multiple lines';
      component.subtitle = longSubtitle;
      fixture.detectChanges();

      const subtitleElement = compiled.query(By.css('.subtitle'));
      expect(subtitleElement.nativeElement.textContent).toBe(longSubtitle);
    });

    it('should handle special characters in title', () => {
      component.title = 'Título com Açẽntos & Símbolos!';
      fixture.detectChanges();

      const titleElement = compiled.query(By.css('h1'));
      expect(titleElement.nativeElement.textContent).toBe('Título com Açẽntos & Símbolos!');
    });

    it('should handle special characters in subtitle', () => {
      component.subtitle = 'Subtítulo com caracteres especiais: @#$%';
      fixture.detectChanges();

      const subtitleElement = compiled.query(By.css('.subtitle'));
      expect(subtitleElement.nativeElement.textContent).toBe('Subtítulo com caracteres especiais: @#$%');
    });
  });

  describe('Integration Scenarios', () => {
    it('should display both title and subtitle together', () => {
      component.title = 'Dashboard';
      component.subtitle = 'Visão geral dos seus investimentos';
      fixture.detectChanges();

      const titleElement = compiled.query(By.css('h1'));
      const subtitleElement = compiled.query(By.css('.subtitle'));
      
      expect(titleElement.nativeElement.textContent).toBe('Dashboard');
      expect(subtitleElement.nativeElement.textContent).toBe('Visão geral dos seus investimentos');
    });

    it('should handle title without subtitle', () => {
      component.title = 'Only Title';
      component.subtitle = '';
      fixture.detectChanges();

      const titleElement = compiled.query(By.css('h1'));
      const subtitleElement = compiled.query(By.css('.subtitle'));
      
      expect(titleElement.nativeElement.textContent).toBe('Only Title');
      expect(subtitleElement.nativeElement.textContent).toBe('');
    });

    it('should handle subtitle without title', () => {
      component.title = '';
      component.subtitle = 'Only Subtitle';
      fixture.detectChanges();

      const titleElement = compiled.query(By.css('h1'));
      const subtitleElement = compiled.query(By.css('.subtitle'));
      
      expect(titleElement.nativeElement.textContent).toBe('');
      expect(subtitleElement.nativeElement.textContent).toBe('Only Subtitle');
    });
  });
});
