import api from "./api.js"; // Ensure you have api.js for Axios setup

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ register.js loaded"); // Debug: Check if script loads

    // Form submission handler
    document.querySelector(".login-form").addEventListener("submit", async function (e) {
        e.preventDefault(); // Stop traditional form submission
        console.log("✅ Register button clicked!"); // Debug: Confirm button click

        // Collect form data
        const userData = {
            email: document.getElementById("email").value,
            username: document.getElementById("email").value.split("@")[0], // Email prefix as username
            first_name: document.getElementById("firstName").value,
            last_name: document.getElementById("lastName").value,
            phone_number: document.getElementById("phone").value,
            date_of_birth: document.getElementById("dateOfBirth").value,
            role: document.getElementById("role").value,
            password: document.getElementById("password").value,
            confirm_password: document.getElementById("confirmPassword").value,
        };

        console.log("✅ Collected user data:", userData); // Debug: Show collected data

        // Add doctor profile if user is a doctor
        if (userData.role === "doctor") {
            userData.doctor_profile = {
                doctor_id: document.getElementById("doctorId").value,
                specialization: document.getElementById("specialization").value,
                years_of_experience: parseInt(document.getElementById("experience").value),
            };
        }

        console.log("✅ Final user data to send:", userData); // Debug: Show final data before sending

        try {
            // Send POST request to register user
            const response = await api.post("/register", userData);
            console.log("✅ API Response:", response.status, response.data); // Debug: API response status & data

            alert("Registration successful!");
            window.location.href = "login.html"; // Redirect to login page
        } catch (error) {
            console.error("❌ Registration failed:", error.response ? error.response.data : error.message); // Debug: Log API error
            alert(error.response?.data?.detail || "Registration failed!");
        }
    });

    // Role selector functionality
    document.querySelectorAll(".role-option").forEach((option) => {
        option.addEventListener("click", () => {
            document.querySelectorAll(".role-option").forEach((opt) => opt.classList.remove("active"));
            option.classList.add("active");

            document.getElementById("role").value = option.getAttribute("data-role");

            const doctorFields = document.querySelectorAll(".doctor-field");
            const isDoctor = option.getAttribute("data-role") === "doctor";

            doctorFields.forEach((field) => {
                field.style.display = isDoctor ? "block" : "none";
                field.querySelectorAll("input, select").forEach((input) => {
                    input.required = isDoctor;
                });
            });
        });
    });

    // Real-time password validation
    document.getElementById("confirmPassword").addEventListener("input", function () {
        const password = document.getElementById("password").value;
        const confirmPassword = this.value;

        this.setCustomValidity(password !== confirmPassword ? "Passwords do not match" : "");
    });
});
