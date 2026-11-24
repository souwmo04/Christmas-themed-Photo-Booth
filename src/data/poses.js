// Every pose set used by the booth.
// `title` is shown in script above the camera, `instruction` below it.
// `footer` is the default caption on the strip.
// To add a set or change a pose, edit text here only.
//
// Carol sets only use traditional carols that are in the public domain.
// Don't add lyrics from modern, copyrighted songs.

export const CATEGORIES = [
  { id: 'poses', name: 'Fun poses' },
  { id: 'carols', name: 'Carol lyrics' },
  { id: 'love', name: 'Love songs' },
];

export const POSE_SETS = [
  // ---------------------------------------------------------------- Fun poses
  {
    id: 'story',
    category: 'poses',
    name: 'Christmas Story',
    description: '8 shots · two strips',
    footer: 'merry & bright',
    poses: [
      { title: 'ready, set, jingle', instruction: 'Big smile, look straight at the camera' },
      { title: "who's on the nice list?", instruction: 'Point at yourself with both thumbs' },
      { title: 'oops, naughty list', instruction: 'Cover your mouth like you got caught' },
      { title: 'cold outside', instruction: 'Hug yourself and pretend to shiver' },
      { title: 'under the mistletoe', instruction: 'Blow a kiss, or make a heart with your hands' },
      { title: 'unwrapping the gift', instruction: 'Open your mouth wide in fake surprise' },
      { title: 'one more cookie', instruction: 'Pretend to sneak a bite of something' },
      { title: 'merry & bright', instruction: 'Peace sign, head tilt, best smile' },
    ],
  },
  {
    id: 'classic',
    category: 'poses',
    name: 'Classic Strip',
    description: '4 shots · one strip',
    footer: 'hello, winter',
    poses: [
      { title: 'hello, winter', instruction: 'Wave at the camera' },
      { title: 'snow day', instruction: 'Look up like snow is falling on you' },
      { title: 'cozy mode', instruction: 'Rest your chin on your hands, soft smile' },
      { title: 'see you next year', instruction: 'Wink and point at the camera' },
    ],
  },
  {
    id: 'besties',
    category: 'poses',
    name: 'Besties',
    description: '4 shots · for 2 or more',
    footer: 'the squad',
    poses: [
      { title: 'the squad', instruction: 'Squeeze together, everyone smile' },
      { title: 'secret santa', instruction: "One person whispers in the other's ear" },
      { title: 'gift exchange', instruction: 'Pretend to hand each other a present' },
      { title: 'chaos mode', instruction: 'Everyone pulls their silliest face' },
    ],
  },
  {
    id: 'couple',
    category: 'poses',
    name: 'Mistletoe Date',
    description: '4 shots · for couples',
    footer: 'you & me',
    poses: [
      { title: 'you & me', instruction: 'Lean your heads together and smile' },
      { title: 'look up!', instruction: 'Both point up at the imaginary mistletoe' },
      { title: 'the kiss', instruction: 'Kiss on the cheek (or a cheeky near-miss)' },
      { title: 'forever my favourite gift', instruction: 'Make one big heart with your hands together' },
    ],
  },
  {
    id: 'family',
    category: 'poses',
    name: 'Family Christmas',
    description: '4 shots · everyone in',
    footer: 'home for the holidays',
    poses: [
      { title: 'home for the holidays', instruction: 'Everyone squeeze in and smile' },
      { title: 'say cheese!', instruction: 'Biggest, cheesiest grins you have' },
      { title: 'the family photo fail', instruction: 'Everyone look in a different direction' },
      { title: 'group hug', instruction: 'Wrap your arms around each other' },
    ],
  },
  {
    id: 'silly',
    category: 'poses',
    name: 'Silly Faces',
    description: '4 shots · no rules',
    footer: 'naughty list',
    poses: [
      { title: 'too much eggnog', instruction: 'Cross your eyes and stick out your tongue' },
      { title: 'brain freeze', instruction: 'Hold your head like you ate too much ice cream' },
      { title: 'the grumpy elf', instruction: 'Arms crossed, your grumpiest frown' },
      { title: 'sugar rush', instruction: 'Wide eyes, hands in the air, go wild' },
    ],
  },
  {
    id: 'cozy',
    category: 'poses',
    name: 'Cozy Night In',
    description: '4 shots · calm and soft',
    footer: 'cozy season',
    poses: [
      { title: 'hot cocoa season', instruction: 'Hold a mug (real or pretend) near your face' },
      { title: 'blanket burrito', instruction: 'Pull your hood or blanket up to your chin' },
      { title: 'movie marathon', instruction: 'Look past the camera like a sad movie is on' },
      { title: 'sleepy & snug', instruction: 'Rest your head on your hands, eyes closed' },
    ],
  },
  {
    id: 'party',
    category: 'poses',
    name: 'Christmas Party',
    description: '8 shots · two strips',
    footer: "let's party",
    poses: [
      { title: "let's party", instruction: 'Both hands up, big smile' },
      { title: 'cheers!', instruction: 'Raise a pretend glass to the camera' },
      { title: 'dance floor', instruction: 'Strike your best dance move' },
      { title: 'the ugly sweater', instruction: 'Show off your outfit like a model' },
      { title: 'gossip corner', instruction: 'Hand by your mouth, spill the tea' },
      { title: 'secret santa reveal', instruction: 'Gasp like you just found out who it was' },
      { title: 'photo bomb', instruction: 'Pop in from the side of the frame' },
      { title: 'last dance', instruction: 'Point at the camera, finger guns' },
    ],
  },
  {
    id: 'santa',
    category: 'poses',
    name: 'Dear Santa',
    description: '4 shots · one strip',
    footer: 'dear santa',
    poses: [
      { title: 'dear santa…', instruction: 'Pretend to write a letter, tongue out thinking' },
      { title: "i've been good", instruction: 'Angel face, hands together' },
      { title: 'mostly good', instruction: 'Shrug with a guilty grin' },
      { title: 'please & thank you', instruction: 'Puppy-dog eyes at the camera' },
    ],
  },

  // ---------------------------------------------------------------- Carol lyrics (public domain)
  {
    id: 'jingle',
    category: 'carols',
    name: 'Jingle Bells',
    description: '8 shots · two strips',
    footer: 'jingle all the way',
    poses: [
      { title: 'dashing through the snow', instruction: 'Lean forward like you are racing' },
      { title: 'in a one-horse open sleigh', instruction: 'Hold the reins of your imaginary sleigh' },
      { title: "o'er the fields we go", instruction: 'Point far into the distance' },
      { title: 'laughing all the way', instruction: 'Laugh big, head tipped back' },
      { title: 'jingle bells', instruction: 'Shake imaginary bells next to your ears' },
      { title: 'jingle bells', instruction: 'Now shake them the other way' },
      { title: 'jingle all the way', instruction: 'Both arms up, celebrate' },
      { title: 'oh what fun it is to ride', instruction: 'Biggest grin and two thumbs up' },
    ],
  },
  {
    id: 'deck',
    category: 'carols',
    name: 'Deck the Halls',
    description: '4 shots · one strip',
    footer: 'fa la la la la',
    poses: [
      { title: 'deck the halls', instruction: 'Pretend to hang a bauble on a tree' },
      { title: 'with boughs of holly', instruction: 'Hold a pretend branch next to your face' },
      { title: "'tis the season to be jolly", instruction: 'Jazz hands!' },
      { title: 'fa la la la la', instruction: 'Sing it: mouth open, eyes closed' },
    ],
  },
  {
    id: 'wish',
    category: 'carols',
    name: 'We Wish You a Merry Christmas',
    description: '4 shots · one strip',
    footer: 'merry christmas',
    poses: [
      { title: 'we wish you a merry christmas', instruction: 'Wave at the camera' },
      { title: 'and a happy new year', instruction: 'Raise a pretend glass, cheers!' },
      { title: 'good tidings we bring', instruction: 'Hold out a pretend present' },
      { title: 'now bring us some figgy pudding', instruction: 'Rub your tummy, look hungry' },
    ],
  },
  {
    id: 'silent',
    category: 'carols',
    name: 'Silent Night',
    description: '4 shots · soft and calm',
    footer: 'silent night',
    poses: [
      { title: 'silent night', instruction: 'Finger on your lips, shhh' },
      { title: 'holy night', instruction: 'Hands together, look up' },
      { title: 'all is calm', instruction: 'Eyes closed, peaceful smile' },
      { title: 'all is bright', instruction: 'Open hands next to your face, sparkle' },
    ],
  },
  {
    id: 'twelve',
    category: 'carols',
    name: 'Twelve Days of Christmas',
    description: '8 shots · two strips',
    footer: 'twelve days of christmas',
    poses: [
      { title: 'on the first day of christmas', instruction: 'Hold up one finger' },
      { title: 'my true love gave to me', instruction: 'Make a heart with your hands' },
      { title: 'a partridge in a pear tree', instruction: 'Flap your arms like a little bird' },
      { title: 'two turtle doves', instruction: 'Two peace signs' },
      { title: 'three french hens', instruction: 'Three fingers up, chicken face' },
      { title: 'four calling birds', instruction: 'Cup your hands around your mouth and call' },
      { title: 'five golden rings', instruction: 'Show off your fingers like they are covered in rings' },
      { title: 'six geese a-laying', instruction: 'Look shocked, hands on your cheeks' },
    ],
  },
  {
    id: 'housetop',
    category: 'carols',
    name: 'Up on the Housetop',
    description: '4 shots · one strip',
    footer: 'ho ho ho',
    poses: [
      { title: 'up on the housetop', instruction: 'Point up at the roof' },
      { title: 'reindeer pause', instruction: 'Make antlers with your hands' },
      { title: 'out jumps good old santa claus', instruction: 'Surprise! Arms wide open' },
      { title: 'ho, ho, ho!', instruction: 'Hands on your belly, laugh like Santa' },
    ],
  },
  {
    id: 'joy',
    category: 'carols',
    name: 'Joy to the World',
    description: '4 shots · one strip',
    footer: 'joy to the world',
    poses: [
      { title: 'joy to the world', instruction: 'Arms wide open, huge smile' },
      { title: 'let earth receive her king', instruction: 'Take a royal bow' },
      { title: 'let every heart prepare him room', instruction: 'Hand on your heart' },
      { title: 'and heaven and nature sing', instruction: 'Sing up to the sky' },
    ],
  },
  {
    id: 'tree',
    category: 'carols',
    name: 'O Christmas Tree',
    description: '4 shots · one strip',
    footer: 'o christmas tree',
    poses: [
      { title: 'o christmas tree', instruction: 'Arms up into a pointy tree shape' },
      { title: 'how lovely are thy branches', instruction: 'Stretch your arms out like branches' },
      { title: 'o tannenbaum', instruction: 'Sway side to side' },
      { title: 'thy leaves are so unchanging', instruction: 'Freeze like a statue, serious face' },
    ],
  },

  // ---------------------------------------------------------------- Love songs (public domain)
  // Classic love songs whose writers died long ago, so the lyrics are free to use.
  {
    id: 'sweetheart',
    category: 'love',
    name: 'Let Me Call You Sweetheart',
    description: '4 shots · for couples · 1910',
    footer: 'sweetheart',
    poses: [
      { title: 'let me call you sweetheart', instruction: 'Lean your heads together, soft smiles' },
      { title: "i'm in love with you", instruction: 'Look at each other, not the camera' },
      { title: 'let me hear you whisper', instruction: 'One whispers in the other’s ear' },
      { title: 'that you love me too', instruction: 'Make one big heart with your hands together' },
    ],
  },
  {
    id: 'daisy',
    category: 'love',
    name: 'Daisy Bell',
    description: '4 shots · for couples · 1892',
    footer: 'a bicycle built for two',
    poses: [
      { title: 'daisy, daisy', instruction: 'Cheek to cheek, big grins' },
      { title: 'give me your answer, do', instruction: 'One pretends to propose, the other gasps' },
      { title: "i'm half crazy", instruction: 'Both pull a silly, love-struck face' },
      { title: 'all for the love of you', instruction: 'Forehead to forehead, eyes closed' },
    ],
  },
  {
    id: 'truly',
    category: 'love',
    name: 'I Love You Truly',
    description: '4 shots · for couples · 1901',
    footer: 'i love you truly',
    poses: [
      { title: 'i love you truly', instruction: 'Hug from behind, both smile at the camera' },
      { title: 'truly, dear', instruction: 'Kiss on the cheek' },
      { title: 'fades into dreams', instruction: 'Rest your head on their shoulder, eyes closed' },
      { title: 'when i feel you are near', instruction: 'Hold hands up to the camera' },
    ],
  },
  {
    id: 'greensleeves',
    category: 'love',
    name: 'Greensleeves',
    description: '4 shots · traditional',
    footer: 'my delight',
    poses: [
      { title: 'greensleeves was all my joy', instruction: 'Laugh together like someone told a joke' },
      { title: 'greensleeves was my delight', instruction: 'Gaze at each other, dreamy eyes' },
      { title: 'greensleeves was my heart of gold', instruction: 'Hands on hearts' },
      { title: 'and who but my lady greensleeves', instruction: 'Take a royal bow and curtsy' },
    ],
  },
];

export const getPoseSet = (id) => POSE_SETS.find((s) => s.id === id) ?? POSE_SETS[0];
