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
                text: "Memory Request Handeling",
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

    let result = cLook(inputData, initialHead, true);
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
            console.log(`Handeling Request at (${x})`)
        });

        const minX = Math.min(...sortedUniqueXValues);
        const maxX = Math.max(...sortedUniqueXValues);
        const minY = 0;
        const maxY = inputData.length * 2;

        chart.options.scales.x.min = minX;
        chart.options.scales.x.max = maxX + 2;
        chart.options.scales.y.min = minY;
        chart.options.scales.y.max = maxY + 2;   
        chart.update();
        document.getElementById("resultDisplay").innerText = "Total Movements: " + result.totalMovement ;
    } else {
        alert("Please enter valid comma-separated numbers and initial head.");
    }
}

function cLook(requests, initialHead, directionUp = true, maxCylinder = 199) {
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
        .sort((a, b) => a - b); // Ascending order (unlike LOOK)

    // Process requests based on the initial direction
    let firstPass = directionUp ? greaterRequests : lessRequests;
    let secondPass = directionUp ? lessRequests : greaterRequests;

    // Process all requests in the first pass
    for (let i = 0; i < firstPass.length; i++) {
        const nextCylinder = firstPass[i];

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
        // In C-LOOK, we don't reverse direction, but jump to the beginning of second pass
        const jumpTo = secondPass[0];

        // Calculate the jump movement (not counted in C-LOOK, but useful for visualization)
        const jumpMovement = Math.abs(currentHead - jumpTo);
        totalMovement += jumpMovement;

        // Store this jump movement
        movements.push({
            from: currentHead,
            to: jumpTo,
            distance: jumpMovement,
            isJump: true, // Mark as a jump for visualization
        });

        // Update current head position
        currentHead = jumpTo;
        sequence.push(currentHead);

        // Process remaining requests in the second pass
        for (let i = 1; i < secondPass.length; i++) {
            // Start from index 1 since we already processed index 0
            const nextCylinder = secondPass[i];

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
