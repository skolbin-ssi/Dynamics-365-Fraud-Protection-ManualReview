# Microsoft Dynamics 365 Fraud Protection - Manual review

## Main documents
* [FE README](./frontend/README.md)
* [FE Contribution guide](./frontend/CONTRIBUTION.md)
* [BE README](./backend/README.md)
* [BE Contribution guide](./backend/CONTRIBUTION.md)
* [Deployment README](./arm/README.md)

## Solution structure
![FunctionalSegregation](./documentation/pictures/MRStructureDiagrams-SolutionArchitecture.png)  

## Business description

### Terms
**Order/Purchase/Transaction** : 
The main object that describes a particular act of interaction between a Merchant and a User. It's stored in 
Dynamics 365 Fraud Protection (DFP) and sometime retrived by Manual Reviev tool (MR) for synchronization and local storing.

**Item** : 
One element in MR system that represents a particular purchase.

**Decision** : 
A reflection of the Purchase Status entity. Shows the decision about aparticular purchase. Could be generated on merchant side and in MR tool.

**Enrichment** : 
When purchase event is consumed by the MR application, it has no information about the purchase, just a reference to it via purchase ID. The process of filling the item with actual purchase data is called enrichment.

**Queue** : 
A logical container in the storage dynamically filled by items based on some filters.

**Filter** : 
A set of parameters that define a set of items in a queue. A filter is created alongside the queue.

**Escalation queue** : 
A queue that contains items with ESCALATE or HOLD labels. This is just specific view of the related main queue. Items in an escalated queue could be reviewed only by supervisors.

**Residual queue** : 
A queue that consists of orders which are not matching filters of any existing queue.

**Locked queue** : 
A queue that has sorting by one of the order fields. An analyst can review items only from the top of the sorted queue.

**Unlocked queue** : 
A queue where an analyst can pick items in random order for review.

**Label** : 
A mark for an order in the queue that is applied by an analyst or senior analyst as a result of a manual review. 
Labels are divided into two groups: final labels that forms decisions (GOOD, BAD, WATCH_INCONCLUSIVE, WATCH_NA) 
and intermediate labels for internal usage in MR (ESCALATE and HOLD). Final labels form a resolution object.

**Resolution** : 
A particular final decision that was made in the MR tool. Could be retrieved during resolution lifetime.

**Tag** : 
Tag is a short mark for specifying item specific. Tags can be applied by analysts and viewed in item/resolution surfing.

**Note** : 
Note is a comment left by an analyst in the order.


### Permissions
Manual Review has role-based access which means every user should have a particular role to use particular features. There are three main kinds of roles: 
* fraud analyst, 
* senior fraud analyst
* manager/administrator
All roles should be defined for the DFP Service principal in Azure AD. 
Role assignments can be done both by the Azure portal and by the DFP User Access tab (the second way is more preferable).
In addition to main roles, some privileges can be provided to users based on in-tool actions and assignments.

All frontend-intended APIs are protected with the OAuth2.0 Implicit flow grant. 
The frontend is responsible for routing the user on Azure Active Directory login page and for the token extracting. 
Once the token obtained the frontend attach this token to each call to the backend.  
The backend uses stateless token processing with role enrichment (in Azure AD, it uses caching).

Role permissions:

| The Analyst                                                                   | The Senior Analyst                                                            | The Fraud Manager                                                              |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| view queues assigned to him                                                   | view any queue                                                                | view any queue                                                                 |
|                                                                               | create queues                                                                 | create queues                                                                  |
|                                                                               | assign people to any queue                                                    | assign people to any queue                                                     |
|                                                                               |                                                                               | update any queue (change name and deadline) where possible                     |
|                                                                               |                                                                               | delete any queue                                                               |
| view any order on queues visible to him                                       | view any item                                                                 | view any item                                                                  |
| lock items in queues assigned to him in accordance with sorting settings      | lock items in queues assigned to him in accordance with sorting settings      | lock any order in any queue                                                    |
| label, tag, comment, unlock items locked on him                               | label, tag, comment, unlock items locked on him                               | label, tag, comment, unlock items locked on him                                |
| apply bulk decisions on items that are visible for the analyst                | apply bulk decisions on any unlocked item (including already labeled)         | apply bulk decisions on any item                                               |
|                                                                               |                                                                               | search items among the queues                                                  |
|                                                                               |                                                                               | release any lock for any analyst (future feature)                              |
|                                                                               | view demand/supply dashboard                                                  | view demand/supply dashboard                                                   |
| view performance dashboard for themselves (including per-queue activity view) | view performance dashboard for themselves (including per-queue activity view) | view performance dashboard for any analyst (including per-queue activity view) |
|                                                                               |                                                                               | view performance dashboard for any queue (including per-analyst activity view) |
| view historical queue settings for participated queues                        | view historical queue settings for any queues                                 | view historical queue settings for any queues                                  |
|                                                                               | view historical analyst info                                                  | view historical analyst info                                                   |

Assignment-based permissions:

| Queue reviewer       | Queue supervisor                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------- |
| lock items           | lock items                                                                                |
|                      | lock escalated items (in escalated queue)                                                 |
| process locked items | process locked items                                                                      |
|                      | receive notifications about orders being escalated in a supervised queue (future feature) |

## Microsoft Open Source code of conduct

For additional information, see the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct).