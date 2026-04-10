-- CreateTable
CREATE TABLE "Enterprise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "org_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region_city" TEXT NOT NULL,
    "region_county" TEXT NOT NULL,
    "type_level1" TEXT NOT NULL,
    "type_level2" TEXT NOT NULL,
    "industry_level1" TEXT NOT NULL,
    "industry_level2" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "filing_status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enterprise_id" INTEGER NOT NULL,
    "report_period" TEXT NOT NULL,
    "base_employment" INTEGER NOT NULL,
    "current_employment" INTEGER NOT NULL,
    "reduce_type_code" TEXT,
    "main_reason_code" TEXT,
    "main_reason_desc" TEXT,
    "second_reason_code" TEXT,
    "second_reason_desc" TEXT,
    "third_reason_code" TEXT,
    "third_reason_desc" TEXT,
    "other_reason" TEXT,
    "report_status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submitted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "MonthlyReport_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "Enterprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonthlyReport_reduce_type_code_fkey" FOREIGN KEY ("reduce_type_code") REFERENCES "DictReduceType" ("code") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MonthlyReport_main_reason_code_fkey" FOREIGN KEY ("main_reason_code") REFERENCES "DictReduceReason" ("code") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MonthlyReport_second_reason_code_fkey" FOREIGN KEY ("second_reason_code") REFERENCES "DictReduceReason" ("code") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MonthlyReport_third_reason_code_fkey" FOREIGN KEY ("third_reason_code") REFERENCES "DictReduceReason" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'enterprise',
    "enterprise_id" INTEGER,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ENABLED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "Enterprise" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DictReduceType" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "DictReduceReason" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "parent_code" TEXT,
    "sort_order" INTEGER NOT NULL,
    CONSTRAINT "DictReduceReason_parent_code_fkey" FOREIGN KEY ("parent_code") REFERENCES "DictReduceType" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Enterprise_org_code_key" ON "Enterprise"("org_code");

-- CreateIndex
CREATE INDEX "MonthlyReport_enterprise_id_idx" ON "MonthlyReport"("enterprise_id");

-- CreateIndex
CREATE INDEX "MonthlyReport_report_period_idx" ON "MonthlyReport"("report_period");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_enterprise_id_key" ON "User"("enterprise_id");

-- CreateIndex
CREATE INDEX "DictReduceReason_parent_code_idx" ON "DictReduceReason"("parent_code");
