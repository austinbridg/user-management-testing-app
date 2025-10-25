# Test Case Report

**Generated:** 2025-10-25
**Total Test Cases:** 21

## Executive Summary

| Category | Test Count | Priority Distribution |
|----------|------------|----------------------|
| Organization Administrator Tests | 13 | High: 6, Medium: 6, Low: 1 |
| System Administrator Tests | 3 | High: 3, Medium: 0, Low: 0 |
| Integration Tests | 2 | High: 2, Medium: 0, Low: 0 |
| Performance Tests | 2 | High: 0, Medium: 2, Low: 0 |
| End User Tests | 1 | High: 0, Medium: 1, Low: 0 |

## Organization Administrator Tests

**Test Count:** 13

### TC-01: Single User Invite - Basic Flow

**Story:** As an Organization Administrator, I can invite a single user by email so that they can access the platform and be assigned to appropriate groups

**Priority:** High

**Estimated Time:** 10 minutes

**Prerequisites:** Organization Administrator access, Test email addresses available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Users page
3. Click "Add User" button
4. Enter valid email address: testuser@example.com
5. Optionally select a group from dropdown
6. Click "Submit" button
7. Verify confirmation message shows invite status
8. Check that user appears in pending invites list

**Acceptance Criteria:**
- Modal opens with email input field
- Email validation works correctly
- Confirmation message displays invite status
- User appears in pending invites with correct status
- If group selected, user is assigned to that group upon activation

**Status Guidance:**
- **Pass:** All acceptance criteria are met and single user invite works correctly
- **Fail:** Any acceptance criteria fails or invite process does not work
- **Blocked:** Cannot access Users page or Organization Administrator access unavailable
- **Partial:** Invite works but some acceptance criteria fail (e.g., no confirmation message)
- **Skip:** Test cannot be executed due to environment issues or missing prerequisites


---

### TC-02: Multi-User Invite from Users Page

**Story:** As an Organization Administrator, I can invite multiple users simultaneously using chip-input from the Users page so that I can efficiently onboard multiple team members at once

**Priority:** High

**Estimated Time:** 15 minutes

**Prerequisites:** Organization Administrator access, Multiple test email addresses available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Users page
3. Click "Add User" button
4. Enter multiple emails via chip-input:
5.   - Type user1@example.com and press Enter
6.   - Type user2@example.com and press comma
7.   - Type user3@example.com and press Enter
8. Optionally select groups from dropdown
9. Submit invite
10. Verify result summary shows per-email outcomes

**Acceptance Criteria:**
- Emails convert to chips when Enter or comma pressed
- Each chip supports remove (X) functionality
- Result summary shows counts by outcome type
- All users (new + existing) are members of selected groups

**Status Guidance:**
- **Pass:** Multi-user invite with chip-input works correctly and all acceptance criteria are met
- **Fail:** Chip-input fails or multi-user invite does not work
- **Blocked:** Cannot access Users page or chip-input functionality unavailable
- **Partial:** Some emails work but chip-input behavior is inconsistent
- **Skip:** Multi-user invite functionality not available or test data missing


---

### TC-03: Chip-Input Behavior Validation

**Story:** As an Organization Administrator, I can invite multiple users simultaneously using chip-input from the Users page so that I can efficiently onboard multiple team members at once

**Priority:** Medium

**Estimated Time:** 8 minutes

**Prerequisites:** Organization Administrator access, Multi-user invite functionality available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Users page
3. Click "Add User" button
4. Test chip-input behavior:
5.   - Type email and press Enter → verify chip creation
6.   - Type email and press comma → verify chip creation
7.   - Click X on chip → verify chip removal
8.   - Enter duplicate emails → verify deduplication
9. Submit with valid chips

**Acceptance Criteria:**
- Emails convert to chips on Enter/comma
- Chips can be removed with X button
- Duplicate emails are surfaced and deduplicated
- UI remains responsive with up to 100 emails

**Status Guidance:**
- **Pass:** All chip-input behaviors work correctly and UI remains responsive
- **Fail:** Chip-input behavior fails or UI becomes unresponsive
- **Blocked:** Chip-input functionality not available
- **Partial:** Some chip behaviors work but others fail
- **Skip:** Multi-user invite functionality not implemented


---

### TC-04: Email Validation

**Story:** As an Organization Administrator, I can invite a single user by email so that they can access the platform and be assigned to appropriate groups

**Priority:** Medium

**Estimated Time:** 5 minutes

**Prerequisites:** Organization Administrator access, User invite functionality available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Users page
3. Click "Add User" button
4. Enter invalid email: invalid-email
5. Attempt to submit
6. Enter valid email: valid@example.com
7. Submit successfully

