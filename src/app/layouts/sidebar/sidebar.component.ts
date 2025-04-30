import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone : false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  username = '';
  isAdmin = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.username = this.authService.currentUserValue?.username || '';
    this.isAdmin = this.authService.isAdmin();
  }
}
