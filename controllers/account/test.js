const passwordHash = require("password-hash");
const moment = require('moment');

const config = require('../../config/config');
const time = require('../utils/time');

const User = require('../../database/models/user.js');
const UserRepo = require('../../database/repositories/user.js');

const TagRepo = require('../../database/repositories/tag.js');
const LocationRepo = require('../../database/repositories/location.js');

const Files = require('../utils/files.js');
const FileRepo = require('../../database/repositories/File.js');



const firstNamesM = [
    'Aaron', 'Abel', 'Abraham', 'Adam', 'Adrian', 'Al', 'Alan', 'Albert', 'Alberto', 'Alejandro', 'Alex', 'Alexander', 'Alfonso', 'Alfred', 'Alfredo', 'Allan', 'Allen', 'Alonzo', 'Alton', 'Alvin', 'Amos', 'Andre', 'Andres', 'Andrew', 'Andy', 'Angel', 'Angelo', 'Anthony', 'Antonio', 'Archie', 'Armando', 'Arnold', 'Arthur', 'Arturo', 'Aubrey', 'Austin', 'Barry', 'Ben', 'Benjamin', 'Bennie', 'Benny', 'Bernard', 'Bert', 'Bill', 'Billy', 'Blake', 'Bob', 'Bobby', 'Boyd', 'Brad', 'Bradford', 'Bradley', 'Brandon', 'Brendan', 'Brent', 'Brett', 'Brian', 'Bruce', 'Bryan', 'Bryant', 'Byron', 'Caleb', 'Calvin', 'Cameron', 'Carl', 'Carlos', 'Carlton', 'Carroll', 'Cary', 'Casey', 'Cecil', 'Cedric', 'Cesar', 'Chad', 'Charles', 'Charlie', 'Chester', 'Chris', 'Christian', 'Christopher', 'Clarence', 'Clark', 'Claude', 'Clay', 'Clayton', 'Clifford', 'Clifton', 'Clint', 'Clinton', 'Clyde', 'Cody', 'Colin', 'Conrad', 'Corey', 'Cornelius', 'Cory', 'Courtney', 'Craig', 'Curtis', 'Dale', 'Dallas',
    'Damon', 'Dan', 'Dana', 'Daniel', 'Danny', 'Darin', 'Darnell', 'Darrel', 'Darrell', 'Darren', 'Darrin', 'Darryl', 'Daryl', 'Dave', 'David', 'Dean', 'Delbert', 'Dennis', 'Derek', 'Derrick', 'Devin', 'Dewey', 'Dexter', 'Domingo', 'Dominic', 'Dominick', 'Don', 'Donald', 'Donnie', 'Doug', 'Douglas', 'Doyle', 'Drew', 'Duane', 'Dustin', 'Dwayne', 'Dwight', 'Earl', 'Earnest', 'Ed', 'Eddie', 'Edgar', 'Edmond', 'Edmund', 'Eduardo', 'Edward', 'Edwin', 'Elbert', 'Elias', 'Elijah', 'Ellis', 'Elmer', 'Emanuel', 'Emilio', 'Emmett', 'Enrique', 'Eric', 'Erick', 'Erik', 'Ernest', 'Ernesto', 'Ervin', 'Eugene', 'Evan', 'Everett', 'Felipe', 'Felix', 'Fernando', 'Floyd', 'Forrest', 'Francis', 'Francisco', 'Frank', 'Frankie', 'Franklin', 'Fred', 'Freddie', 'Frederick', 'Fredrick', 'Gabriel', 'Garrett', 'Garry', 'Gary', 'Gene', 'Geoffrey', 'George', 'Gerald', 'Gerard', 'Gerardo', 'Gilbert', 'Gilberto', 'Glen', 'Glenn', 'Gordon', 'Grady', 'Grant', 'Greg', 'Gregg', 'Gregory', 'Guadalupe',
    'Guillermo', 'Gustavo', 'Guy', 'Harold', 'Harry', 'Harvey', 'Hector', 'Henry', 'Herbert', 'Herman', 'Homer', 'Horace', 'Howard', 'Hubert', 'Hugh', 'Hugo', 'Ian', 'Ignacio', 'Ira', 'Irvin', 'Irving', 'Isaac', 'Ismael', 'Israel', 'Ivan', 'Jack', 'Jackie', 'Jacob', 'Jaime', 'Jake', 'James', 'Jamie', 'Jan', 'Jared', 'Jason', 'Javier', 'Jay', 'Jean', 'Jeff', 'Jeffery', 'Jeffrey', 'Jerald', 'Jeremiah', 'Jeremy', 'Jermaine', 'Jerome', 'Jerry', 'Jesse', 'Jessie', 'Jesus', 'Jim', 'Jimmie', 'Jimmy', 'Jody', 'Joe', 'Joel', 'Joey', 'John', 'Johnathan', 'Johnnie', 'Johnny', 'Jon', 'Jonathan', 'Jonathon', 'Jordan', 'Jorge', 'Jose', 'Joseph', 'Josh', 'Joshua', 'Juan', 'Julian', 'Julio', 'Julius', 'Justin', 'Karl', 'Keith', 'Kelly', 'Kelvin', 'Ken', 'Kenneth', 'Kenny', 'Kent', 'Kerry', 'Kevin', 'Kim', 'Kirk', 'Kristopher', 'Kurt', 'Kyle', 'Lamar', 'Lance', 'Larry', 'Laurence', 'Lawrence', 'Lee', 'Leland', 'Leo', 'Leon', 'Leonard',
    'Leroy', 'Leslie', 'Lester', 'Levi', 'Lewis', 'Lionel', 'Lloyd', 'Lonnie', 'Loren', 'Lorenzo', 'Louis', 'Lowell', 'Lucas', 'Luis', 'Luke', 'Luther', 'Lyle', 'Lynn', 'Mack', 'Malcolm', 'Manuel', 'Marc', 'Marco', 'Marcos', 'Marcus', 'Mario', 'Marion', 'Mark', 'Marlon', 'Marshall', 'Martin', 'Marty', 'Marvin', 'Mathew', 'Matt', 'Matthew', 'Maurice', 'Max', 'Melvin', 'Merle', 'Michael', 'Micheal', 'Miguel', 'Mike', 'Milton', 'Mitchell', 'Morris', 'Moses', 'Myron', 'Nathan', 'Nathaniel', 'Neal', 'Neil', 'Nelson', 'Nicholas', 'Nick', 'Nicolas', 'Noah', 'Noel', 'Norman', 'Oliver', 'Omar', 'Orlando', 'Orville', 'Oscar', 'Otis', 'Owen', 'Pablo', 'Pat', 'Patrick', 'Paul', 'Pedro', 'Percy', 'Perry', 'Pete', 'Peter', 'Phil', 'Philip', 'Phillip', 'Preston', 'Rafael', 'Ralph', 'Ramiro', 'Ramon', 'Randal', 'Randall', 'Randolph', 'Randy', 'Raul', 'Ray', 'Raymond', 'Reginald', 'Rene', 'Rex', 'Ricardo', 'Richard', 'Rick', 'Rickey', 'Ricky', 'Robert',
    'Roberto', 'Robin', 'Roderick', 'Rodney', 'Rodolfo', 'Rogelio', 'Roger', 'Roland', 'Rolando', 'Roman', 'Ron', 'Ronald', 'Ronnie', 'Roosevelt', 'Ross', 'Roy', 'Ruben', 'Rudolph', 'Rudy', 'Rufus', 'Russell', 'Ryan', 'Salvador', 'Salvatore', 'Sam', 'Sammy', 'Samuel', 'Santiago', 'Santos', 'Saul', 'Scott', 'Sean', 'Sergio', 'Seth', 'Shane', 'Shannon', 'Shaun', 'Shawn', 'Sheldon', 'Sherman', 'Sidney', 'Simon', 'Spencer', 'Stanley', 'Stephen', 'Steve', 'Steven', 'Stewart', 'Stuart', 'Sylvester', 'Taylor', 'Ted', 'Terence', 'Terrance', 'Terrell', 'Terrence', 'Terry', 'Theodore', 'Thomas', 'Tim', 'Timmy', 'Timothy', 'Toby', 'Todd', 'Tom', 'Tomas', 'Tommie', 'Tommy', 'Tony', 'Tracy', 'Travis', 'Trevor', 'Troy', 'Tyler', 'Tyrone', 'Van', 'Vernon', 'Victor', 'Vincent', 'Virgil', 'Wade', 'Wallace', 'Walter', 'Warren', 'Wayne', 'Wendell', 'Wesley', 'Wilbert', 'Wilbur', 'Wilfred', 'Willard', 'William', 'Willie', 'Willis', 'Wilson', 'Winston', 'Wm', 'Woodrow', 'Zachary'
];

