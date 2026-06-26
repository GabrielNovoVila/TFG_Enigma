# Plan de pruebas de endpoints

Este plan cubre los endpoints REST actuales del backend de la aplicacion Enigma.
Las pruebas automatizadas asociadas estan en:

- `src/test/java/com/example/enigma/M3ControllerEndpointTests.java`
- `src/test/java/com/example/enigma/AutenticacionControladorEndpointTests.java`
- `src/test/java/com/example/enigma/M3ServicioTests.java`

## Endpoints de maquina M3

| Endpoint | Caso probado | Resultado esperado | Prueba automatizada |
| --- | --- | --- | --- |
| `POST /m3` | Crear una maquina nueva | `201 Created` y cuerpo con `id`, tres rotores y reflector inicial | `crearMaquinaDevuelve201YMaquinaCreada` |
| `PATCH /m3/{id}` | Cambiar reflector de una maquina existente | `200 OK` y reflector actualizado | `cambiarReflectorDevuelve200SiExiste` |
| `PATCH /m3/{id}` | Cambiar reflector de una maquina inexistente | `404 Not Found` | `cambiarReflectorDevuelve404SiNoExiste` |
| `DELETE /m3/{id}` | Eliminar una maquina existente | `204 No Content` | `eliminarMaquinaDevuelve204SiExiste` |
| `DELETE /m3/{id}` | Eliminar una maquina inexistente | `404 Not Found` | `eliminarMaquinaDevuelve404SiNoExiste` |
| `PUT /m3/{id}` | Cambiar rotores, posiciones iniciales y posiciones actuales | `200 OK` y configuracion actualizada | `cambiarRotoresDevuelve200YAplicaConfiguracion` |
| `PUT /m3/{id}` | Cambiar rotores de una maquina inexistente | `404 Not Found` | `cambiarRotoresDevuelve404SiNoExiste` |
| `POST /m3/{id}/cifrar` | Cifrar una letra en una maquina existente | `200 OK`, letra resultante, maquina y pasos | `cifrarDevuelveResultadoMaquinaYPasos` |
| `POST /m3/{id}/cifrar` | Cifrar en una maquina inexistente | `404 Not Found` | `cifrarDevuelve404SiNoExiste` |
| `POST /m3/{id}/descifrar` | Descifrar una letra en una maquina existente | `200 OK`, letra resultante, maquina y pasos | `descifrarDevuelveResultadoMaquinaYPasos` |
| `POST /m3/{id}/descifrar` | Descifrar en una maquina inexistente | `404 Not Found` | `descifrarDevuelve404SiNoExiste` |
| `POST /m3/{id}/cables` | Conectar dos letras en una maquina existente | `200 OK` y maquina actualizada | `meterCablesDevuelve200SiExiste` |
| `POST /m3/{id}/cables` | Conectar cables en una maquina inexistente | `404 Not Found` | `meterCablesDevuelve404SiNoExiste` |
| `DELETE /m3/{id}/cables` | Desconectar dos letras en una maquina existente | `200 OK` y maquina actualizada | `sacarCablesDevuelve200SiExiste` |
| `DELETE /m3/{id}/cables` | Desconectar cables en una maquina inexistente | `404 Not Found` | `sacarCablesDevuelve404SiNoExiste` |
| `GET /m3/` | Consultar endpoint de usuario sin usuario OAuth | `200 OK` y lista vacia | `homeSinUsuarioOAuthDevuelveListaVacia` |

## Endpoint de autenticacion

| Endpoint | Caso probado | Resultado esperado | Prueba automatizada |
| --- | --- | --- | --- |
| `POST /auth/refresh` | Refrescar sesion con refresh token valido | `200 OK` y nuevo `accessToken` | `refreshDevuelveAccessTokenConRefreshTokenValido` |
| `POST /auth/refresh` | Refrescar sin token | `401 Unauthorized` | `refreshDevuelve401SiFaltaToken` |
| `POST /auth/refresh` | Refrescar con token en blanco | `401 Unauthorized` | `refreshDevuelve401SiTokenEsBlanco` |
| `POST /auth/refresh` | Refrescar con token invalido | `401 Unauthorized` | `refreshDevuelve401SiTokenNoEsValido` |

## Pruebas de servicio relevantes

| Metodo | Caso probado | Resultado esperado | Prueba automatizada |
| --- | --- | --- | --- |
| `M3Servicio.cifrar` | Cifrado con offsets negativos por configuracion de anillos | No lanza excepcion y devuelve una letra | `cifraConOffsetsNegativosSinSalirDelAlfabeto` |

## Ejecucion y resultado

Comando recomendado:

```powershell
cd C:\Users\Gabi\Desktop\Clasecita\TFG\TFG_Enigma\TFG_Enigma
.\gradlew.bat test
```

La bateria se ejecuto correctamente el 20 de junio de 2026. El resultado fue de **23 pruebas superadas de 23**, sin fallos ni pruebas omitidas:

- 17 pruebas de endpoints de `M3Controller`.
- 4 pruebas del endpoint de renovacion de sesion.
- 1 prueba de la logica de cifrado con offsets negativos.
- 1 prueba de carga del contexto de la aplicacion.

Durante la ejecucion se corrigieron dos incidencias detectadas por las pruebas:

1. Las pruebas de `M3Controller` necesitaban un doble de prueba de `AutenticacionServicio`, ya que el componente `FiltroJWT` depende de dicho servicio al construir el contexto de Spring.
2. El endpoint `GET /m3/` recibia directamente un `OAuth2User`, lo que podia fallar cuando no existia una sesion OAuth activa. Ahora recibe la autenticacion de forma segura y devuelve una lista vacia cuando el usuario no esta autenticado mediante OAuth.

El informe detallado se genera en:

```text
build/reports/tests/test/index.html
```
