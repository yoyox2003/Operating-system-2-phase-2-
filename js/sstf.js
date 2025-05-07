const ctx = document.getElementById("myChart").getContext("2d");
const chart = new Chart(ctx, {
    type: "line",
    data: {
        datasets: [
            {
                label: "Requests",
                data: [],
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
                fill: false,
                tension: 0.1,
            },
        ],
    },
    options: {
        responsive: true,
        parsing: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Requests",
                },
                type: "linear",
                ticks: {
                    autoSkip: false,
                    callback: function (value) {
                        return value;
                    },
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Time (Simulation not real)",
                },
                min: 0,
                max: 10,
                ticks: {
                    stepSize: 2,
                },
            },
        },
        plugins: {
            title: {
                display: true,
                text: "Custom Plot with Input Values",
            },
        },
    },
});

function addPoint(x, y) {
    chart.data.datasets[0].data.push({ x: x, y: y });
}

function updateChart() {
    const input = document.getElementById("inputArray").value;
    let inputData = input.split(",").map((value) => parseInt(value.trim()));
    const initialHead = document.getElementById("initialHead").value;

    let result = sstf(inputData, initialHead, true);
    inputData = result.sequence;

    if (
        inputData.length > 0 &&
        inputData.every((num) => !isNaN(num)) &&
        initialHead
    ) {
        chart.data.datasets[0].data = [];

        const sortedUniqueXValues = [...new Set(inputData)].sort(
            (a, b) => a - b
        );

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
        alert("Please enter valid comma-separated numbers and intial head.");
    }
}

function sstf(requests, initialHead, preferLarger = true) {
    // Create a copy of requests to work with (so we don't modify the original array)
    const pendingRequests = [...requests];

    // Keep track of the head movement sequence (starting with initial head position)
    const sequence = [initialHead];

    // Current head position
    let currentHead = initialHead;

    // Total head movement
    let totalMovement = 0;

    // Store individual movements for calculation display
    const movements = [];

    // Process all requests until none are left
    while (pendingRequests.length > 0) {
        // Find the closest request to the current head position
        let minDistance = Infinity;
        let closestRequestIndex = -1;

        // Loop through all pending requests to find the closest one
        for (let i = 0; i < pendingRequests.length; i++) {
            // Calculate distance (absolute difference between positions)
            const distance = Math.abs(currentHead - pendingRequests[i]);

            // If this request is closer than any we've seen so far
            if (distance < minDistance) {
                minDistance = distance;
                closestRequestIndex = i;
            }
            // If the distance is the same (tie), use direction preference
            else if (distance === minDistance) {
                const currentClosest = pendingRequests[closestRequestIndex];
                const newOption = pendingRequests[i];

                // If we prefer larger cylinder numbers (moving up)
                if (preferLarger) {
                    // Choose the larger cylinder number in case of tie
                    if (newOption > currentClosest) {
                        closestRequestIndex = i;
                    }
                }
                // If we prefer smaller cylinder numbers (moving down)
                else {
                    // Choose the smaller cylinder number in case of tie
                    if (newOption < currentClosest) {
                        closestRequestIndex = i;
                    }
                }
            }
        }

        // Get the cylinder number of the closest request
        const nextCylinder = pendingRequests[closestRequestIndex];

        // Calculate the movement needed
        const movement = Math.abs(currentHead - nextCylinder);

        // Add to total movement
        totalMovement += movement;

        // Store this movement for later
        movements.push({
            from: currentHead,
            to: nextCylinder,
            distance: movement,
        });

        // Update current head position to the serviced request
        currentHead = nextCylinder;

        // Add this position to our sequence
        sequence.push(currentHead);

        // Remove the processed request from our pending list
        pendingRequests.splice(closestRequestIndex, 1);
    }

    // Return the results
    return {
        sequence: sequence,
        movements: movements,
        totalMovement: totalMovement,
    };
}
