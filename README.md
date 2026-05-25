Máquina Enigma - Trabajo de fin de grado de Ingeniería Informática (2ª ed.)

Simulador de una máquina enigma M3. Hecho con tecnologías Rest (Spring). Consta de 2 partes: 
 - Un backend en Java que contiene toda la lógica
 - Un frontend en React Web (JavaScript, HTML, CSS)

La idea de este proyecto es la simulación de una máquina Enigma, de forma que:
 - Rotores
 - Reflector
 - Entrada
 - Salida

Sean simulados con clases y con llamadas a una API.

La aplicación tiene habilitado el inicio de sesión con cuentas de Google gracias a Google Cloud console.

Endpoints de la API:
 - POST /auth/refresh
 - POST /m3
 - PATCH /m3/{id}
 - DELETE /m3/{id}
 - PUT /m3/{id}
 - POST /m3/{id}/cifrar
 - POST /m3/{id}/cables
 - DELETE /m3/{id}/cables
