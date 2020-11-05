# Release History

## 1.17.2 (2020-10-30)
### New Features
- Personal performance dashboard is added so the users can see their own performance.
- Analyst view dashboard: decision pie chart is redesigned.
- Risk score distribution bar chart is added on Queue view dashboard.
- Risk score distribution pie chart is added on Demand/Supply by queue dashboard.
- Warning message is added on Demand/Supply by queue dashboard when there are no items near to SLA or near to Timeout.

### Other Changes
- Fixed a bug when in some cases items are not passed via EventHub from DFP to ManualReview tool.
- Fixed a bug when queue name is not populated on dashboards for deleted queues. In case of exceptions the queue ID will be populated.

### Known issues
- CountryRegion field of the items: for all the transactions those came to MR before the current release billing and shipping addresses may contain inaccuracy.
- Dashboards: period of 2 weeks actually contains 15 days, 4 weeks - 29 days, 6 weeks - 43 days (each period includes current day).
- Queue list with item details: while switching between the tab with regular queues and the tab with escalated queues Analyst is required to select the queue each time because the selection is reset to None.
- Queue list: Analyst needs to reload the page to get new escalated queues in the corresponding tab.
- Download reports: for some dashboards download file names are the same.
- Download reports: some percent values are missing in the reports hence they are present on corresponding dashboards.
