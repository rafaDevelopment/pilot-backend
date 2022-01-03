# Permisos
| Route   |      Method      |  Roles |
|:----------|-------------|------|
| people/login | POST | Anyone |
| people/logout | DELETE | Anyone logged in |
| caregiver/register | POST | Anyone |
| caregiver/:id | GET | Caregiver, Patient (belongsTo), Volunteer (belongsTo, through Match), Coordinator (some of them) |
||

Note: There will be 3 types of coordinators, one will be able to access everyone (Volunteers, Caregivers and Patients), another one will only be able to access the volunteers assigned to them, and the last one will only be able to access the patients from their hospitals (CESFAM).