const firstNamesF = [
    'Ada', 'Adrienne', 'Agnes', 'Alberta', 'Alexandra', 'Alexis', 'Alice', 'Alicia', 'Alison', 'Allison', 'Alma', 'Alyssa', 'Amanda', 'Amber', 'Amelia', 'Amy', 'Ana', 'Andrea', 'Angel', 'Angela', 'Angelica', 'Angelina', 'Angie', 'Anita', 'Ann', 'Anna', 'Anne', 'Annette', 'Annie', 'Antoinette', 'Antonia', 'April', 'Arlene', 'Ashley', 'Audrey', 'Barbara', 'Beatrice', 'Becky', 'Belinda', 'Bernadette', 'Bernice', 'Bertha', 'Bessie', 'Beth', 'Bethany', 'Betsy', 'Betty', 'Beulah', 'Beverly', 'Billie', 'Blanca', 'Blanche', 'Bobbie', 'Bonnie', 'Brandi', 'Brandy', 'Brenda', 'Bridget', 'Brittany', 'Brooke', 'Camille', 'Candace', 'Candice', 'Carla', 'Carmen', 'Carol', 'Carole', 'Caroline', 'Carolyn', 'Carrie', 'Casey', 'Cassandra', 'Catherine', 'Cathy', 'Cecelia', 'Cecilia', 'Celia', 'Charlene', 'Charlotte', 'Chelsea', 'Cheryl', 'Christie', 'Christina', 'Christine', 'Christy', 'Cindy', 'Claire', 'Clara', 'Claudia', 'Colleen', 'Connie', 'Constance', 'Cora', 'Courtney', 'Cristina', 'Crystal', 'Cynthia', 'Daisy', 'Dana', 'Danielle', 'Darla',
    'Darlene', 'Dawn', 'Deanna', 'Debbie', 'Deborah', 'Debra', 'Delia', 'Della', 'Delores', 'Denise', 'Desiree', 'Diana', 'Diane', 'Dianna', 'Dianne', 'Dixie', 'Dolores', 'Donna', 'Dora', 'Doreen', 'Doris', 'Dorothy', 'Ebony', 'Edith', 'Edna', 'Eileen', 'Elaine', 'Eleanor', 'Elena', 'Elisa', 'Elizabeth', 'Ella', 'Ellen', 'Eloise', 'Elsa', 'Elsie', 'Elvira', 'Emily', 'Emma', 'Erica', 'Erika', 'Erin', 'Erma', 'Ernestine', 'Essie', 'Estelle', 'Esther', 'Ethel', 'Eula', 'Eunice', 'Eva', 'Evelyn', 'Faith', 'Fannie', 'Faye', 'Felicia', 'Flora', 'Florence', 'Frances', 'Francis', 'Freda', 'Gail', 'Gayle', 'Geneva', 'Genevieve', 'Georgia', 'Geraldine', 'Gertrude', 'Gina', 'Ginger', 'Gladys', 'Glenda', 'Gloria', 'Grace', 'Gretchen', 'Guadalupe', 'Gwen', 'Gwendolyn', 'Hannah', 'Harriet', 'Hattie', 'Hazel', 'Heather', 'Heidi', 'Helen', 'Henrietta', 'Hilda', 'Holly', 'Hope', 'Ida', 'Inez', 'Irene', 'Iris', 'Irma', 'Isabel', 'Jackie', 'Jacqueline', 'Jacquelyn', 'Jaime', 'Jamie',
    'Jan', 'Jana', 'Jane', 'Janet', 'Janice', 'Janie', 'Janis', 'Jasmine', 'Jean', 'Jeanette', 'Jeanne', 'Jeannette', 'Jeannie', 'Jenna', 'Jennie', 'Jennifer', 'Jenny', 'Jessica', 'Jessie', 'Jill', 'Jo', 'Joan', 'Joann', 'Joanna', 'Joanne', 'Jodi', 'Jody', 'Johanna', 'Johnnie', 'Josefina', 'Josephine', 'Joy', 'Joyce', 'Juana', 'Juanita', 'Judith', 'Judy', 'Julia', 'Julie', 'June', 'Kara', 'Karen', 'Kari', 'Karla', 'Kate', 'Katherine', 'Kathleen', 'Kathryn', 'Kathy', 'Katie', 'Katrina', 'Kay', 'Kayla', 'Kelley', 'Kelli', 'Kellie', 'Kelly', 'Kendra', 'Kerry', 'Kim', 'Kimberly', 'Krista', 'Kristen', 'Kristi', 'Kristie', 'Kristin', 'Kristina', 'Kristine', 'Kristy', 'Krystal', 'Lana', 'Latoya', 'Laura', 'Lauren', 'Laurie', 'Laverne', 'Leah', 'Lee', 'Leigh', 'Lela', 'Lena', 'Leona', 'Leslie', 'Leticia', 'Lila', 'Lillian', 'Lillie', 'Linda', 'Lindsay', 'Lindsey', 'Lisa', 'Lois', 'Lola', 'Lora', 'Lorena', 'Lorene', 'Loretta', 'Lori', 'Lorraine', 'Louise',
    'Lucia', 'Lucille', 'Lucy', 'Lula', 'Luz', 'Lydia', 'Lynda', 'Lynette', 'Lynn', 'Lynne', 'Mabel', 'Mable', 'Madeline', 'Mae', 'Maggie', 'Mamie', 'Mandy', 'Marcella', 'Marcia', 'Margaret', 'Margarita', 'Margie', 'Marguerite', 'Maria', 'Marian', 'Marianne', 'Marie', 'Marilyn', 'Marion', 'Marjorie', 'Marlene', 'Marsha', 'Marta', 'Martha', 'Mary', 'Maryann', 'Mattie', 'Maureen', 'Maxine', 'May', 'Megan', 'Meghan', 'Melanie', 'Melba', 'Melinda', 'Melissa', 'Melody', 'Mercedes', 'Meredith', 'Michele', 'Michelle', 'Mildred', 'Mindy', 'Minnie', 'Miranda', 'Miriam', 'Misty', 'Molly', 'Mona', 'Monica', 'Monique', 'Muriel', 'Myra', 'Myrtle', 'Nadine', 'Nancy', 'Naomi', 'Natalie', 'Natasha', 'Nellie', 'Nettie', 'Nichole', 'Nicole', 'Nina', 'Nora', 'Norma', 'Olga', 'Olive', 'Olivia', 'Ollie', 'Opal', 'Ora', 'Pam', 'Pamela', 'Pat', 'Patricia', 'Patsy', 'Patti', 'Patty', 'Paula', 'Paulette', 'Pauline', 'Pearl', 'Peggy', 'Penny', 'Phyllis', 'Priscilla', 'Rachael', 'Rachel', 'Ramona',
    'Raquel', 'Rebecca', 'Regina', 'Renee', 'Rhonda', 'Rita', 'Roberta', 'Robin', 'Robyn', 'Rochelle', 'Rosa', 'Rosalie', 'Rose', 'Rosemarie', 'Rosemary', 'Rosie', 'Roxanne', 'Ruby', 'Ruth', 'Sabrina', 'Sadie', 'Sally', 'Samantha', 'Sandra', 'Sandy', 'Sara', 'Sarah', 'Shannon', 'Shari', 'Sharon', 'Shawna', 'Sheila', 'Shelia', 'Shelley', 'Shelly', 'Sheri', 'Sherri', 'Sherry', 'Sheryl', 'Shirley', 'Silvia', 'Sonia', 'Sonja', 'Sonya', 'Sophia', 'Sophie', 'Stacey', 'Stacy', 'Stella', 'Stephanie', 'Sue', 'Susan', 'Susie', 'Suzanne', 'Sylvia', 'Tabitha', 'Tamara', 'Tami', 'Tammy', 'Tanya', 'Tara', 'Tasha', 'Teresa', 'Teri', 'Terri', 'Terry', 'Thelma', 'Theresa', 'Tiffany', 'Tina', 'Toni', 'Tonya', 'Tracey', 'Traci', 'Tracy', 'Tricia', 'Valerie', 'Vanessa', 'Velma', 'Vera', 'Verna', 'Veronica', 'Vicki', 'Vickie', 'Vicky', 'Victoria', 'Viola', 'Violet', 'Virginia', 'Vivian', 'Wanda', 'Wendy', 'Whitney', 'Willie', 'Wilma', 'Winifred', 'Yolanda', 'Yvette', 'Yvonne'
];

