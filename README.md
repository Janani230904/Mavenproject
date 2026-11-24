# Placement Application Tracker

A local Java web app for recording job applications. Add a company and role, change its status after an interview, and delete entries. The browser UI uses HTML, CSS, and JavaScript. The backend uses Java 21, Spring Boot, Spring Data JPA, and MySQL.

## Quick interview demo (Windows PowerShell)

Open PowerShell in the folder containing `pom.xml`. Use your existing JDK 21 and Maven setup.

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```

Open [http://localhost:8080](http://localhost:8080). The demo profile uses an in-memory H2 database and clears the records when the app stops.

## Run with MySQL

Start your local MySQL server. In MySQL Workbench or the MySQL command line, run:

```sql
CREATE DATABASE IF NOT EXISTS placement_tracker CHARACTER SET utf8mb4;
```

From PowerShell in the project folder, run these commands. Replace the placeholders with your own local database credentials. Hibernate creates the application table on startup.

```powershell
$env:DB_USER = 'your_mysql_user'
$env:DB_PASSWORD = 'your_mysql_password'
mvn spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080). The default URL uses port 3306. Set `DB_URL` if your MySQL server uses another host or port. Records saved in MySQL persist across app restarts.

## REST API

| Method | Path | What it does | Success |
| --- | --- | --- | --- |
| GET | /api/applications | List applications, newest first | 200 |
| POST | /api/applications | Add an application | 201 |
| PUT | /api/applications/{id} | Update an application's company, role, and status | 200 |
| DELETE | /api/applications/{id} | Delete an application | 204 |

POST and PUT accept JSON such as:

```json
{"company":"Example Tech","role":"Java Developer","status":"APPLIED"}
```

Allowed statuses are `APPLIED`, `INTERVIEW`, `OFFER`, and `REJECTED`. Invalid inputs return 400. Updating or deleting an unknown ID returns 404.

## Explain it in an interview

When I click **Add application**, JavaScript sends a POST request with JSON. Spring Boot binds and validates the request in `ApplicationController`. The controller calls `ApplicationRepository`, and Hibernate maps `JobApplication` to a database row. The frontend refreshes the list with GET.

For a quick demo, add a sample application, change its status from Applied to Interview, then refresh the page to show the saved change. Open the browser's Network tab to show the POST, PUT, and GET requests. With MySQL enabled, restart the app and show that the entry is still there.
