# Investigación de mercado — SmartTrafic

Fecha de corte: septiembre 2026. Objetivo: posicionar la plataforma como la oferta con más ventajas reales para municipios pequeños e intermedios de Colombia y LatAm, no como una copia barata de SCATS/NoTraffic.

## 1. El mercado que sí existe

El mercado mundial de controladores semafóricos crece, pero el dinero se concentra en ciudades grandes. Los controladores actuados (fases fijas o semi-actuadas) siguen siendo mayoría (~48 %). Los adaptativos/IA crecen más rápido (~12 % CAGR), y el costo por cruce de un sistema “de marca” puede ir de USD 10.000 a USD 120.000 si se suma fibra, cámaras, gabinetes y capacitación.

En Estados Unidos, SCATS y SCOOT siguen cotizándose por encima de USD 20.000 por intersección solo en software/control, sin obra civil. NoTraffic reporta instalaciones cercanas a USD 75.000 por cruce (2025) y concentra ~80 % de su ingreso en Norteamérica. Miovision, SWARCO y McCain venden a secretarías con personal ITS propio. Ese no es el cliente de SmartTrafic.

## 2. Lo que muestra SECOP en Colombia (órdenes de magnitud reales)

Contratos públicos recientes de semaforización / señalización luminosa:

| Municipio | Año | Valor (COP) | Qué compraron |
|---|---|---|---|
| Yopal | 2023 | $2.157 millones | Señalización + semaforización urbana y rural (licitación de obra) |
| Armenia | 2022 | $1.574 millones | Señalización, compra e instalación de semáforos |
| Ubaté | 2025 | $370 millones | Suministro, instalación y mantenimiento de dispositivos luminosos |
| Piedecuesta | 2025 | $299 millones | Suministro, instalación y mantenimiento preventivo |
| Caucasia | 2023 | $286 millones | Adecuación, mantenimiento e instalación de una intersección |
| La Virginia | 2025 | $96 millones | Sistema integral vehicular y peatonal |
| Chiquinquirá | 2025 | $58 millones | Señalización + mantenimiento de semáforos (mínima cuantía) |
| Manizales | 2023 | $56 millones | Semáforos en un solo bulevar |

Lectura estratégica:

- El océano azul no es Bogotá ni Medellín. Es el municipio de 20.000 a 150.000 habitantes que ya tiene 2–8 cruces caóticos y un presupuesto de $50 a $400 millones.
- Casi todos los contratos mezclan **obra + lámparas + mantenimiento**, no software. El municipio paga acero y queda sin cerebro, sin datos y sin alertas.
- Bogotá gasta decenas de millones **solo en contratos de personas** para planeamiento semafórico. El municipio pequeño no tiene esa planta. Necesita que el software haga el trabajo del ingeniero de tránsito.

Espacio de competencia: un modelo mixto (el municipio paga postes/ópticas/solar; SmartTrafic cobra SaaS + comodato del cerebro) entra por debajo del ticket de una licitación tradicional y se contrata como servicio tecnológico, no como obra millonaria.

## 3. Competidores de espejo y por qué no cubren este mercado

| Actor | Fortaleza | Brecha que SmartTrafic cubre |
|---|---|---|
| SCATS / SCOOT | Madurez, olas verdes metropolitanas | Supercomputador central, lazos inductivos, personal especialista, costo político enorme |
| NoTraffic | Cámara + radar + IA por cruce | ~USD 75k/cruce, red eléctrica estable, lock-in de sensores propietarios |
| Miovision | Conteo 24/7 y clasificación | Hardware premium, gabinetes NEMA, no solar-first |
| SWARCO / McCain | Gabinetes industriales, NTCIP | Precio y complejidad de integración |
| ACS Lite (FHWA) | Adaptativo “barato” para EE.UU. | Amarra a marcas Eagle/Econolite/Siemens; no LatAm |
| Integradores locales (obra + LED) | Conocen SECOP y metalmecánica | Cero analítica, cero adaptativo, cero alertas, semáforo ciego |

## 4. Brechas no cubiertas (las que vamos a ocupar)

