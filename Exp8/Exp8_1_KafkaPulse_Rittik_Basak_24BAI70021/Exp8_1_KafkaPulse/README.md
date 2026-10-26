# Experiment 8.1 — KafkaPulse
**Rittik Basak | UID: 24BAI70021 | Full Stack II**

A runnable React + Spring Boot application for the Kafka reliability experiment in your report. Contains two application folders: `frontend` and `backend`. It uses real Apache Kafka, not a browser simulation. The frontend displays your name and UID in both its sidebar and footer.

## 1. Install / check prerequisites
- Docker Desktop, running with Linux containers.
- JDK 25 as specified in your report (Java 17+ is sufficient for the source).
- Node.js 22 LTS and npm.
- VS Code. Maven is downloaded automatically by the included official Maven Wrapper.
- Internet is needed for the initial Maven, npm, and Docker downloads. No cloud service or account is needed to run the lab.

Check in PowerShell:
```powershell
java -version
node -v
npm -v
docker version
```
Extract the ZIP completely before running it. Open the extracted `Exp8_1_KafkaPulse` folder in VS Code. Do not run commands inside the ZIP viewer.

## 2. Start the three components
Keep all three components running during the demonstration.

**Terminal 1 — Kafka**
```powershell
cd backend
docker compose up -d --wait
```
Wait for the container to become healthy. First launch can take several minutes. Topics are created automatically by Spring Boot. If you already have a Kafka broker on port 9092, use that broker and skip this Compose command; do not start two brokers on the same port.

**Terminal 2 — Spring Boot** (new terminal from the project root)
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
Wait for `Started Application`. Backend: http://localhost:8300/api/events . On macOS/Linux use `chmod +x mvnw` then `./mvnw spring-boot:run`.

**Terminal 3 — React** (new terminal from the project root)
```powershell
cd frontend
npm ci
npm run dev
```
Open **http://localhost:3002**. Expect an API-connected indicator and a reachable Kafka broker indicator. A new database starts empty intentionally; publish events to populate real results.

Alternatively, on Windows, double-click `START-KAFKA.cmd`, wait for success, then `START-BACKEND.cmd`, wait for startup, then `START-FRONTEND.cmd`.

## 3. Conduct before ma'am: exact sequence
1. Show your name and UID in the frontend and explain the flow: React → REST API → Kafka → consumer → H2 → dashboard.
2. Click **Normal**, then **Publish event**. The event becomes `PROCESSED`, with **1** attempt.
3. Click **Retry twice**, then **Publish event**. It fails twice and succeeds on attempt **3**, after waits of **1 second and 2 seconds**. Inspect the event.
4. Click **Send to DLQ**, then **Publish event**. It fails on all **4** attempts, waiting **1, 2, and 4 seconds** between attempts, then becomes `DLQ`. Open **Dead-letter queue** and **Inspect** to show the last error.
5. Without changing the event ID, click **Publish event** again. See the duplicate warning. Backend returns **409 Conflict**; no extra record is created.
6. Use the ledger search and status filter. The counters are computed from actual records. `Retried events` counts records with attempts > 1; it is not the number of retry operations.
7. To show persistence, stop ONLY the backend with Ctrl+C and start it again. Records remain in its file-backed H2 database. Run from the backend folder every time so the relative database location stays consistent.
8. Explain: three retries means four total attempts. Polling is every 1.5 seconds, so very short `PROCESSING` transitions may not appear on screen.

The scenario buttons generate a fresh ID and populate the form; they do not submit until you click Publish event. The ID stays unchanged after publication so the duplicate demonstration is easy.

## 4. Architecture and files
- `backend/src/main/java/com/rittik/kafkapulse/EventController.java`: REST API, validation, health endpoint.
- `EventService.java`: persistent state changes, duplicate protection, publishing and processing.
- `EventConsumer.java`: main and dead-letter consumers.
- `KafkaConfig.java`: topics, exponential backoff and DeadLetterPublishingRecoverer.
- `EventRecord.java`, `EventRepository.java`: H2/JPA persistence.
- `frontend/src/main.jsx`: React dashboard, forms, filters, event inspector and polling.
- `frontend/src/style.css`: responsive interface.
- `backend/docker-compose.yml`: Kafka in KRaft mode; no ZooKeeper required.
- `backend/src/test/.../ReliabilityTest.java`: integration checks against an embedded Kafka broker.