const lastNames = [
    'Abbott', 'Acevedo', 'Acosta', 'Adams', 'Adkins', 'Aguilar', 'Aguirre', 'Albert', 'Alexander', 'Alford', 'Allen', 'Allison', 'Alston', 'Alvarado', 'Alvarez', 'Anderson', 'Andrews', 'Anthony', 'Armstrong', 'Arnold', 'Ashley', 'Atkins', 'Atkinson', 'Austin', 'Avery', 'Avila', 'Ayala', 'Ayers', 'Bailey', 'Baird', 'Baker', 'Baldwin', 'Ball', 'Ballard', 'Banks', 'Barber', 'Barker', 'Barlow', 'Barnes', 'Barnett', 'Barr', 'Barrera', 'Barrett', 'Barron', 'Barry', 'Bartlett', 'Barton', 'Bass', 'Bates', 'Battle', 'Bauer', 'Baxter', 'Beach', 'Bean', 'Beard', 'Beasley', 'Beck', 'Becker', 'Bell', 'Bender', 'Benjamin', 'Bennett', 'Benson', 'Bentley', 'Benton', 'Berg', 'Berger', 'Bernard', 'Berry', 'Best', 'Bird', 'Bishop', 'Black', 'Blackburn', 'Blackwell', 'Blair', 'Blake', 'Blanchard', 'Blankenship', 'Blevins', 'Bolton', 'Bond', 'Bonner', 'Booker', 'Boone', 'Booth', 'Bowen', 'Bowers', 'Bowman', 'Boyd', 'Boyer', 'Boyle', 'Bradford', 'Bradley', 'Bradshaw', 'Brady', 'Branch', 'Bray', 'Brennan', 'Brewer', 'Bridges',
    'Briggs', 'Bright', 'Britt', 'Brock', 'Brooks', 'Brown', 'Browning', 'Bruce', 'Bryan', 'Bryant', 'Buchanan', 'Buck', 'Buckley', 'Buckner', 'Bullock', 'Burch', 'Burgess', 'Burke', 'Burks', 'Burnett', 'Burns', 'Burris', 'Burt', 'Burton', 'Bush', 'Butler', 'Byers', 'Byrd', 'Cabrera', 'Cain', 'Calderon', 'Caldwell', 'Calhoun', 'Callahan', 'Camacho', 'Cameron', 'Campbell', 'Campos', 'Cannon', 'Cantrell', 'Cantu', 'Cardenas', 'Carey', 'Carlson', 'Carney', 'Carpenter', 'Carr', 'Carrillo', 'Carroll', 'Carson', 'Carter', 'Carver', 'Case', 'Casey', 'Cash', 'Castaneda', 'Castillo', 'Castro', 'Cervantes', 'Chambers', 'Chan', 'Chandler', 'Chaney', 'Chang', 'Chapman', 'Charles', 'Chase', 'Chavez', 'Chen', 'Cherry', 'Christensen', 'Christian', 'Church', 'Clark', 'Clarke', 'Clay', 'Clayton', 'Clements', 'Clemons', 'Cleveland', 'Cline', 'Cobb', 'Cochran', 'Coffey', 'Cohen', 'Cole', 'Coleman', 'Collier', 'Collins', 'Colon', 'Combs', 'Compton', 'Conley', 'Conner', 'Conrad', 'Contreras', 'Conway', 'Cook', 'Cooke', 'Cooley',
    'Cooper', 'Copeland', 'Cortez', 'Cote', 'Cotton', 'Cox', 'Craft', 'Craig', 'Crane', 'Crawford', 'Crosby', 'Cross', 'Cruz', 'Cummings', 'Cunningham', 'Curry', 'Curtis', 'Dale', 'Dalton', 'Daniel', 'Daniels', 'Daugherty', 'Davenport', 'David', 'Davidson', 'Davis', 'Dawson', 'Day', 'Dean', 'Decker', 'Dejesus', 'Delacruz', 'Delaney', 'Deleon', 'Delgado', 'Dennis', 'Diaz', 'Dickerson', 'Dickson', 'Dillard', 'Dillon', 'Dixon', 'Dodson', 'Dominguez', 'Donaldson', 'Donovan', 'Dorsey', 'Dotson', 'Douglas', 'Downs', 'Doyle', 'Drake', 'Dudley', 'Duffy', 'Duke', 'Duncan', 'Dunlap', 'Dunn', 'Duran', 'Durham', 'Dyer', 'Eaton', 'Edwards', 'Elliott', 'Ellis', 'Ellison', 'Emerson', 'England', 'English', 'Erickson', 'Espinoza', 'Estes', 'Estrada', 'Evans', 'Everett', 'Ewing', 'Farley', 'Farmer', 'Farrell', 'Faulkner', 'Ferguson', 'Fernandez', 'Ferrell', 'Fields', 'Figueroa', 'Finch', 'Finley', 'Fischer', 'Fisher', 'Fitzgerald', 'Fitzpatrick', 'Fleming', 'Fletcher', 'Flores', 'Flowers', 'Floyd', 'Flynn', 'Foley', 'Forbes', 'Ford',
    'Foreman', 'Foster', 'Fowler', 'Fox', 'Francis', 'Franco', 'Frank', 'Franklin', 'Franks', 'Frazier', 'Frederick', 'Freeman', 'French', 'Frost', 'Fry', 'Frye', 'Fuentes', 'Fuller', 'Fulton', 'Gaines', 'Gallagher', 'Gallegos', 'Galloway', 'Gamble', 'Garcia', 'Gardner', 'Garner', 'Garrett', 'Garrison', 'Garza', 'Gates', 'Gay', 'Gentry', 'George', 'Gibbs', 'Gibson', 'Gilbert', 'Giles', 'Gill', 'Gillespie', 'Gilliam', 'Gilmore', 'Glass', 'Glenn', 'Glover', 'Goff', 'Golden', 'Gomez', 'Gonzales', 'Gonzalez', 'Good', 'Goodman', 'Goodwin', 'Gordon', 'Gould', 'Graham', 'Grant', 'Graves', 'Gray', 'Green', 'Greene', 'Greer', 'Gregory', 'Griffin', 'Griffith', 'Grimes', 'Gross', 'Guerra', 'Guerrero', 'Guthrie', 'Gutierrez', 'Guy', 'Guzman', 'Hahn', 'Hale', 'Haley', 'Hall', 'Hamilton', 'Hammond', 'Hampton', 'Hancock', 'Haney', 'Hansen', 'Hanson', 'Hardin', 'Harding', 'Hardy', 'Harmon', 'Harper', 'Harrell', 'Harrington', 'Harris', 'Harrison', 'Hart', 'Hartman', 'Harvey', 'Hatfield', 'Hawkins', 'Hayden', 'Hayes',
    'Haynes', 'Hays', 'Head', 'Heath', 'Hebert', 'Henderson', 'Hendricks', 'Hendrix', 'Henry', 'Hensley', 'Henson', 'Herman', 'Hernandez', 'Herrera', 'Herring', 'Hess', 'Hester', 'Hewitt', 'Hickman', 'Hicks', 'Higgins', 'Hill', 'Hines', 'Hinton', 'Hobbs', 'Hodge', 'Hodges', 'Hoffman', 'Hogan', 'Holcomb', 'Holden', 'Holder', 'Holland', 'Holloway', 'Holman', 'Holmes', 'Holt', 'Hood', 'Hooper', 'Hoover', 'Hopkins', 'Hopper', 'Horn', 'Horne', 'Horton', 'House', 'Houston', 'Howard', 'Howe', 'Howell', 'Hubbard', 'Huber', 'Hudson', 'Huff', 'Huffman', 'Hughes', 'Hull', 'Humphrey', 'Hunt', 'Hunter', 'Hurley', 'Hurst', 'Hutchinson', 'Hyde', 'Ingram', 'Irwin', 'Jackson', 'Jacobs', 'Jacobson', 'James', 'Jarvis', 'Jefferson', 'Jenkins', 'Jennings', 'Jensen', 'Jimenez', 'Johns', 'Johnson', 'Johnston', 'Jones', 'Jordan', 'Joseph', 'Joyce', 'Joyner', 'Juarez', 'Justice', 'Kane', 'Kaufman', 'Keith', 'Keller', 'Kelley', 'Kelly', 'Kemp', 'Kennedy', 'Kent', 'Kerr', 'Key', 'Kidd', 'Kim', 'King',
    'Kinney', 'Kirby', 'Kirk', 'Kirkland', 'Klein', 'Kline', 'Knapp', 'Knight', 'Knowles', 'Knox', 'Koch', 'Kramer', 'Lamb', 'Lambert', 'Lancaster', 'Landry', 'Lane', 'Lang', 'Langley', 'Lara', 'Larsen', 'Larson', 'Lawrence', 'Lawson', 'Le', 'Leach', 'Leblanc', 'Lee', 'Leon', 'Leonard', 'Lester', 'Levine', 'Levy', 'Lewis', 'Lindsay', 'Lindsey', 'Little', 'Livingston', 'Lloyd', 'Logan', 'Long', 'Lopez', 'Lott', 'Love', 'Lowe', 'Lowery', 'Lucas', 'Luna', 'Lynch', 'Lynn', 'Lyons', 'Macdonald', 'Macias', 'Mack', 'Madden', 'Maddox', 'Maldonado', 'Malone', 'Mann', 'Manning', 'Marks', 'Marquez', 'Marsh', 'Marshall', 'Martin', 'Martinez', 'Mason', 'Massey', 'Mathews', 'Mathis', 'Matthews', 'Maxwell', 'May', 'Mayer', 'Maynard', 'Mayo', 'Mays', 'Mcbride', 'Mccall', 'Mccarthy', 'Mccarty', 'Mcclain', 'Mcclure', 'Mcconnell', 'Mccormick', 'Mccoy', 'Mccray', 'Mccullough', 'Mcdaniel', 'Mcdonald', 'Mcdowell', 'Mcfadden', 'Mcfarland', 'Mcgee', 'Mcgowan', 'Mcguire', 'Mcintosh', 'Mcintyre', 'Mckay', 'Mckee',
    'Mckenzie', 'Mckinney', 'Mcknight', 'Mclaughlin', 'Mclean', 'Mcleod', 'Mcmahon', 'Mcmillan', 'Mcneil', 'Mcpherson', 'Meadows', 'Medina', 'Mejia', 'Melendez', 'Melton', 'Mendez', 'Mendoza', 'Mercado', 'Mercer', 'Merrill', 'Merritt', 'Meyer', 'Meyers', 'Michael', 'Middleton', 'Miles', 'Miller', 'Mills', 'Miranda', 'Mitchell', 'Molina', 'Monroe', 'Montgomery', 'Montoya', 'Moody', 'Moon', 'Mooney', 'Moore', 'Morales', 'Moran', 'Moreno', 'Morgan', 'Morin', 'Morris', 'Morrison', 'Morrow', 'Morse', 'Morton', 'Moses', 'Mosley', 'Moss', 'Mueller', 'Mullen', 'Mullins', 'Munoz', 'Murphy', 'Murray', 'Myers', 'Nash', 'Navarro', 'Neal', 'Nelson', 'Newman', 'Newton', 'Nguyen', 'Nichols', 'Nicholson', 'Nielsen', 'Nieves', 'Nixon', 'Noble', 'Noel', 'Nolan', 'Norman', 'Norris', 'Norton', 'Nunez', 'Obrien', 'Ochoa', 'Oconnor', 'Odom', 'Odonnell', 'Oliver', 'Olsen', 'Olson', 'Oneal', 'Oneil', 'Oneill', 'Orr', 'Ortega', 'Ortiz', 'Osborn', 'Osborne', 'Owen', 'Owens', 'Pace', 'Pacheco', 'Padilla', 'Page', 'Palmer',
    'Park', 'Parker', 'Parks', 'Parrish', 'Parsons', 'Pate', 'Patel', 'Patrick', 'Patterson', 'Patton', 'Paul', 'Payne', 'Pearson', 'Peck', 'Pena', 'Pennington', 'Perez', 'Perkins', 'Perry', 'Peters', 'Petersen', 'Peterson', 'Petty', 'Phelps', 'Phillips', 'Pickett', 'Pierce', 'Pittman', 'Pitts', 'Pollard', 'Poole', 'Pope', 'Porter', 'Potter', 'Potts', 'Powell', 'Powers', 'Pratt', 'Preston', 'Price', 'Prince', 'Pruitt', 'Puckett', 'Pugh', 'Quinn', 'Ramirez', 'Ramos', 'Ramsey', 'Randall', 'Randolph', 'Rasmussen', 'Ratliff', 'Ray', 'Raymond', 'Reed', 'Reese', 'Reeves', 'Reid', 'Reilly', 'Reyes', 'Reynolds', 'Rhodes', 'Rice', 'Rich', 'Richard', 'Richards', 'Richardson', 'Richmond', 'Riddle', 'Riggs', 'Riley', 'Rios', 'Rivas', 'Rivera', 'Rivers', 'Roach', 'Robbins', 'Roberson', 'Roberts', 'Robertson', 'Robinson', 'Robles', 'Rocha', 'Rodgers', 'Rodriguez', 'Rodriquez', 'Rogers', 'Rojas', 'Rollins', 'Roman', 'Romero', 'Rosa', 'Rosales', 'Rosario', 'Rose', 'Ross', 'Roth', 'Rowe', 'Rowland', 'Roy',
    'Ruiz', 'Rush', 'Russell', 'Russo', 'Rutledge', 'Ryan', 'Salas', 'Salazar', 'Salinas', 'Sampson', 'Sanchez', 'Sanders', 'Sandoval', 'Sanford', 'Santana', 'Santiago', 'Santos', 'Sargent', 'Saunders', 'Savage', 'Sawyer', 'Schmidt', 'Schneider', 'Schroeder', 'Schultz', 'Schwartz', 'Scott', 'Sears', 'Sellers', 'Serrano', 'Sexton', 'Shaffer', 'Shannon', 'Sharp', 'Sharpe', 'Shaw', 'Shelton', 'Shepard', 'Shepherd', 'Sheppard', 'Sherman', 'Shields', 'Short', 'Silva', 'Simmons', 'Simon', 'Simpson', 'Sims', 'Singleton', 'Skinner', 'Slater', 'Sloan', 'Small', 'Smith', 'Snider', 'Snow', 'Snyder', 'Solis', 'Solomon', 'Sosa', 'Soto', 'Sparks', 'Spears', 'Spence', 'Spencer', 'Stafford', 'Stanley', 'Stanton', 'Stark', 'Steele', 'Stein', 'Stephens', 'Stephenson', 'Stevens', 'Stevenson', 'Stewart', 'Stokes', 'Stone', 'Stout', 'Strickland', 'Strong', 'Stuart', 'Suarez', 'Sullivan', 'Summers', 'Sutton', 'Swanson', 'Sweeney', 'Sweet', 'Sykes', 'Talley', 'Tanner', 'Tate', 'Taylor', 'Terrell', 'Terry', 'Thomas', 'Thompson', 'Thornton', 'Tillman',
    'Todd', 'Torres', 'Townsend', 'Tran', 'Travis', 'Trevino', 'Trujillo', 'Tucker', 'Turner', 'Tyler', 'Tyson', 'Underwood', 'Valdez', 'Valencia', 'Valentine', 'Valenzuela', 'Vance', 'Vang', 'Vargas', 'Vasquez', 'Vaughan', 'Vaughn', 'Vazquez', 'Vega', 'Velasquez', 'Velazquez', 'Velez', 'Villarreal', 'Vincent', 'Vinson', 'Wade', 'Wagner', 'Walker', 'Wall', 'Wallace', 'Waller', 'Walls', 'Walsh', 'Walter', 'Walters', 'Walton', 'Ward', 'Ware', 'Warner', 'Warren', 'Washington', 'Waters', 'Watkins', 'Watson', 'Watts', 'Weaver', 'Webb', 'Weber', 'Webster', 'Weeks', 'Weiss', 'Welch', 'Wells', 'West', 'Wheeler', 'Whitaker', 'White', 'Whitehead', 'Whitfield', 'Whitley', 'Whitney', 'Wiggins', 'Wilcox', 'Wilder', 'Wiley', 'Wilkerson', 'Wilkins', 'Wilkinson', 'William', 'Williams', 'Williamson', 'Willis', 'Wilson', 'Winters', 'Wise', 'Witt', 'Wolf', 'Wolfe', 'Wong', 'Wood', 'Woodard', 'Woods', 'Woodward', 'Wooten', 'Workman', 'Wright', 'Wyatt', 'Wynn', 'Yang', 'Yates', 'York', 'Young', 'Zamora', 'Zimmerman'
];

