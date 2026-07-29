import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../components/ui/search-bar/search-bar';
import { CardComponent } from '../../components/ui/card/card';

@Component({
  selector: 'app-mi-cartera',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, CardComponent],
  templateUrl: './mi-cartera.html',
  styleUrl: './mi-cartera.css',
})
export class MiCartera {
  searchTerm: string = '';

  onSearch(term: string) {
    this.searchTerm = term;
  }
}
