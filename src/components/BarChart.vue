<template>
  <div>
    <canvas id="bar-chart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  name: "BarChart",
  props: {
    data: {
      type: Array,
      required: true,
    },
    labels: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.createBarChart();
  },
  methods: {
    createBarChart() {
      const ctx = document.getElementById("bar-chart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.labels,
          datasets: [
            {
              label: this.title,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
              data: this.data,
            },
          ],
        },
        options: {
          scales: {
            y: {
              // 使用 'y' 而不是 'yAxes'
              beginAtZero: true,
            },
          },
        },
      });
    },
  },
};
</script>
