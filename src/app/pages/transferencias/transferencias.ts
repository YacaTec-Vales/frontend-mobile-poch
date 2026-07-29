import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';

@Component({
  selector: 'app-transferencias',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  templateUrl: './transferencias.html',
  styleUrl: './transferencias.css',
})
export class Transferencias {
  activeTab: 'inbox' | 'sent' = 'inbox';

  setTab(tab: 'inbox' | 'sent') {
    this.activeTab = tab;
  }
}
