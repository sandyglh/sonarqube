CREATE TABLE "CE_QUEUE" (
  "ID" INTEGER NOT NULL GENERATED BY DEFAULT AS IDENTITY (START WITH 1, INCREMENT BY 1),
  "UUID" VARCHAR(40) NOT NULL,
  "TASK_TYPE" VARCHAR(15) NOT NULL,
  "COMPONENT_UUID" VARCHAR(40) NULL,
  "STATUS" VARCHAR(15) NOT NULL,
  "SUBMITTER_LOGIN" VARCHAR(255) NULL,
  "WORKER_UUID" VARCHAR(40) NULL,
  "EXECUTION_COUNT" INTEGER NOT NULL,
  "STARTED_AT" BIGINT NULL,
  "CREATED_AT" BIGINT NOT NULL,
  "UPDATED_AT" BIGINT NOT NULL
);
CREATE UNIQUE INDEX "CE_QUEUE_UUID" ON "CE_QUEUE" ("UUID");
CREATE INDEX "CE_QUEUE_COMPONENT_UUID" ON "CE_QUEUE" ("COMPONENT_UUID");
CREATE INDEX "CE_QUEUE_STATUS" ON "CE_QUEUE" ("STATUS");


CREATE TABLE "CE_ACTIVITY" (
  "ID" INTEGER NOT NULL GENERATED BY DEFAULT AS IDENTITY (START WITH 1, INCREMENT BY 1),
  "UUID" VARCHAR(40) NOT NULL,
  "TASK_TYPE" VARCHAR(15) NOT NULL,
  "COMPONENT_UUID" VARCHAR(40) NULL,
  "ANALYSIS_UUID" VARCHAR(50) NULL,
  "STATUS" VARCHAR(15) NOT NULL,
  "IS_LAST" BOOLEAN NOT NULL,
  "IS_LAST_KEY" VARCHAR(55) NOT NULL,
  "SUBMITTER_LOGIN" VARCHAR(255) NULL,
  "WORKER_UUID" VARCHAR(40) NULL,
  "EXECUTION_COUNT" INTEGER NOT NULL,
  "SUBMITTED_AT" BIGINT NOT NULL,
  "STARTED_AT" BIGINT NULL,
  "EXECUTED_AT" BIGINT NULL,
  "CREATED_AT" BIGINT NOT NULL,
  "UPDATED_AT" BIGINT NOT NULL,
  "EXECUTION_TIME_MS" BIGINT NULL,
  "ERROR_MESSAGE" VARCHAR(1000),
  "ERROR_STACKTRACE" CLOB,
  "ERROR_TYPE" VARCHAR(20)
);

CREATE UNIQUE INDEX "CE_ACTIVITY_UUID" ON "CE_ACTIVITY" ("UUID");
CREATE INDEX "CE_ACTIVITY_COMPONENT_UUID" ON "CE_ACTIVITY" ("COMPONENT_UUID");
CREATE INDEX "CE_ACTIVITY_ISLASTKEY" ON "CE_ACTIVITY" ("IS_LAST_KEY");
CREATE INDEX "CE_ACTIVITY_ISLAST_STATUS" ON "CE_ACTIVITY" ("IS_LAST", "STATUS");

CREATE TABLE "CE_TASK_CHARACTERISTICS" (
  "UUID" VARCHAR(40) NOT NULL PRIMARY KEY,
  "TASK_UUID" VARCHAR(40) NOT NULL,
  "KEE" VARCHAR(50) NOT NULL,
  "TEXT_VALUE" VARCHAR(4000)
);
CREATE INDEX "CE_TASK_CHARACTERISTICS_TASK_UUID" ON "CE_TASK_CHARACTERISTICS" ("TASK_UUID");


CREATE TABLE "CE_TASK_INPUT" (
  "TASK_UUID" VARCHAR(40) NOT NULL PRIMARY KEY,
  "INPUT_DATA" BLOB,
  "CREATED_AT" BIGINT NOT NULL,
  "UPDATED_AT" BIGINT NOT NULL
);


CREATE TABLE "CE_SCANNER_CONTEXT" (
  "TASK_UUID" VARCHAR(40) NOT NULL PRIMARY KEY,
  "CONTEXT_DATA" BLOB NOT NULL,
  "CREATED_AT" BIGINT NOT NULL,
  "UPDATED_AT" BIGINT NOT NULL
);
