async function findRole(person) {
  let user = await person.getUser();
  let volunteer = await person.getVolunteer();
  if (user) {
    if (await user.getPatient()) {
      return "Patient";
    }
    if (await user.getCaregiver()) {
      return "Caregiver";
    }
    return null;
  } else if (volunteer) {
    if (await volunteer.getCoordinator()) {
      return "Coordinator";
    }
    return "Volunteer";
  }
  return null;
}

module.exports = findRole;