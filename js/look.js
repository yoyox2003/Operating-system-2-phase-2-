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

    let result = look(inputData, initialHead, true);
    inputData = result.sequence;
    console.log(inputData); // used this to test and see the array

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
        alert("Please enter valid comma-separated numbers and initial head.");
    }
}

function look(requests, initialHead, directionUp = true, maxCylinder = 199) {
    // Create a copy of requests to work with
    let pendingRequests = [...requests];

    // Keep track of the head movement sequence
    const sequence = [initialHead];

    // Current head position
    let currentHead = initialHead;

    // Total head movement
    let totalMovement = 0;

    // Store individual movements for calculation display
    const movements = [];

    // Create two arrays, one for requests greater than initialHead and one for less
    const greaterRequests = pendingRequests
        .filter((req) => req > initialHead)
        .sort((a, b) => a - b);
    const lessRequests = pendingRequests
        .filter((req) => req < initialHead)
        .sort((a, b) => b - a); // Descending order

    // Process requests based on the initial direction
    let firstPass = directionUp ? greaterRequests : lessRequests;
    let secondPass = directionUp ? lessRequests : greaterRequests;

    // Process all requests in the first pass
    for (let i = 0; i < firstPass.length; i++) {
        const nextCylinder = directionUp ? firstPass[i] : firstPass[i];

        // Calculate the movement
        const movement = Math.abs(currentHead - nextCylinder);
        totalMovement += movement;

        // Store this movement
        movements.push({
            from: currentHead,
            to: nextCylinder,
            distance: movement,
        });

        // Update current head position
        currentHead = nextCylinder;
        sequence.push(currentHead);
    }

    // If we still have requests in the second pass, process them
    if (secondPass.length > 0) {
        // Process all requests in the second pass
        for (let i = 0; i < secondPass.length; i++) {
            const nextCylinder = !directionUp ? secondPass[i] : secondPass[i];

            // Calculate the movement
            const movement = Math.abs(currentHead - nextCylinder);
            totalMovement += movement;

            // Store this movement
            movements.push({
                from: currentHead,
                to: nextCylinder,
                distance: movement,
            });

            // Update current head position
            currentHead = nextCylinder;
            sequence.push(currentHead);
        }
    }

    // Process any requests at the initial head position (if any)
    const equalRequests = pendingRequests.filter((req) => req === initialHead);
    if (equalRequests.length > 0) {
        // No head movement needed for these
        for (let i = 0; i < equalRequests.length; i++) {
            movements.push({
                from: initialHead,
                to: initialHead,
                distance: 0,
            });
        }
    }

    // Return the results
    return {
        sequence: sequence,
        movements: movements,
        totalMovement: totalMovement,
    };
}