**Acceptance Criteria:**
- Invalid email is flagged and cannot be submitted
- Real-time validation occurs as user types
- Valid email allows successful submission

**Status Guidance:**
- **Pass:** Email validation works correctly for both valid and invalid formats
- **Fail:** Email validation fails or allows invalid emails
- **Blocked:** Email validation functionality not available
- **Partial:** Some validation works but not all cases
- **Skip:** User invite functionality not implemented


---

### TC-06: User Status Management

**Story:** As an Organization Administrator, I can deactivate and reactivate users so that I can manage user access without losing their historical data

**Priority:** Medium

**Estimated Time:** 8 minutes

**Prerequisites:** Organization Administrator access, Active test users available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Users page
3. Find active user
4. Deactivate user
5. Verify user loses access
6. Reactivate user
7. Verify access is restored with previous group memberships

**Acceptance Criteria:**
- User loses access when deactivated
- Historical data is preserved
- Access is restored when reactivated
- Previous group memberships remain intact

**Status Guidance:**
- **Pass:** User status management works correctly and data is preserved
- **Fail:** Status changes fail or data is lost during deactivation/reactivation
- **Blocked:** User status management functionality not available
- **Partial:** Basic status changes work but data preservation issues
- **Skip:** User management functionality not implemented


---

### TC-07: Effective Access Preview

**Story:** As an Organization Administrator, I can preview any user's effective capabilities and scope so that I can understand their current access before making changes

**Priority:** Medium

**Estimated Time:** 6 minutes

**Prerequisites:** Organization Administrator access, Users with group memberships available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Users page
3. Find user with group memberships
4. Click "View Effective Access" action
5. Verify preview loads within 2 seconds
6. Check that preview shows groups → roles → capabilities + resolved scope

**Acceptance Criteria:**
- Preview loads within 2 seconds (p95)
- Shows read-only view of effective access
- Displays groups, roles, capabilities, and resolved scope
- Preview is comprehensive and accurate

**Status Guidance:**
- **Pass:** Effective access preview works correctly and loads within SLA
- **Fail:** Preview fails to load or shows incorrect information
- **Blocked:** Effective access preview functionality not available
- **Partial:** Preview loads but information is incomplete or inaccurate
- **Skip:** Access preview functionality not implemented


---

### TC-10: Custom Role Creation

**Story:** As an Organization Administrator, I can create custom roles by selecting capabilities from platform and application areas so that I can tailor access to my organization's specific needs

**Priority:** High

**Estimated Time:** 12 minutes

**Prerequisites:** Organization Administrator access, Custom role creation functionality available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Roles page
3. Click "Create Custom Role"
4. Enter role name and description
5. Select capabilities from platform areas
6. Select capabilities from application areas
7. Save role
8. Verify role is created and can be assigned to groups

**Acceptance Criteria:**
- Role is created successfully
- Role reflects organization's specific job functions
- Role can be assigned to groups
- Role appears in roles catalog

**Status Guidance:**
- **Pass:** Custom role creation works correctly and role can be used
- **Fail:** Custom role creation fails or role cannot be assigned
- **Blocked:** Custom role creation functionality not available
- **Partial:** Role created but cannot be assigned or has issues
- **Skip:** Custom role functionality not implemented


---

### TC-11: Permission Assignment

**Story:** As an Organization Administrator, I can assign application-defined permissions to roles so that I can control what actions each role can perform

**Priority:** Medium

**Estimated Time:** 10 minutes

**Prerequisites:** Organization Administrator access, Custom roles available, Application permissions defined

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Roles page
3. Create or edit custom role
4. Assign application-defined permissions to role
5. Save role
6. Verify permissions define what actions role can perform
7. Test that permissions are not editable by users

**Acceptance Criteria:**
- Permissions are assigned successfully
- Permissions define role actions correctly
- Permissions are managed by application teams
- Users cannot edit permissions

**Status Guidance:**
- **Pass:** Permission assignment works correctly and permissions are properly managed
- **Fail:** Permission assignment fails or permissions can be edited by users
- **Blocked:** Permission assignment functionality not available
- **Partial:** Basic assignment works but permission management issues
- **Skip:** Permission management functionality not implemented


---

### TC-12: Group Creation

**Story:** As an Organization Administrator, I can create and edit groups with names, descriptions, assigned roles, hierarchy scopes, and members so that I can organize users with appropriate access

**Priority:** High

**Estimated Time:** 15 minutes

