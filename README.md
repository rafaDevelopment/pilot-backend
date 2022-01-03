
Backend - App RAFA
===
[![GitHub Super-Linter](https://github.com/RAFA-APP/rafa-app-backend/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)


# :construction: Dependencias

* NodeJS. Version 16.0.0
* PostgreSQL Version 8.6

# :closed_lock_with_key:  Archivo `.env` 

Se debe crear el archivo .env con las siguientes variables:

* `DB_USERNAME`
* `DB_PASSWORD`
* `DB_NAME`
* `TOKEN_SECRET`

# :package: Instalar dependencias NPM 

Desde el directorio del proyecto correr:

### ```npm install```

Para instalar los módulos de node.

### ```npm -g nodemon```

Para instalar nodemon globalmente.

### ```npm run dev```

Para correr el servidor en [http://localhost:3000](http://localhost:3000)

# :card_file_box: Base de datos

Desde el directorio del proyecto correr:

### ```npx sequelize db:create```

### ```npx sequelize db:migrate```

Para crear la base de datos y correr las migraciones.

### ```npx sequelize db:seed:all```

Para poblar la base de datos con los seeds creados.

### ```npx sequelize db:drop```

Para botar la base datos. \
Ojo! :eye: Este comando no tiene vuelta atrás.
