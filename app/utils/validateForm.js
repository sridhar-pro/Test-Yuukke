export const validateFormData = (formData) => {
  const errors = {};

  if (!formData?.name) errors.name = "Please enter your first name.";
  if (!formData?.email) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!formData?.contact) {
    errors.contact = "Please enter your phone number.";
  } else if (!/^\d{10}$/.test(formData.contact)) {
    errors.contact = "Phone number must be exactly 10 digits.";
  }
  if (!formData?.country) errors.country = "Please select your country.";
  if (!formData?.addressLine1)
    errors.addressLine1 = "Please enter your flat or building info.";
  if (!formData?.addressLine2)
    errors.addressLine2 = "Please enter your area or street info.";
  if (!formData?.city) errors.city = "Please enter your city.";
  if (!formData?.state) errors.state = "Please select your state.";
  if (!formData?.pin) {
    errors.pin = "PIN code is required.";
  } else if (!/^\d{6}$/.test(formData.pin)) {
    errors.pin = "PIN code must be exactly 6 digits.";
  }

  return errors;
};
