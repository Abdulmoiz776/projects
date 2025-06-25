// Initialize variables
let orders = [];
let currentPage = 1;
let ordersPerPage = parseInt(document.getElementById('rowsPerPage').value) || 20;

// DOM elements
const orderList = document.getElementById("orderList");
const searchInput = document.getElementById("search");
const carriersFilter = document.getElementById("carriers");
const bookingDateFilter = document.getElementById("bookingDate");
const pickupDateFilter = document.getElementById("pickupDate");
const customerFilter = document.getElementById("Customer");
const customFilter = document.getElementById("customFilter");
const paginationContainer = document.getElementById("pagination");
const rowsPerPageInput = document.getElementById("rowsPerPage");

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Initialize date pickers
    flatpickr(bookingDateFilter, {
        dateFormat: "Y-m-d",
        allowInput: true
    });

    flatpickr(pickupDateFilter, {
        dateFormat: "Y-m-d",
        allowInput: true
    });

    flatpickr(customFilter, {
        mode: "range",
        dateFormat: "Y-m-d",
        allowInput: true
    });

    // Check if ordersData is available from the template
    if (typeof ordersData !== 'undefined' && ordersData.length > 0) {
        orders = ordersData;
        filterOrders(1);
    } else {
        console.error("No orders data available");
        orderList.innerHTML = "<tr><td colspan='7'>No orders data available</td></tr>";
    }

    // Event listeners
    searchInput.addEventListener("input", () => filterOrders(1));
    carriersFilter.addEventListener("change", () => filterOrders(1));
    customerFilter.addEventListener("change", () => filterOrders(1));
    bookingDateFilter.addEventListener("change", () => filterOrders(1));
    pickupDateFilter.addEventListener("change", () => filterOrders(1));
    customFilter.addEventListener("change", () => filterOrders(1));

    rowsPerPageInput.addEventListener("change", () => {
        const newRowsPerPage = parseInt(rowsPerPageInput.value, 10);
        if (newRowsPerPage > 0) {
            ordersPerPage = newRowsPerPage;
            filterOrders(1);
        } else {
            alert("Please enter a valid number of rows per page.");
            rowsPerPageInput.value = ordersPerPage;
        }
    });
});

// Function to filter orders
function filterOrders(page = 1) {
    currentPage = page;

    const searchTerm = searchInput.value.toLowerCase();
    const carriers = carriersFilter.value;
    const customerSearchTerm = customerFilter.value.toLowerCase();
    const bookingDate = bookingDateFilter.value;
    const pickupDate = pickupDateFilter.value;
    const customFilterValue = customFilter.value;

    const filteredOrders = orders.filter((order) => {
        // Global search
        const matchesSearchTerm = searchTerm === "" ||
            Object.values(order).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            );

        // Carrier filter
        const matchesCarrier = carriers === "all" ||
            (order.carrier && order.carrier.toLowerCase() === carriers.toLowerCase());

        // Customer filter
        const matchesCustomer = customerSearchTerm === "all" ||
            (order.customer && order.customer.toLowerCase().includes(customerSearchTerm));

        // Date filters
        const matchesBookingDate = bookingDate === "" ||
            (order.bookingDate && order.bookingDate === bookingDate);

        const matchesPickupDate = pickupDate === "" ||
            (order.pickupDate && order.pickupDate === pickupDate);

        // Date range filter
        let matchesCustomFilter = true;
        if (customFilterValue) {
            const [startDate, endDate] = customFilterValue.split(" to ");
            const orderDate = new Date(order.bookingDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            matchesCustomFilter = orderDate >= start && orderDate <= end;
        }

        return matchesSearchTerm && matchesCarrier && matchesCustomer &&
            matchesBookingDate && matchesPickupDate && matchesCustomFilter;
    });

    renderOrders(filteredOrders, page);
}

// Function to render orders
function renderOrders(filteredOrders, page = 1) {
    orderList.innerHTML = "";

    if (filteredOrders.length === 0) {
        orderList.innerHTML = "<tr><td colspan='7'>No orders found matching your criteria</td></tr>";
        renderPagination(0, page);
        return;
    }

    const startIndex = (page - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    paginatedOrders.forEach((order, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${order.customer || 'N/A'}</td>
            <td>${order.user_id || 'N/A'}</td>
            <td>${order.order_id || 'N/A'}</td>
            <td>${order.trackingNo || 'N/A'}</td>
            <td>
                <select class="status-dropdown" data-shipment-id="${order._id}">
                    <option value="pending" ${order.shipmentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in_transit" ${order.shipmentStatus === 'in_transit' ? 'selected' : ''}>In Transit</option>
                    <option value="delivered" ${order.shipmentStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            <td>
                <button class="action-btn" data-shipment-id="${order._id}">View</button>
                <button class="save-btn" data-shipment-id="${order._id}">Save</button>
            </td>
        `;
        orderList.appendChild(row);
    });

    // Add event listeners to new save buttons
    document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', saveShipmentChanges);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', viewOrderDetails);
    });

    renderPagination(filteredOrders.length, page);
}

// Function to render pagination
function renderPagination(totalOrders, currentPage) {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    if (totalPages <= 1) return;

    // Previous button
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) filterOrders(currentPage - 1);
    });
    paginationContainer.appendChild(prevButton);

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.disabled = i === currentPage;
        pageButton.addEventListener("click", () => filterOrders(i));
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) filterOrders(currentPage + 1);
    });
    paginationContainer.appendChild(nextButton);
}

// Function to save shipment changes
function saveShipmentChanges() {
    const shipmentId = this.getAttribute('data-shipment-id');
    const status = document.querySelector(`.status-dropdown[data-shipment-id="${shipmentId}"]`).value;

    fetch(`/admin/update_shipment/${shipmentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            shipment_status: status
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Shipment updated successfully!');
                // Update the local orders array
                const orderIndex = orders.findIndex(o => o._id === shipmentId);
                if (orderIndex !== -1) {
                    orders[orderIndex].shipmentStatus = status;
                }
            } else {
                alert('Error updating shipment: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating shipment');
        });
}

// Function to view order details
function viewOrderDetails() {
    const shipmentId = this.getAttribute('data-shipment-id');
    window.location.href = `/admin/order_details/${shipmentId}`;
}