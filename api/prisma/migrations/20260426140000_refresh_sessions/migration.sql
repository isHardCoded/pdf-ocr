-- CreateTable
CREATE TABLE "refresh_session" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_session_token_hash_key" ON "refresh_session"("token_hash");
CREATE INDEX "refresh_session_user_id_idx" ON "refresh_session"("user_id");

ALTER TABLE "refresh_session" ADD CONSTRAINT "refresh_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
