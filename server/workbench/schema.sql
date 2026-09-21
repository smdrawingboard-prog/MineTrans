CREATE TABLE IF NOT EXISTS workbench_assessments (
 id CHAR(36) PRIMARY KEY, owner VARCHAR(320) NOT NULL, current_version INT NOT NULL DEFAULT 0,
 INDEX workbench_owner (owner)
);
CREATE TABLE IF NOT EXISTS workbench_versions (
 assessment_id CHAR(36) NOT NULL, version INT NOT NULL, actor VARCHAR(320) NOT NULL,
 status VARCHAR(20) NOT NULL, payload LONGTEXT NOT NULL, engine_version VARCHAR(32) NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (assessment_id,version),
 FOREIGN KEY (assessment_id) REFERENCES workbench_assessments(id)
);
CREATE TABLE IF NOT EXISTS workbench_documents (
 id CHAR(36) PRIMARY KEY, assessment_id CHAR(36) NOT NULL, owner VARCHAR(320) NOT NULL,
 payload LONGTEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (assessment_id) REFERENCES workbench_assessments(id)
);
CREATE TABLE IF NOT EXISTS workbench_access (
 assessment_id CHAR(36) NOT NULL, email VARCHAR(320) NOT NULL,
 granted_by VARCHAR(320) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (assessment_id,email),
 FOREIGN KEY (assessment_id) REFERENCES workbench_assessments(id)
);
