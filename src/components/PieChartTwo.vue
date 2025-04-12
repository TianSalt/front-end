<template>
    <div>
      <canvas id="pie-chart-2"></canvas>
    </div>
  </template>
  
  <script>
  import { Chart, registerables } from 'chart.js';
  Chart.register(...registerables);
  
  export default {
    name: 'PieChartTwo',
    props: {
      data: {
        type: Array,
        required: true
      },
      labels: {
        type: Array,
        required: true
      },
      title: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        chart: null // 用于存储 Chart 实例
      };
    },
    mounted() {
      this.createBarChart();
    },
    beforeDestroy() {
      // 在组件销毁前销毁图表实例
      if (this.chart) {
        this.chart.destroy();
      }
    },
    methods: {
      createBarChart() {
        const ctx = document.getElementById('pie-chart-2').getContext('2d');
  
        // 如果已经存在图表实例，先销毁它
        if (this.chart) {
          this.chart.destroy();
        }
  
        // 创建新的图表实例
        this.chart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: this.labels,
            datasets: [{
              label: this.title,
              backgroundColor: ['rgb(127,255,212)', 'rgb(255,99,132)'], // 两种颜色
              borderColor: ['rgb(127,255,212)', 'rgb(255,99,132)'],     // 两种颜色
              borderWidth: 1,
              data: this.data
            }]
          },
          options: {
            responsive: true, // 使图表响应式
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: this.title
              }
            }
          }
        });
      }
    }
  };
  </script>
  