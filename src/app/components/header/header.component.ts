import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();

    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
