import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';

declare var ApexCharts: any;

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit {
  ngAfterViewInit() {
    if (typeof ApexCharts !== 'undefined') {
      const options = {
        series: [70, 30],
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
                    return "$15,400";
                  },
                },
                value: {
                  show: true,
                  fontFamily: "Inter, sans-serif",
                  offsetY: -20,
                  formatter: function (value: any) {
                    return value + "%";
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

      const chart = new ApexCharts(document.getElementById("donut-chart"), options);
      chart.render();
    }
  }
}
