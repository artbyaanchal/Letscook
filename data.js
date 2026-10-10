// Recipe content, control defaults and copy for Let's Cook.

export const RECIPES = [
  { id: 'dosa', name: 'Masala Dosa', meal: 'Breakfast', time: 30, level: 'Easy', veg: true, photo: 'dosa' },
  { id: 'idli', name: 'Idli Sambar', meal: 'Breakfast', time: 25, level: 'Easy', veg: true, photo: 'idli' },
  { id: 'paratha', name: 'Aloo Paratha', meal: 'Breakfast', time: 35, level: 'Easy', veg: true, photo: 'paratha' },
  { id: 'paneer', name: 'Paneer Butter Masala', meal: 'Lunch', time: 40, level: 'Medium', veg: true, photo: 'paneer' },
  { id: 'dal', name: 'Dal Makhani', meal: 'Lunch', time: 45, level: 'Medium', veg: true, photo: 'dal' },
  { id: 'chole', name: 'Chole Bhature', meal: 'Lunch', time: 50, level: 'Medium', veg: true, photo: 'chole' },
  { id: 'biryani', name: 'Hyderabadi Biryani', meal: 'Dinner', time: 60, level: 'Medium', veg: false, photo: 'biryani' },
  { id: 'thali', name: 'Veg Thali', meal: 'Dinner', time: 70, level: 'Medium', veg: true, photo: 'thali' },
  { id: 'pavbhaji', name: 'Pav Bhaji', meal: 'Snacks', time: 35, level: 'Easy', veg: true, photo: 'pavbhaji' },
  { id: 'tikka', name: 'Paneer Tikka', meal: 'Snacks', time: 30, level: 'Easy', veg: true, photo: 'tikka' },
  { id: 'cake', name: 'Eggless Vanilla Sponge Cake', meal: 'Desserts', time: 50, level: 'Easy', veg: true, photo: 'cake' },
  { id: 'teacake', name: 'Eggless Tea-time Cake', meal: 'Desserts', time: 45, level: 'Easy', veg: true, photo: 'cakeslice' },
];

export const MEALS = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Desserts'];
export const QUICK_FILTERS = ['Quick & Easy', 'Vegetarian', 'Under 30 min'];

// The one recipe with a full cook-along in this build.
export const CAKE = {
  id: 'cake',
  name: 'Eggless Vanilla Sponge Cake',
  intro: 'A soft, fluffy curd-based sponge that needs only one bowl. Perfect for a birthday at home or tea-time.',
  prep: 15, bake: 35, serves: 6, level: 'Easy',
  ingredients: [
    { id: 'maida', name: 'Maida (all-purpose flour)', qty: 1.5, unit: 'cups', photo: 'ing-maida', have: true },
    { id: 'sugar', name: 'Sugar, powdered', qty: 0.75, unit: 'cup', photo: 'ing-sugar', have: true },
    { id: 'curd', name: 'Curd (thick yogurt)', qty: 1, unit: 'cup', photo: 'ing-curd', have: false, pack: '400 g pack' },
    { id: 'oil', name: 'Oil', qty: 0.5, unit: 'cup', photo: 'ing-oil', have: true },
    { id: 'milk', name: 'Milk', qty: 0.25, unit: 'cup', photo: 'ing-milk', have: true },
    { id: 'bp', name: 'Baking powder · soda', qty: 1, unit: 'tsp · ½ tsp', photo: 'ing-bp', have: true, fixed: true },
    { id: 'vanilla', name: 'Vanilla essence', qty: 1, unit: 'tsp', photo: 'ing-vanilla', have: false, pack: '20 ml bottle' },
  ],
  prepTasks: [
    { title: 'Gather your ingredients', short: 'Check that everything is within reach.', say: 'Bring all the ingredients to the counter so everything is within reach.', ill: 'measure' },
    { title: 'Measure everything into small bowls', short: 'Measure and arrange as instructed.', say: 'Measure one and a half cups maida, three quarter cup sugar, one cup curd, half cup oil and a quarter cup milk.', ill: 'measure', chips: true },
    { title: 'Preheat the oven and grease the tin', short: 'Preheat oven to 180°C. Grease and line the tin.', say: 'Preheat your oven to one hundred and eighty degrees. Grease the tin and line it with butter paper.', ill: 'oven' },
  ],
  steps: [
    { title: 'Whisk the curd and sugar together.', detail: '1 cup curd + ¾ cup sugar, in your big bowl.', look: 'Smooth and creamy, no sugar grains left.', ill: 'whisk',
      help: 'Hold the bowl with one hand and whisk in quick circles for about two minutes, until you can no longer feel sugar grains.', ingredients: 'One cup curd and three quarter cup powdered sugar.' },
    { title: 'Add baking powder and soda. Let it bubble.', detail: '1 tsp baking powder + ½ tsp soda. Stir once, then wait.', timer: 120, ill: 'bubble',
      help: 'Stir just once so the powder mixes in, then leave it. Small bubbles on top mean it is working.', ingredients: 'One teaspoon baking powder and half teaspoon baking soda.' },
    { title: 'Add oil, milk and vanilla. Whisk again.', detail: '½ cup oil + ¼ cup milk + 1 tsp vanilla.', look: 'Glossy and well mixed, no oil floating on top.', ill: 'whisk',
      help: 'Pour the oil slowly while you whisk so it blends in evenly.', ingredients: 'Half cup oil, quarter cup milk and one teaspoon vanilla essence.' },
    { title: 'Sift in the maida and a pinch of salt.', detail: '1½ cups maida. Tap the sieve gently over the bowl.', look: 'No big lumps of flour left in the sieve.', ill: 'sift',
      help: 'Hold the sieve over the bowl and tap its side gently. Sifting adds air and keeps the cake light.', ingredients: 'One and a half cups maida and a pinch of salt.' },
    { title: 'Fold gently into a smooth batter.', detail: 'Use a spatula. Cut down the middle and turn the batter over.', look: 'Thick, smooth batter that falls in ribbons. No dry flour.', ill: 'fold',
      help: 'Cut the spatula down through the middle, scrape along the bottom and turn the batter over. Do not beat it, or the cake turns dense.', ingredients: 'No new ingredients in this step.' },
    { title: 'Pour into the greased tin. Tap it twice.', detail: 'Spread the batter evenly, then tap the tin on the counter.', look: 'An even, flat top with no big air bubbles.', ill: 'fold',
      help: 'Tapping the tin twice on the counter pops large air bubbles so the cake bakes evenly.', ingredients: 'No new ingredients in this step.' },
    { title: 'Bake at 180°C for 30 to 35 minutes.', detail: 'Middle rack of the preheated oven.', timer: 1800, ill: 'oven',
      help: 'The cake is ready when a toothpick pushed into the centre comes out clean.', ingredients: 'No new ingredients in this step.' },
  ],
};

