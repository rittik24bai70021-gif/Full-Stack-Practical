# Experiment 8.2 — StreamOps Reliability Suite
**Rittik Basak | UID: 24BAI70021 | Full Stack II**

Separate `frontend` and `backend` applications, aligned with Experiment 8.2 of the supplied report. StreamOps adds a blue analytics dashboard with success rate, status distribution, retry analysis, searchable event ledger, selected-event inspector and DLQ monitor. All displayed metrics come from backend records; there are no prefilled demonstration results.

## Run using your existing Exp 8.1 Kafka broker (recommended)
You already have Docker Desktop and Kafka working. Leave Docker Desktop and `exp81-kafka` running. Exp 8.2 connects to that same broker at localhost:9092, while using separate topics and consumer groups. **Do not start another Kafka broker on port 9092.** Both experiments' backends and frontends can run at the same time because their ports differ.

1. Extract this ZIP completely and open `Exp8_2_StreamOps` in VS Code.
2. Check Kafka in a terminal:
```powershell
docker ps --filter name=exp81-kafka
```
If the existing container is stopped:
```powershell
docker start exp81-kafka
```
Wait for it to become healthy. If the container does not exist, use the standalone setup below.

3. Right-click `backend` > Open in Integrated Terminal:
```powershell
.\mvnw.cmd spring-boot:run
```
Wait for `Started Application`. The two Exp 8.2 topics are created automatically.

4. Right-click `frontend` > Open in Integrated Terminal:
```powershell
npm.cmd ci
npm.cmd run dev
```
5. Open Chrome at **http://localhost:3003**. Keep both terminals running.

You can also double-click `START-BACKEND.cmd` and `START-FRONTEND.cmd` after Kafka is running. Maven Wrapper downloads Maven automatically; no separate Maven installation is needed. Requirements: JDK 17+ (JDK 25 matches the submitted report), Node.js 22 LTS, Docker Desktop, internet for first-time dependency downloads.

## Optional standalone Kafka setup
Only use this if no Kafka broker is using port 9092. From `backend`:
```powershell
docker compose up -d --wait
docker compose ps
```
This creates `exp82-kafka` and a separate persistent volume. A one-shot `kafka-init` service sets data-directory ownership to UID/GID 1000 before Kafka starts, addressing the permission issue encountered in Exp 8.1. An exited init service with exit code 0 is expected. The Kafka service itself must be healthy.

If this setup fails, inspect:
```powershell
docker compose logs --no-color --tail=80 kafka-init kafka
```
Do not use `docker compose down -v` to troubleshoot: it removes stored Kafka data. To stop the standalone broker without deleting data, use `docker compose stop`.

## Conduct: step by step
Run the scenarios one at a time and wait for each to finish. Click the preset FIRST, then replace the generated ID if you want the IDs below.

| Scenario | Event ID | Simulated failures | Expected final state | Attempts |
|---|---|---:|---|---:|
| Normal | POST82-NORMAL-001 | 0 | PROCESSED | 1 |
| Retry twice | POST82-RETRY-001 | 2 | PROCESSED | 3 |
| Send to DLQ | POST82-DLQ-001 | 10 | DLQ | 4 |

Suggested content: `Publish the college technical fest announcement.`

1. Select **Normal**, enter your ID/content, click **Publish event**. It succeeds immediately.
2. Select **Retry twice**, enter a new ID, publish. Delays are 1 second then 2 seconds before success on attempt 3.
3. Select **Send to DLQ**, enter a new ID, publish. All 4 attempts fail; waits are 1, 2 and 4 seconds. Allow at least 7–10 seconds plus processing and polling time.
4. Open **Retry analysis** to explain the histogram, recovered-after-retry count, extra processing attempts and delay policy.
5. Open **Dead-letter queue** and click **Inspect**. Show the last error and attempt count.
6. Go to **Overview**, keep an already-used ID and publish again. Expect a duplicate warning / HTTP 409 and no new record. A duplicate ID is blocked even when its content changes.
7. Open **Event ledger**, search by ID or content, select a status filter, and inspect a record.
8. Once all events finish, stop ONLY the backend with Ctrl+C and restart it from the same backend folder. H2 records remain visible after reconnection.

Starting from an empty database, the three scenarios yield: total 3, success rate 66.7%, retried events 2, DLQ 1. The retry histogram shows one event at 1 attempt, one at 3, and one at 4. Extra processing attempts = 0 + 2 + 3 = 5. Recovered after retry = 1.

### Metric definitions
- **Total submitted:** all persisted event records, including an event whose broker acknowledgement failed.
- **Success rate:** PROCESSED / all records × 100; 0.0% when there are no records. Pending events are included in the denominator.
- **Retried events:** records with attempts > 1, regardless of final outcome.
- **Extra processing attempts:** sum(max(attempts − 1, 0)).
- **Recovered after retry:** PROCESSED records with attempts > 1.
- **Status distribution:** current statuses of all stored records; not a historical time series.
- **Histogram:** number of records at each attempt count; 4+ includes any additional deliveries following interrupted processing/restarts.

