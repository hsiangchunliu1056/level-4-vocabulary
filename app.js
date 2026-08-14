const list = document.querySelector('#word-list');
const search = document.querySelector('#search');
const count = document.querySelector('#result-count');
const status = document.querySelector('#voice-status');
const stopButton = document.querySelector('#stop-speaking');
const quizForm = document.querySelector('#quiz-form');
const quizRange = document.querySelector('#quiz-range');
const quizError = document.querySelector('#quiz-error');
const quizArea = document.querySelector('#quiz-area');
let activeButton = null;

const IPA_VOWELS = {
  AA: String.fromCharCode(0x0251), AE: String.fromCharCode(0x00e6), AH: String.fromCharCode(0x0259),
  AO: String.fromCharCode(0x0254), AW: `a${String.fromCharCode(0x028a)}`, AY: `a${String.fromCharCode(0x026a)}`,
  EH: String.fromCharCode(0x025b), ER: String.fromCharCode(0x025a), EY: `e${String.fromCharCode(0x026a)}`,
  IH: String.fromCharCode(0x026a), IY: 'i', OW: `o${String.fromCharCode(0x028a)}`,
  OY: `${String.fromCharCode(0x0254)}${String.fromCharCode(0x026a)}`, UH: String.fromCharCode(0x028a), UW: 'u'
};

const NO_SENTENCE_IPA = new Set([
  'a', 'an', 'the', 'i', 'me', 'my', 'mine', 'we', 'our', 'ours', 'you', 'your', 'yours',
  'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'they', 'them', 'their', 'theirs',
  'to', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'with', 'after', 'before', 'behind',
  'beside', 'between', 'during', 'into', 'near', 'off', 'onto', 'over', 'since', 'through',
  'toward', 'under', 'up', 'while', 'within', 'without'
]);

