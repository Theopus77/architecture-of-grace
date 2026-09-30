# The Unseen Realm (the Bible's unseen world, from the primary documents) — Daily Drafts banks.
# Every item comes from the course's own reviewed lessons (see hist_banks.py): each scholar's idea
# stays named as theirs, with other readings beside it. This file only adds the Spanish strand names and a third wrong
# choice for each K–2 question.
from hist_banks import make

ES = {
 # K–2
 "Real but Unseen": "Real pero invisible",
 "God's Family in Heaven": "La familia de Dios en el cielo",
 "Two Families Meet": "Dos familias se encuentran",
 "Trouble on the Earth": "Problemas en la tierra",
 "The Rainbow Promise": "La promesa del arcoíris",
 "Many Nations": "Muchas naciones",
 "Living with Many Languages": "Vivir con muchos idiomas",
 "The Bush That Kept Burning": "La zarza que seguía ardiendo",
 "Jesus Helps and Is Strong": "Jesús ayuda y es fuerte",
 "Everyone Invited Home": "Todos invitados a casa",
 # 3–5
 "Who Was Michael Heiser?": "¿Quién fue Michael Heiser?",
 "A Court in Heaven": "Una corte en el cielo",
 "Three Rebellions": "Tres rebeliones",
 "Four Short Verses": "Cuatro versículos cortos",
 "The Flood and Noah": "El diluvio y Noé",
 "Moses' Song and the Old Copies": "El canto de Moisés y las copias antiguas",
 "A Blessing for All Families": "Una bendición para todas las familias",
 "Angels With Names": "Ángeles con nombre",
 "A Messenger Who Speaks as God": "Un mensajero que habla como Dios",
 "Other Ways of Reading": "Otras maneras de leer",
 # 6–8
 "Enoch in Genesis": "Enoc en el Génesis",
 "Why Heiser Read Enoch": "Por qué Heiser leía Enoc",
 "Heiser and the Sages of Babylon": "Heiser y los sabios de Babilonia",
 "Goliath of Gath": "Goliat de Gat",
 "Mountains and Their Powers": "Los montes y sus poderes",
 "The Scrolls from the Caves": "Los rollos de las cuevas",
 "Rulers Over Nations": "Gobernantes sobre las naciones",
 "A Word for Adversary": "Una palabra para adversario",
 "Three Groups of Dark Powers": "Tres grupos de poderes oscuros",
 "Azazel and the Day of Atonement": "Azazel y el Día de la Expiación",
 # 9–12
 "The Book and Its Mountain": "El libro y su monte",
 "Pentecost in Jerusalem": "Pentecostés en Jerusalén",
 "The Spirits in Prison": "Los espíritus encarcelados",
 "Words for Heavenly Beings": "Palabras para los seres celestiales",
 "Worship Belongs to God": "La adoración es para Dios",
 "Sages, Watchers and a Hebrew Word": "Sabios, Vigilantes y una palabra hebrea",
 "Weighing an Argument": "Sopesar un argumento",
 "Heiser's Mount of Assembly": "El monte de la asamblea según Heiser",
 "Ancient Astronauts and Other Claims": "Astronautas antiguos y otras afirmaciones",
 "Writing and Presenting": "Escribir y presentar",
 # Adult (more 11–12)
 "Reading in Context": "Leer en contexto",
 "Comparing With Care": "Comparar con cuidado",
 "Where Scholars Debate": "Donde debaten los estudiosos",
 "The Goal of the Story": "La meta de la historia",
 "Judging and Ruling": "Juzgar y gobernar",
 "The Place Called Armageddon": "El lugar llamado Armagedón",
 "Ways to Read Revelation": "Maneras de leer el Apocalipsis",
 "How His Ideas Spread": "Cómo se difundieron sus ideas",
 "Choosing a Question": "Elegir una pregunta",
 "Weighing Readings Fairly": "Sopesar las lecturas con justicia",
}

