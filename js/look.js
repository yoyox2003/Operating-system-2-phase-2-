const ctx = document.getElementById('myChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'Requests',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        parsing: false, 
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Requests'
                },
                type: 'linear', 
                ticks: {
                    autoSkip: false,
                    callback: function (value) {
                        return value; 
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Time (Simulation not real)'
                },
                min: 0,
                max: 10,
                ticks: {
                    stepSize: 2
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Custom Plot with Input Values'
            }
        }
    }
});

function addPoint(x, y) {
    chart.data.datasets[0].data.push({ x: x, y: y });
}

function updateChart() {
    const input = document.getElementById('inputArray').value;
    const inputData = input.split(',').map(value => parseInt(value.trim()));

    if (inputData.length > 0 && inputData.every(num => !isNaN(num))) {

        chart.data.datasets[0].data = [];


        const sortedUniqueXValues = [...new Set(inputData)].sort((a, b) => a - b);

       
        chart.options.scales.x.ticks.values = sortedUniqueXValues;

        
        inputData.forEach((x, index) => {
            addPoint(x, index * 2);
        });

        const minX = Math.min(...sortedUniqueXValues);
        const maxX = Math.max(...sortedUniqueXValues);
        const minY = 0;
        const maxY = inputData.length * 2;


        chart.options.scales.x.min = minX;  
        chart.options.scales.x.max = maxX;  
        chart.options.scales.y.min = minY;  
        chart.options.scales.y.max = maxY;  

        chart.update();
    } else {
        alert('Please enter valid comma-separated numbers.');
    }
}