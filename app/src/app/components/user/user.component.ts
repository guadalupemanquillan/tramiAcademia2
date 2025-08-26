import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
  users$: Observable<User[]> = of([]);
  constructor(private userService: UserService) {}
  ngOnInit(): void {
    this.users$ = this.userService.getAll();
  }
}