## 5. Configuration matching the report
| Component | Value |
|---|---|
| Backend port | 8300 |
| Frontend port | 3002 |
| Kafka broker | localhost:9092 |
| Main topic | scheduled-posts |
| Dead-letter topic | scheduled-posts-dlq |
| Main consumer group | scheduled-posts-group |
| DLQ consumer group | scheduled-posts-dlq-group |
| H2 | backend/data/kafka-reliability-db.mv.db |
| Retry delays | 1000, 2000, 4000 ms |
| Maximum deliveries under normal uninterrupted operation | 4 |

The frontend uses a Vite `/api` proxy to port 8300. A browser-reachable API is checked separately from Kafka broker reachability. `PUBLISH_FAILED` is an additional status for a missing broker acknowledgement. Kafka delivery can be uncertain after a timeout; inspect the existing ID before creating another.

## 6. REST requests / Postman
`POST http://localhost:8300/api/events` — Body → raw → JSON:
```json
{"eventId":"POST-RETRY-001","content":"Scheduled post reliability test","failuresBeforeSuccess":2}
```
Expected: **202 Accepted**. Use a new ID for a new event. Repeat the same body for **409 Conflict**.
- `GET http://localhost:8300/api/events` — all records, newest first.
- `GET http://localhost:8300/api/events/POST-RETRY-001` — one record.
- `GET http://localhost:8300/api/health` — API and live broker connectivity.
- Invalid input returns 400. Missing event returns 404. Publish acknowledgement failure returns 503.

## 7. Inspect actual Kafka topics
From `backend`:
```powershell
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic scheduled-posts-dlq --from-beginning --max-messages 1
```
Run the second command after the DLQ demo. Otherwise it waits for a message. Ctrl+C exits the console consumer.

## 8. Build and verify
Backend (no Docker required for tests; test broker runs inside the JVM):
```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd package
```
Frontend:
```powershell
cd frontend
npm run build
```
The conduct interface should be run with `npm run dev` for the supplied API proxy. Vite's production preview is not configured as a production deployment.

## 9. Troubleshooting
- **Docker daemon error:** open Docker Desktop and wait until its engine is ready.
- **Kafka port 9092 in use:** stop the conflicting instance or use the existing broker. Do not delete any unrelated container.
- **API offline:** start the backend, inspect its terminal, and visit `/api/events`. There are no fake success indicators or prefilled records.
- **Backend exits while Kafka starts:** wait for Kafka health, then restart the backend.
- **Port 8300 / 3002 occupied:** stop the earlier app using that port before starting this experiment.
- **`mvnw.cmd` not recognized:** ensure your terminal is inside `backend` and use the leading `.\` in PowerShell.
- **npm.ps1 execution-policy error:** use `npm.cmd ci` and `npm.cmd run dev` without changing your system execution policy.
- **`JAVA_HOME` invalid:** point it at your installed JDK directory, reopen the terminal, and recheck `java -version`.
- **Database already in use:** only run one backend against this H2 database.
- **First downloads are slow:** allow Maven/npm/Docker to finish. Internet is required on first use.
- **Events briefly say RETRYING after the last attempt:** the DLQ consumer updates them asynchronously. Allow a few seconds.

## 10. Stop and resume
Stop the frontend and backend terminals with Ctrl+C. From backend run `docker compose stop`. This retains Kafka data. `docker compose up -d --wait` starts it again. H2 records remain on disk. Avoid deleting just the database or just the Kafka volume: their histories should stay aligned.

## Lab scope / accurate viva explanation
This lab demonstrates scheduled-post *events* processed immediately after submission; it does not implement calendar scheduling or publish to social media. The simulated failure count is deliberate test input.

The consumer skips completed events and the single backend instance serializes submissions and state transitions. This is educational idempotency for persisted records, not a claim of exactly-once arbitrary external side effects. Database writes and Kafka publishing are not an atomic transaction; a production system would use an outbox and stronger distributed concurrency controls. A process restart during backoff may reset the in-memory retry schedule. One partition makes retry ordering easy to observe but can delay later events while the current event retries. For the conduct, let each scenario finish before publishing the next one.

Reference: Spring Kafka error handling — https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html
