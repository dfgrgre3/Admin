#!/bin/bash
PAGES="about anti-cheat api-explorer api-logs archive articles assignments banners campaigns comments contact-messages course-bundles course-tags currency discussions email exam-attempts exam-results failed-payments faq file-manager global-activity grade-center help-center homepage-sections installments invoices languages live-chat moderators pages payment-gateways payment-logs polls profile promotions push-notifications questions recordings referral sms system-metrics timezone transactions translation trash waiting-room wallet"
TABLES=.claude/db_tables.txt
ROUTES=.claude/go_routes.txt
printf "%-20s | %-30s | %-28s | %s\n" "PAGE" "DB TABLE" "GO ROUTE" "NEXT HANDLER"
printf '%.0s-' {1..110}; echo
for p in $PAGES; do
  # normalize: strip dashes, singularize crude
  n=$(echo "$p" | tr -d '-')
  s=$(echo "$n" | sed -E 's/ies$/y/; s/([^s])s$/\1/')
  tbl=$(grep -iE "^($n|$s)s?$" "$TABLES" | head -1)
  [ -z "$tbl" ] && tbl=$(grep -iE "^.*($s).*$" "$TABLES" | head -1)
  rt=$(grep -iE "^/(admin/)?($p|$s)(s)?(/|$)" "$ROUTES" | head -1)
  [ -z "$rt" ] && rt=$(grep -iE "($p|$s)" "$ROUTES" | head -1)
  nh=""; [ -d "src/app/api/admin/$p" ] && nh="YES"
  printf "%-20s | %-30s | %-28s | %s\n" "$p" "${tbl:---}" "${rt:---}" "${nh:---}"
done
