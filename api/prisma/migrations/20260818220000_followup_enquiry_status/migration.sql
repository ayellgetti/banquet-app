ALTER TABLE "follow_ups" ADD COLUMN "enquiry_status" "LeadStatus";

UPDATE "follow_ups"
SET "enquiry_status" = CASE
  WHEN comments ~* '(moved to|closed as) visit scheduled|पाइपलाइन विज़िट निर्धारित|विज़िट निर्धारित के रूप में बंद|पाइपलाइन भेट नियोजित|भेट नियोजित म्हणून बंद' THEN 'FOLLOW_UP'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) quotation sent|पाइपलाइन कोटेशन भेजा|कोटेशन भेजा के रूप में बंद|पाइपलाइन कोटेशन पाठवले|कोटेशन पाठवले म्हणून बंद' THEN 'QUOTATION_SENT'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) booking confirmed|पाइपलाइन बुकिंग पुष्ट|बुकिंग पुष्ट के रूप में बंद|बुकिंग पुष्ट म्हणून बंद' THEN 'CONVERTED'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) not interested|पाइपलाइन रुचि नहीं|रुचि नहीं के रूप में बंद|पाइपलाइन रस नाही|रस नाही म्हणून बंद' THEN 'NOT_INTERESTED'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) negotiation|पाइपलाइन बातचीत|बातचीत के रूप में बंद|पाइपलाइन वाटाघाट|वाटाघाट म्हणून बंद' THEN 'NEGOTIATION'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) qualified|पाइपलाइन योग्य|योग्य के रूप में बंद|पाइपलाइन पात्र|पात्र म्हणून बंद' THEN 'QUALIFIED'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) contacted|पाइपलाइन संपर्क किया|संपर्क किया के रूप में बंद|पाइपलाइन संपर्क केला|संपर्क केला म्हणून बंद' THEN 'CONTACTED'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) fake|पाइपलाइन नकली|नकली के रूप में बंद|पाइपलाइन बनावट|बनावट म्हणून बंद' THEN 'FAKE'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) other|पाइपलाइन अन्य|अन्य के रूप में बंद|पाइपलाइन इतर|इतर म्हणून बंद' THEN 'OTHER'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) lost|पाइपलाइन खोया|खोया के रूप में बंद|पाइपलाइन गमावले|गमावले म्हणून बंद' THEN 'LOST'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) booked|पाइपलाइन बुकिंग पुष्ट' THEN 'CONVERTED'::"LeadStatus"
  WHEN comments ~* '(moved to|closed as) new|पाइपलाइन नया|नया के रूप में बंद|पाइपलाइन नवीन|नवीन म्हणून बंद' THEN 'NEW'::"LeadStatus"
  ELSE NULL
END
WHERE "enquiry_status" IS NULL
  AND comments IS NOT NULL;

UPDATE "follow_ups" AS f
SET "enquiry_status" = e.status
FROM "enquiries" AS e
WHERE f.enquiry_id = e.id
  AND f.enquiry_status IS NULL
  AND f.id = (
    SELECT f2.id
    FROM "follow_ups" AS f2
    WHERE f2.enquiry_id = f.enquiry_id
    ORDER BY f2.created_at DESC, f2.id DESC
    LIMIT 1
  );

DO $$
DECLARE
  r RECORD;
  prev_status "LeadStatus";
  prev_enquiry bigint;
BEGIN
  prev_enquiry := NULL;
  FOR r IN
    SELECT id, enquiry_id, enquiry_status
    FROM "follow_ups"
    ORDER BY enquiry_id, created_at, id
  LOOP
    IF prev_enquiry IS DISTINCT FROM r.enquiry_id THEN
      prev_status := NULL;
      prev_enquiry := r.enquiry_id;
    END IF;

    IF r.enquiry_status IS NULL THEN
      UPDATE "follow_ups"
      SET enquiry_status = COALESCE(prev_status, 'NEW')
      WHERE id = r.id;
      prev_status := COALESCE(prev_status, 'NEW');
    ELSE
      prev_status := r.enquiry_status;
    END IF;
  END LOOP;
END $$;

ALTER TABLE "follow_ups"
  ALTER COLUMN "enquiry_status" SET NOT NULL;
