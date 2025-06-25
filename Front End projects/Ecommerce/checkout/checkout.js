document.addEventListener('DOMContentLoaded', function () {
    // Initialize steps
    const steps = document.querySelectorAll('.step');
    const continueButtons = document.querySelectorAll('.btn-continue');

    // Show only first step initially
    steps.forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Handle continue buttons
    continueButtons.forEach(button => {
        button.addEventListener('click', function () {
            const nextStep = this.getAttribute('data-next');

            if (nextStep) {
                // Hide all steps
                steps.forEach(step => {
                    step.classList.remove('active');
                });

                // Show next step
                document.querySelector(`.step[data-step="${nextStep}"]`).classList.add('active');

                // Scroll to top of the step
                document.querySelector(`.step[data-step="${nextStep}"]`).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Quantity adjustment functionality
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function () {
            const input = this.parentElement.querySelector('.quantity-input');
            let value = parseInt(input.value);

            if (this.classList.contains('minus') && value > 1) {
                input.value = value - 1;
            } else if (this.classList.contains('plus') && value < 99) {
                input.value = value + 1;
            }
            updateCartTotals();
        });
    });

    // Direct input handling
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function () {
            if (this.value < 1) this.value = 1;
            if (this.value > 99) this.value = 99;
            updateCartTotals();
        });
    });

    // Delete item functionality
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            const item = this.closest('.item');
            item.style.animation = 'fadeOut 0.3s ease';

            setTimeout(() => {
                item.remove();
                updateCartTotals();
            }, 300);
        });
    });

    // Shipping option selection
    document.querySelectorAll('.shipping-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.shipping-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            this.querySelector('input').checked = true;
        });
    });

    // Payment tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');

            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
        });
    });

    // Same as shipping address toggle
    document.getElementById('sameAsShipping').addEventListener('change', function () {
        document.getElementById('billingAddressFields').style.display =
            this.checked ? 'none' : 'block';
    });

    // Edit buttons in review step
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const step = this.getAttribute('data-step');

            // Hide all steps
            document.querySelectorAll('.step').forEach(step => {
                step.classList.remove('active');
            });

            // Show selected step
            document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
            
            // Scroll to top of the step
            document.querySelector(`.step[data-step="${step}"]`).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Function to update cart totals (simplified example)
    function updateCartTotals() {
        const items = document.querySelectorAll('.item');
        const itemCount = items.length;
        document.querySelector('.cart-items h2').textContent = `Cart (${itemCount} ${itemCount === 1 ? 'Item' : 'Items'})`;

        // In a real implementation, you would:
        // 1. Calculate new subtotal based on quantities
        // 2. Update the displayed totals in the summary
        // 3. Potentially make an AJAX call to update server-side
    }
});