const EXAMPLES = {
  'about':'Tell me about your new puppy.', 'above':'A bird flew above the trees.', 'a lot (of)':'We have a lot of crayons.', 'again':'Please read the story again.', 'ago':'We moved here a year ago.', 'airport':'We met Grandma at the airport.', 'always':'I always wash my hands.', 'animal':'That animal has a long tail.', 'as':'Use this box as a table.',
  'bacon':'Dad cooked bacon for breakfast.', 'bank':'Mom went to the bank.', 'barbecue (BBQ)':'We had a barbecue in the yard.', 'beach':'We built a castle on the beach.', 'because':'I smiled because I was happy.', 'bell':'The school bell rang.', 'bookstore':'We found a book at the bookstore.', 'boring':'The long wait was boring.', 'bread':'Please pass me the bread.', 'breakfast':'I eat breakfast before school.', 'bring':'Please bring your coat.', 'build':'We can build a tall tower.', 'building':'That building has many windows.', 'bulletin board':'My picture is on the bulletin board.', 'busy':'Mom is busy making dinner.', 'but':'I want juice, but we have milk.', 'butter':'Put butter on the warm bread.', 'by':'The cat sat by the door.',
  'calendar':'Mark your birthday on the calendar.', 'can':'Put the soup in a can.', 'cap':'He wears a blue cap.', 'carrier':'The mail carrier brought a letter.', 'carry':'Can you carry this bag?', 'city':'Taipei is a busy city.', 'clean':'Keep your room clean.', 'close':'Sit close to your friend.', 'correct':'Your answer is correct.', 'country':'My uncle lives in the country.', 'crazy':'That was a crazy idea!', 'crocodile':'The crocodile swims in the river.', 'cut':'Please cut the paper carefully.', 'cute':'The kitten is very cute.',
  'dark':'It gets dark after dinner.', 'dinner':'We eat dinner together.', 'dirty':'My shoes are dirty.', 'dry':'Hang the towel to dry.', 'dryer':'Use the dryer for your hair.', 'email':'I sent an email to my teacher.', 'English':'We sing songs in English.',
  'fast':'The rabbit can run fast.', 'find':'I cannot find my pencil.', 'fire station':'The fire station has red trucks.', 'flower shop':'We bought roses at the flower shop.', 'for':'This card is for you.', 'forest':'Many animals live in the forest.', 'fruit':'An apple is healthy fruit.', 'fun':'Playing outside is fun.', 'funny':'That funny dog made us laugh.',
  'garden':'We grow tomatoes in the garden.', 'giraffe':'The giraffe has a long neck.', 'gorilla':'The gorilla ate a banana.', 'ground':'Please put your bag on the ground.', 'hear':'Can you hear the music?', 'help':'Please help me set the table.', 'hers':'The red bike is hers.', 'high':'The kite flew high.', 'hippo (hippopotamus)':'A hippo likes to stay in water.', 'his':'That is his lunch box.', 'honey':'Bees make sweet honey.', 'idea':'I have an idea for our game.', 'interesting':'This book is interesting.', 'its':'The dog wagged its tail.', 'jam':'I like jam on toast.', 'jar':'The cookies are in the jar.', 'ketchup':'May I have some ketchup?', 'kitten':'The kitten slept on the chair.',
  'lake':'We saw ducks on the lake.', 'large':'We need a large box.', 'last (night / week)':'I saw a movie last night.', 'leave':'We leave school at four.', 'letter':'I wrote a letter to Grandpa.', 'look for':'Let us look for your hat.', 'low':'The shelf is too low.', 'lunch':'My lunch has rice and fruit.',
  'magic':'The show was full of magic.', 'magician':'The magician pulled a rabbit from a hat.', 'mail':'The mail came this morning.', 'mail carrier':'The mail carrier smiled at us.', 'math':'Math is my favorite class.', 'meal':'We shared a meal together.', 'meat':'Chicken is meat.', 'mind':'Do you mind closing the door?', 'mine':'That yellow cup is mine.', 'mountain':'We climbed a small mountain.', 'musician':'The musician played the piano.', 'near':'The park is near my home.', 'never':'I never skip breakfast.', 'note (s)':'Write your notes in this book.', 'notebook':'My notebook is in my backpack.',
  'off':'Please turn off the light.', 'often':'We often play after school.', 'once':'I have been there once.', 'only':'There is only one cookie left.', 'ours':'The little house is ours.', 'oven':'The cake is in the oven.',
  'park':'We played at the park.', 'pay':'Dad will pay for the tickets.', 'pepper':'Do not put too much pepper on it.', 'pick':'Please pick a book.', 'pick up':'Please pick up your toys.', 'player':'The player kicked the ball.', 'playground':'We run on the playground.', 'police station':'The police station is near the park.', 'pork':'We had pork for dinner.', 'postcard':'I sent a postcard from the beach.', 'post office':'The post office is on this street.', 'puppy':'The puppy chewed my shoe.', 'rarely':'We rarely stay up late.', 'river':'The river flows to the sea.',
  'salt':'Please add a little salt.', 'sausage':'We ate sausage for breakfast.', 'say':'Please say hello to Dad.', 'science':'We learned about plants in science.', 'scientist':'The scientist studies stars.', 'sea':'The sea looks blue today.', 'seat':'Please save me a seat.', 'seesaw':'We played on the seesaw.', 'seldom':'It seldom rains here in summer.', 'send':'I will send you a picture.', 'shop':'We shop for food on Sunday.', 'slide':'The children went down the slide.', 'slow':'The turtle is slow.', 'smile':'Her smile made me happy.', 'snack':'I packed a snack for school.', 'snowman':'We made a snowman yesterday.', 'sometimes':'I sometimes read before bed.', 'station':'Meet me at the train station.', 'stay':'Please stay with the group.', 'street':'Look both ways before crossing the street.', 'strong':'My brother is strong.', 'student':'Every student has a desk.', 'study':'I study English every day.', 'sugar':'Do not add too much sugar.', 'supermarket':'We bought milk at the supermarket.', 'sweet':'These strawberries are sweet.', 'swing':'I can swing very high.',
  'take off':'Please take off your shoes.', 'teach':'Ms. Lin will teach us a song.', 'television':'We watch television after homework.', 'tell':'Please tell me the answer.', 'test':'We have a spelling test tomorrow.', 'than':'My bag is heavier than yours.', 'theirs':'Those books are theirs.', 'thirsty':'I am thirsty after running.', 'thousand':'A thousand stars filled the sky.', 'tonight':'We will make pizza tonight.', 'town':'Our town has a small library.', 'train station':'The train station is very busy.', 'turn':'It is your turn now.', 'turn off':'Turn off the fan, please.', 'turn on':'Turn on the lamp, please.', 'twice':'I brush my teeth twice a day.', 'usually':'I usually walk to school.', 'vegetable':'Carrots are orange vegetables.', 'village':'My grandparents live in a village.', 'visit':'We will visit Aunt May tomorrow.', 'wait':'Please wait for the bus.', 'weak':'I felt weak after being sick.', 'week':'There are seven days in a week.', 'weekend':'We go hiking on the weekend.', 'wet':'My socks are wet.', 'which':'Which game do you want?', 'whose':'Whose pencil is this?', 'why':'Why are you laughing?', 'wonderful':'We had a wonderful day.', 'world':'We want to see the world.', 'would':'I would like some water.', 'wrong':'That answer is wrong.', 'yard':'The children played in the yard.', 'year':'This year is going quickly.', 'yesterday':'Yesterday was very sunny.', 'yours':'Is this backpack yours?'
};

