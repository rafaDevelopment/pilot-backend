'use strict';
const db = require("../models");
const bcrypt = require("bcrypt");
const faker = require('faker');
const cliProgress = require('cli-progress');

const model = db.Caregiver
    for (let assoc of Object.keys(model.associations)) {
      for (let accessor of Object.keys(model.associations[assoc].accessors)) {
        console.log(model.name + '.' + model.associations[assoc].accessors[accessor]+'()');
      }
    }


function getRandomSubarray(arr, n) {
  var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
  if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("12345678", salt);
    const cantVol = 100
    const cantPat = 100
    const cantCareG = 100
    const vols = []
    const pats = []
    const careGs = []
    const coords = []
    const coordCesfams = []
    const pInterests = []

    function randomPerson() {
      var rut = [...Array(7)].map((i) => (Math.floor(Math.random() * 10)).toString())
      rut = (Math.floor(Math.random() * 9) + 1).toString() + rut.join('') + '-' + (Math.floor(Math.random() * 9) + 1).toString()
      var firstName = faker.name.firstName()
      var lastName = faker.name.lastName()
      const birthDate = faker.date.between('1920-01-01', '1999-01-01').toISOString().split('T')[0]
      var person = {
        firstName,
        lastName,
        email: `${firstName}${lastName}@mail.com`,
        password,
        rut,
        birthDate,
        comuna: 'Puente Alto',
        country: 'Chile',
        civilState: 'Soltero',
        status: Math.round(Math.random())*3,
        address: 'Pucara Poniente 2181',
        gender: ['hombre', 'mujer'][Math.floor(Math.random() * 2)],
        banned: false,
        pictureUrl: faker.image.imageUrl()
      }
      return person
    }

    coordCesfams.push(
      (await db.CesfamCoordinator.create({
        email: 'bernardita@cesfam.com',
        cesfam: 'Cesfam Bernardita',
        password,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      (await db.CesfamCoordinator.create({
        email: 'alicia@cesfam.com',
        cesfam: 'Cesfam Alicia',
        password,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      (await db.CesfamCoordinator.create({
        email: 'cesfam@cesfam.com',
        cesfam: 'Cesfam Puente Alto',
        password,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )

    // Crear intereses personales
    pInterests.push(
      (await db.PersonalInterest.create({
        name: "Cine"
      })),
      (await db.PersonalInterest.create({
        name: "Música"
      })),
      (await db.PersonalInterest.create({
        name: "Deporte"
      })),
      (await db.PersonalInterest.create({
        name: "Jardinería"
      })),
      (await db.PersonalInterest.create({
        name: "Manualidades"
      })),
      (await db.PersonalInterest.create({
        name: "Juegos de Mesa"
      })),
      (await db.PersonalInterest.create({
        name: "Animales"
      }))
    )
    const barVol = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    barVol.start(cantVol)
    for (let i = 0; i < cantVol; i++) {
      barVol.increment()
      const person = await db.Person.create(randomPerson())
      person.role = "volunteers"
      await person.save()
      const vol = await person.createVolunteer({
        senior: faker.datatype.boolean(),
        adult: faker.datatype.boolean(),
        adolescence: faker.datatype.boolean(),
        children: faker.datatype.boolean(),
        accompaniment: ['Practico', 'Social', 'Espiritual'][Math.floor(Math.random() * 2)],
        matches: 0
      })
      let mondayHour = Math.floor(Math.random()*12)+8;
      vol.createMonday({
        startTime: `${mondayHour}:00:00`,
        endTime: `${mondayHour+2}:00:00`
      });

      let tuesdayHour = Math.floor(Math.random()*12)+8;
      vol.createTuesday({
        startTime: `${tuesdayHour}:00:00`,
        endTime: `${tuesdayHour+2}:00:00`
      });

      let wednesdayHour = Math.floor(Math.random()*12)+8;
      vol.createWednesday({
        startTime: `${wednesdayHour}:00:00`,
        endTime: `${wednesdayHour+2}:00:00`
      });

      let thursdayHour = Math.floor(Math.random()*12)+8;
      vol.createThursday({
        startTime: `${thursdayHour}:00:00`,
        endTime: `${thursdayHour+2}:00:00`
      });

      let fridayHour = Math.floor(Math.random()*12)+8;
      vol.createFriday({
        startTime: `${fridayHour}:00:00`,
        endTime: `${fridayHour+2}:00:00`
      });

      let saturdayHour = Math.floor(Math.random()*12)+8;
      vol.createSaturday({
        startTime: `${saturdayHour}:00:00`,
        endTime: `${saturdayHour+2}:00:00`
      });

      let sundayHour = Math.floor(Math.random()*12)+8;
      vol.createSunday({
        startTime: `${sundayHour}:00:00`,
        endTime: `${sundayHour+2}:00:00`
      });

      vol.setPersonalInterests(getRandomSubarray(pInterests, Math.floor(Math.random()*3)+1));
      vols.push([person, vol])
    }
    barVol.stop()
    const barUsers = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    barUsers.start(cantPat)
    for (let i = 0; i < cantPat; i++) {
      barUsers.increment()
      const cesfamCoord = coordCesfams[Math.floor(Math.random()*coordCesfams.length)];
      const person = await db.Person.create(randomPerson())
      person.role = "patients"
      await person.save()
      const user = await person.createUser()
      await user.setPersonalInterests(getRandomSubarray(pInterests, Math.floor(Math.random()*3)+1));
      const pat = await user.createPatient({
        hospital: 1,
        religion: "Cristiana"
      })
      await pat.createEmergencyContact({
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        relationship: `${['Hijo(a)', 'Esposo(a)', 'Hermano(a)'][Math.floor(Math.random() * 3)]}`,
        phoneNumber: '+56973780474'
      })
      const Cperson = await db.Person.create(randomPerson())
      Cperson.role = "caregivers"
      await Cperson.save()
      const Cuser = await Cperson.createUser()
      const careG = await Cuser.createCaregiver()
      await careG.setPatients([pat])

      await careG.setCesfamCoordinator(cesfamCoord)
      await pat.setCesfamCoordinator(cesfamCoord)

      careGs.push([Cperson, Cuser, careG])
      pats.push([person, user, pat])
    }
    barUsers.stop()
    // for (let i = 0; i < cantCareG; i++) {
    //   const person = await db.Person.create(randomPerson())
    //   const user = await person.createUser()
    //   const careG = await user.createCaregiver({})
    //   careGs.push([person, user, careG])
    // }
    

    // Coord 1
    const personCoord1 = await db.Person.create({
      firstName: 'Hernán',
      lastName: 'Cabrera',
      email: "hcabrera@uc.cl",
      password,
      rut: "8661748-K",
      birthDate: '1990-01-01',
      comuna: 'Providencia',
      country: 'Chile',
      civilState: 'Soltero',
      status: 3,
      address: 'Arzobispo Vicuña 21 Dp 415',
      gender: 'hombre',
      banned: false,
      pictureUrl: faker.image.imageUrl(),
      role: 'coordinators'
    })
    const volCoord1 = await personCoord1.createVolunteer({
      senior: faker.datatype.boolean(),
      adult: faker.datatype.boolean(),
      adolescence: faker.datatype.boolean(),
      children: faker.datatype.boolean(),
      accompaniment: ['Practico', 'Social', 'Espiritual'][Math.floor(Math.random() * 2)],
      matches: 0
    })
    const coord1 =  await volCoord1.createCoordinator({})
    coords.push([personCoord1, volCoord1, coord1])

    // Coord 2
    const personCoord2 = await db.Person.create({
      firstName: 'Bernardita',
      lastName: 'Rojas',
      email: "bernardita@rafa.cl",
      password,
      rut: "1234567-1",
      birthDate: '1990-01-01',
      comuna: 'Providencia',
      country: 'Chile',
      civilState: 'Soltero',
      status: 3,
      address: 'Arzobispo Vicuña 21 Dp 415',
      gender: 'mujer',
      banned: false,
      pictureUrl: faker.image.imageUrl(),
      role: 'coordinators'
    })
    const volCoord2 = await personCoord2.createVolunteer({
      senior: faker.datatype.boolean(),
      adult: faker.datatype.boolean(),
      adolescence: faker.datatype.boolean(),
      children: faker.datatype.boolean(),
      accompaniment: ['Practico', 'Social', 'Espiritual'][Math.floor(Math.random() * 2)],
      matches: 0
    })
    const coord2 =  await volCoord2.createCoordinator({})
    coords.push([personCoord2, volCoord2, coord2])

    // Coord 3
    const personCoord3 = await db.Person.create({
      firstName: 'Alicia',
      lastName: '',
      email: "alicia@rafa.cl",
      password,
      rut: "1234567-2",
      birthDate: '1990-01-01',
      comuna: 'Providencia',
      country: 'Chile',
      civilState: 'Soltero',
      status: 3,
      address: 'Arzobispo Vicuña 21 Dp 415',
      gender: 'mujer',
      banned: false,
      pictureUrl: faker.image.imageUrl(),
      role: 'coordinators'
    })
    const volCoord3 = await personCoord3.createVolunteer({
      senior: faker.datatype.boolean(),
      adult: faker.datatype.boolean(),
      adolescence: faker.datatype.boolean(),
      children: faker.datatype.boolean(),
      accompaniment: ['Practico', 'Social', 'Espiritual'][Math.floor(Math.random() * 2)],
      matches: 0
    })
    const coord3 =  await volCoord3.createCoordinator({})
    coords.push([personCoord3, volCoord3, coord3])

    // Asignar voluntarios a coordinadores

    for (let i = 0; i < coords.length; i++) {
      const [person, vol, coord] = coords[i];
      const volunteerees = vols.slice(
        Math.round(i*(vols.length/coords.length)), 
        Math.round(i*(vols.length/coords.length)+(vols.length/coords.length))
      )
      console.log(volunteerees.length);
      for (let v = 0; v < volunteerees.length; v++) {
        const [person, vol] = volunteerees[v];
        person.status = Math.round(Math.random()) * 3
        await person.save()
      }
      await coord.setVolunteerees(volunteerees.map(e => e[1]))
    }
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
