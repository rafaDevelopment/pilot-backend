'use strict';
const bcrypt = require("bcrypt");
const faker = require('faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("12345678", salt);
    var people = []
    var users = []
    var patients = []
    var caregivers = []
    var volunteers = []
    var length = 500
    var userCount = 0
    var volunteerCount = 0
    var coordinators = []
    for (let index = 1; index < length; index++) {
      var rut = [...Array(7)].map((i) => (Math.floor(Math.random() * 10)).toString())
      rut = (Math.floor(Math.random() * 9) + 1).toString() + rut.join('') + '-' + (Math.floor(Math.random() * 9) + 1).toString()
      var firstName = faker.name.firstName()
      var lastName = faker.name.lastName()
      var person = {
        firstName,
        lastName,
        email: `${firstName}${lastName}@mail.com`,
        password,
        rut,
        birthDate: '1999-01-01',
        comuna: 'Puente Alto',
        country: 'Chile',
        civilState: 'Soltero',
        status: 0,
        address: 'Pucara Poniente 2181',
        gender: ['hombre', 'mujer'][Math.floor(Math.random() * 2)],
        banned: false,
        pictureUrl: faker.image.imageUrl(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (index < (1 / 3) * length) {
        userCount++
        person.role = 'patients'
        var user = {
          PersonId: index,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        var patient = {
          hospital: 1,
          religion: "Cristiana",
          UserId: userCount,
          CesfamCoordinatorId: Math.floor(Math.random() * 3) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        users.push(user),
          patients.push(patient)
      } else if (index < (2 / 3) * length) {
        userCount++
        person.role = 'caregivers'
        var user = {
          PersonId: index,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        var caregiver = {
          UserId: userCount,
          CesfamCoordinatorId: Math.floor(Math.random() * 3) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        users.push(user),
          caregivers.push(caregiver)
      } else {
        person.role = 'volunteers'
        volunteerCount++
        var volunteer = {
          senior: faker.datatype.boolean(),
          adult: faker.datatype.boolean(),
          adolescence: faker.datatype.boolean(),
          children: faker.datatype.boolean(),
          accompaniment: ['Practico', 'Social', 'Espiritual'][Math.floor(Math.random() * 2)],
          matches: 0,
          PersonId: index,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        if (coordinators.length < 1) {
          console.log("ID del COORD: ", index);
          person.status = 1
          person.email = "hcabrera@uc.cl"
          person.firstName = "Hernan"
          person.lastName = "Cabrera"
          person.rut = "8661748-K"
          person.address = "Arzobispo Vicuña 21 Dp 415"
          person.comuna = "Providencia"
          var coordinator = {
            VolunteerId: volunteerCount,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          coordinators.push(coordinator)
        } else if (coordinators.length < 2) {
          console.log("ID del COORD: ", index);
          person.status = 1
          person.email = "bernardita@rafa.cl"
          person.firstName = "Bernardita"
          person.lastName = "Rojas"
          person.rut = "1234567-1"
          person.address = "Arzobispo Vicuña 21 Dp 415"
          person.comuna = "Providencia"
          var coordinator = {
            VolunteerId: volunteerCount,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          coordinators.push(coordinator)
        } else if (coordinators.length < 3) {
          console.log("ID del COORD: ", index);
          person.status = 1
          person.email = "alicia@rafa.cl"
          person.firstName = "Alicia"
          person.lastName = ""
          person.rut = "1234567-2"
          person.address = "Arzobispo Vicuña 21 Dp 415"
          person.comuna = "Providencia"
          var coordinator = {
            VolunteerId: volunteerCount,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          coordinators.push(coordinator)
        }
        volunteers.push(volunteer)
      }
      people.push(person)
    }
    var volCoords = []
    for (let i = 0; i < volunteers.length; i++) {
      const vol = volunteers[i];
      volCoords.push({
        VolunteerId: i+1,
        CoordinatorId: Math.floor(Math.random() * 3) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    return queryInterface.bulkInsert('CesfamCoordinators', [
      {
        email: 'bernardita@cesfam.com',
        cesfam: 'Cesfam Bernardita',
        password,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'alicia@cesfam.com',
        cesfam: 'Cesfam Alicia',
        password,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'cesfam@cesfam.com',
        cesfam: 'Cesfam Puente Alto',
        password,
        createdAt: new Date(),
        updatedAt: new Date()
      }
  ]).then(() => {
      return queryInterface.bulkInsert('People', people)
    }).then(() => {
      return queryInterface.bulkInsert('Users', users)
    }).then(() => {
      return queryInterface.bulkInsert('Patients', patients)
    }).then(() => {
      return queryInterface.bulkInsert('Caregivers', caregivers)
    }).then(() => {
      return queryInterface.bulkInsert('Volunteers', volunteers)
    }).then(() => {
      return queryInterface.bulkInsert('Coordinators', coordinators)
    }).then(() => {
      return queryInterface.bulkInsert('VolunteerCoordinators', volCoords)
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