const tags = [
    'girls', 'baby', 'party', 'cool', 'lol', 'gym', 'design', 'funny', 'healthy',
    'flowers', 'lifestyle', 'hot', 'wedding', 'fit', 'handmade', 'work', 'workout',
    'love', 'fashion', 'beautiful', 'happy', 'food', 'me', 'selfie', 'summer', 'art',
    'friends', 'nature', 'girl', 'fun', 'style', 'cute', 'smile', 'family', 'travel',
    'fitness', 'life', 'beauty', 'amazing', 'photography', 'music', 'beach', 'night',
    'drawing', 'inspiration', 'home', 'holiday', 'christmas', 'nyc', 'london', 'sea',
    'sunset', 'dog', 'makeup', 'hair', 'pretty', 'swag', 'cat', 'model', 'motivation',
];

const bios = [
    'All you need to lure me into your car is wine and pizza.',
    'Funny, handsome, and stupid.',
    'Your mom loves me.',
    'Cats love me.',
    'Dogs love me.',
    'Looking at my phone searching for a reason to stop looking at my phone.',
    'You can’t play hard and work hard. If you say that, you’re not doing either hard enough. (I don’t work very hard.)',
    'Last vacation was to see the basement of the Alamo. Wasn’t what I thought it was going to be but I had a big adventure.',
    'I’m just a human, standing in front of a bunch of people on an app, and asking them to love me.',
    'The last person who swiped left on me aged so quickly he shriveled up into an old man skeleton thing before he turned into dust and died a swift yet horrifying death. He chose poorly.',
    'I’m pretty great but don’t listen to me.',
    '9th grade history teacher by day. Semi-pretentious craft beer aficionado by night.',
    'Product designer by day, cyberpunk and avant garde enthusiast by night.',
    'Management/marketing consultant by day, amature mixologist and professional cat cuddler by night.',
    'Software engineer by day, even bigger nerd by night.',
    'Love anime, board games, and obscure music nobody else seems to listen to.',
    'Dinners with friends that end in late nights talking and laughing over a table strewn with the dirty dishes none of us are getting up to wash.',
    'Making fun of people who do crossfit, net-back hats, first runs, the first sip of beer after a long day, and coming home to my dog every night.',
    '“This one’s got real potential.” – My 90+ next door neighbor',
    '“Excellent incisors. And he flosses.” – Dr. Dan, my dentist',
    '“Better than a hallelujah” – Amy Grant',
    '“Hard working, conscientious student.” – my 10th grade English teacher',
    '“I’d highly recommend her for any position.” – my first boss',
    '“I laughed until I cried.” – my ex (sorry)',
    'tacos < burritos',
    'Friday nights out > Thursday nights out',
    'National league > American league',
    'Radiolab > Serial',
    'I’m just sayin’',
    'breakfast for dinner < pizza for breakfast',
    'the movie > the book (so sue me)',
    'sunrise < sunset',
    'coffee > life',
    'Sunday fundays > lazy Sundays',
    'Electric guitar < acoustic guitar (but I play both)',
    'Guilty pleasures: neighborhood drama, fancy cupcakes, and binge watching Dr House.',
    'I hate flowers. You’ll never have to buy me flowers. Potatoes chips however ...',
    'I love roller coasters but the pirate ship ride completely terrifies me.',
    "About Me: Likes fishing, gives great speeches at weddings, and plays a mean harmonica. \nAbout You: Eats adventurously, likes road trips, can talk about books for hours.",
    "About Me: Likes poop jokes, can stay out late on a school night, and isn’t afraid to talk politics on a first date. \nAbout You: Tolerate my poop jokes, doesn’t take yourself too seriously, and like a healthy debate."
];

