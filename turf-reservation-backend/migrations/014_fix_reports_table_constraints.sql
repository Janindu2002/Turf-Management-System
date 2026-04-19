-- Fix reports table foreign key to point to users instead of non-existent admins table
DO $$ 
BEGIN 
    -- 1. Drop the old constraint if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_admin_id_fkey') THEN
        ALTER TABLE reports DROP CONSTRAINT reports_admin_id_fkey;
    END IF;

    -- 2. Add the correct constraint pointing to the users table
    ALTER TABLE reports ADD CONSTRAINT reports_admin_id_fkey 
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL;
END $$;
