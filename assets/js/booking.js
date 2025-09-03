document.addEventListener('DOMContentLoaded', function() {
    // Initialize Flatpickr date pickers
    const checkInPicker = flatpickr("#checkIn", {
        minDate: "today",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates) {
            checkOutPicker.set("minDate", selectedDates[0]);
            updateSummary();
        }
    });

    const checkOutPicker = flatpickr("#checkOut", {
        minDate: "today",
        dateFormat: "Y-m-d",
        onChange: function() {
            updateSummary();
        }
    });

    // Dynamic rates are loaded into the roomType options via data-rate

    // Add event listeners for form fields
    document.getElementById('roomType').addEventListener('change', updateSummary);
    document.getElementById('guests').addEventListener('change', updateSummary);

    // Function to calculate number of nights
    function calculateNights(checkIn, checkOut) {
        if (!checkIn || !checkOut) return 0;
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((checkOut - checkIn) / oneDay));
    }

    // Function to update booking summary
    function updateSummary() {
        const checkIn = checkInPicker.selectedDates[0];
        const checkOut = checkOutPicker.selectedDates[0];
        const roomSelect = document.getElementById('roomType');
        const roomType = roomSelect.value;
        const guests = document.getElementById('guests').value;

        // Update summary fields
        document.getElementById('summaryCheckIn').textContent = checkIn ? checkIn.toLocaleDateString() : '-';
        document.getElementById('summaryCheckOut').textContent = checkOut ? checkOut.toLocaleDateString() : '-';
        document.getElementById('summaryRoom').textContent = roomType ? 
            document.getElementById('roomType').options[document.getElementById('roomType').selectedIndex].text : '-';
        document.getElementById('summaryGuests').textContent = guests ? `${guests} Guest${guests > 1 ? 's' : ''}` : '-';

        // Calculate nights and total
        const nights = calculateNights(checkIn, checkOut);
        document.getElementById('summaryNights').textContent = nights || '-';

        const selectedOption = roomSelect.selectedOptions && roomSelect.selectedOptions[0];
        const rate = selectedOption ? parseFloat(selectedOption.dataset.rate) || 0 : 0;
        const total = nights * rate;
        document.getElementById('summaryTotal').textContent = total ? `GHS ${total}` : 'GHS 0';
    }

    // Form validation and submission
    const form = document.getElementById('reservationForm');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        // Collect form data
        const formData = {
            name: document.getElementById("fullname").value,
        phone_number: document.getElementById("phone").value,
        arrival_date: document.getElementById("checkIn").value,
        departure_date: document.getElementById("checkOut").value,
        room_type: document.getElementById("roomType").value,
        number_of_guests: document.getElementById("guests").value
        };
        try{
            const response = await fetch("https://sweetpee.hotelipad.com/api/sr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                const modalElement = document.getElementById('confirmationModal');
                if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    const confirmationModal = new bootstrap.Modal(modalElement);
                    confirmationModal.show();
                }
                form.reset();
                form.classList.remove('was-validated');
                updateSummary();
            } else {
                throw new Error(data.message || 'Failed to create booking');
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
});
document.addEventListener("DOMContentLoaded", async () => {
    const roomTypeSelect = document.getElementById("roomType");

    try {
        const response = await fetch("https://sweetpee.hotelipad.com/api/tariffs");
        if (!response.ok) throw new Error("Failed to load tariffs");

        const tariffs = await response.json();

        // clear any existing options except the first placeholder
        roomTypeSelect.innerHTML = '<option value="">Select Room Type</option>';

        // populate dynamically, filtering out names containing "booking.com"
        tariffs
            .filter(t => !(t && t.name && /booking\.com/i.test(t.name)))
            .forEach(tariff => {
                const option = document.createElement("option");
                option.value = tariff.id || tariff.name; // use proper identifier (id if available)
                option.textContent = `${tariff.name} - GHS ${tariff.rate}/night`;
                option.dataset.rate = tariff.rate;
                roomTypeSelect.appendChild(option);
            });

        // refresh summary after loading
        if (typeof updateSummary === 'function') {
            updateSummary();
        }

    } catch (err) {
        console.error("Error loading tariffs:", err);
        // fallback: show message in dropdown
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Unable to load room types";
        roomTypeSelect.appendChild(option);
    }
});
 
