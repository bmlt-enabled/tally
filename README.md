INTRODUCTION
============
This is an extremely simple Web app that aggregates the various known [BMLT Root Servers](https://bmlt.magshare.net/installing-a-new-root-server/), and creates a "live" table that displays some basic statistics about those servers.
BMLTTally is a utility app that quickly polls a list of Root Servers, and displays their information in the form of a table, and a map. This started life as a "quick n' dirty one-off," so it does not cleave to the standards of the rest of the BMLT project.

[It can be seen in action here.](https://bmlt.magshare.net/bmlt-tally)

CHANGELIST
----------
***Version 1.1.6* ** *- January 16, 2018*

- No operational change. Moved the repo to GitHub.
- The BitBucket Repo is now officially deprecated. All new versions will be added to the GitHub repo.

***Version 1.1.5* ** *- January 16, 2018*

- Added NA Denmark.

***Version 1.1.4* ** *- December 13, 2017*

- Added the New England Region.

***Version 1.1.3* ** *- November 12, 2017*

- Changed the UA in the call_curl() function to match the rest of the system.

***Version 1.1.2* ** *- October 29, 2017*

- Added NA Italia.

***Version 1.1.1* ** *- October 16, 2017*

- Some browsers seem to have difficulty parsing the JSON. I hope I simplified it enough for them.
- Better explanation as to why the Server may not indicate that the admin app can be used.

***Version 1.1.0* ** *- October 16, 2017*

- Now allow you to choose sorting.
- Removed the yellow background, as its now redundant.
- Now check to see if Semantic Admin is enabled before marking a server as valid for the admin app.

***Version 1.0.20* ** *- September 23, 2017*

- Georgia is now SSL.

***Version 1.0.19* ** *- September 4, 2017*

- Added Arizona.

***Version 1.0.18* ** *- September 2, 2017*

- Colorado is now SSL.

***Version 1.0.17* ** *- August 22, 2017*

- Ireland is now SSL.

***Version 1.0.16* ** *- August 19, 2017*

- Iowa lost their SSL. It will probably be back.
- Added IDs for the Sandwich server.

***Version 1.0.15* ** *- August 3, 2017*

- NA India is now SSL.

***Version 1.0.14* ** *- July 25, 2017*

- Iowa Region is now SSL.

***Version 1.0.13* ** *- July 21, 2017*

- Volunteer Region is now SSL.

***Version 1.0.12* ** *- July 12, 2017*

- German-Speaking Region switched to SSL.
- Alabama/NW Florida switched to SSL.
- Quebec switched to SSL.
- Sierra-Sage switched to SSL.

***Version 1.0.11* ** *- June 30, 2017*

- Quebec is back.
- Added NA Colorado.

***Version 1.0.10* ** *- May 22, 2017*

- Removed Quebec for now.

***Version 1.0.9* ** *- May 21, 2017*

- NC Region is now SSL.

***Version 1.0.8* ** *- May 20, 2017*

- Added a tally of the various types of servers.

***Version 1.0.7* ** *- May 20, 2017*

- Added Central Indiana.

***Version 1.0.6* ** *- May 20, 2017*

- Quebec en le MAISON.

***Version 1.0.5* ** *- May 20, 2017*

- Michigan is in da HOUSE.

***Version 1.0.4* ** *- May 18, 2017*

- Updated for Sweden and Carolina Regions. They now use the built-in Semantic Workshop.

***Version 1.0.3* ** *- May 15, 2017*

- Australia is now SSL.

***Version 1.0.2* ** *- May 14, 2017*

- Milwaukee is now "Wisconsin Region."

***Version 1.0.1* ** *- May 13, 2017*

- Tweaked the styles a bit.

***Version 1.0.0* ** *- May 11, 2017*

- First tracked version.