**Prerequisites:** Organization Administrator access, Groups page accessible, Roles available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Groups page
3. Click "Create Group"
4. Enter group name and description
5. Assign roles to group
6. Define hierarchy scopes
7. Add members to group
8. Save group
9. Verify group is created and can be used for access control

**Acceptance Criteria:**
- Group is created successfully
- All fields are saved correctly
- Group can be used for access control
- Group appears in groups list

**Status Guidance:**
- **Pass:** Group creation works correctly and all fields are saved properly
- **Fail:** Group creation fails or fields are not saved correctly
- **Blocked:** Group creation functionality not available
- **Partial:** Group created but some fields missing or incorrect
- **Skip:** Group management functionality not implemented


---

### TC-13: Group Member Management

**Story:** As an Organization Administrator, I can add and remove users from groups so that I can maintain proper group membership

**Priority:** High

**Estimated Time:** 12 minutes

**Prerequisites:** Organization Administrator access, Existing groups available, Test users available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Groups page
3. Edit existing group
4. Add users to group using searchable table
5. Remove users from group
6. Save changes
7. Verify membership changes are applied
8. Test duplicate membership prevention

**Acceptance Criteria:**
- Users can be added to groups
- Users can be removed from groups
- Duplicate memberships are prevented
- Searchable table supports efficient management
- Changes are applied immediately

**Status Guidance:**
- **Pass:** Group member management works correctly and efficiently
- **Fail:** Member management fails or duplicate memberships allowed
- **Blocked:** Group member management functionality not available
- **Partial:** Basic member management works but efficiency issues
- **Skip:** Group member management functionality not implemented


---

### TC-14: Hierarchy Access Parameters

**Story:** As an Organization Administrator, I can define hierarchy access using Hierarchy Name, Path, and Permission parameters so that I can control where users can perform actions

**Priority:** High

**Estimated Time:** 15 minutes

**Prerequisites:** Organization Administrator access, Groups page accessible, Hierarchy data available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Groups page
3. Create or edit group
4. Define hierarchy access:
5.   - Set Hierarchy Name (specific or wildcard *)
6.   - Set Path (specific path or wildcard *)
7.   - Set Permission (grant/deny)
8. Save group
9. Verify access is granted/denied to entire subgraph
10. Test wildcard constraints

**Acceptance Criteria:**
- Access is granted/denied to entire subgraph starting at final node
- Wildcard * applies to entire hierarchy
- If hierarchy name is *, path must also be *
- Access patterns are consistent

**Status Guidance:**
- **Pass:** Hierarchy access parameters work correctly and constraints are enforced
- **Fail:** Hierarchy access fails or constraints not enforced
- **Blocked:** Hierarchy access functionality not available
- **Partial:** Basic hierarchy access works but constraint issues
- **Skip:** Hierarchy access functionality not implemented


---

### TC-15: Hierarchy Scope Picker

**Story:** As an Organization Administrator, I can use a scope picker to browse, search, and multi-select hierarchy nodes with "include descendants" toggle so that I can efficiently define access scopes

**Priority:** Medium

**Estimated Time:** 12 minutes

**Prerequisites:** Organization Administrator access, Scope picker functionality available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Groups page
3. Create or edit group
4. Use scope picker to define hierarchy access:
5.   - Browse hierarchy nodes
6.   - Search for specific nodes
7.   - Multi-select nodes
8.   - Toggle "include descendants"
9. Verify picker responds within 300ms
10. Save group

**Acceptance Criteria:**
- Scope picker allows browsing hierarchy
- Search functionality works correctly
- Multi-select is supported
- "Include descendants" toggle works
- Picker responds within 300ms

**Status Guidance:**
- **Pass:** Scope picker works correctly and meets performance requirements
- **Fail:** Scope picker fails or performance requirements not met
- **Blocked:** Scope picker functionality not available
- **Partial:** Basic picker works but performance or functionality issues
- **Skip:** Scope picker functionality not implemented


---

### TC-21: Orphan User Management

**Story:** As an Organization Administrator, I can handle orphan users (users with zero groups) by providing clear guidance and request-access CTAs so that users are not left without direction

**Priority:** Low

**Estimated Time:** 6 minutes

**Prerequisites:** Organization Administrator access, Users with zero groups available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Users page
3. Find users with zero groups
4. Verify clear guidance is provided
5. Check that request-access CTAs are available
6. Verify users are not left without direction

**Acceptance Criteria:**
- Clear guidance is provided for orphan users
- Request-access CTAs are available
- Users are not left without direction
- Management interface is helpful

