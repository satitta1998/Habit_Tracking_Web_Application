/**
 * BarChart Component
 * Responsible for rendering a bar chart using the Chart.js.
 * It is used to visualize data such as the completion percentage of habits for the user's friends.
 */

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register the components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = ({ data, width = 400, height = 400 }) => {
  // Define the bar chart data
  const barData = {
    labels: data.name, // X-axis labels
    datasets: [
      {
        label: 'Completion Percentage', // Label for the dataset
        data: data.percentage, // Data for the bars
        backgroundColor: 'rgba(100, 180, 246, 0.4)', // Bar color
        borderColor: 'rgba(75, 192, 192, 1)', // Border color of the bars
        borderWidth: 1, // Border width
      },
    ],
  };

  // Define the options for the chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // Legend position
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            // Custom tooltip label
            return `${context.dataset.label}: ${context.raw}%`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true, // Start x-axis at zero
      },
      y: {
        beginAtZero: true, // Start y-axis at zero
        min: 0, // Minimum value of y-axis
        max: 100, // Maximum value of y-axis
        ticks: {
          callback: function(value) {
            return `${value}%`; // Format y-axis labels with percentage sign
          },
        },
      },
    },
  };

  return <Bar data={barData} options={options} width={width} height={height} />;
};

export default BarChart;
