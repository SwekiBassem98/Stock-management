-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Variant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    "supplierRef" TEXT,
    "internalRef" TEXT,
    "color" TEXT,
    "thickness" TEXT,
    "avgUnitPrice" DECIMAL NOT NULL DEFAULT 0,
    "minAlert" DECIMAL NOT NULL DEFAULT 0,
    "initialQuantity" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Variant_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Variant" ("avgUnitPrice", "color", "createdAt", "id", "internalRef", "materialId", "minAlert", "supplierRef", "thickness", "updatedAt") SELECT "avgUnitPrice", "color", "createdAt", "id", "internalRef", "materialId", "minAlert", "supplierRef", "thickness", "updatedAt" FROM "Variant";
DROP TABLE "Variant";
ALTER TABLE "new_Variant" RENAME TO "Variant";
CREATE INDEX "Variant_internalRef_idx" ON "Variant"("internalRef");
CREATE INDEX "Variant_supplierRef_idx" ON "Variant"("supplierRef");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