**Status Guidance:**
- **Pass:** Orphan user management provides clear guidance and helpful CTAs
- **Fail:** Orphan user management fails or provides unclear guidance
- **Blocked:** Cannot access users with zero groups
- **Partial:** Basic guidance provided but CTAs missing or unclear
- **Skip:** Orphan user management functionality not implemented


---

## System Administrator Tests

**Test Count:** 3

### TC-05: User Organization Association

**Story:** As a System Administrator, I can associate users with one or more organizations via Sustainability Graph APIs so that users can work across different organizational contexts

**Priority:** High

**Estimated Time:** 12 minutes

**Prerequisites:** System Administrator access, Sustainability Graph APIs available, Test organizations available

**Test Steps:**
1. Login as System Administrator
2. Use Sustainability Graph APIs to associate user with organizations
3. Verify user can work on behalf of one organization at a time
4. Test organization context switching
5. Verify users are associated by default to "_All Users_" node

**Acceptance Criteria:**
- User can be associated with multiple organizations
- Vertex token contains correct organization context
- Organization switching works within 500ms
- Users are associated to "_All Users_" node by default

**Status Guidance:**
- **Pass:** User organization association works correctly across all acceptance criteria
- **Fail:** Organization association fails or context switching does not work
- **Blocked:** Sustainability Graph APIs unavailable or System Administrator access denied
- **Partial:** Basic association works but context switching fails
- **Skip:** Organization management functionality not implemented


---

### TC-08: Default Role Visibility

**Story:** As a System Administrator, I can see and manage the four default roles (System Administrator, Organization Administrator, Organization Manager, Organization Member) so that I can ensure proper access control across the platform

**Priority:** High

**Estimated Time:** 8 minutes

**Prerequisites:** System Administrator access, Roles page accessible

**Test Steps:**
1. Login as System Administrator
2. Navigate to Roles page
3. Verify four default roles are visible:
4.   - System Administrator
5.   - Organization Administrator
6.   - Organization Manager
7.   - Organization Member
8. Check that roles have clear descriptions
9. Verify default roles cannot be edited

**Acceptance Criteria:**
- All four default roles are visible
- Clear descriptions of capabilities are shown
- Default roles cannot be edited
- Permission matrix is displayed correctly

**Status Guidance:**
- **Pass:** All default roles are visible and properly configured
- **Fail:** Default roles missing or incorrectly configured
- **Blocked:** Cannot access Roles page or System Administrator access denied
- **Partial:** Some default roles visible but others missing or misconfigured
- **Skip:** Role management functionality not implemented


---

### TC-09: Default Permission Matrix Validation

**Story:** As a System Administrator, I can see and manage the four default roles (System Administrator, Organization Administrator, Organization Manager, Organization Member) so that I can ensure proper access control across the platform

**Priority:** High

**Estimated Time:** 15 minutes

**Prerequisites:** System Administrator access, Permission matrix visible

**Test Steps:**
1. Login as System Administrator
2. Navigate to Roles page
3. Review permission matrix for each default role
4. Verify Entity Management permissions:
5.   - System Administrator: All permissions ✓
6.   - Organization Administrator: All permissions ✓
7.   - Organization Manager: Edit ✓, Create ✗, View ✓, Delete ✗
8.   - Organization Member: View ✓, others ✗
9. Verify Hierarchy Management permissions
10. Verify Organization Management permissions
11. Verify Role Management permissions
12. Verify User Group Management permissions
13. Verify User Management permissions

**Acceptance Criteria:**
- Permission matrix matches PRD specifications exactly
- Each role has correct permissions for each management area
- Visual indicators (✓/✗) are accurate
- Permission descriptions are clear

**Status Guidance:**
- **Pass:** Permission matrix is accurate and matches PRD specifications
- **Fail:** Permission matrix incorrect or does not match PRD
- **Blocked:** Permission matrix not visible or accessible
- **Partial:** Some permissions correct but others incorrect
- **Skip:** Permission matrix functionality not implemented


---

## Integration Tests

**Test Count:** 2

### TC-16: EIM Authentication

**Story:** As a User, I can authenticate via Schneider Electric EIM so that I can securely access the platform using my corporate credentials

**Priority:** High

**Estimated Time:** 8 minutes

**Prerequisites:** EIM integration configured, Valid EIM credentials available

**Test Steps:**
1. Navigate to platform login page
2. Click "Login with EIM" or similar
3. Enter Schneider Electric EIM credentials
4. Complete EIM authentication flow
5. Verify successful login to platform
6. Test authentication integration

**Acceptance Criteria:**
- EIM authentication works seamlessly
- User can access platform with corporate credentials
- Authentication integrates properly with platform
- Login process is smooth