function vowelGroupAt(word, index) {
  return word.slice(index).match(/^(ai|au|aw|ay|ea|ee|ei|ey|ie|oa|oe|oi|oo|ou|ow|oy|ue|ui|[aeiouy])/i)?.[0] || '';
}

function appendAnnotatedWord(parent, rawWord) {
  const vowels = WORD_VOWELS[rawWord.toLowerCase()];
  if (!vowels) { parent.append(rawWord); return; }
  const groups = [];
  let groupCursor = 0;
  while (groupCursor < rawWord.length) {
    const groupText = vowelGroupAt(rawWord, groupCursor);
    if (groupText) groups.push(groupText);
    groupCursor += groupText ? groupText.length : 1;
  }
  if (groups.length !== vowels.length) { parent.append(rawWord); return; }
  let cursor = 0;
  let vowelIndex = 0;
  while (cursor < rawWord.length) {
    const groupText = vowelGroupAt(rawWord, cursor);
    if (!groupText) { parent.append(rawWord[cursor]); cursor += 1; continue; }
    const group = document.createElement('span');
    group.className = 'annotated-vowel';
    group.textContent = groupText;
    const symbol = document.createElement('span');
    symbol.className = 'vowel-symbol';
    symbol.textContent = `/${IPA_VOWELS[vowels[vowelIndex]]}/`;
    group.append(symbol);
    parent.append(group);
    cursor += groupText.length;
    vowelIndex += 1;
  }
}

function appendAnnotatedText(parent, text, skipFunctionWords = false) {
  const tokens = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|[^A-Za-z]+/g) || [text];
  tokens.forEach((token) => {
    if (/^[A-Za-z]/.test(token)) {
      if (skipFunctionWords && NO_SENTENCE_IPA.has(token.toLowerCase())) parent.append(token);
      else appendAnnotatedWord(parent, token);
    }
    else parent.append(token);
  });
}

function stopSpeaking() {
  speechSynthesis.cancel();
  activeButton?.classList.remove('is-speaking');
  activeButton = null;
  stopButton.disabled = true;
}

function speak(word, button) {
  if (!('speechSynthesis' in window)) { status.textContent = '這個瀏覽器不支援語音播放。'; return; }
  stopSpeaking();
  activeButton = button;
  button.classList.add('is-speaking');
  stopButton.disabled = false;
  status.textContent = `正在播放：${word}`;
  const utterance = new SpeechSynthesisUtterance(word.replaceAll(/[()]/g, '').replaceAll('…', ''));
  utterance.lang = 'en-US';
  utterance.rate = 0.72;
  utterance.voice = speechSynthesis.getVoices().find((voice) => /^en-US/i.test(voice.lang)) || null;
  utterance.onend = () => { if (activeButton === button) { stopSpeaking(); status.textContent = '準備好了'; } };
  utterance.onerror = () => { stopSpeaking(); status.textContent = '無法播放，請再試一次。'; };
  speechSynthesis.speak(utterance);
}

function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const matches = LEVEL_FOUR_WORDS.filter(({ word, meaning }) => `${word}${meaning}`.toLocaleLowerCase().includes(query));
  count.textContent = `共 ${matches.length} 個單字`;
  list.replaceChildren();
  if (!matches.length) { list.innerHTML = '<p class="empty">找不到相符的單字。</p>'; return; }
  matches.forEach(({ id, word, meaning }) => {
    const card = document.createElement('article'); card.className = 'word-card';
    const number = document.createElement('span'); number.className = 'number'; number.textContent = `No. ${String(id).padStart(3, '0')}`;
    const button = document.createElement('button'); button.className = 'word'; button.type = 'button'; appendAnnotatedText(button, word);
    button.setAttribute('aria-label', `播放 ${word}`); button.addEventListener('click', () => speak(word, button));
    const translation = document.createElement('p'); translation.className = 'meaning'; translation.textContent = meaning;
    const example = document.createElement('button'); example.className = 'example'; example.type = 'button'; appendAnnotatedText(example, EXAMPLES[word], true);
    example.setAttribute('aria-label', `播放例句：${EXAMPLES[word]}`); example.addEventListener('click', () => speak(EXAMPLES[word], example));
    card.append(number, button, translation, example); list.append(card);
  });
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function vowelSounds(word) {
  return (word.match(/[A-Za-z]+/g) || []).flatMap((part) => (WORD_VOWELS[part.toLowerCase()] || []).map((sound) => `/${IPA_VOWELS[sound]}/`)).join(' ');
}

