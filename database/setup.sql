CREATE DATABASE IF NOT EXISTS recruit;
USE recruit;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applicant (
    applicant_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    personal_link VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT,
    job_posting_id INT,
    resume_path  VARCHAR(255) NOT NULL,
    score INT,
    FOREIGN KEY (applicant_id) REFERENCES applicant(applicant_id),
    FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id),
);

CREATE TABLE IF NOT EXISTS job_posting (
    job_posting_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    dscription TEXT,
    user_id INT NOT NULL,
    criteria_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (criteria_id) REFERENCES criteria(criteria_id),
    status ENUM('DRAFT', 'PUBLISHED', 'CLOSED') NOT NULL
);

CREATE TABLE IF NOT EXISTS criteria (
    criteria_id INT AUTO_INCREMENT PRIMARY KEY,
    criteria_json JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS database_scan_process (
    process_id INT AUTO_INCREMENT PRIMARY KEY, 
    job_posting_id INT NOT NULL,
    FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id)
);

CREATE TABLE IF NOT EXISTS database_scan_job (
    process_id INT,
    application_id INT,
    score INT,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'FINISHED', 'FAILED') NOT NULL,
    FOREIGN KEY (process_id) REFERENCES database_scan_process(process_id),
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    PRIMARY KEY (process_id, application_id)
);