**Status Guidance:**
- **Pass:** EIM authentication works seamlessly and integrates properly
- **Fail:** EIM authentication fails or integration issues
- **Blocked:** EIM integration not configured or credentials unavailable
- **Partial:** Basic authentication works but integration issues
- **Skip:** EIM integration not implemented


---

### TC-17: Vertex Token Generation

**Story:** As a User, I can receive a Vertex token with my organization context and permissions so that I can access platform resources with appropriate authorization

**Priority:** High

**Estimated Time:** 6 minutes

**Prerequisites:** Authenticated user, Vertex token service available

**Test Steps:**
1. Login as authenticated user
2. Access platform resources
3. Verify Vertex token is generated
4. Check token contains organization context
5. Verify token contains user permissions
6. Test token is used for authorization decisions

**Acceptance Criteria:**
- Vertex token is generated automatically
- Token contains organization context
- Token contains user permissions
- Token is used for all authorization decisions

**Status Guidance:**
- **Pass:** Vertex token generation works correctly and contains all required information
- **Fail:** Token generation fails or missing required information
- **Blocked:** Vertex token service unavailable
- **Partial:** Token generated but missing some information
- **Skip:** Vertex token functionality not implemented


---

## Performance Tests

**Test Count:** 2

### TC-18: Fast Access Preview Performance

**Story:** As an Organization Administrator, I can preview effective access within 2 seconds so that I can make quick decisions about access changes

**Priority:** Medium

**Estimated Time:** 8 minutes

**Prerequisites:** Organization Administrator access, Users with complex group memberships available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Users page
3. Find user with complex group memberships
4. Click "View Effective Access"
5. Measure time to load preview
6. Verify preview loads within 2 seconds (p95)
7. Check that preview shows comprehensive access information

**Acceptance Criteria:**
- Preview loads within 2 seconds (p95)
- Comprehensive access information is shown
- Performance is consistent across different user types

**Status Guidance:**
- **Pass:** Access preview loads within SLA and shows comprehensive information
- **Fail:** Preview fails to load within SLA or shows incomplete information
- **Blocked:** Access preview functionality not available
- **Partial:** Preview loads but performance or information issues
- **Skip:** Access preview functionality not implemented


---

### TC-19: Quick Search Performance

**Story:** As an Organization Administrator, I can search in pickers within 300ms so that I can quickly find users, groups, and hierarchy nodes

**Priority:** Medium

**Estimated Time:** 10 minutes

**Prerequisites:** Organization Administrator access, Search functionality available

**Test Steps:**
1. Login as Organization Administrator
2. Navigate to Groups page
3. Test search in various pickers:
4.   - User search
5.   - Group search
6.   - Hierarchy node search
7. Measure search response time
8. Verify searches return results within 300ms (p95)

**Acceptance Criteria:**
- Search results returned within 300ms (p95)
- Search works for users, groups, and hierarchy nodes
- Performance is consistent across different search types

**Status Guidance:**
- **Pass:** Search performance meets SLA across all picker types
- **Fail:** Search performance fails SLA or functionality issues
- **Blocked:** Search functionality not available
- **Partial:** Some searches meet SLA but others do not
- **Skip:** Search functionality not implemented


---

## End User Tests

**Test Count:** 1

### TC-20: No Access State

**Story:** As a User with no group memberships, I can see a clear "No Access" state with guidance on how to request access so that I understand my current status

**Priority:** Medium

**Estimated Time:** 5 minutes

**Prerequisites:** User with no group memberships available

**Test Steps:**
1. Login as user with no group memberships
2. Navigate to platform
3. Verify "No Access" state is displayed
4. Check that guidance on requesting access is provided
5. Verify state provides clear next steps

**Acceptance Criteria:**
- "No Access" state is clearly displayed
- Guidance on requesting access is provided
- Clear next steps are shown
- User understands current status

**Status Guidance:**
- **Pass:** No Access state is clear and provides helpful guidance
- **Fail:** No Access state not displayed or guidance unclear
- **Blocked:** Cannot create user with no group memberships
- **Partial:** No Access state shown but guidance incomplete
- **Skip:** No Access state functionality not implemented


---

## Report Notes

This report was generated from the test case database and can be used to:
- Compare against ADRs (Architecture Decision Records)
- Identify gaps in test coverage
- Remove irrelevant test cases
- Plan test case updates based on product requirements

**Next Steps:**
1. Review each category against your ADRs
2. Identify missing test cases for new requirements
3. Flag outdated or irrelevant test cases for removal
4. Update test cases to match current product specifications
