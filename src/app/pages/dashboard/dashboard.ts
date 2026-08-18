import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { InputComponent } from '../../components/ui/input/input';
import { DistribuidorService } from '../../core/services/distribuidor.service';
import type { DistribuidorStatus } from '../../core/types/distribuidor.types';

declare var ApexCharts: any;

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CardComponent, ButtonComponent, CurrencyPipe, FormsModule, InputComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly distribuidorService = inject(DistribuidorService);

  readonly status = signal<DistribuidorStatus | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  
  // Aumento de crédito
  isIncreaseFormVisible = signal(false);
  increaseAmount = 0;
  increaseReason = '';
  readonly isIncreasing = signal(false);
  readonly increaseError = signal('');
  readonly increaseSuccess = signal('');

  private chart: any;

  ngOnInit() {
    this.distribuidorService.getMyStatus().subscribe({
      next: (response) => {
        this.status.set(response.data);
        this.isLoading.set(false);
        setTimeout(() => this.renderChart(response.data), 0);
      },
      error: (err) => {
        this.errorMessage.set('No se pudo cargar la información.');
        this.isLoading.set(false);
      }
    });
  }

  solicitarAumento() {
    this.increaseError.set('');
    this.increaseSuccess.set('');
    
    if (this.increaseAmount <= 0) {
      this.increaseError.set('Ingresa un monto válido mayor a 0');
      return;
    }
    if (!this.increaseReason.trim()) {
      this.increaseError.set('El motivo es obligatorio');
      return;
    }

    const currentStatus = this.status();
    if (!currentStatus) return;

    this.isIncreasing.set(true);

    const dto = {
      montoCentavos: this.increaseAmount * 100,
      motivo: this.increaseReason.trim()
    };

    this.distribuidorService.requestCreditRaise(currentStatus.id, dto).subscribe({
      next: (res) => {
        this.isIncreasing.set(false);
        // Ahora res.data es de tipo CreditRaiseRequest, que representa la solicitud pendiente
        // Por lo tanto, no actualizamos la gráfica ni el estatus porque el crédito aún no aumenta.
        this.increaseSuccess.set(res.message);
        
        this.increaseAmount = 0;
        this.increaseReason = '';
        setTimeout(() => {
          this.isIncreaseFormVisible.set(false);
          this.increaseSuccess.set('');
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.isIncreasing.set(false);
        this.increaseError.set(err.error?.message || 'Error al solicitar el aumento');
      }
    });
  }

  private renderChart(data: DistribuidorStatus) {
    if (typeof ApexCharts === 'undefined') return;
    
    const limit = data.creditLimitCents / 100;
    const available = data.creditAvailableCents / 100;
    const used = limit - available;
    
    const usedPercentage = limit > 0 ? (used / limit) * 100 : 0;
    const availablePercentage = limit > 0 ? (available / limit) * 100 : 0;

    const options = {
      series: [usedPercentage, availablePercentage],
      colors: ["#600C0C", "#e5e7eb"], // Brand color vs Gray
      chart: {
        height: 320,
        type: "donut",
      },
      stroke: {
        colors: ["transparent"],
        lineCap: "",
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: 20,
              },
              total: {
                showAlways: true,
                show: true,
                label: "Crédito Usado",
                fontFamily: "Inter, sans-serif",
                formatter: function (w: any) {
                  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(used);
                },
              },
              value: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: -20,
                formatter: function (value: any) {
                  return value.toFixed(1) + "%";
                },
              },
            },
            size: "80%",
          },
        },
      },
      grid: {
        padding: {
          top: -2,
        },
      },
      labels: ["Usado", "Disponible"],
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
    };

    if (this.chart) {
      this.chart.destroy();
    }
    
    this.chart = new ApexCharts(document.getElementById("donut-chart"), options);
    this.chart.render();
  }
}
