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

    // Room prices
    const roomPrices = {
        'deluxe': 250,
        'executive': 450
    };

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
        const roomType = document.getElementById('roomType').value;
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

        const total = nights * (roomPrices[roomType] || 0);
        document.getElementById('summaryTotal').textContent = total ? `GHS ${total}` : 'GHS 0';
    }

    // Form validation and submission
    const form = document.getElementById('reservationForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        // Collect form data
        const formData = {
            checkIn: document.getElementById('checkIn').value,
            checkOut: document.getElementById('checkOut').value,
            roomType: document.getElementById('roomType').value,
            guests: document.getElementById('guests').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            specialRequests: document.getElementById('specialRequests').value
        };

        // Here you would typically send the formData to your server
        // For now, we'll just show a success message
        alert('Booking successful! A confirmation email will be sent to you shortly.');
        form.reset();
        form.classList.remove('was-validated');
        updateSummary();
    });
});
