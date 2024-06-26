document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const hostRoomURL = urlParams.get("hostRoomURL");
  if (hostRoomURL) {
    document.querySelector("iframe").src = hostRoomURL;
  }

  const appointmentId = urlParams.get("appointmentID");

  // Set MC Start Date to today
  const today = new Date().toISOString().split("T")[0];
  const mcEndDateInput = document.getElementById("mcenddate");
  mcEndDateInput.setAttribute("min", today);

  // Fetch all medicines from the medicine table
  fetch(`${window.location.origin}/api/medicine`)
    .then((response) => response.json())
    .then((medicines) => {
      const medicineCheckboxes = document.getElementById("medicine-checkboxes");
      medicines.forEach((medicine) => {
        const label = document.createElement("label");
        label.classList.add("form-check-label");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.classList.add("form-check-input");
        input.value = medicine.MedicineID;
        input.name = "medicines";

        label.appendChild(input);
        label.appendChild(document.createTextNode(medicine.Name));
        medicineCheckboxes.appendChild(label);
      });
    })
    .catch((error) => console.error("Error fetching medicines:", error));

  // Handle form submission
  document
    .getElementById("appointment-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const diagnosis = document.getElementById("diagnosis").value;
      const mcenddate = document.getElementById("mcenddate").value;
      const doctornotes = document.getElementById("doctornotes").value;
      const medicineCheckboxes = document.querySelectorAll(
        'input[name="medicines"]:checked'
      );
      const MedicineIDs = Array.from(medicineCheckboxes).map((checkbox) =>
        parseInt(checkbox.value)
      );

      if (new Date(mcenddate) < new Date(today)) {
        alert("MC End Date cannot be before today.");
        return;
      }

      const requestBody = {
        Diagnosis: diagnosis,
        MCStartDate: today, // Default to today
        MCEndDate: mcenddate,
        DoctorNotes: doctornotes,
        MedicineIDs: MedicineIDs,
      };

      console.log(appointmentId);
      fetch(
        `${window.location.origin}/api/appointment/${appointmentId}/updateWithMedicines`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "Success") {
            document.getElementById("success-message").style.display = "block";
          } else {
            alert("Failed to update appointment.");
          }
        })
        .catch((error) => {
          console.error("Error updating appointment:", error);
          alert("Failed to update appointment.");
        });
    });
});
