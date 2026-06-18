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

## Ejecucion

Comando recomendado:

```powershell
cd C:\Users\Gabi\Desktop\Clasecita\TFG\TFG_Enigma\TFG_Enigma
.\gradlew.bat test
```

En el entorno actual de Codex no se pudo completar la ejecucion porque Gradle intento resolver
`org.springframework.boot:org.springframework.boot.gradle.plugin:3.3.2` y la red esta bloqueada.
El error obtenido fue:

```text
Plugin [id: 'org.springframework.boot', version: '3.3.2'] was not found
```

Cuando el equipo tenga red o la dependencia este cacheada, el comando anterior generara el informe en:

```text
build/reports/tests/test/index.html
```
