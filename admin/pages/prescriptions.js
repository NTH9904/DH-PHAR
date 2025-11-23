// Admin Prescriptions scripts
async function loadPrescriptions() {
  try {
    // Replace with API call when available
    // const prescriptionsResponse = await window.API.prescriptions.getAll();
    // const prescriptions = prescriptionsResponse.data || [];
    // TODO: render prescriptions into #prescriptions-list
  } catch (error) {
    console.error('Error loading prescriptions:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPrescriptions);
} else {
  loadPrescriptions();
}