1. **Motos primero.** Colombia y buena parte de LatAm no son tráfico de carriles homogéneos. Motos ocupan 30–60 % del flujo, se filtran, se agrupan en la zona anticipada de detección (Manual de Señalización Vial 2024, Res. 45005). SCATS/NoTraffic optimizan autos. SmartTrafic clasifica moto / auto / bus / camión / bici / peatón y da peso distinto a la cola.
2. **Solar de verdad, no “solar opcional”.** Los sistemas de marca mueren si se va la luz. El modo Eco (batería < 20 %) y el watchdog de carga son el diferencial de municipio.
3. **Edge-first / nube-second.** Si se cae el 4G, el cruce sigue tomando decisiones locales. Los gigantes asumen backhaul permanente.
4. **Tráfico heterogéneo.** Vendedores informales, buses que paran en el cruce, motocarros, desfiles, mercado dominical. El algoritmo tiene modos: colegio, mercado, procesión, noche antiatraco, emergencia, eco.
5. **UX para no ingenieros.** El alcalde y el técnico de la secretaría no van a configurar SCATS. Bento, pocas decisiones, consumo progresivo.
6. **OpEx en vez de CapEx tecnológico.** El municipio no financia el cerebro. Paga mensualidad. Eso encaja en contratación de servicios, no en licitación de obra de $2.000 millones.
7. **WhatsApp / Telegram nativo.** El técnico del municipio no abre un SIEM. Recibe “Cruce Parque se quedó en ámbar por conflicto de fases” al celular.
8. **Inclusión peatonal real.** Luces de piso para peatón con celular, audio para invidentes, extensión de verde si hay peatón lento (adulto mayor, silla de ruedas).
9. **Prioridad de emergencia sin hardware caro.** Sirena + visión + botón de la estación de bomberos en la app. No exige transpondedores Opticom de USD 3.000 por ambulancia.
10. **Datos que el alcalde puede mostrar.** Gas no quemado (ralentí evitado vs ciclo de 45 s), CO₂ evitado, camiones de 3+ ejes (argumento de peaje/variante), minutos ganados. Los semáforos tradicionales no generan narrativa política.
11. **Ciberseguridad de gabinete.** NEMA TS 8 y ATC Cybersecurity exigen autenticación, cifrado, inventario de firmware. Casi ningún integrador local lo ofrece. SmartTrafic nace con TLS, firmas de dispositivo, RBAC, auditoría inmutable y conflicto-monitor lógico.
12. **Cumplimiento colombiano.** Manual de Señalización 2024, motovías, zona anticipada, tiempos mínimos peatonales, no experimental “por moda”.
13. **Gemelo digital antes de instalar.** Simular el cruce con conteos reales o sintéticos para mostrar al concejo “así se va a ver” sin romper una sola losa.
14. **Mantenimiento predictivo.** Consumo por lámpara, temperatura de gabinete, salud de batería, heartbeat MQTT. El municipio no tiene que “revisar si prendió”.
15. **V2X listo, no V2X obligatorio.** SPaT/MAP a futuro, sin exigir autos conectados hoy.

## 5. Innovaciones que SmartTrafic incluye (y casi nadie vende juntas)

| Innovación | Para qué existe | Quién la paga emocionalmente |
|---|---|---|
| Control adaptativo por peso de cola + distancia 100/200/300 m | Corta verdes vacíos, extiende pelotones | Conductor y comerciante |
| Corte por vacío + mínimo peatonal inviolable | Seguridad jurídica y humana | Secretaría de tránsito |
| Modo noche antiatraco | El semáforo no obliga a parar si la otra calle está vacía | Ciudadano de 11 p.m. |
| Prioridad ambulancia/bomberos por IA + micrófono + app | Salva minutos | Alcalde (titular) |
| Ola verde para bus municipal y recolector | Menos frenadas de pesados = menos huecos y CO₂ | Hacienda y ambiente |
| Modo Eco solar | El cruce no se apaga en invierno | Alcalde (miedo a apagón) |
| Luces de piso + audio | Peatón zombi e inclusión | ANSV / concejo |
| Clasificación de carga pesada | Argumento de peaje, variante, desgaste de vía | Hacienda |
| Alerta de choque/varado (objeto detenido > 3 min) | Policía llega antes del reclamo en redes | Policía |
| Retraso de verde si radar ve un infractor que no va a alcanzar a frenar | Evita el T-bone | Familia del que iba en verde |
| Motobox / zona anticipada | Arranque de motos primero, menos filtrado caótico | Motociclistas (ANDI) |
| Modo colegio (7:00–7:40 y 12:30–13:30) | Verde peatonal largo automático | Padres |
| Modo mercado/feria | Recalibra fases el domingo | Comerciantes |
| Reportes en lenguaje natural (IA) al correo del alcalde | El alcalde no lee gráficas | Despacho |
| Dashboard en la estación de policía | Vendor lock-in positivo | Mandos de policía |
| Matriz de propiedad (municipio vs comodato) | Renovación de contrato | La empresa |
| Salud tipo Sentry + Telegram al dueño de la plataforma | Operar 50 municipios sin un NOC de 20 personas | El fundador |
| Simulador / gemelo | Cierra la venta en una reunión | Concejo |

## 6. Estándares de ingeniería que adoptamos (aunque el municipio no los pida)

- **Fail-safe de conflicto:** nunca verde vs verde. Monitor de conflicto lógico + ámbar intermitente si hay duda. Equivalente funcional a MMU/CMU de gabinete NEMA.
- **Tiempos mínimos y máximos** por fase, peatón y despeje (yellow + all-red). El algoritmo adaptativo no puede violarlos.
- **Comunicación:** MQTT 5 sobre TLS 1.3, autenticación por dispositivo (certificado o HMAC), no HTTP polling.
- **Identidad:** RBAC (superadmin, operador plataforma, alcaldía, técnico, policía/visor). Superadmin anclado al correo `clpezci@gmail.com`.
- **Auditoría:** cada cambio de plan, variable, usuario o comando de campo queda en log inmutable (append-only).
- **Secretos:** nunca en el cliente. Service role solo en servidor. RLS en Postgres por `municipality_id`.
- **Edge autónomo:** watchdog, last-known-good plan, degradación a tiempo fijo si fallan sensores.
- **Privacidad:** las cámaras son para conteo/clases, no para vigilancia masiva por defecto. Rostros no se almacenan en fase 1. Placas solo si el municipio contrata el módulo (y con base legal).
- **Alineación futura:** NTCIP 1202 v04 / ATC 5201 como hoja de ruta de interoperabilidad, MQTT como transporte actual (el propio NTCIP discute MQTT como alternativa a SNMP).

## 7. Tesis de producto

NoTraffic es el espejo técnico. El municipio pequeño colombiano es el cliente. El producto no es “un semáforo con Wi-Fi”. Es **el sistema operativo de movilidad del municipio**: adaptativo, solar, motos-first, vendible como suscripción, operable por un técnico con celular, y con un candado contractual limpio (el acero es del municipio; el cerebro es nuestro).
