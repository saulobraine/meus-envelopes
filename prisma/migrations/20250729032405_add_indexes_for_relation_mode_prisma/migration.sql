-- CreateIndex
CREATE INDEX "Envelope_userId_idx" ON "Envelope"("userId");

-- CreateIndex
CREATE INDEX "ImportSession_userId_idx" ON "ImportSession"("userId");

-- CreateIndex
CREATE INDEX "ImportTransactionPreview_importSessionId_idx" ON "ImportTransactionPreview"("importSessionId");

-- CreateIndex
CREATE INDEX "MonthlyIncome_userId_idx" ON "MonthlyIncome"("userId");

-- CreateIndex
CREATE INDEX "Operation_userId_idx" ON "Operation"("userId");

-- CreateIndex
CREATE INDEX "Operation_envelopeId_idx" ON "Operation"("envelopeId");

-- CreateIndex
CREATE INDEX "SharedAccountAccess_ownerId_idx" ON "SharedAccountAccess"("ownerId");

-- CreateIndex
CREATE INDEX "SharedAccountAccess_memberId_idx" ON "SharedAccountAccess"("memberId");