export const ACTIONS = {
  next: 'Next step', previous: 'Previous step', skip: 'Skip ahead', repeat: 'Repeat step', help: 'Ask for help',
  ingredients: 'Ingredients', timer: 'Start timer', stoptimer: 'Stop timer', pause: 'Pause', resume: 'Resume',
  exit: 'Exit cooking', none: 'Off',
};

export const GESTURES = [
  { id: 'thumb', name: 'Thumbs up', photo: 'thumb', says: '“Great! Let’s move on.”' },
  { id: 'fist', name: 'Closed fist', photo: 'fist', says: '“No problem. Take your time. I’ll wait.”' },
  { id: 'open', name: 'Open hand', photo: 'open', says: '“Welcome back! Let’s continue.”' },
  { id: 'one', name: 'One finger up', photo: 'one', says: '“Of course. Let’s go through that again.”' },
  { id: 'v', name: 'Two fingers (V)', photo: 'v', says: '“I’ve got you. Let me explain that.”' },
  { id: 'ok', name: 'OK sign', photo: 'ok', says: '“Timer started. I’ll let you know.”' },
];

export const DEFAULT_SETTINGS = {
  gesturesOn: true,
  voiceOn: true,
  gestureMap: { thumb: 'next', fist: 'pause', open: 'resume', one: 'repeat', v: 'help', ok: 'timer' },
  gestureEnabled: { thumb: true, fist: true, open: true, one: true, v: true, ok: true },
  hand: 'Both',
  holdMs: 1000,
  sensitivity: 0.6,
  wakeWord: 'Hey Let’s Cook',
  requireWakeWord: false,
  language: 'Hinglish',
  readAloud: true,
  speechRate: 0.45,
  phrases: {
    next: ['next', 'done', 'aage', 'आगे'],
    previous: ['previous', 'go back', 'back', 'peeche', 'पीछे'],
    skip: ['skip ahead', 'skip'],
    repeat: ['repeat', 'again', 'phir se', 'फिर से'],
    help: ['help me', 'how do i', 'help', 'kaise karein', 'कैसे'],
    ingredients: ['ingredients', 'what do i need'],
    timer: ['start timer', 'start the timer', 'timer start'],
    stoptimer: ['stop timer', 'stop the timer'],
    pause: ['pause', 'wait', 'ruko', 'रुको'],
    resume: ['resume', 'continue', 'carry on', "let's go"],
    exit: ['exit cooking', 'exit', 'stop cooking'],
    ready: ["i'm ready to cook", 'ready to cook', 'start cooking', 'start preparing', 'start'],
  },
};

export const SAY = {
  next: 'Great! Here’s what comes next.',
  previous: 'Sure. Let’s revisit that step.',
  skip: 'Okay, moving ahead one step.',
  repeat: 'Of course. Let’s go through that again.',
  help: 'I’ve got you. Let me explain.',
  ingredients: 'Here’s what you’ll need for this step.',
  timer: 'Timer started. I’ll let you know when it’s done.',
  stoptimer: 'Timer stopped.',
  pause: 'No problem. Take your time. I’ll wait.',
  resume: 'Welcome back! Let’s continue where we left off.',
  exit: 'Ready to leave? You can return to your recipe later.',
  notUnderstood: 'Sorry, I didn’t catch that. Try saying Next, Repeat or Help.',
  timerDone: 'Your timer is up! Check your dish.',
  done: 'You made it! Enjoy your meal.',
};
