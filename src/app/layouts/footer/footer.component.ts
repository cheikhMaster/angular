import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone : false,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
  }
}
