# Docker Compose y PostgreSQL

Vamos a crear un archivo `docker-compose.yaml` a la vez de una archivo llamado `db/init.sql` para la configuración inicial de la base de datos dentro del contenedor.

Para el archivo de docker configuramos lo siguiente:

```yaml
version: '3.1'

services:
    nestdb_pg:
        image: postgres:latest
        container_name: nestdb_pg
        restart: always
        environment:
            POSTGRES_DB: nestdb
            POSTGRES_USER: user_nest
            POSTGRES_PASSWORD: secret1234
        volumes:
            - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
        ports:
            - 5435:5432
```

Y para el archivo `init.sql` establecemos la siguiente consulta:

```sql
SELECT 'CREATE DATABASE nestdb'
WHERE NOT EXISTS (
    SELECT
    FROM pg_database
    WHERE datname = 'nestdb'
) \gexec
```

Para levantar o correr por primera vez el contenedor usamos el siguiente comando (la bandera `-d` es para ejecutar en segundo plano, es opcional):

```txt
docker-compose up -d
```

Podemos probar nuestra aplicación usando cualquier cliente sql, por ejemplo TablePlus, en donde ponemos las siguiente credenciales:

| Key      | Value        |
| -------- | ------------ |
| Host     | `localhost`  |
| User     | `user_nest`  |
| Password | `secret1234` |
| Database | `nestdb`     |

___

| Anterior                                                                             | Readme                 | Siguiente                                                |
| ------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------- |
| [Configuración y variables de entorno](./P2T1_Configuracion_variables_de_entorno.md) | [Readme](../README.md) | [Iniciando con TypeORM](./P4T1_Iniciando_con_TypeORM.md) |