const genders = ['male', 'female', 'nb'];

const coords = {
    lat     : 48.85340440403773,
    lng     : 2.3487839388235443,

    maxLat  : 0.15,
    maxLng  : 0.35,
};

const required = [
    'firstname', 'lastname', 'username', 'email', 'password', 
    'gender', 'birthday', 'language'
];

const pictures_path = {
    male    : 'man_',
    female  : 'woman_'
};


function random() {
    return Math.round((Math.random())*100);
}

exports.getLastNames = function(){
    return lastNames;
}

exports.getFirstNames = function(){
    return [firstNamesM, firstNamesF];
}

exports.getPicturePath = function(j, r){
    let picture = 'fake_data/profiles/profile_' + pictures_path[genders[j]];

    let nbr = r % (genders[j] === 'female'? 130 : 50);
    picture += nbr + '.jpeg';

    return picture;
}

exports.generateUser = function(firstname, lastname, j){

    let r = random();
    let username = (firstname + '.' + lastname).toLowerCase();

    let age = config.params.MIN_AGED_USERS + 2 + r % 20;

    let gender = (r%3>0)? genders[j] : genders[2];

    let user = {
        firstname   : firstname,
        lastname    : lastname,
        username    : username,
        email       : 'tillderoquefeuil+' + username + '@gmail.com',
        password    : 'Matcha42!',
        language    : 'en',
        gender      : gender,
        bio         : bios[r % (bios.length + 5)],
        online      : time.toDatetime(moment().subtract(r, 'hours')),
        birthday    : time.toDatetime(moment().subtract(age, 'years')),
        picture_url : exports.getPicturePath(j, r)
    };

    return user;
}

