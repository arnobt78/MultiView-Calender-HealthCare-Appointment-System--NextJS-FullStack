-- Tag invoices when billing doctor belongs to exactly one organization.
UPDATE invoices AS inv
SET organization_id = (
  SELECT om.org_id
  FROM organization_members AS om
  WHERE om.user_id = inv.user_id
  ORDER BY om.joined_at ASC
  LIMIT 1
)
WHERE inv.organization_id IS NULL
  AND (
    SELECT COUNT(*)::int
    FROM organization_members AS om2
    WHERE om2.user_id = inv.user_id
  ) = 1;