The API indicator checks backend reachability. Kafka connectivity is checked separately every 10 seconds. The ledger refreshes every 1.5 seconds; very brief PROCESSING transitions may not be visible. During an outage, last known records remain displayed with an offline notice.

## Isolation and ports
| Setting | Experiment 8.1 | Experiment 8.2 |
|---|---|---|
| Frontend | 3002 | 3003 |
| Backend | 8300 | 8301 |
| Broker | localhost:9092 | localhost:9092 (shared) |
| Main topic | scheduled-posts | scheduled-posts-82 |
| DLQ topic | scheduled-posts-dlq | scheduled-posts-dlq-82 |
| Main group | scheduled-posts-group | scheduled-posts-group-82 |
| DLQ group | scheduled-posts-dlq-group | scheduled-posts-dlq-group-82 |
| H2 file inside backend/data | kafka-reliability-db.mv.db | kafka-reliability-db-82.mv.db |

Exp 8.1 events are not copied to Exp 8.2. It is normal for StreamOps to start with an empty ledger.

## REST API / Postman
Base URL: `http://localhost:8301`
- `POST /api/events` — accepts a unique event, returns 202.
- `GET /api/events` — records, newest first.
- `GET /api/events/{eventId}` — one record; 404 if absent.
- `GET /api/health` — API and Kafka connectivity.

POST body (raw JSON):
```json
{"eventId":"POST82-RETRY-001","content":"Publish the technical fest announcement.","failuresBeforeSuccess":2}
```
Duplicate ID: 409. Invalid input: 400. Broker acknowledgement failure: 503 and a PUBLISH_FAILED record; acknowledgement timeouts can leave delivery uncertain, so inspect that ID before creating another.

To inspect actual DLQ messages using your existing Kafka container:
```powershell
docker exec exp81-kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic scheduled-posts-dlq-82 --from-beginning --max-messages 1
```
Run after the DLQ scenario; otherwise the command waits for a message. If using the optional standalone container, replace `exp81-kafka` with `exp82-kafka`.

## Source map
- `backend/src/main/java/com/rittik/streamops/EventController.java`: REST endpoints and input validation.
- `EventService.java`: submission, duplicate detection, state persistence and simulated processing.
- `EventConsumer.java`: isolated main-topic and DLQ listeners.
- `KafkaConfig.java`: topic definitions, exponential backoff and DeadLetterPublishingRecoverer.
- `EventRecord.java` / `EventRepository.java`: JPA entity and repository.
- `frontend/src/main.jsx`: dashboard, analytics calculations, forms, search, inspector and polling.
- `frontend/src/style.css`: responsive StreamOps design.

## Verify
From backend:
```powershell
.\mvnw.cmd test
```
Tests start an embedded Kafka broker automatically; no Docker is required for this test command. From frontend:
```powershell
npm.cmd run build
```
Use `npm.cmd run dev` for the conduct: its Vite proxy forwards `/api` to port 8301. Production hosting is not configured by this ZIP.

## Troubleshooting
- Docker command missing in an old terminal: close and reopen VS Code. If needed, refresh the current terminal PATH:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
```
- Docker client works but Server fails: open Docker Desktop and wait for its engine.
- API offline: start the backend on 8301 and inspect its terminal.
- Kafka unreachable: verify the existing broker is healthy before starting the backend.
- Port 9092 in use: reuse that broker instead of starting the optional one.
- Frontend port 3003 / backend port 8301 in use: stop an earlier copy of this experiment.
- Database in use: run only one Exp 8.2 backend against its file.
- Maven wrapper missing: open a terminal directly in backend, then use `.\mvnw.cmd`.
- npm PowerShell execution-policy issue: use `npm.cmd` as shown, without changing execution policy.

## Lab scope
This application processes scheduled-post event payloads immediately; it does not schedule future calendar times or post to social media. Failures are deliberate test inputs. Completed-record checks and serialized operations demonstrate idempotency in one backend instance, not exactly-once arbitrary external side effects. Kafka publishing and database writes are not an atomic transaction; production designs need an outbox and distributed concurrency controls. Restarting during backoff can reset its in-memory retry schedule. One partition makes ordering visible but holds later events while a previous record retries.

Reference: https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html

## Updated interface — navy & violet

The frontend now uses a dark navy canvas, violet accents, left navigation, larger cards, and responsive layouts.

To update an existing installation, stop the frontend with Ctrl+C and replace only its `frontend` folder from this ZIP. Keep your existing backend folder and database. In the new frontend folder run:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:3003 in Chrome. Keep Kafka and the backend running as before.