exports.manageOrientation = function(user){
    let r = random();
    let orientations = [1];

    orientations.push(random() % 2);
    orientations.push(random() % 2);

    user.see_f = orientations[r % 3]? true : false;
    user.see_m = orientations[(r+1) % 3]? true : false;
    user.see_nb = orientations[(r+2) % 3]? true : false;

    return user;
}

exports.getRandomTags = function(user){
    let tagIndex;
    let r = random();
    user.tags = [];

    for (let j=1; j<5; j++){
        tagIndex = ((j * r) % tags.length);
        if (tags[tagIndex]){
            user.tags.push(tags[tagIndex]);
        }
    }

    return user;
}

exports.getRandomCoords = function(user){
    let r = [
        random(), random(), random()
    ];

    let lat = ((r[0] + r[1] + 1) / (r[2]+1));
    let lng = ((r[2] + r[1] + 1) / (r[0]+1));

    while (lat > coords.maxLat){
        lat = lat / 10;
    }

    while (lng > coords.maxLng){
        lng = lng / 10;
    }

    let pos = {
        lat : (r[2] % 2)? -1 : 1,
        lng : (r[0] % 2)? -1 : 1
    }

    user.coords = {
        lat : (coords.lat + (pos.lat * lat)),
        lng : (coords.lng + (pos.lng * lng))
    };

    return user;
}

