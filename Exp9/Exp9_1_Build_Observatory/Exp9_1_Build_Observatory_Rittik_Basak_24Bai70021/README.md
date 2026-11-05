# Build Observatory — Experiment 9.1
**Rittik Basak | UID: 24Bai70021 | Full Stack II**

A complete CI testing lab with a React dashboard, Spring Boot REST API, persistent H2 storage, JUnit/Mockito, MockMvc, Pact contracts, PostgreSQL Testcontainers, and a GitHub Actions workflow.

## Start on Windows
1. Install JDK 21 (JDK 17 also works). Confirm `java -version` in a new PowerShell window.
2. Extract the ZIP completely. Open the extracted project in VS Code.
3. Open Terminal → New Terminal. The directory must contain `pom.xml`, `mvnw.cmd` and `START_HERE.cmd`.
4. Run ` .\mvnw.cmd spring-boot:run `, or double-click `START_HERE.cmd`.
5. Wait for `Started ObservatoryApplication`, then open **http://localhost:8400**.
6. Stop the server with Ctrl+C. Build records persist in the local `data` folder.

The compiled frontend is included. **Node.js is not required just to run the app.** The first Maven launch needs internet to download Maven and dependencies. No system Maven installation is needed. Keep the `.mvn` folder; it contains the wrapper configuration.

## Conduct the experiment
1. Open Overview. Confirm the API says Connected.
2. Enter `Add CI workflow` and click Create record. The server should return 201 and create a QUEUED record.
3. Try `Test build validation` and `Verify database persistence`.
4. Open Build history, search a message, inspect an ID, and export JSON.
5. Switch among Observatory Mint, Amethyst Studio and Desert Amber in the header.
6. Run the default verification in a second terminal: ` .\mvnw.cmd clean verify `.
7. Start Docker Desktop, use Linux containers, and wait until `docker info` succeeds.
8. Run the complete experiment: ` .\mvnw.cmd clean verify -Pfull `.
9. Save your console output and reports under `target/surefire-reports`, `target/failsafe-reports` and `target/pacts`.
10. Capture screenshots of the personalized dashboard, records, test results, and PostgreSQL test output.

Default verification runs JUnit/Mockito, MockMvc, Pact consumer generation, then Pact provider verification. The full profile ALSO runs PostgreSQL Testcontainers. Docker is mandatory for the full profile; the database test is not silently skipped.

**Creating a build record does not run Maven, GitHub Actions or a queue worker.** QUEUED is the persisted sample status specified in the experiment. The UI's four checks show configured test layers, not live passing results. Real results come from Maven reports or GitHub Actions. No cloud repository has been created and no remote workflow has been run.

## Version compatibility note
This is a deliberately pinned compatibility implementation, not an exact dependency-version reproduction of the sample PDF. It uses Spring Boot 3.4.4, Java release 17 (runs on JDK 21), Pact 4.6.17, Testcontainers 1.20.6, PostgreSQL 16, Maven 3.9.9, React 18.3.1 and Vite 6.2.6. The sample lists Boot 4.1.1, Pact 4.7.5 and Testcontainers 2.0.5. The experiment objectives and endpoints are preserved. If your instructor mandates the exact sample versions, do not describe this as that exact stack. This is a local educational project, not a production deployment template.

## Frontend development (optional)
Install Node.js 22 LTS. In a second terminal:
```
cd frontend
npm ci
npm run dev
```
Open http://localhost:5173 with the backend running on 8400. Vite proxies `/api` to the backend.
After editing, run `npm run build` from `frontend` (or `REBUILD_FRONTEND.cmd` at project root), then restart the backend to serve the rebuilt files at 8400. The build outputs go into `src/main/resources/static`. Do not manually edit the bundled JS there; edit `frontend/src`.

## REST endpoints / Postman
Base URL: http://localhost:8400

| Method | Path | Expected result |
|---|---|---|
| POST | /api/builds | 201 Created + Location header |
| GET | /api/builds | 200, newest-first JSON array |
| GET | /api/builds/{id} | 200, or 404 if absent |

For POST, choose Body → raw → JSON:
```json
{"commitMessage":"Add CI workflow"}
```
Invalid cases: blank strings, missing/null message, malformed JSON, or more than 200 characters after trimming return 400. Leading/trailing whitespace is trimmed. Use the actual returned ID for retrieval. A Postman collection is included under `docs`.

## GitHub Actions
The included `.github/workflows/ci.yml` runs on push, pull request, or manual dispatch. To demonstrate remote CI, upload the project to a repository you own, including `.github`, `.mvn` and `frontend/package-lock.json`. Do not upload `target`, `frontend/node_modules` or your local `data` folder. The Ubuntu runner builds React and runs `clean verify -Pfull` with Java 21 and Docker. It preserves the reports, contracts and executable JAR as artifacts. Actions availability and quotas depend on your account.

## File map
- `pom.xml`: pinned dependencies, Surefire, Failsafe and full profile.
- `mvnw`, `mvnw.cmd`, `.mvn/wrapper`: Maven Wrapper, at project root.
- `src/main/java/in/rittik/observatory`: entity, repository, service, controller, error handler.
- `src/test/java/in/rittik/observatory`: unit, MockMvc, Pact and PostgreSQL tests.
- `frontend/src`: React UI and responsive theme styles.
- `src/main/resources/static`: prebuilt UI for one-port startup.
- `docs/LAB_GUIDE.md`: explanation, expected observations and viva questions.
- `VALIDATION.md`: actual validation performed during packaging.

## Troubleshooting
- **mvnw.cmd not recognized:** extract the entire ZIP, then `cd` into the folder containing `pom.xml`. Run `Get-ChildItem -Force` to confirm `mvnw.cmd` and `.mvn` exist. Use ` .\mvnw.cmd ` in PowerShell, not just `mvnw.cmd`.
- **Java not found:** install JDK 21, set JAVA_HOME to the JDK directory, add its bin directory to PATH, then reopen VS Code.
- **Port 8400 in use:** stop the earlier app. Alternatively run ` .\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8401" ` and visit localhost:8401. The included built UI uses relative API URLs and still works; the Vite development proxy would also need updating.
- **Database already in use:** stop duplicate backend processes. Run only one app against this file-backed H2 database.
- **Offline indicator:** check the backend terminal, then click Refresh API.
- **Docker test fails:** start Docker Desktop in Linux-container mode; run `docker info`; confirm internet access to download postgres:16-alpine. Default checks can run without Docker, but do not claim full database verification until `-Pfull` succeeds.
- **Network dependency errors:** check your internet/proxy settings, then retry. Do not delete tests to make a build pass.
- **Pact provider run alone fails:** run `clean verify` so consumer tests generate `target/pacts` before Failsafe verifies them.

The reference PDF's final learning outcomes mention Kafka/retries/DLQ; those belong to another experiment. This project's guide gives CI-specific outcomes instead.
