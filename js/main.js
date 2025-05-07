// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    console.log("Operating Systems Project - Phase 2 initialized");

    // Button hover effect enhancement
    const button = document.querySelector(".btn");
    if (button) {
        button.addEventListener("mouseenter", () => {
            button.style.transition = "all 0.3s ease";
        });
    }
});