exports.createTestAccount = function(data) {

    return new Promise((resolve, reject) => {

        for (var i in required) {
            if (!data[required[i]]) {
                return reject("data missging : " + required[i]);
            }
        }
        
        var user = {
            firstname   : data.firstname,
            lastname    : data.lastname,
            username    : data.username,
            email       : data.email,
            language    : data.language,
            gender      : data.gender,
            birthday    : data.birthday,
            see_f       : data.see_f,
            see_m       : data.see_m,
            see_nb      : data.see_nb,
            bio         : data.bio,
            online      : data.online,
            password    : passwordHash.generate(data.password),
            valide      : true,
            providers   : ['local', 'test']
        }

        UserRepo.createOne(user)
        .then(_user => {
            TagRepo.updateUserTags(_user, data.tags)
            .then(_u => {
                LocationRepo.createOne(data.coords)
                .then(result => {
                    LocationRepo.userLink(result, _user)
                    .then(location => {
                        _user.location = location;

                        if (data.picture_url){
                            Files.saveFromUrl(_user, data.picture_url, 'img/jpeg')
                            .then(file => {
                                FileRepo.createOne(file.light())
                                .then(_file => {
                                    UserRepo.updateProfilePicture(_file, _user)
                                    .then(u => {
                                        return resolve(_user);
                                    });
                                });
                            });
                        } else {
                            return resolve(_user);
                        }

                    });
                });
            });
        }).catch(error => {
            return reject(error);
        });

    });
};