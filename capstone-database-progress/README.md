
## Summary
The only need we have for a database on this project is to store player info. We don't have a need for complex queries, and the structure of our player data is pretty simple. This made a No SQL database make the most sense, and with Firebase's email verification, we believe it to be the best fit.


## Overview of Implementation
The basic structure we have is as follows:
1. Each student/player is tied to a unique email, acting as the primary key
    - This also allows us to utilize Firebase's email verification, meaning we do not have to handle passwords
2. Save Data, this includes:
    - The scene they were last in
    - The players inventory, this is to 
    - Their last position within the scene
    - Their current score
    - Timestamp of their last save
3. Lastly, username, this is what will be displayed on the leaderboard and main menu

Since we are using emails to login, this allows the verification to be passwordless, so we don't to have worry about storage/hashing. This was one of the main reasons why we decided on Firebase.


## Key Design Decisions
While Firebase offers indexing, it wouldn't really be of any use to us. Any pull from the database we do is a simple query. Either grab all the save data based on the matching email, or for the leaderboard grab the top usernames based on score. Because of this, as well as the fact that it adds cost to your firebase plan, we have not implemented any indexing. As for normalization, there is also no need.


## Challenges Faced and Future Improvements
As of now we don't have any plans of further improvements, we should have everything we need set up already. The biggest challenge was getting the email verification to work properly, but that has already been ironed out.