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