EXTRA = {
 # Real but Unseen
 "Why do we know the wind is there?": "We can taste it",
 "What does unseen mean?": "Very bright",
 "How can you tell love is there?": "It makes a loud sound",
 "What does the Bible call God's home?": "A tower",
 "Where can you read the prayer Jesus taught?": "Exodus, chapter 3",
 "What do you learn in this course?": "How to build a boat",
 # God's Family in Heaven
 "What did Michael Heiser read?": "Only comic books",
 "What did Heiser call the heavenly ones?": "Birds in the garden",
 "What do some other readers call angels?": "God's boat",
 "What does a messenger do?": "Sleeps all day",
 "Who heard the angel's news in Luke 2?": "Noah",
 "What did the angel say first?": "Run away",
 # Two Families Meet
 "What job did God give the man in Genesis 2?": "To count the stars",
 "What does it mean to care for a garden?": "To pull up every plant",
 "What did the man give to the animals?": "Shoes",
 "How did Heiser see Eden?": "As a desert",
 "Who was God's earthly family in Heiser's picture?": "Trees",
 "What do other readers see in Eden?": "A tall tower",
 # Trouble on the Earth
 "What did Heiser think the sons of God were?": "Fish in the sea",
 "Which book of the Bible tells this story?": "Revelation",
 "What do some other readers think?": "The sons of God were trees",
 "What does the word violence mean?": "Sharing your lunch",
 "How did God feel when he saw the hurting, the story says?": "Hungry",
 "What did Heiser think made things on earth worse?": "Too many trees",
 # The Rainbow Promise
 "How long did the rain fall in the story?": "One hundred years",
 "What did the dove bring back?": "A feather hat",
 "Why was the olive leaf good news?": "It meant night was coming",
 "What did God promise in Genesis 9, the story says?": "To make it rain every day",
 "What was the sign of the promise?": "A cloud of smoke",
 "What is a covenant?": "A kind of tree",
 # Many Nations
 "What were the names of Noah's three sons?": "Moses, Aaron and Miriam",
 "What is a nation?": "A kind of boat",
 "About how many languages are in the world today?": "About two",
 "What did Heiser think Deuteronomy 32 meant?": "God planted a garden",
 "Where was one very old copy of this song found?": "Under a rainbow",
 "What do many Bibles say in this verse instead of sons of God?": "Sons of Babel",
 # Living with Many Languages
 "What does it mean to take turns?": "Everyone waits and nobody plays",
 "At Babel, what did the people want for themselves?": "A garden",
 "What helps a group work together?": "Hiding the blocks",
 "What can you do if someone speaks a language you do not know?": "Pretend they are not there",
 "Which promise reached out to every nation?": "The plan to plant a garden",
 "Which is a language many families speak in Chicago?": "Ugaritic",
 # The Bush That Kept Burning
 "What was Moses doing when he saw the bush?": "Building a tower",
 "What was strange about the bush?": "It sang songs",
 "Who came to Moses in the flame, the story says?": "Noah",
 "What did God tell Moses to take off?": "His belt",
 "What does holy mean?": "Loud and fast",
 "Who had God heard crying, the story says?": "The birds in the bush",
 "What did Heiser think the Angel of the LORD was?": "A bird in the tree",
 "Who was Michael Heiser?": "A sailor on Noah's ark",
 # Jesus Helps and Is Strong
 "How much food did Jesus' friends find in Mark 6?": "A basket of grapes",
 "What did Jesus say about the children in Mark 10?": "Be quiet and go away",
 "What are the Gospels?": "Maps of Egypt",
 "Where were Jesus and his friends when the wind came?": "In a cave",
 "What did Jesus say to the sea?": "Grow bigger",
 "What did Heiser think Jesus came to do?": "Plant a new garden in Egypt",
 # Everyone Invited Home
 "Which book has the huge crowd from every nation?": "Numbers",
 "What did the people in the crowd hold?": "Umbrellas",
 "How big was the crowd?": "Two friends",
 "What is one way to welcome a new friend?": "Turn your back",
 "What does welcome mean?": "To forget someone",
 "How do many Christians read these stories?": "As a story about a flood",
}

BANDS = make('unr', ES, EXTRA)
