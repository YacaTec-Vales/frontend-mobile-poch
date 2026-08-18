import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/ui/card/card';
import { InputComponent } from '../../components/ui/input/input';
import { ButtonComponent } from '../../components/ui/button/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nuevo-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './nuevo-cliente.html',
  styleUrl: './nuevo-cliente.css',
})
export class NuevoCliente {
  nombre: string = '';
  curp: string = '';
}