function makeChoices(answer, pool) {
  return shuffle([answer, ...shuffle(pool.filter((item) => item.word !== answer.word)).slice(0, 3)]);
}

function showQuestion(questions, index, score) {
  const question = questions[index];
  quizArea.replaceChildren();
  const progress = document.createElement('p'); progress.className = 'quiz-progress'; progress.textContent = `第 ${index + 1} 題／共 ${questions.length} 題　答對 ${score} 題`;
  const type = document.createElement('p'); type.className = 'quiz-type';
  const prompt = document.createElement('h3');
  const feedback = document.createElement('p'); feedback.className = 'quiz-feedback';
  const next = (correct) => {
    feedback.textContent = correct ? '答對了！' : `正確答案：${question.word}`;
    feedback.classList.toggle('wrong', !correct);
    quizArea.querySelectorAll('button, input').forEach((element) => { element.disabled = true; });
    const nextButton = document.createElement('button'); nextButton.type = 'button'; nextButton.className = 'quiz-next';
    nextButton.textContent = index + 1 === questions.length ? '查看成績' : '下一題';
    nextButton.addEventListener('click', () => {
      if (index + 1 === questions.length) {
        quizArea.innerHTML = `<h3>測驗完成</h3><p class="quiz-score">你答對 ${score + (correct ? 1 : 0)}／${questions.length} 題</p>`;
      } else showQuestion(questions, index + 1, score + (correct ? 1 : 0));
    });
    quizArea.append(nextButton);
  };
  if (question.kind === 'pronunciation') {
    type.textContent = '發音題'; prompt.textContent = `哪個單字的母音發音是：${vowelSounds(question.word)}？`;
    makeChoices(question, question.pool).forEach((choice) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'quiz-choice'; button.textContent = choice.word;
      button.addEventListener('click', () => next(choice.word === question.word)); quizArea.append(button);
    });
  } else if (question.kind === 'listening') {
    type.textContent = '聽力題'; prompt.textContent = '聽完發音後，選出正確單字。';
    const replay = document.createElement('button'); replay.type = 'button'; replay.className = 'quiz-replay'; replay.textContent = '▶ 播放發音'; replay.addEventListener('click', () => speak(question.word, replay)); quizArea.append(replay);
    makeChoices(question, question.pool).forEach((choice) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'quiz-choice'; button.textContent = choice.word;
      button.addEventListener('click', () => next(choice.word === question.word)); quizArea.append(button);
    });
    setTimeout(() => speak(question.word, replay), 150);
  } else {
    type.textContent = '拼字題'; prompt.textContent = `請拼出「${question.meaning}」的英文單字。`;
    const input = document.createElement('input'); input.type = 'text'; input.className = 'quiz-spelling'; input.autocomplete = 'off'; input.placeholder = '輸入英文單字';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'quiz-next'; button.textContent = '確認答案';
    button.addEventListener('click', () => next(input.value.trim().toLowerCase() === question.word.toLowerCase())); quizArea.append(input, button);
  }
  quizArea.prepend(progress, type, prompt); quizArea.append(feedback);
}

quizForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const match = quizRange.value.trim().match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) { quizError.textContent = '請輸入範圍，例如 61-65。'; return; }
  const start = Number(match[1]); const end = Number(match[2]);
  const selected = LEVEL_FOUR_WORDS.filter((item) => item.id >= Math.min(start, end) && item.id <= Math.max(start, end));
  if (!selected.length) { quizError.textContent = '這個範圍沒有單字，請重新輸入。'; return; }
  quizError.textContent = ''; quizArea.hidden = false;
  const questions = shuffle(selected).map((item, index) => ({ ...item, pool: selected, kind: ['pronunciation', 'listening', 'spelling'][index % 3] }));
  showQuestion(questions, 0, 0);
});

search.addEventListener('input', render);
stopButton.addEventListener('click', () => { stopSpeaking(); status.textContent = '已停止發音'; });
window.addEventListener('beforeunload', stopSpeaking);
render();
