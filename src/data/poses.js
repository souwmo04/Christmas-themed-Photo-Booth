// Every pose set used by the booth.
// `title` is shown in script above the camera, `instruction` below it.
// To add a set or change a pose, edit text here only.

export const POSE_SETS = [
  {
    id: 'story',
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
];

export const getPoseSet = (id) => POSE_SETS.find((s) => s.id === id) ?? POSE_SETS[0];
